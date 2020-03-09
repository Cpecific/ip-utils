import IpUtilsError from './Error';
import Network from './Network';

/**
 * Parses CIDR `string` and creates `Network` instance.
 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
 * @returns {Network} `Network` instance.
 * @example
 * throwsParseNetwork('192.168.11.5/24')
 * // => new Network(new IPv4([192, 168, 11, 5]), 24)
 * throwsParseNetwork('::1%eth0/128')
 * // => new Network(new IPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'eth0'), 128)
 * throwsParseNetwork('192.168.11.5')
 * // => throw new IpUtilsError(INVALID_CIDR_STRING)
 * throwsParseNetwork('::ff::/24')
 * // => throw new IpUtilsError(INVALID_IP_STRING)
 * throwsParseNetwork('192.168.11.5/35')
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_CIDR_STRING
 * @throws {IpUtilsError} INVALID_IP_STRING
 * @throws {IpUtilsError} PREFIX_IS_NOT_A_NUMBER
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function throwsParseNetwork(string: string): Network {
	const ret = Network.parseData(string);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return new Network(ret[0], ret[1]);
}

/**
 * Parses CIDR `string` and creates `Network` instance.
 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
 * @returns {(Network | null)} `Network` instance, or `null` on error.
 * @example
 * parseNetwork('192.168.11.5/24')
 * // => new Network(new IPv4([192, 168, 11, 5]), 24)
 * parseNetwork('::1%eth0/128')
 * // => new Network(new IPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 'eth0'), 128)
 * parseNetwork('192.168.11.5')
 * // => null
 * parseNetwork('::ff::/24')
 * // => null
 * parseNetwork('192.168.11.5/35')
 * // => null
 * @error INVALID_CIDR_STRING
 * @error INVALID_IP_STRING
 * @error PREFIX_IS_NOT_A_NUMBER
 * @error INVALID_NETMASK_LENGTH
 */
export default function parseNetwork(string: string): Network | null {
	const ret = Network.parseData(string);
	if (typeof ret === 'number') {
		return null;
	}
	return new Network(ret[0], ret[1]);
}
