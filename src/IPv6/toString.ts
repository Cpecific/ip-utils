import IPv6_toNormalizedString, { IPv6_throwsToNormalizedString } from './toNormalizedString';

/**
 * @utility
 * @param bytes ip address: array of bytes or parts (length = 8, 16) (*assumes correct*).
 * @param {string} [zoneId] zone string (optional).
 * @returns {string} eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons.
 * One or more consecutive groups containing only zeros may be replaced with a single empty group, using two consecutive colons (::).
 * @example
 * IPv6_throwsToString([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0')
 * // => '2001:db8:85a3::8a2e:370:7334%eth0'
 * IPv6_throwsToString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function IPv6_throwsToString(bytes: number[], zoneId?: string): string {
	return IPv6_throwsToNormalizedString(bytes, zoneId).replace(/((^|:)(0(:|$))+)/, '::');
}

/**
 * @utility
 * @param bytes ip address: array of bytes or parts (length = 8, 16) (*assumes correct*).
 * @param {string} [zoneId] zone string (optional).
 * @returns {string} eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons.
 * One or more consecutive groups containing only zeros may be replaced with a single empty group, using two consecutive colons (::).
 * @example
 * IPv6_toString([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0')
 * // => '2001:db8:85a3::8a2e:370:7334%eth0'
 * IPv6_toString([0x2001, 0xdb8, 0x85a3, 0x0])
 * // => null
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function IPv6_toString(bytes: number[], zoneId?: string): string | null {
	const ret = IPv6_toNormalizedString(bytes, zoneId);
	if (ret === null) { return null; }
	return ret.replace(/((^|:)(0(:|$))+)/, '::');
}