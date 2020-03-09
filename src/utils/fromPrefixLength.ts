import IpUtilsError, { Codes } from '../Error';

/**
 * @internal
 * @param {number} prefix netmask length (*assumes positive integer*).
 * @param {number} bytesLength total number of bytes (*assumes positive integer*).
 */
export function _fromPrefixLength(prefix: number, bytesLength: number): number[] {
	// if (prefix < 0 || prefix > (bytesLength * 8)) {
	// 	return Codes.INVALID_NETMASK_LENGTH;
	// }
	const bytes = Array<number>(bytesLength);
	// Because (usually) prefix >= 50% of bytesLength, we go with reverse iteration,
	// which is slightly slower at 50%, even though it has (I guess) ">= 0" (gez) operation.
	// Accessing value of filledBytesCount is a little bit expensive.
	let i = bytesLength - 1;
	if (prefix < bytesLength * 8) {
		const filledBytesCount = Math.floor(prefix / 8);
		while (i > filledBytesCount) {
			bytes[i--] = 0;
		}
		bytes[i--] = ~(0xff >> (prefix % 8)) & 0xff;
	}
	while (i >= 0) {
		bytes[i--] = 0xFF;
	}
	return bytes;
}

/**
 * Creates an array of bytes (network mask) for given netmask length = `prefix` and length = `bytesLength`.
 * @utility
 * @param {number} prefix netmask length (*assumes positive integer*).
 * @param {number} bytesLength total number of bytes (*assumes positive integer*).
 * @returns {number[]} array of bytes.
 * @example
 * throwsFromPrefixLength(10, 4)
 * // => [255, 192, 0, 0]
 * throwsFromPrefixLength(35, 4)
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function throwsFromPrefixLength(prefix: number, bytesLength: number): number[] {
	if (prefix < 0 || prefix > (bytesLength * 8)) {
		throw new IpUtilsError(Codes.INVALID_NETMASK_LENGTH);
	}
	return _fromPrefixLength(prefix, bytesLength);
}

/**	
 * Creates an array of bytes (network mask) for given netmask length = `prefix` and length = `bytesLength`.
 * @utility
 * @param {number} prefix netmask length (*assumes positive integer*).
 * @param {number} bytesLength total number of bytes (*assumes positive integer*).
 * @returns {(number[] | null)} array of bytes, or `null` on error.
 * @example
 * fromPrefixLength(10, 4)
 * // => [255, 192, 0, 0]
 * fromPrefixLength(35, 4)
 * // => null
 * @error INVALID_NETMASK_LENGTH
 */
export default function fromPrefixLength(prefix: number, bytesLength: number): number[] | null {
	if (prefix < 0 || prefix > (bytesLength * 8)) {
		return null;
	}
	return _fromPrefixLength(prefix, bytesLength);
}