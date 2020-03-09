import IpUtilsError, { Codes } from '../Error';

/**
 * @utility
 * @param bytes ip address: array of bytes (length = 4) (*assumes correct*).
 * @returns {string} dot-decimal notation, which consists of four octets of the address expressed individually in decimal numbers and separated by periods.
 * @example
 * IPv4_throwsToString([192, 168, 11, 5])
 * // => '192.168.11.5'
 * IPv4_throwsToString([192, 168])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function IPv4_throwsToString(bytes: number[]): string {
	if (bytes.length !== 4) {
		throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
	}
	return bytes.join('.');
}

/**
 * @utility
 * @param bytes ip address: array of bytes (length = 4) (*assumes correct*).
 * @returns {(string | null)} dot-decimal notation, which consists of four octets of the address expressed individually in decimal numbers and separated by periods, or `null` on error.
 * @example
 * IPv4_toString([192, 168, 11, 5])
 * // => '192.168.11.5'
 * IPv4_toString([192, 168])
 * // => null
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function IPv4_toString(bytes: number[]): string | null {
	if (bytes.length !== 4) {
		return null;
	}
	return bytes.join('.');
}