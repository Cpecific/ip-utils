import IpUtilsError, { Codes } from './Error';
import IPv4 from './IPv4';
import IPv6 from './IPv6';

/**
 * Parses ip address `string` and, if `string` is IPv4 string, creates `IP` instance.
 * @param {string} string ip address: string in "IPv4" or "IPv6 transitional" format.
 * @returns {IPv4} `IPv4` instance.
 * @error INVALID_IP_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 */
function _parseIPv4(string: string) {
	let addr: IPv4 | IPv6 | null = IPv4.parse(string);
	if (addr !== null) { return addr; }
	addr = IPv6.parse(string);
	if (addr === null) {
		return Codes.INVALID_IP_STRING;
	}
	if (!addr.isIPv4MappedAddress()) {
		return Codes.INVALID_IPv6_IPv4_TRANSITIONAL_STRING;
	}
	return new IPv4(addr.bytes.slice(-4));
}

/**
 * Parses ip address `string` and, if `string` is IPv4 string, creates `IP` instance.
 * @param {string} string ip address: string in "IPv4" or "IPv6 transitional" format.
 * @returns {IPv4} `IPv4` instance.
 * @example
 * throwsParseIPv4('192.168.11.5')
 * // => IPv4
 * throwsParseIPv4('::ffff:192.168.11.5')
 * // => IPv4
 * throwsParseIPv4('::ffff:c0a8:b05')
 * // => IPv4
 * throwsParseIPv4('2001:db8:85a3::8a2e:370:7334')
 * // => throw new IpUtilsError(INVALID_IPv6_IPv4_TRANSITIONAL_STRING)
 * @throws {IpUtilsError} INVALID_IP_STRING
 * @throws {IpUtilsError} INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 */
export function throwsParseIPv4(string: string): IPv4 {
	const ret = _parseIPv4(string);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return ret;
}

/**
 * Parses ip address `string` and, if `string` is IPv4 string, creates `IP` instance.
 * @param {string} string ip address: string in "IPv4" or "IPv6 transitional" format.
 * @returns {(IPv4 | null)} `IPv4` instance, or `null` on error.
 * @example
 * parseIPv4('192.168.11.5')
 * // => IPv4
 * parseIPv4('::ffff:192.168.11.5')
 * // => IPv4
 * parseIPv4('::ffff:c0a8:b05')
 * // => IPv4
 * parseIPv4('2001:db8:85a3::8a2e:370:7334')
 * // => null
 * @error INVALID_IP_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 */
export default function parseIPv4(string: string): IPv4 | null {
	const ret = _parseIPv4(string);
	if (typeof ret === 'number') { return null; }
	return ret;
}