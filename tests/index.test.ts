import { expect } from 'chai';
import * as IPutils from '../lib/index';

const Data = {
	IPv4: {
		first: {
			string: '192.168.11.5',
			errorString: '265.192.11.5',
			errorLengthString: '192.11.5',
			bytes: [192, 168, 11, 5],
		},
		subnet: {
			string: '255.255.252.0',
			bytes: [0xff, 0xff, 0xfc, 0x00],
			prefix: 8 + 8 + 6,
			host: {
				first: {
					string: '255.255.253.128',
					bytes: [0xff, 0xff, 0xfd, 0x80],
				},
			},
		},
	},
	IPv6: {
		first: {
			string: '2001:db8:85a3::8a2e:370:7334',
			normalizedString: '2001:db8:85a3:0:0:8a2e:370:7334',
			fixedString: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
			bytes: [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
			parts: [0x2001, 0x0db8, 0x85a3, 0x0000, 0x0000, 0x8a2e, 0x0370, 0x7334],
		},
		second: {
			string: '::ffff:192.168.11.5',
			bytes: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 192, 168, 11, 5],
			parts: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0xFFFF, (192 << 8) | 168, (11 << 8) | 5],
		},
		subnet: {
			string: 'ffff:ffff:fc00::',
			bytes: [0xff, 0xff, 0xff, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
			parts: [0xffff, 0xffff, 0xfc00, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000],
			prefix: 16 + 16 + 6,
			host: {
				first: {
					string: 'ffff:ffff:fc01::',
					bytes: [0xff, 0xff, 0xff, 0xff, 0xfc, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
				}
			}
		},
	},
}

describe('std', function () {
	it('fromPrefixLength', function () {
		{
			const input = Data.IPv4.subnet;
			const result = IPutils.fromPrefixLength(input.prefix, input.bytes.length);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result).deep.equal(input.bytes);
		}
		{
			const input = Data.IPv6.subnet;
			const result = IPutils.fromPrefixLength(input.prefix, input.bytes.length);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result).deep.equal(input.bytes);
		}
	});
	it('fromNetworkMask', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.fromNetworkMask(input.bytes.slice());
			expect(result).equal(undefined);
		}
		{
			const input = Data.IPv4.subnet;
			const result = IPutils.fromNetworkMask(input.bytes.slice());
			expect(result).equal(input.prefix);
		}
		{
			const input = Data.IPv6.first;
			const result = IPutils.fromNetworkMask(input.bytes.slice());
			expect(result).equal(undefined);
		}
		{
			const input = Data.IPv6.subnet;
			const result = IPutils.fromNetworkMask(input.bytes.slice());
			expect(result).equal(input.prefix);
		}
	});
	it('matchCIDR', function () {
		{
			const input = Data.IPv4.subnet;
			const host = input.host.first;
			const result = IPutils.matchCIDR(host.bytes.slice(), input.bytes.slice(), input.prefix);
			expect(result).equal(true);
		}
		// different subnets for ips
		{
			const input = Data.IPv4.subnet;
			const host = Data.IPv4.first;
			const result = IPutils.matchCIDR(host.bytes.slice(), input.bytes.slice(), input.prefix);
			expect(result).equal(false);
		}
		// ipv4 !== ipv6
		{
			const input = Data.IPv4.subnet;
			const host = Data.IPv6.first;
			const result = IPutils.matchCIDR(host.bytes.slice(), input.bytes.slice(), input.prefix);
			expect(result).equal(undefined);
		}
		// IPv6
		{
			const input = Data.IPv6.subnet;
			const host = input.host.first;
			const result = IPutils.matchCIDR(host.bytes.slice(), input.bytes.slice(), input.prefix);
			expect(result).equal(true);
		}
	});
	it('parse', function () {
		// IPv4
		{
			const input = Data.IPv4.first;
			const result = IPutils.parse(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv4');
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.bytes.slice());
		}
		// IPv6
		{
			const input = Data.IPv6.first;
			const result = IPutils.parse(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv6');
			if (!IPutils.isIPv6(result)) { return; }
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.bytes.slice());
		}
		// IPv6 (IPv4-mapped IPv6)
		{
			const input = Data.IPv6.second;
			const result = IPutils.parse(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv6');
			if (!IPutils.isIPv6(result)) { return; }
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.bytes.slice());
		}
	});
	it('parseCIDR', function () {
		{
			const input = Data.IPv4.first;
			const inputString = input.string + '/24';
			const result = IPutils.parseCIDR(inputString);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.addr.kind()).to.equal('ipv4');
			const str = result.toString();
			expect(str).to.equal(inputString);
		}
		{
			const input = Data.IPv4.subnet;
			const inputString = input.string + '/' + input.prefix;
			const result = IPutils.parseCIDR(inputString);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.addr.kind()).to.equal('ipv4');
			const str = result.toString();
			expect(str).to.equal(inputString);
		}
		{
			const input = Data.IPv6.first;
			const inputString = input.string + '/64';
			const result = IPutils.parseCIDR(inputString);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.addr.kind()).to.equal('ipv6');
			const str = result.toString();
			expect(str).to.equal(inputString);
		}
		{
			const input = Data.IPv6.subnet;
			const inputString = input.string + '/' + input.prefix;
			const result = IPutils.parseCIDR(inputString);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.addr.kind()).to.equal('ipv6');
			const str = result.toString();
			expect(str).to.equal(inputString);
		}
	});
	it('parseIPv4', function () {
		{
			const input = Data.IPv6.first;
			const result = IPutils.parseIPv4(input.string);
			expect(result).equal(undefined);
		}
		// IPv6 transitional
		{
			const input = Data.IPv6.second;
			const result = IPutils.parseIPv4(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv4');
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.bytes.slice(-4));
		}
	});
	it('autoConstructor', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.autoConstructor(input.bytes.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv4');
		}
		{
			const input = Data.IPv6.first;
			const result = IPutils.autoConstructor(input.bytes.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv6');
		}
	});
	it('fromByteArray', function () {
		{
			const input = Data.IPv4.first.bytes;
			const result = IPutils.fromByteArray(input);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv4');
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.slice());
		}
		{
			const input = Data.IPv6.first.bytes;
			const result = IPutils.fromByteArray(input);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.kind()).to.equal('ipv6');
			if (!IPutils.isIPv6(result)) { return; }
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.slice());
		}
	});
	it('network', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.network(input.bytes.slice(), 24);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.addr.kind()).to.equal('ipv4');
			const string = result.toString();
			expect(string).deep.equal(input.string + '/24');
		}
		{
			const input = Data.IPv4.subnet;
			const result = IPutils.network(input.bytes.slice(), input.prefix);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.addr.kind()).to.equal('ipv4');
			const string = result.toString();
			expect(string).equal(input.string + '/' + input.prefix);
		}
	});
	it('toByteArray', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.toByteArray(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.length).to.equal(input.bytes.length);
			const bytes = result;
			expect(bytes).deep.equal(input.bytes.slice());
		}
		{
			const input = Data.IPv6.first;
			const result = IPutils.toByteArray(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result.length).to.equal(input.bytes.length);
			const bytes = result;
			expect(bytes).deep.equal(input.bytes.slice());
		}
	});
	it('toString', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.toString(input.bytes);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result).to.equal(input.string);
		}
		{
			const input = Data.IPv6.first;
			const result = IPutils.toString(input.bytes);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			expect(result).to.equal(input.string);
		}
	});
});

