// import * as IPutils from '../lib/index';
import { IPv4Bytes, IPv6Bytes, IPv6Parts } from '../src/types';

export function getIPv6Parts(bytes: IPv6Bytes | number[]): IPv6Parts {
	return [
		(bytes[0] << 8) | bytes[1],
		(bytes[2] << 8) | bytes[3],
		(bytes[4] << 8) | bytes[5],
		(bytes[6] << 8) | bytes[7],
		(bytes[8] << 8) | bytes[9],
		(bytes[10] << 8) | bytes[11],
		(bytes[12] << 8) | bytes[13],
		(bytes[14] << 8) | bytes[15],
	]
}
export const Data = {
	IPv4: {
		error: [
			{
				string: '355.168.11.5',
				bytes: [355, 168, 11, 5],
			},
			{
				string: '-5.168.11.5',
				bytes: [-5, 168, 11, 5],
			},
			{
				string: '192.168.11.5.8',
				bytes: [192, 168, 11, 5, 8],
			},
			{
				string: '192.168.11.',
				bytes: [192, 168, 11],
			},
		],
		errorDecOctHex: [
			'192.0503.11.5',
			'999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999.1.1.1',
			'0777.0.0.0',
			'0x100.0.0.0',
			'192.11.5',
			'',
		],
		errorDec: [
			'265.192.11.5',
			'192.-168.11.5',
			'192.053.11.5',
			'192.0xFF.11.5',
		],
		errorOct: ['0300.0080.0002.0353', '0300.00x0.0002.0353', '0553.0777.0111.0'],
		errorHex: ['0xC0.0x00.0x02.0x', '0xC0.0x00.0x02.0xAZ', '0RC0.0x00.0x02.0xEB', '00xC0.0x00.0x02.0xEB'],
		errorDecOct: [
			'192.0xFF.11.5',
		],
		errorDecHex: [
			'192.053.11.5',
		],
		errorOctHex: [
			'192.0080.0002.0353',
			'0777.0000.0002.0353',
			'0xFFFF.0000.0111.0'
		],
		errorVariable: ['265.192.11.5.', '265.192.11.5.9', '265.192.11.', '265.192.', '265.192999999'],
		errorLong: [
			'999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
			'-46486'
		],
		errorNetworkMask: [
			[192, 168, 11, 5],
			[127, 0, 0, 1],
			[0xff, 0xfb, 0x00, 0x00],
		],
		ips: [
			{
				parse: ['192.168.11.5'],
				string: '192.168.11.5',
				bytes: [192, 168, 11, 5],
			},
			{
				parse: ['127.1'],
				string: '127.0.0.1',
				bytes: [127, 0, 0, 1],
			},
		],
		subnets: [
			// common
			{
				prefix: 8 + 8 + (6 + 3), // 25
				mask: [0xff, 0xff, 0xff, 0x80],
				hostMask: [0x00, 0x00, 0x00, 0x7f],
				host: {
					some: {
						string: '85.255.252.16',
						bytes: [0x55, 0xff, 0xfc, 0x10],
						cidr: '85.255.252.16/25',
					},
					first: {
						string: '85.255.252.1',
						bytes: [0x55, 0xff, 0xfc, 0x01],
					},
					last: {
						string: '85.255.252.126',
						bytes: [0x55, 0xff, 0xfc, 0x7e],
					},
				},
				errIps: [
					{
						string: '85.255.252.128',
						bytes: [0x55, 0xff, 0xfc, 0x80],
					},
					{
						string: '55.255.252.16',
						bytes: [0x37, 0xff, 0xfc, 0x10],
					},
				],
				errHosts: [
					{
						string: '85.255.252.127',
						bytes: [0x55, 0xff, 0xfc, 0x7f],
					},
				],
				network: {
					string: '85.255.252.0',
					bytes: [0x55, 0xff, 0xfc, 0x00],
				},
				broadcast: {
					string: '85.255.252.127',
					bytes: [0x55, 0xff, 0xfc, 0x7f],
				},
			},
			// p2p
			{
				prefix: 31,
				mask: [0xff, 0xff, 0xff, 0xfe],
				hostMask: [0x00, 0x00, 0x00, 0x01],
				host: {
					some: {
						string: '85.255.255.254',
						bytes: [0x55, 0xff, 0xff, 0xfe],
						cidr: '85.255.255.254/31',
					},
					first: {
						string: '85.255.255.254',
						bytes: [0x55, 0xff, 0xff, 0xfe],
					},
					last: {
						string: '85.255.255.255',
						bytes: [0x55, 0xff, 0xff, 0xff],
					},
				},
				errIps: [
					{
						string: '85.255.255.127',
						bytes: [0x55, 0xff, 0xff, 0x7f],
					},
					{
						string: '55.255.255.254',
						bytes: [0x37, 0xff, 0xff, 0x10],
					},
				],
				errHosts: [],
				network: {
					string: '85.255.255.254',
					bytes: [0x55, 0xff, 0xff, 0xfe],
				},
				broadcast: {
					string: '85.255.255.255',
					bytes: [0x55, 0xff, 0xff, 0xff],
				},
			},
			// p2p
			{
				prefix: 32,
				mask: [0xff, 0xff, 0xff, 0xff],
				hostMask: [0x00, 0x00, 0x00, 0x00],
				host: {
					some: {
						string: '85.255.255.255',
						bytes: [0x55, 0xff, 0xff, 0xff],
						cidr: '85.255.255.255/32',
					},
					first: {
						string: '85.255.255.255',
						bytes: [0x55, 0xff, 0xff, 0xff],
					},
					last: {
						string: '85.255.255.255',
						bytes: [0x55, 0xff, 0xff, 0xff],
					},
				},
				errIps: [
					{
						string: '85.255.255.127',
						bytes: [0x55, 0xff, 0xff, 0x7f],
					},
					{
						string: '55.255.255.255',
						bytes: [0x37, 0xff, 0xff, 0x10],
					},
				],
				errHosts: [],
				network: {
					string: '85.255.255.255',
					bytes: [0x55, 0xff, 0xff, 0xff],
				},
				broadcast: {
					string: '85.255.255.255',
					bytes: [0x55, 0xff, 0xff, 0xff],
				},
			},
		],
	},
	IPv6: {
		first: {},
		second: {},
		erroString: [
			'',
			':ff:', // colons = 2
			'::ff:', // colons = 3 - 1 = 2
			':ff::', // colons = 3 - 1 = 2
			'::ff::', // colons = 4 - 2 = 2

			'10001:db8:85a3::8a2e:370:7334', // invalid data

			'::2001:db8:85a3:0:0:8a2e:370:7334', // colons = 9 - 1 = 8
			'::2001:db8:85a3:0:0:8a2e:370', // colons = 8 - 1 = 7
			'2001:db8:85a3:0:0:8a2e:370:7334:55', // colons = 8
		],
		errorBytes: [
			[0x100, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
			[0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34, 0x55],
		],
		// errorParts: [
		// 	[0x10001, 0x0db8, 0x85a3, 0x0000, 0x0000, 0x8a2e, 0x0370, 0x7334],
		// 	[0x2001, 0x0db8, 0x85a3, 0x0000, 0x0000, 0x8a2e, 0x0370, 0x7334, 0x55],
		// ],
		errorNetworkMask: [
			[0xff, 0xff, 0xff, 0xff, 0xff, 0xfb, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
			[0xff, 0xff, 0xff, 0xff, 0xff, 0x81, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
		],
		ips: [
			{
				parse: [
					'2001:db8:85a3::8a2e:0370:7334',
				],
				string: '2001:db8:85a3::8a2e:370:7334',
				normalizedString: '2001:db8:85a3:0:0:8a2e:370:7334',
				fixedString: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
				bytes: [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
				parts: [0x2001, 0x0db8, 0x85a3, 0x0000, 0x0000, 0x8a2e, 0x0370, 0x7334],
			},
			{
				parse: [
					'::ffff:c0a8:b05',
					'::ffff:192.168.11.5',
				],
				string: '::ffff:192.168.11.5',
				bytes: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 192, 168, 11, 5],
				parts: [0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0xFFFF, (192 << 8) | 168, (11 << 8) | 5],
				isIPv4Mapped: true,
			},
		],
		subnet: [
			{
				prefix: 16 + 16 + (6 + 3), // 41
				mask: [0xff, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
				hostMask: [0x00, 0x00, 0x00, 0x00, 0x00, 0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
				host: {
					some: {
						string: '55ff:ffff:fc10::',
						bytes: [0x55, 0xff, 0xff, 0xff, 0xfc, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						cidr: '55ff:ffff:fc10::/41',
					},
					first: {
						string: '55ff:ffff:fc00::1',
						bytes: [0x55, 0xff, 0xff, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
					},
					last: {
						string: '55ff:ffff:fc7f:ffff:ffff:ffff:ffff:fffe',
						bytes: [0x55, 0xff, 0xff, 0xff, 0xfc, 0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe],
					},
				},
				errIps: [
					{
						string: '55ff:ffff:fc80::',
						bytes: [0x55, 0xff, 0xff, 0xff, 0xff, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
					},
					{
						string: '37ff:ffff:fc00::',
						bytes: [0x37, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
					},
				],
				errHosts: [
					{
						string: '55ff:ffff:fc00::',
						bytes: [0x55, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
					},
				],
				network: {
					string: '55ff:ffff:fc00::',
					bytes: [0x55, 0xff, 0xff, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
				},
				broadcast: {
					string: '55ff:ffff:fc7f:ffff:ffff:ffff:ffff:ffff',
					bytes: [0x55, 0xff, 0xff, 0xff, 0xfc, 0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
				},
			},
		],
	},
}// as const;
