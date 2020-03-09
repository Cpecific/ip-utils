import type { IPvClass } from './types';
import IpUtilsError, { Codes } from './Error';
import IPv4 from './IPv4';
import IPv6 from './IPv6';

/**
 * Creates `IP` instance if `string` is valid.
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {IPvClass} `IP` instance.
 * @example
 * throwsParse('127.1')
 * // => new IPv4([127, 0, 0, 1])
 * throwsParse('2001:db8:85a3::8a2e:370:7334%eth0')
 * // => new IPv6([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 
 * //              0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34], 'eth0')
 * throwsParse('::ff::')
 * // => throw new IpUtilsError(INVALID_IP_STRING)
 * @error INVALID_IPv4_STRING
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 * @throws {IpUtilsError} INVALID_IP_STRING
 */
export function throwsParse(string: string): IPvClass {
	const ret = parse(string);
	if (ret === null) {
		throw new IpUtilsError(Codes.INVALID_IP_STRING);
	}
	return ret;
}

/**
 * Creates `IP` instance if `string` is valid.
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {(IPvClass | null)} `IP` instance, or `null` on error.
 * @example
 * parse('127.1')
 * // => new IPv4([127, 0, 0, 1])
 * parse('2001:db8:85a3::8a2e:370:7334%eth0')
 * // => new IPv6([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 
 * //              0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34], 'eth0')
 * parse('::ff::')
 * // => null
 * @error INVALID_IPv4_STRING
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function parse(string: string): IPvClass | null {
	let ret: IPvClass | null = IPv4.parse(string);
	if (ret !== null) { return ret; }
	return IPv6.parse(string);
}