describe('IPv4', function () {
	it('parse', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.IPv4.parse(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const string = result.toString();
			expect(string).deep.equal(input.string);
		}
		// error: invalid input
		{
			const input = Data.IPv4.first;
			const result = IPutils.IPv4.parse(input.errorString);
			expect(result).equal(undefined);
		}
		// error: invalid length
		{
			const input = Data.IPv4.first;
			const result = IPutils.IPv4.parse(input.errorLengthString);
			expect(result).equal(undefined);
		}
	});
	it('construct', function () {
		{
			const input = Data.IPv4.first;
			const result = IPutils.IPv4.construct(input.bytes.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const string = result.toString();
			expect(string).equal(input.string);
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.bytes);
		}
		// error: invalid input
		{
			const input = Data.IPv4.first;
			const inputBytes = input.bytes.slice();
			inputBytes[0] = 0x100;
			const result = IPutils.IPv4.construct(inputBytes.slice());
			expect(result).equal(undefined);
		}
		// error: invalid length
		{
			const input = Data.IPv4.first;
			const result = IPutils.IPv4.construct(input.bytes.slice(1));
			expect(result).equal(undefined);
		}
	});
	it('prefixLengthFromNetworkMask', function () {
		// not netmask
		{
			const input = Data.IPv4.first;
			const result = IPutils.IPv4.construct(input.bytes.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const prefix = result.prefixLengthFromNetworkMask();
			expect(prefix).equal(undefined);
		}
		// netmask
		{
			const input = Data.IPv4.subnet;
			const result = IPutils.IPv4.construct(input.bytes.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const prefix = result.prefixLengthFromNetworkMask();
			expect(prefix).equal(input.prefix);
		}
	});
});

describe('IPv6', function () {
	it('parse', function () {
		{
			const input = Data.IPv6.first;
			const result = IPutils.IPv6.parse(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const string = result.toString();
			expect(string).deep.equal(input.string);
		}
		// IPv6 transitional
		{
			const input = Data.IPv6.second;
			const result = IPutils.IPv6.parse(input.string);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const string = result.toString();
			expect(string).equal(input.string);
		}
	});
	it('construct', function () {
		// (bytes)
		{
			const input = Data.IPv6.first;
			const result = IPutils.IPv6.construct(input.bytes.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const string = result.toString();
			expect(string).deep.equal(input.string);
			const bytes = result.toByteArray();
			expect(bytes).deep.equal(input.bytes.slice());
		}
		// (bytes) (error: invalid input)
		{
			const input = Data.IPv6.first;
			const inputBytes = input.bytes.slice();
			inputBytes[0] = 0x100;
			let result = IPutils.IPv6.construct(inputBytes.slice());
			expect(result).equal(undefined);
			if (typeof result !== 'undefined') { return; }

			inputBytes[0] = -0x01;
			result = IPutils.IPv6.construct(inputBytes.slice());
			expect(result).equal(undefined);
			if (typeof result !== 'undefined') { return; }
		}
		// (parts)
		{
			const input = Data.IPv6.first;
			const result = IPutils.IPv6.construct(input.parts.slice());
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const string = result.toString();
			expect(string).deep.equal(input.string);
		}
		// (parts) (error: invalid input)
		{
			const input = Data.IPv6.first;
			const inputParts = input.parts.slice();
			inputParts[0] = 0x10000;
			let result = IPutils.IPv6.construct(inputParts.slice());
			expect(result).equal(undefined);
			if (typeof result !== 'undefined') { return; }

			inputParts[0] = -0x01;
			result = IPutils.IPv6.construct(inputParts.slice());
			expect(result).equal(undefined);
		}
		// (error: invalid length)
		{
			const input = Data.IPv6.first;
			const result = IPutils.IPv6.construct(input.bytes.slice(0, 7));
			expect(result).equal(undefined);
		}
	});
	it('parts', function () {
		const input = Data.IPv6.first;
		const result = IPutils.IPv6.construct(input.bytes);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		const parts = result.parts();
		expect(parts).deep.equal(input.parts.slice());
	});
	it('isIPv4MappedAddress', function () {
		{
			const input = Data.IPv6.first;
			const result = IPutils.IPv6.construct(input.bytes);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const bool = result.isIPv4MappedAddress();
			expect(bool).equal(false);
		}
		// IPv6 transitional
		{
			const input = Data.IPv6.second;
			const result = IPutils.IPv6.construct(input.bytes);
			expect(result).not.equal(undefined);
			if (typeof result === 'undefined') { return; }
			const bool = result.isIPv4MappedAddress();
			expect(bool).equal(true);
		}
	});
	it('toIPv4Address', function () {
		{
			const input = Data.IPv6.first;
			const ipv6 = IPutils.IPv6.construct(input.bytes);
			expect(ipv6).not.equal(undefined);
			if (typeof ipv6 === 'undefined') { return; }

			const ipv4 = ipv6.toIPv4Address();
			expect(ipv4).equal(undefined);
		}
		// IPv6 transitional
		{
			const input = Data.IPv6.second;
			const ipv6 = IPutils.IPv6.construct(input.bytes);
			expect(ipv6).not.equal(undefined);
			if (typeof ipv6 === 'undefined') { return; }

			const ipv4 = ipv6.toIPv4Address();
			expect(ipv4).not.equal(undefined);
			if (typeof ipv4 === 'undefined') { return; }
			expect(ipv4.bytes).deep.equal(input.bytes.slice(-4));
		}
	});
	it('prefixLengthFromNetworkMask', function () {
		// not IPv6 mask
		{
			const input = Data.IPv6.first;
			const ipv6 = IPutils.IPv6.construct(input.bytes);
			expect(ipv6).not.equal(undefined);
			if (typeof ipv6 === 'undefined') { return; }

			const prefix = ipv6.prefixLengthFromNetworkMask();
			expect(prefix).equal(undefined);
		}
		// IPv6 mask
		{
			const input = Data.IPv6.subnet;
			const ipv6 = IPutils.IPv6.construct(input.bytes);
			expect(ipv6).not.equal(undefined);
			if (typeof ipv6 === 'undefined') { return; }

			const prefix = ipv6.prefixLengthFromNetworkMask();
			expect(prefix).not.equal(undefined);
			if (typeof prefix === 'undefined') { return; }
			expect(prefix).equal(input.prefix);
		}
	});
	it('toNormalizedString', function () {
		const input = Data.IPv6.first;
		const ipv6 = IPutils.IPv6.construct(input.bytes);
		expect(ipv6).not.equal(undefined);
		if (typeof ipv6 === 'undefined') { return; }

		const string = ipv6.toNormalizedString();
		expect(string).equal(input.normalizedString);
	});
	it('toFixedLengthString', function () {
		const input = Data.IPv6.first;
		const ipv6 = IPutils.IPv6.construct(input.bytes);
		expect(ipv6).not.equal(undefined);
		if (typeof ipv6 === 'undefined') { return; }

		const string = ipv6.toFixedLengthString();
		expect(string).equal(input.fixedString);
	});
});