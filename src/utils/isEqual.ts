
/**
 * Checks whether `first` and `second` byte arrays are equal.
 * @utility
 * @param {number[]} first ip address: array of bytes (length = 4, 16, *variable*).
 * @param {number[]} second ip address: array of bytes (length = 4, 16, *variable*).
 * @returns {boolean} `true` if `first` and `second` byte arrays are equal, else `false`.
 * @example
 * isEqual([192, 168, 11, 5], [10, 83, 2, 14])
 * // => false
 */
export default function isEqual(first: number[], second: number[]): boolean {
	if (first.length !== second.length) { return false; }
	for (let i = first.length - 1; i >= 0; --i) {
		if (first[i] !== second[i]) {
			return false;
		}
	}
	return true;
}