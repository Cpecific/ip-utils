import IpUtilsError, { Codes } from '../Error';
import toByteArray from '../utils/toByteArray';

/**
 * Parses CIDR `string` and creates network data tuple [ array of bytes, netmask length ].
 * @utility
 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
 * @returns {[number[], number]} tuple [ array of bytes, netmask length ].
 * @example
 * Network_throwsParseData('192.168.11.5/24')
 * // => [ [192, 168, 11, 5], 24 ]
 * Network_throwsParseData('::1%eth0/128')
 * // => [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 128 ]
 * Network_throwsParseData('192.168.11.5')
 * // => throw new IpUtilsError(INVALID_CIDR_STRING)
 * Network_throwsParseData('::ff::/24')
 * // => throw new IpUtilsError(INVALID_IP_STRING)
 * Network_throwsParseData('192.168.11.5/35')
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_CIDR_STRING
 * @throws {IpUtilsError} INVALID_IP_STRING
 * @throws {IpUtilsError} PREFIX_IS_NOT_A_NUMBER
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function Network_throwsParseData(string: string): [number[], number] {
	const ret = Network_parseData(string);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return ret;
}

/**
 * Parses CIDR `string` and creates network data tuple [ array of bytes, netmask length ].
 * @utility
 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
 * @returns {([number[], number] | number)} tuple[ array of bytes, netmask length ], or error code.
 * @example
 * Network_parseData('192.168.11.5/24')
 * // => [ [192, 168, 11, 5], 24 ]
 * Network_parseData('::1%eth0/128')
 * // => [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 128 ]
 * Network_parseData('192.168.11.5')
 * // => INVALID_CIDR_STRING
 * Network_parseData('::ff::/24')
 * // => INVALID_IP_STRING
 * Network_parseData('192.168.11.5/35')
 * // => INVALID_NETMASK_LENGTH
 * @error INVALID_CIDR_STRING
 * @error INVALID_IP_STRING
 * @error PREFIX_IS_NOT_A_NUMBER
 * @error INVALID_NETMASK_LENGTH
 */
export default function Network_parseData(string: string) {
	const match = string.match(/^(.+)\/(\d+)$/);
	if (!match) {
		return Codes.INVALID_CIDR_STRING;
	}
	const bytes = toByteArray(match[1]);
	if (bytes === null) {
		return Codes.INVALID_IP_STRING;
	}
	const prefix = parseInt(match[2], 10);
	if (typeof prefix !== 'number' || isNaN(prefix)) {
		return Codes.PREFIX_IS_NOT_A_NUMBER;
	}
	if (prefix > bytes.length * 8) {
		return Codes.INVALID_NETMASK_LENGTH;
	}
	return [bytes, prefix] as [number[], number];
}