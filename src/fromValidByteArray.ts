import type { IPvClass } from './types';
import IpUtilsError, { Codes } from './Error';
import IPv4 from './IPv4';
import IPv6 from './IPv6';

/**
 * Validates data of `bytes` and creates `IP` instance.
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16) (**unsafe assign**).
 * @returns {IPvClass} `IP` instance.
 * @example
 * throwsFromValidByteArray([192, 168, 11, 5])
 * // => IPv4
 * throwsFromValidByteArray([192, 168])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY
 * @throws {IpUtilsError} INVALID_IPv6_PART_ARRAY
 * @throws {IpUtilsError} INVALID_IPv6_BYTE_ARRAY
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function throwsFromValidByteArray(bytes: number[]): IPvClass {
	switch (bytes.length) {
		case 4:
			return IPv4.throwsConstruct(bytes);
		case 16:
			return IPv6.throwsConstruct(bytes);
	}
	throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
}

/**
 * Validates data of `bytes` and creates `IP` instance.
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16) (**unsafe assign**).
 * @returns {(IPvClass | null)} `IP` instance, or `null` on error.
 * @example
 * fromValidByteArray([192, 168, 11, 5])
 * // => IPv4
 * fromValidByteArray([192, 168])
 * // => null
 * @error INVALID_IPv4_BYTE_ARRAY
 * @error INVALID_IPv6_PART_ARRAY
 * @error INVALID_IPv6_BYTE_ARRAY
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function fromValidByteArray(bytes: number[]): IPvClass | null {
	switch (bytes.length) {
		case 4:
			return IPv4.construct(bytes);
		case 16:
			return IPv6.construct(bytes);
	}
	return null;
}