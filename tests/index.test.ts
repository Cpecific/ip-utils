import { expect, assert } from 'chai';
import deepEqual from 'deep-equal';

import * as IPutils from '../src/index';
import * as utils from '../src/utils';

import { Data, getIPv6Parts } from './data';

describe('std', function () {
	it('fromPrefixLength', function () {
		{
			for (const input of Data.IPv4.subnets) {
				const result = IPutils.fromPrefixLength(input.prefix, 4);
				expect(result).not.equal(null);
				// utils
				const u = utils.fromPrefixLength(input.prefix, 4);
				expect(u).not.equal(null);
				if (result === null || u === null) { return; }
				
				expect(result.bytes).deep.equal(u);
				expect(result.bytes).deep.equal(input.mask);
			}
		}
		{
			for (const input of Data.IPv6.subnet) {
				const result = IPutils.fromPrefixLength(input.prefix, 16);
				expect(result).not.equal(null);
				// utils
				const u = utils.fromPrefixLength(input.prefix, 16);
				expect(u).not.equal(null);
				if (result === null || u === null) { return; }
				
				expect(result.bytes).deep.equal(u);
				expect(result.bytes).deep.equal(input.mask);
			}
		}
	});
	it('fromNetworkMask', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const result = IPutils.fromNetworkMask(input.mask.slice());
				expect(result).equal(input.prefix);
			}
		}
		// error
		{
			for (const bytes of Data.IPv4.errorNetworkMask) {
				const result = IPutils.fromNetworkMask(bytes.slice());
				expect(result).equal(null);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const result = IPutils.fromNetworkMask(input.mask.slice());
				expect(result).equal(input.prefix);
			}
		}
		// error
		{
			for (const bytes of Data.IPv6.errorNetworkMask) {
				const result = IPutils.fromNetworkMask(bytes.slice());
				expect(result).equal(null);
			}
		}
	});
	it('matchCIDR', function () {
		{
			for (const input of Data.IPv4.subnets) {
				for (const key in input.host) {
					const host = input.host[key as keyof typeof input.host];
					const result = IPutils.matchNetwork(host.bytes.slice(), input.network.bytes.slice(), input.prefix);
					expect(result).equal(true);
				}
			}
		}
		// invalid ips not contained by subnet
		{
			for (const input of Data.IPv4.subnets) {
				for (const host of input.errIps) {
					const result = IPutils.matchNetwork(host.bytes.slice(), input.network.bytes.slice(), input.prefix);
					expect(result).equal(false);
				}
			}
		}
		// invalid host not contained by subnet
		{
			for (const input of Data.IPv4.subnets) {
				for (const host of input.errHosts) {
					const result = IPutils.matchNetwork(host.bytes.slice(), input.network.bytes.slice(), input.prefix);
					if (result) {
						const network = new IPutils.Network(new IPutils.IPv4(input.network.bytes.slice()), input.prefix);
						assert(
							deepEqual(host.bytes, network.networkAddressBytes())
							|| deepEqual(host.bytes, network.broadcastAddressBytes())
						);
						// utility
						assert(
							deepEqual(host.bytes, utils.Network.networkAddressBytes([network.addr.bytes, network.prefix]))
							|| deepEqual(host.bytes, utils.Network.broadcastAddressBytes([network.addr.bytes, network.prefix]))
						);
					}
				}
			}
		}
		// ipv4 !== ipv6
		{
			for (const ipv4 of Data.IPv4.subnets) {
				for (const ipv6 of Data.IPv6.ips) {
					const result = IPutils.matchNetwork(ipv6.bytes.slice(), ipv4.network.bytes.slice(), ipv4.prefix);
					expect(result).equal(null);
				}
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const host = input.host.first;
				const result = IPutils.matchNetwork(host.bytes.slice(), input.network.bytes.slice(), input.prefix);
				expect(result).equal(true);
			}
		}
	});
	it('parse', function () {
		// IPv4
		{
			for (const input of Data.IPv4.ips) {
				for (const p of input.parse) {
					const result = IPutils.parse(p);
					expect(result).not.equal(null);
					if (result === null) { return; }
					expect(result.kind()).to.equal('ipv4');
					const bytes = result.toByteArray();
					expect(bytes).deep.equal(input.bytes.slice());
				}
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.ips) {
				for (const p of input.parse) {
					const result = IPutils.throwsParse(p);
					expect(result).not.equal(null);
					if (result === null) { return; }
					expect(result.kind()).to.equal('ipv6');
					if (!IPutils.isIPv6(result)) { return; }
					const bytes = result.toByteArray();
					expect(bytes).deep.equal(input.bytes.slice());
					// IPv6 (IPv4-mapped IPv6)
					if (typeof input.isIPv4Mapped !== 'undefined') {
						let bMapped = result.isIPv4MappedAddress();
						expect(bMapped).to.equal(true);
						// utils
						bMapped = utils.IPv6.isIPv4MappedAddress(result.bytes);
						expect(bMapped).to.equal(true);
					}
				}
			}
		}
	});
	it('parseNetwork', function () {
		// IPv4
		{
			for (const input of Data.IPv4.ips) {
				for (const p of input.parse) {
					const inputString = p + '/24';
					const result = IPutils.parseNetwork(inputString);
					expect(result).not.equal(null);
					// utils
					expect(utils.parseNetwork(inputString)).not.equal(null);
					if (result === null) { return; }
					expect(result.addr.kind()).to.equal('ipv4');
					const str = result.toString();
					expect(str).to.equal(input.string + '/24');
				}
			}
		}
		// .subnets
		{
			for (const input of Data.IPv4.subnets) {
				const inputString = input.host.some.string + '/' + input.prefix;
				const result = IPutils.parseNetwork(inputString);
				expect(result).not.equal(null);
				// utils
				expect(utils.parseNetwork(inputString)).not.equal(null);
				if (result === null) { return; }
				expect(result.addr.kind()).to.equal('ipv4');
				const str = result.toString();
				expect(str).to.equal(inputString);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.ips) {
				for (const p of input.parse) {
					const inputString = p + '/64';
					const result = IPutils.parseNetwork(inputString);
					expect(result).not.equal(null);
					// utils
					expect(utils.parseNetwork(inputString)).not.equal(null);
					if (result === null) { return; }
					expect(result.addr.kind()).to.equal('ipv6');
					const str = result.toString();
					expect(str).to.equal(input.string + '/64');
				}
			}
		}
		// .subnets
		{
			for (const input of Data.IPv6.subnet) {
				const inputString = input.host.some.string + '/' + input.prefix;
				const result = IPutils.parseNetwork(inputString);
				expect(result).not.equal(null);
				// utils
				expect(utils.parseNetwork(inputString)).not.equal(null);
				if (result === null) { return; }
				expect(result.addr.kind()).to.equal('ipv6');
				const str = result.toString();
				expect(str).to.equal(inputString);
			}
		}
	});
	it('parseIPv4', function () {
		{
			for (const input of Data.IPv6.ips) {
				if (typeof input.isIPv4Mapped !== 'undefined') { continue; }
				for (const p of input.parse) {
					const result = IPutils.parseIPv4(p);
					expect(result).equal(null);
					// utils
					expect(utils.parseIPv4(p)).equal(null);
				}
			}
		}
		// IPv6 transitional
		{
			for (const input of Data.IPv6.ips) {
				if (typeof input.isIPv4Mapped === 'undefined') { continue; }
				for (const p of input.parse) {
					const result = IPutils.parseIPv4(p);
					expect(result).not.equal(null);
					// utils
					const u = utils.parseIPv4(p);
					expect(u).not.equal(null);
					if (result === null) { return; }

					expect(u).deep.equal(result.bytes);
					expect(result.kind()).to.equal('ipv4');
					const bytes = result.toByteArray();
					expect(bytes).deep.equal(input.bytes.slice(-4));
				}
			}
		}
	});
	it('fromByteArray', function () {
		// IPv4
		{
			for (const input of Data.IPv4.ips) {
				const result = IPutils.fromByteArray(input.bytes.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				expect(result.kind()).to.equal('ipv4');
				const bytes = result.toByteArray();
				expect(bytes).deep.equal(input.bytes);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.ips) {
				const result = IPutils.fromByteArray(input.bytes.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				expect(result.kind()).to.equal('ipv6');
				if (!IPutils.isIPv6(result)) { return; }
				const bytes = result.toByteArray();
				expect(bytes).deep.equal(input.bytes.slice());
			}
		}
	});
	it('network', function () {
		{
			for (const input of Data.IPv4.ips) {
				const result = IPutils.Network.construct(input.bytes.slice(), 24);
				expect(result).not.equal(null);
				if (result === null) { return; }
				expect(result.addr.kind()).to.equal('ipv4');
				const string = result.toString();
				expect(string).deep.equal(input.string + '/24');
			}
		}
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const result = IPutils.Network.construct(ihost.bytes.slice(), input.prefix);
				expect(result).not.equal(null);
				if (result === null) { return; }
				expect(result.addr.kind()).to.equal('ipv4');
				const string = result.toString();
				expect(string).equal(ihost.cidr);
			}
		}
	});
	it('toByteArray', function () {
		// IPv4
		{
			for (const input of Data.IPv4.ips) {
				for (const p of input.parse) {
					const result = IPutils.toByteArray(p);
					expect(result).not.equal(null);
					// utils
					const u = utils.toByteArray(p);
					expect(u).not.equal(null);
					if (result === null) { return; }

					expect(result).deep.equal(u);
					expect(result.length).to.equal(input.bytes.length);
					const bytes = result;
					expect(bytes).deep.equal(input.bytes.slice());
				}
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.ips) {
				for (const p of input.parse) {
					const result = IPutils.toByteArray(p);
					expect(result).not.equal(null);
					// utils
					const u = utils.toByteArray(p);
					expect(u).not.equal(null);
					if (result === null) { return; }

					expect(result).deep.equal(u);
					expect(result.length).to.equal(input.bytes.length);
					const bytes = result;
					expect(bytes).deep.equal(input.bytes.slice());
				}
			}
		}
	});
	it('toString', function () {
		{
			for (const input of Data.IPv4.ips) {
				const result = IPutils.toString(input.bytes.slice());
				expect(result).not.equal(null);
				const u = utils.toString(input.bytes.slice())
				expect(u).not.equal(null);
				if (result === null) { return; }

				expect(result).to.equal(u);
				expect(result).to.equal(input.string);
			}
		}
		{
			for (const input of Data.IPv6.ips) {
				const result = IPutils.toString(input.bytes.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				expect(result).to.equal(input.string);
			}
		}
	});
});

