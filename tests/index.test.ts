import { expect } from 'chai';
import * as IPutils from '../src/index';

const Data = {
	IPv4: {
		first: {
			string: '192.168.11.5',
			bytes: [192, 168, 11, 5],
		},
	},
	IPv6: {
		first: {
			string: '2001:db8:85a3::8a2e:370:7334',
			bytes: [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x0, 0x0, 0x0, 0x0, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
		},
		second: {
			string: '::ffff:192.168.11.5',
			bytes: [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xFF, 0xFF, 192, 168, 11, 5],
		},
	},
}

describe('std', function () {
	it('parse: IPv4', function () {
		const input = Data.IPv4.first;
		const result = IPutils.safe.parse(input.string);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.kind()).to.equal('ipv4');
		const bytes = result.toByteArray();
		expect(bytes).deep.equal(input.bytes.slice());
	});

	it('parse: IPv6', function () {
		const input = Data.IPv6.first;
		const result = IPutils.safe.parse(input.string);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.kind()).to.equal('ipv6');
		const bytes = result.toByteArray();
		expect(bytes).deep.equal(input.bytes.slice());
	});

	it('parse: IPv4-mapped IPv6', function () {
		const input = Data.IPv6.second;
		const result = IPutils.safe.parse(input.string);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.kind()).to.equal('ipv6');
		const bytes = result.toByteArray();
		expect(bytes).deep.equal(input.bytes.slice());
	});

	it('parseCIDR: IPv4', function () {
		const input = '192.168.11.5/24';
		const result = IPutils.safe.parseCIDR(input);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.addr.kind()).to.equal('ipv4');
		const str = result.toString();
		expect(str).to.equal(input);
	});

	it('parseIPv4', function () {
		const input = Data.IPv6.second;
		const result = IPutils.safe.parseIPv4(input.string);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.kind()).to.equal('ipv4');
		const bytes = result.toByteArray();
		expect(bytes).deep.equal(input.bytes.slice(-4));
	});

	it('fromByteArray: IPv4', function () {
		const input = Data.IPv4.first.bytes;
		const result = IPutils.safe.fromByteArray(input);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.kind()).to.equal('ipv4');
		const bytes = result.toByteArray();
		expect(bytes).deep.equal(input.slice());
	});

	it('fromByteArray: IPv6', function () {
		const input = Data.IPv6.first.bytes;
		const result = IPutils.safe.fromByteArray(input);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.kind()).to.equal('ipv6');
		const bytes = result.toByteArray();
		expect(bytes).deep.equal(input.slice());
	});

	it('subnet: IPv4', function () {
		const input = Data.IPv4.first;
		const result = IPutils.safe.subnet(input.bytes, 24);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.addr.kind()).to.equal('ipv4');
		const bytes = result.toString();
		expect(bytes).deep.equal(input.string + '/24');
	});

	it('toByteArray: IPv4', function () {
		const input = Data.IPv4.first;
		const result = IPutils.safe.toByteArray(input.string);
		expect(result).not.equal(undefined);
		if (typeof result === 'undefined') { return; }
		expect(result.length).to.equal(4);
		const bytes = result;
		expect(bytes).deep.equal(input.bytes.slice());
	});
});