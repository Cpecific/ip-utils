import IpUtilsError, { Codes } from '../Error';

import IPv6_isIPv4MappedAddress from './isIPv4MappedAddress';

/**
 * @utility
 * @param bytes ip address: array of bytes or parts (length = 8, 16) (*assumes correct*).
 * @param {string} [zoneId] zone string (optional).
 * @returns {string} eight groups of four hexadecimal digits, each group representing 16 bits, groups are separated by colons.
 * @example
 * IPv6_throwsToFixedLengthString([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0')
 * // => '2001:0db8:85a3:0000:0000:8a2e:0370:7334%eth0'
 * @throws {IpUtilsError} INVALID_IPv6_AMOUNT_OF_PARTS
 */
export function IPv6_throwsToFixedLengthString(bytes: number[], zoneId?: string): string {
	const ret = IPv6_toFixedLengthString(bytes, zoneId);
	if (ret === null) {
		throw new IpUtilsError(Codes.INVALID_IPv6_AMOUNT_OF_PARTS);
	}
	return ret;
}

/**
 * @utility
 * @param bytes ip address: array of bytes or parts (length = 8, 16) (*assumes correct*).
 * @param {string} [zoneId] zone string (optional).
 * @returns {string} eight groups of four hexadecimal digits, each group representing 16 bits, groups are separated by colons.
 * @example
 * IPv6_toFixedLengthString([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0')
 * // => '2001:0db8:85a3:0000:0000:8a2e:0370:7334%eth0'
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function IPv6_toFixedLengthString(bytes: number[], zoneId?: string): string | null {
	const isIPv4 = IPv6_isIPv4MappedAddress(bytes);
	const results = Array<string>(isIPv4 ? 6 : 8);
	switch (bytes.length) {
		case 8:
			for (let i = results.length - 1; i >= 0; --i) {
				const part = bytes[i].toString(16);
				// results[i] = part.padStart(4, '0');
				switch (part.length) {
					case 1:
						results[i] = '000' + part;
						break;
					case 2:
						results[i] = '00' + part;
						break;
					case 3:
						results[i] = '0' + part;
						break;
					case 4:
						results[i] = part;
						break;
				}
			}
			break;
		case 16:
			for (let i = results.length - 1; i >= 0; --i) {
				let part = bytes[i * 2 + 1].toString(16);
				// results[i] = part.padStart(4, '0');
				switch (part.length) {
					case 1:
						part = bytes[i * 2].toString(16) + '0' + part;
						break;
					case 2:
						part = bytes[i * 2].toString(16) + part;
						break;
				}
				switch (part.length) {
					case 3:
						results[i] = '0' + part;
						break;
					case 4:
						results[i] = part;
						break;
				}
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