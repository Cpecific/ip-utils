import IpUtilsError, { Codes } from '../Error';
import IPv4_toString, { IPv4_throwsToString } from '../IPv4/toString';
import IPv6_toString, { IPv6_throwsToString } from '../IPv6/toString';

/**
 * Determines IP version for given array of `bytes` and returns corresponding string notation.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16) (*assumes correct*).
 * @returns {string} IPv4 or IPv6 string notation.
 * @example
 * throwsToString([192, 168, 11, 5])
 * // => '192.168.11.5'
 * throwsToString([192, 168])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * throwsToString([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => '2001:db8:85a3::8a2e:370:7334'
 * throwsToString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => '8193.3512.34211.0' // consider using toValidString
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function throwsToString(bytes: number[]): string {
	switch (bytes.length) {
		case 4:
			return IPv4_throwsToString(bytes);
		case 16:
			return IPv6_throwsToString(bytes);
	}
	throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
}

/**
 * Determines IP version for given array of `bytes` and returns corresponding string notation.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16) (*assumes correct*).
 * @returns {(string | null)} IPv4 or IPv6 string notation, or `null` on error.
 * @example
 * toString([192, 168, 11, 5])
 * // => '192.168.11.5'
 * toString([192, 168])
 * // => null
 * toString([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => '2001:db8:85a3::8a2e:370:7334'
 * toString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => '8193.3512.34211.0' // consider using toValidString
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function toString(bytes: number[]): string | null {
	switch (bytes.length) {
		case 4:
			return IPv4_toString(bytes);
		case 16:
			return IPv6_toString(bytes);
	}
	return null;
}