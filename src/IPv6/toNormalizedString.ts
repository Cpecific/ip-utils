import IpUtilsError, { Codes } from '../Error';

import IPv6_isIPv4MappedAddress from './isIPv4MappedAddress';

/**
 * @utility
 * @param bytes ip address: array of bytes or parts (length = 8, 16) (*assumes correct*).
 * @param {string} [zoneId] zone string (optional).
 * @returns {string} eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons.
 * @example
 * IPv6_throwsToNormalizedString([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0')
 * // => '2001:db8:85a3:0:0:8a2e:370:7334%eth0'
 * IPv6_throwsToNormalizedString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function IPv6_throwsToNormalizedString(bytes: number[], zoneId?: string): string {
	const ret = IPv6_toNormalizedString(bytes, zoneId);
	if (ret === null) {
		throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
	}
	return ret;
}

/**
 * @utility
 * @param bytes ip address: array of bytes or parts (length = 8, 16) (*assumes correct*).
 * @param {string} [zoneId] zone string (optional).
 * @returns {(string | null)} eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons, or `null` on error.
 * @example
 * IPv6_toNormalizedString([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0')
 * // => '2001:db8:85a3:0:0:8a2e:370:7334%eth0'
 * IPv6_toNormalizedString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => null
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function IPv6_toNormalizedString(bytes: number[], zoneId?: string): string | null {
	const isIPv4 = IPv6_isIPv4MappedAddress(bytes);
	const results = Array<string>(isIPv4 ? 6 : 8);
	switch (bytes.length) {
		case 8:
			for (let i = results.length - 1; i >= 0; --i) {
				const part = bytes[i];
				results[i] = part.toString(16);
			}
			break;
		case 16:
			for (let i = results.length - 1; i >= 0; --i) {
				const part = (bytes[i * 2] << 8) | bytes[i * 2 + 1];
				results[i] = part.toString(16);
			}
			break;
		default:
			return null;
	}
	let addr = results.join(':');
	if (isIPv4) {
		addr += `:${(
			bytes.length === 8 ?
				[
					bytes[6] >> 8, bytes[6] & 0xFF,
					bytes[7] >> 8, bytes[7] & 0xFF,
				] :
				bytes.slice(-4)
		).join('.')}`;
	}
	return `${addr}${zoneId ? `%${zoneId}` : ``}`;
}