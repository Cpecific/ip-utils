
/**
 * Converts `long` integer into array of bytes.
 * @utility
 * @param {number} long integer.
 * @returns {number[]} array of bytes (length = 4).
 * @example
 * IPv4_fromLong(3232238341)
 * // => [192, 168, 11, 5]
 */
export default function IPv4_fromLong(long: number): number[] {
	long >>>= 0;
	return [
		(long >> 24) & 0xFF,
		(long >> 16) & 0xFF,
		(long >> 8) & 0xFF,
		long & 0xFF,
	];
}