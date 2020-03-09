import IpUtilsError, { Codes } from '../Error';
import IPv4_parseData from '../IPv4/parseData';
import IPv6_parseData from '../IPv6/parseData';
import IPv6_isIPv4MappedAddress from '../IPv6/isIPv4MappedAddress';
import type { IPv6_ParseData } from '../IPv6/parseData';

/**
 * Parses ip address `string` and, if `string` is IPv4 string, returns array of bytes.
 * @param {string} string ip address: string in "IPv4" or "IPv6 transitional" format.
 * @returns {(number[] | number)} array of bytes, or error code.
 * @error INVALID_IP_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 */
function _parseIPv4(string: string) {
	let addr: number[] | IPv6_ParseData | number = IPv4_parseData(string);
	if (typeof addr !== 'number') { return addr; }
	addr = IPv6_parseData(string);
	if (typeof addr === 'number') {
		return Codes.INVALID_IP_STRING;
	}
	if (!IPv6_isIPv4MappedAddress(addr.bytes)) {
		return Codes.INVALID_IPv6_IPv4_TRANSITIONAL_STRING;
	}
	return addr.bytes.slice(-4);
}

/**
 * Parses ip address `string` and, if `string` is IPv4 string, returns array of bytes.
 * @param {string} string ip address: string in "IPv4" or "IPv6 transitional" format.
 * @returns {number[]} array of bytes.
 * @example
 * throwsParseIPv4('192.168.11.5')
 * // => [192, 168, 11, 5]
 * throwsParseIPv4('::ffff:192.168.11.5')
 * // => [192, 168, 11, 5]
 * throwsParseIPv4('::ffff:c0a8:b05')
 * // => [192, 168, 11, 5]
 * throwsParseIPv4('2001:db8:85a3::8a2e:370:7334')
 * // => throw new IpUtilsError(INVALID_IPv6_IPv4_TRANSITIONAL_STRING)
 * @throws {IpUtilsError} INVALID_IP_STRING
 * @throws {IpUtilsError} INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 */
export function throwsParseIPv4(string: string): number[] {
	const ret = _parseIPv4(string);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return ret;
}

/**
 * Parses ip address `string` and, if `string` is IPv4 string, returns array of bytes.
 * @param {string} string ip address: string in "IPv4" or "IPv6 transitional" format.
 * @returns {(number[] | null)} array of bytes, or `null` on error.
 * @example
 * parseIPv4('192.168.11.5')
 * // => [192, 168, 11, 5]
 * parseIPv4('::ffff:192.168.11.5')
 * // => [192, 168, 11, 5]
 * parseIPv4('::ffff:c0a8:b05')
 * // => [192, 168, 11, 5]
 * parseIPv4('2001:db8:85a3::8a2e:370:7334')
 * // => null
 * @error INVALID_IP_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 */
export default function parseIPv4(string: string): number[] | null {
	const ret = _parseIPv4(string);
	if (typeof ret === 'number') { return null; }
	return ret;
}