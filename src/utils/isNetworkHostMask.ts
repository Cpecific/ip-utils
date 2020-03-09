import { notBitTable } from './_data';

/**
 * Checks if `bytes` is valid network host mask.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16, *variable*).
 * @returns {boolean} `true` if `bytes` is valid network host mask, else `false`.
 * @example
 * isNetworkHostMask([0, 63, 255, 255]) // 63 = 0011 1111
 * // => true
 * isNetworkHostMask([0, 192, 255, 255]) // 192 = 1100 0000
 * // => false
 */
export default function isNetworkHostMask(bytes: number[]): boolean {
	var i = bytes.length - 1;
	for (; i >= 0; --i) {
		const byte = bytes[i];
		if (!(byte in notBitTable)) {
			return false;
		}
		const bits = notBitTable[byte as keyof typeof notBitTable];
		if (bits !== 8) {
			--i;
			break;
		}
	}
	for (; i >= 0; --i) {
		const byte = bytes[i];
		if (byte !== 0) { return false; }
	}
	return true;
}