describe('IPv4', function () {
	it('parse', function () {
		{
			for (const input of Data.IPv4.ips) {
				for (const p of input.parse) {
					const result = IPutils.IPv4.parse(p);
					expect(result).not.equal(null);
					if (result === null) { return; }
					const string = result.toString();
					expect(string).deep.equal(input.string);
				}
			}
		}
		// error: invalid decimal...
		{
			IPutils.IPv4.SetParsePermissions(['decimal']);
			for (const input of Data.IPv4.errorDec) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['decimal', 'octet']);
			for (const input of Data.IPv4.errorDecOct) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['decimal', 'hex']);
			for (const input of Data.IPv4.errorDecHex) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['decimal', 'octet', 'hex']);
			for (const input of Data.IPv4.errorDecOctHex) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['octet']);
			for (const input of Data.IPv4.errorOct) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['octet', 'hex']);
			for (const input of Data.IPv4.errorOctHex) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['hex']);
			for (const input of Data.IPv4.errorHex) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['decimal', 'octet', 'hex', 'variable']);
			for (const input of Data.IPv4.errorVariable) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
			IPutils.IPv4.SetParsePermissions(['decimal', 'octet', 'hex', 'long']);
			for (const input of Data.IPv4.errorLong) {
				const result = IPutils.IPv4.parse(input);
				expect(result).equal(null);
			}
		}
		IPutils.IPv4.ResetParsePermissions();
	});
	it('construct', function () {
		{
			for (const input of Data.IPv4.ips) {
				const result = IPutils.IPv4.construct(input.bytes.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				const string = result.toString();
				expect(string).equal(input.string);
				const bytes = result.toByteArray();
				expect(bytes).deep.equal(input.bytes);
			}
		}
		// error
		{
			for (const input of Data.IPv4.error) {
				const result = IPutils.IPv4.construct(input.bytes.slice());
				expect(result).equal(null);
			}
		}
	});
	it('prefixLengthFromNetworkMask', function () {
		// not netmask
		{
			for (const input of Data.IPv4.errorNetworkMask) {
				const result = IPutils.IPv4.construct(input.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				const prefix = result.prefixLengthFromNetworkMask();
				expect(prefix).equal(null);
			}
		}
		// netmask
		{
			for (const input of Data.IPv4.subnets) {
				const result = IPutils.IPv4.construct(input.mask.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				const prefix = result.prefixLengthFromNetworkMask();
				expect(prefix).equal(input.prefix);
			}
		}
	});
});

describe('IPv6', function () {
	it('parse', function () {
		{
			for (const input of Data.IPv6.ips) {
				for (const p of input.parse) {
					const result = IPutils.IPv6.parse(p);
					expect(result).not.equal(null);
					if (result === null) { return; }
					const string = result.toString();
					expect(string).equal(input.string);
				}
			}
		}
		// error
		{
			for (const string of Data.IPv6.erroString) {
				const result = IPutils.IPv6.parse(string);
				expect(result).equal(null);
			}
		}
	});
	it('construct', function () {
		// (bytes)
		{
			for (const input of Data.IPv6.ips) {
				const result = IPutils.IPv6.construct(input.bytes.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				const string = result.toString();
				expect(string).equal(input.string);
				const bytes = result.toByteArray();
				expect(bytes).deep.equal(input.bytes.slice());
			}
		}
		// (parts)
		{
			for (const input of Data.IPv6.ips) {
				const result = IPutils.IPv6.construct(getIPv6Parts(input.bytes));
				expect(result).to.equal(null);
			}
		}
		// error (bytes)
		{
			for (const bytes of Data.IPv6.errorBytes) {
				let result = IPutils.IPv6.construct(bytes.slice());
				expect(result).equal(null);
				if (result !== null) { return; }
			}
		}
		// error (parts)
		// {
		// 	for (const parts of Data.IPv6.errorParts) {
		// 		let result = IPutils.IPv6.construct(parts.slice());
		// 		expect(result).equal(null);
		// 		if (result !== null) { return; }
		// 	}
		// }
	});
	it('parts', function () {
		for (const input of Data.IPv6.ips) {
			const result = IPutils.IPv6.construct(input.bytes.slice());
			expect(result).not.equal(null);
			if (result === null) { return; }
			const parts = result.parts();
			expect(parts).deep.equal(getIPv6Parts(input.bytes));
		}
	});
	it('isIPv4MappedAddress', function () {
		{
			for (const input of Data.IPv6.ips) {
				const result = IPutils.IPv6.construct(input.bytes.slice());
				expect(result).not.equal(null);
				if (result === null) { return; }
				const bool = result.isIPv4MappedAddress();
				expect(bool).equal(typeof input.isIPv4Mapped !== 'undefined' ? input.isIPv4Mapped : false);
			}
		}
	});
	it('toIPv4Address', function () {
		{
			for (const input of Data.IPv6.ips) {
				const ipv6 = IPutils.IPv6.construct(input.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const ipv4 = ipv6.toIPv4Address();
				if (typeof input.isIPv4Mapped !== 'undefined') {
					expect(ipv4).not.equal(null);
					if (ipv4 === null) { return; }
					expect(ipv4.bytes).deep.equal(input.bytes.slice(-4));
				}
				else {
					expect(ipv4).equal(null);
				}
			}
		}
	});
	it('prefixLengthFromNetworkMask', function () {
		// not IPv6 mask
		{
			for (const bytes of Data.IPv6.errorNetworkMask) {
				const ipv6 = IPutils.IPv6.construct(bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const prefix = ipv6.prefixLengthFromNetworkMask();
				expect(prefix).equal(null);
			}
		}
		// IPv6 mask
		{
			for (const input of Data.IPv6.subnet) {
				const ipv6 = IPutils.IPv6.construct(input.mask.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const prefix = ipv6.prefixLengthFromNetworkMask();
				expect(prefix).not.equal(null);
				if (prefix === null) { return; }
				expect(prefix).equal(input.prefix);
			}
		}
	});
	it('toNormalizedString', function () {
		for (const input of Data.IPv6.ips) {
			if (typeof input.normalizedString === 'undefined') { continue; }
			const ipv6 = IPutils.IPv6.construct(input.bytes.slice());
			expect(ipv6).not.equal(null);
			if (ipv6 === null) { return; }

			const string = ipv6.toNormalizedString();
			expect(string).equal(input.normalizedString);
		}
	});
	it('toFixedLengthString', function () {
		for (const input of Data.IPv6.ips) {
			if (typeof input.fixedString === 'undefined') { continue; }
			const ipv6 = IPutils.IPv6.construct(input.bytes.slice());
			expect(ipv6).not.equal(null);
			if (ipv6 === null) { return; }

			const string = ipv6.toFixedLengthString();
			expect(string).equal(input.fixedString);
		}
	});
});

describe('Network', function () {
	it('construct', function () {
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const result = IPutils.Network.construct(ipv4, input.prefix);
				expect(result).not.equal(null);
				if (result === null) { return; }

				const string = result.toString();
				expect(string).equal(ihost.cidr);
			}
		}
		// error: invalid input (netmask length)
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const result = IPutils.Network.construct(ipv4, 33);
				expect(result).equal(null);
			}
		}
	});
	it('mask', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const network = IPutils.Network.construct(ipv4, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.mask();
				expect(result).deep.equal(input.mask);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ihost = input.host.some;
				const ipv6 = IPutils.IPv6.construct(ihost.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const network = IPutils.Network.construct(ipv6, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.mask();
				expect(result).deep.equal(input.mask);
			}
		}
	});
	it('hostMask', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const network = IPutils.Network.construct(ipv4, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.hostMask();
				expect(result).deep.equal(input.hostMask);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ihost = input.host.some;
				const ipv = IPutils.IPv6.construct(ihost.bytes.slice());
				expect(ipv).not.equal(null);
				if (ipv === null) { return; }

				const network = IPutils.Network.construct(ipv, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.hostMask();
				expect(result).deep.equal(input.hostMask);
			}
		}
	});
	it('firstHost', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const network = IPutils.Network.construct(ipv4, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.firstHost();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.host.first.string);
				expect(result.bytes).deep.equal(input.host.first.bytes);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ihost = input.host.some;
				const ipv6 = IPutils.IPv6.construct(ihost.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const network = IPutils.Network.construct(ipv6, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.firstHost();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.host.first.string);
				expect(result.bytes).deep.equal(input.host.first.bytes);
			}
		}
	});
	it('lastHost', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const network = IPutils.Network.construct(ipv4, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.lastHost();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.host.last.string);
				expect(result.bytes).deep.equal(input.host.last.bytes);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ihost = input.host.some;
				const ipv6 = IPutils.IPv6.construct(ihost.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const network = IPutils.Network.construct(ipv6, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.lastHost();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.host.last.string);
				expect(result.bytes).deep.equal(input.host.last.bytes);
			}
		}
	});
	it('networkAddress', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;
				const ipv4 = IPutils.IPv4.construct(ihost.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const network = IPutils.Network.construct(ipv4, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.networkAddress();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.network.string);
				expect(result.bytes).deep.equal(input.network.bytes);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ihost = input.host.some;
				const ipv6 = IPutils.IPv6.construct(ihost.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const network = IPutils.Network.construct(ipv6, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.networkAddress();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.network.string);
				expect(result.bytes).deep.equal(input.network.bytes);
			}
		}
	});
	it('broadcastAddress', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ihost = input.host.some;

				const network = IPutils.Network.construct(ihost.bytes.slice(), input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.broadcastAddress();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.broadcast.string);
				expect(result.bytes).deep.equal(input.broadcast.bytes);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ihost = input.host.some;
				const ipv6 = IPutils.IPv6.construct(ihost.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const network = IPutils.Network.construct(ipv6, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const result = network.broadcastAddress();
				expect(result).not.equal(null);
				if (result === null) { return; }

				expect(result.toString()).equal(input.broadcast.string);
				expect(result.bytes).deep.equal(input.broadcast.bytes);
			}
		}
	});
	it('contains', function () {
		// IPv4
		{
			for (const input of Data.IPv4.subnets) {
				const ipv4 = IPutils.IPv4.construct(input.network.bytes.slice());
				expect(ipv4).not.equal(null);
				if (ipv4 === null) { return; }

				const network = IPutils.Network.construct(ipv4, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const b1 = network.contains(input.host.some.bytes.slice());
				expect(b1).equal(true);

				// const b2 = network.contains(Data.IPv4.first.bytes.slice());
				// expect(b2).equal(false);
			}
		}
		// IPv6
		{
			for (const input of Data.IPv6.subnet) {
				const ipv6 = IPutils.IPv6.construct(input.network.bytes.slice());
				expect(ipv6).not.equal(null);
				if (ipv6 === null) { return; }

				const network = IPutils.Network.construct(ipv6, input.prefix);
				expect(network).not.equal(null);
				if (network === null) { return; }

				const b1 = network.contains(input.host.some.bytes.slice());
				expect(b1).equal(true);
			}
		}
	});
});