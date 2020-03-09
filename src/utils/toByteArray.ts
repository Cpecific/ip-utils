import IpUtilsError, { Codes } from '../Error';
import IPv4_parseData from '../IPv4/parseData';
import IPv6_parseData from '../IPv6/parseData';
import type { IPv6_ParseData } from '../IPv6/parseData';

/**
 * Creates array of bytes if `string` is valid.
 * @utility
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {number[]} array of bytes.
 * @example
 * throwsToByteArray('127.1')
 * // => [127, 0, 0, 1]
 * throwsToByteArray('2001:db8:85a3::8a2e:370:7334')
 * // => [0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34]
 * throwsToByteArray('::ff::')
 * // => throw new IpUtilsError(INVALID_IP_STRING)
 * @error INVALID_IPv4_STRING
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 * @throws {IpUtilsError} INVALID_IP_STRING
 */
export function throwsToByteArray(string: string): number[] {
	const ret = toByteArray(string);
	if (ret === null) {
		throw new IpUtilsError(Codes.INVALID_IP_STRING)
	}
	return ret;
}

/**
 * Creates array of bytes if `string` is valid.
 * @utility
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {number[]} array of bytes.
 * @example
 * toByteArray('127.1')
 * // => [127, 0, 0, 1]
 * toByteArray('2001:db8:85a3::8a2e:370:7334')
 * // => [0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34]
 * toByteArray('::ff::')
 * // => null
 * @error INVALID_IPv4_STRING
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function toByteArray(string: string): number[] | null {
	let ret: number[] | IPv6_ParseData | number = IPv4_parseData(string);
	if (typeof ret !== 'number') { return ret; }
	ret = IPv6_parseData(string);
	if (typeof ret !== 'number') { return ret.bytes; }
	return null;
}
