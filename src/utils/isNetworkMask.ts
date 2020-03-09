import { bitTable } from './_data';

/**
 * Checks if `bytes` is valid network mask.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16, *variable*).
 * @returns {boolean} `true` if `bytes` is valid network mask, else `false`.
 * @example
 * isNetworkMask([255, 192, 0, 0]) // 192 = 1100 0000
 * // => true
 * isNetworkMask([255, 63, 0, 0]) // 63 = 0011 1111
 * // => false
 */
export default function isNetworkMask(bytes: number[]): boolean {
	var i = 0;
	for (; i < bytes.length; ++i) {
		const byte = bytes[i];
		if (!(byte in bitTable)) {
			return false;
		}
		const bits = bitTable[byte as keyof typeof bitTable];
		if (bits !== 8) {
			++i;
			break;
		}
	}
	for (; i < bytes.length; ++i) {
		const byte = bytes[i];
		if (byte !== 0) { return false; }
	}
	return true;
}