import IPv4_check from '../IPv4/check';
import IPv6_check from '../IPv6/check';

/**
 * Validates length and data of `bytes`.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16).
 * @returns {boolean} `true` if ip address is valid, else `false`.
 * @example
 * isValidByteArray([192, 168, 11, 5])
 * // => true
 * isValidByteArray([192, 168])
 * // => false
 * isValidByteArray([-5, 168, 512, 1024])
 * // => false
 * isValidByteArray([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => true
 * isValidByteArray([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
 * // => false
 * @error INVALID_IPv4_BYTE_ARRAY
 * @error INVALID_IPv6_BYTE_ARRAY
 */
export default function isValidByteArray(bytes: number[]): boolean {
	switch (bytes.length) {
		case 4:
			return IPv4_check(bytes);
		case 16:
			return IPv6_check(bytes);
	}
	return false;
}