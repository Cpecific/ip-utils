import IpUtilsError, { Codes } from '../Error';

/**
 * Validates length and data of `bytes`.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4).
 * @returns {boolean} `true` if `bytes` is valid IPv4 array.
 * @example
 * IPv4_throwsCheck([192, 168, 11, 5])
 * // => true
 * IPv4_throwsCheck([192, 168])
 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY_LENGTH)
 * IPv4_throwsCheck([-192, -168, 512, 1024])
 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY)
 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY_LENGTH
 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY
 */
export function IPv4_throwsCheck(bytes: number[]): boolean {
	if (bytes.length !== 4) {
		throw new IpUtilsError(Codes.INVALID_IPv4_BYTE_ARRAY_LENGTH);
	}
	for (let i = 0; i < 4; ++i) {
		const byte = bytes[i];
		if (byte < 0 || byte > 0xFF) {
			throw new IpUtilsError(Codes.INVALID_IPv4_BYTE_ARRAY);
		}
	}
	return true;
}

/**
 * Validates length and data of `bytes`.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4).
 * @returns {boolean} `true` if `bytes` is valid IPv4 array, else `false`.
 * @example
 * IPv4_check([192, 168, 11, 5])
 * // => true
 * IPv4_check([192, 168])
 * // => false
 * IPv4_check([-192, -168, 512, 1024])
 * // => false
 * @error INVALID_IPv4_BYTE_ARRAY_LENGTH
 * @error INVALID_IPv4_BYTE_ARRAY
 */
export default function IPv4_check(bytes: number[]): boolean {
	if (bytes.length !== 4) {
		return false;
	}
	for (let i = 0; i < 4; ++i) {
		const byte = bytes[i];
		if (byte < 0 || byte > 0xFF) {
			return false;
		}
	}
	return true;
}