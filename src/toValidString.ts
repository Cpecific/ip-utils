import IpUtilsError, { Codes } from './Error';
import IPv4 from './IPv4';
import IPv6 from './IPv6';

/**
 * Determines IP version for given array of `bytes` and returns corresponding string notation.
 * Validates data of `bytes`.
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16).
 * @returns {string} IPv4 or IPv6 string notation.
 * @example
 * throwsToValidString([192, 168, 11, 5])
 * // => '192.168.11.5'
 * throwsToValidString([192, 168])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * throwsToValidString([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => '2001:db8:85a3::8a2e:370:7334'
 * throwsToValidString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY)
 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY
 * @throws {IpUtilsError} INVALID_IPv6_PART_ARRAY
 * @throws {IpUtilsError} INVALID_IPv6_BYTE_ARRAY
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function throwsToValidString(bytes: number[]): string {
	switch (bytes.length) {
		case 4:
			if (IPv4.throwsCheck(bytes))
				return new IPv4(bytes).toString();
			break;
		case 16:
			if (IPv6.throwsCheck(bytes))
				return new IPv6(bytes).toString();
			break;
	}
	throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
}

/**
 * Determines IP version for given array of `bytes` and returns corresponding string notation.
 * Validates data of `bytes`.
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16).
 * @returns {(string | null)} IPv4 or IPv6 string notation, or `null` on error.
 * @example
 * toValidString([192, 168, 11, 5])
 * // => '192.168.11.5'
 * toValidString([192, 168])
 * // => null
 * toValidString([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => '2001:db8:85a3::8a2e:370:7334'
 * toValidString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => null
 * @error INVALID_IPv4_BYTE_ARRAY
 * @error INVALID_IPv6_PART_ARRAY
 * @error INVALID_IPv6_BYTE_ARRAY
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function toValidString(bytes: number[]): string | null {
	switch (bytes.length) {
		case 4:
			if (IPv4.check(bytes))
				return new IPv4(bytes).toString();
			break;
		case 16:
			if (IPv6.check(bytes))
				return new IPv4(bytes).toString();
			break;
	}
	return null;
}