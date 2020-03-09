import IpUtilsError, { Codes } from '../Error';

/**
 * @error INVALID_IPv6_BYTE_ARRAY
 * @error INVALID_IPv6_INPUT_ARRAY_LENGTH
 */
function _check(bytes: number[], zoneId?: string) {
	if (typeof zoneId !== 'undefined' && typeof zoneId !== 'string') {
		throw new IpUtilsError(Codes.INVALID_IPv6_ZONE);
	}
	if (bytes.length !== 16) {
		return Codes.INVALID_IPv6_INPUT_ARRAY_LENGTH;
	}
	for (let i = 15; i >= 0; --i) {
		const byte = bytes[i];
		if (byte < 0 || byte > 0xFF) {
			return Codes.INVALID_IPv6_BYTE_ARRAY;
		}
	}
	return true;
}

/**
 * Validates length and data of `bytes` and `zoneId`.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 16).
 * @param {string} [zoneId] zone string (optional).
 * @returns {boolean} `true` if `bytes` is valid IPv6 bytes array and `zoneId` is valid argument.
 * @example
 * IPv6_throwsCheck([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => true
 * IPv6_throwsCheck([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
 * // => throw new IpUtilsError(INVALID_IPv6_INPUT_ARRAY_LENGTH)
 * IPv6_throwsCheck([-0x20, 0x01, -0xd, 0xb8, -0x85, 0xa3, 0, 0, 0, 0, 0xFF8a, 0x2e, 0xAE3, 0x70, 0x8873, 0x34])
 * // => throw new IpUtilsError(INVALID_IPv6_BYTE_ARRAY)
 * IPv6_throwsCheck([], 17)
 * // => throw new IpUtilsError(INVALID_IPv6_ZONE)
 * @throws {IpUtilsError} INVALID_IPv6_ZONE
 * @throws {IpUtilsError} INVALID_IPv6_BYTE_ARRAY
 * @throws {IpUtilsError} INVALID_IPv6_INPUT_ARRAY_LENGTH
 */
export function IPv6_throwsCheck(bytes: number[], zoneId?: string): boolean {
	const ret = _check(bytes, zoneId);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return true;
}

/**
 * Validates length and data of `bytes` and `zoneId`.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 16).
 * @param {string} [zoneId] zone string (optional).
 * @returns {boolean} `true` if `bytes` is valid IPv6 bytes array and `zoneId` is valid argument, else `false`.
 * @example
 * IPv6_check([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
 * // => true
 * IPv6_check([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
 * // => false
 * IPv6_check([-0x20, 0x01, -0xd, 0xb8, -0x85, 0xa3, 0, 0, 0, 0, 0xFF8a, 0x2e, 0xAE3, 0x70, 0x8873, 0x34])
 * // => false
 * IPv6_check([], 17)
 * // => false
 * @error INVALID_IPv6_ZONE
 * @error INVALID_IPv6_BYTE_ARRAY
 * @error INVALID_IPv6_INPUT_ARRAY_LENGTH
 */
export default function IPv6_check(bytes: number[], zoneId?: string): boolean {
	return _check(bytes, zoneId) === true;
}
