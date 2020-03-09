import type { IPvClass } from './types';
import IpUtilsError, { Codes } from './Error';
import IPv4 from './IPv4';
import IPv6 from './IPv6';

/**
 * Creates `IP` instance based on length of `bytes`.
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16) (**unsafe assign**, *assumes correct*).
 * @returns {IPvClass} `IP` instance.
 * @example
 * throwsFromByteArray([192, 168, 11, 5])
 * // => IPv4
 * throwsFromByteArray([192, 168])
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function throwsFromByteArray(bytes: number[]): IPvClass {
	switch (bytes.length) {
		case 4:
			return new IPv4(bytes);
		case 16:
			return new IPv6(bytes);
	}
	throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
}
/**
 * Creates `IP` instance based on length of `bytes`.
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16) (**unsafe assign**, *assumes correct*).
 * @returns {(IPvClass | null)} `IP` instance, or `null` on error.
 * @example
 * fromByteArray([192, 168, 11, 5])
 * // => IPv4
 * fromByteArray([192, 168])
 * // => null
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function fromByteArray(bytes: number[]): IPvClass | null {
	switch (bytes.length) {
		case 4:
			return new IPv4(bytes);
		case 16:
			return new IPv6(bytes);
	}
	return null;
}