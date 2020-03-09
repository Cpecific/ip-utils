import Network_parseData from '../Network/parseData';

export {
	Network_throwsParseData as throwsParseNetwork
} from '../Network/parseData';

/**
 * Parses CIDR `string` and creates network data tuple [ array of bytes, netmask length ].
 * @utility
 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
 * @returns {([number[], number] | null)} tuple[ array of bytes, netmask length ], or `null` on error.
 * @example
 * parseNetwork('192.168.11.5/24')
 * // => [ [192, 168, 11, 5], 24 ]
 * parseNetwork('::1%eth0/128')
 * // => [ [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 128 ]
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
export default function parseNetwork(string: string): [number[], number] | null {
	const ret = Network_parseData(string);
	if (typeof ret === 'number') {
		return null;
	}
	return ret;
}
