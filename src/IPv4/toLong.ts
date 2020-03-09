
/**
 * Converts IPv4 `bytes` array to unsigned int.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4) (*assumes correct*).
 * @returns {number} unsigned int.
 * @example
 * IPv4_toLong([192, 168, 11, 5])
 * // => 3232238341
 */
export default function IPv4_toLong(bytes: number[]): number {
	return (bytes[0] << 24) >>> 0 | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
}