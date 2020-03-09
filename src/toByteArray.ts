import parse, { throwsParse } from './parse';

/**
 * Creates array of bytes if `string` is valid.
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {number[]} array of bytes.
 * @example
 * throwsToByteArray('127.1')
 * // => [127, 0, 0, 1]
 * throwsToByteArray('2001:db8:85a3::8a2e:370:7334%eth0')
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
	return throwsParse(string).bytes;
}

/**
 * Creates array of bytes if `string` is valid.
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {number[]} array of bytes.
 * @example
 * toByteArray('127.1')
 * // => [127, 0, 0, 1]
 * toByteArray('2001:db8:85a3::8a2e:370:7334%eth0')
 * // => [0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34]
 * toByteArray('::ff::')
 * // => null
 * @error INVALID_IPv4_STRING
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function toByteArray(string: string): number[] | null {
	const addr = parse(string);
	if (addr === null) { return null; }
	return addr.bytes;
}
