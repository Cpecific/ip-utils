import IpUtilsError, { Codes } from '../Error';

/**
 * Check whether `first` and `second` are within same network (first `prefix` bits are equal).
 * @utility
 * @param {number[]} first ip address: array of bytes (length = 4, 16, *variable*) (*assumes correct*).
 * @param {number[]} second ip address: array of bytes (length = 4, 16, *variable*) (*assumes correct*).
 * @param {number} prefix netmask length (*assumes correct*).
 * @returns {boolean} `true` if `first` and `second` are within same network.
 * @example
 * throwsMatchNetwork([85, 192, 15, 60], [85, 214, 170, 83], 10)
 * // => true (192 = 1100 0000, 214 = 1101 0110)
 * throwsMatchNetwork([85, 192, 15, 60], [85, 150, 170, 83], 10)
 * // => false (192 = 1100 0000, 214 = 1001 0110)
 * throwsMatchNetwork([85, 192, 15, 60], [85, 192, 15, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 10)
 * // => throw new IpUtilsError(MATCH_NETWORK_MISMATCHING_LENGTH)
 * @throws {IpUtilsError} MATCH_NETWORK_MISMATCHING_LENGTH
 */
export function throwsMatchNetwork(first: number[], second: number[], prefix: number): boolean {
	const ret = matchNetwork(first, second, prefix);
	if (ret === null) {
		throw new IpUtilsError(Codes.MATCH_NETWORK_MISMATCHING_LENGTH);
	}
	return ret;
}

/**
 * Check whether `first` and `second` are within same network (first `prefix` bits are equal).
 * @utility
 * @param {number[]} first ip address: array of bytes (length = 4, 16, *variable*) (*assumes correct*).
 * @param {number[]} second ip address: array of bytes (length = 4, 16, *variable*) (*assumes correct*).
 * @param {number} prefix netmask length (*assumes correct*).
 * @returns {(boolean | null)} `true` if `first` and `second` are within same network, else `false`, or `null` on error.
 * @example
 * matchNetwork([85, 192, 15, 60], [85, 214, 170, 83], 10)
 * // => true (192 = 1100 0000, 214 = 1101 0110)
 * matchNetwork([85, 192, 15, 60], [85, 150, 170, 83], 10)
 * // => false (192 = 1100 0000, 214 = 1001 0110)
 * matchNetwork([85, 192, 15, 60], [85, 192, 15, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 10)
 * // => null
 * @error MATCH_NETWORK_MISMATCHING_LENGTH
 */
export default function matchNetwork(first: number[], second: number[], prefix: number): boolean | null {
	if (first.length !== second.length) {
		return null;
	}
	for (let i = 0; prefix > 0; ++i) {
		if (prefix >= 8) {
			if (first[i] !== second[i]) { return false; }
		} else {
			const shift = 8 - prefix;
			if ((first[i] >> shift) !== (second[i] >> shift)) { return false; }
		}
		prefix -= 8;
	}
	return true;
}

/**
 * Check whether `first` and `second` are within same network (first `prefix` bits are equal).
 * @utility
 * @param {number[]} first ip address: array of bytes (length = 4, 16, *variable*) (*assumes correct*).
 * @param {number[]} second ip address: array of bytes (length = 4, 16, *variable*) (*assumes correct*).
 * @param {number} prefix netmask length (*assumes correct*).
 * @returns {boolean} `true` if `first` and `second` are within same network, else `false`.
 * @example
 * matchNetworkBoolean([85, 192, 15, 60], [85, 214, 170, 83], 10)
 * // => true (192 = 1100 0000, 214 = 1101 0110)
 * matchNetworkBoolean([85, 192, 15, 60], [85, 150, 170, 83], 10)
 * // => false (192 = 1100 0000, 214 = 1001 0110)
 * matchNetworkBoolean([85, 192, 15, 60], [85, 192, 15, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 10)
 * // => false
 * @error MATCH_NETWORK_MISMATCHING_LENGTH
 */
export function matchNetworkBoolean(first: number[], second: number[], prefix: number): boolean {
	const ret = matchNetwork(first, second, prefix);
	if (ret === null) { return false; }
	return ret;
}
