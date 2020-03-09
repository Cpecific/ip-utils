import matchNetwork from '../utils/matchNetwork';

/**
 * @utility
 * @param bytes ip address: array of bytes (length = 16) (*assumes correct*).
 * @returns {boolean} `true` if ip address is contained by "ipv4Mapped" special range, else `false`.
 */
export default function IPv6_isIPv4MappedAddress(bytes: number[]): boolean {
	return matchNetwork(bytes, [
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0xff, 0xff,
		0, 0, 0, 0
	], 96) === true;
}