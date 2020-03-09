import type { IPvClass } from './types';
import IpUtilsError, { Codes } from './Error';
import { _fromPrefixLength } from './utils/fromPrefixLength';
import fromByteArray from './fromByteArray';

/**
 * Creates an `IP` instance (network mask) for given netmask length = `prefix` and length = `bytesLength`.
 * @param {number} prefix netmask length (*assumes positive integer*).
 * @param {number} bytesLength total number of bytes (*assumes positive integer*).
 * @returns {IPvClass} `IP` instance.
 * @example
 * throwsFromPrefixLength(10, 4)
 * // => [255, 192, 0, 0]
 * throwsFromPrefixLength(35, 4)
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * throwsFromPrefixLength(10, 5)
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 */
export function throwsFromPrefixLength(prefix: number, bytesLength: number): IPvClass {
	if (prefix < 0 || prefix > (bytesLength * 8)) {
		throw new IpUtilsError(Codes.INVALID_NETMASK_LENGTH);
	}
	const ret = fromByteArray(_fromPrefixLength(prefix, bytesLength));
	if (ret === null) {
		throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH)
	}
	return ret;
}

/**	
 * Creates an `IP` instance (network mask) for given netmask length = `prefix` and length = `bytesLength`.
 * @param {number} prefix netmask length (*assumes positive integer*).
 * @param {number} bytesLength total number of bytes (*assumes positive integer*).
 * @returns {(IPvClass | null)} `IP` instance, or `null` on error.
 * @example
 * fromPrefixLength(10, 4)
 * // => [255, 192, 0, 0]
 * fromPrefixLength(35, 4)
 * // => null
 * fromPrefixLength(10, 5)
 * // => null
 * @error INVALID_NETMASK_LENGTH
 * @error INVALID_BYTE_ARRAY_LENGTH
 */
export default function fromPrefixLength(prefix: number, bytesLength: number): IPvClass | null {
	if (prefix < 0 || prefix > (bytesLength * 8)) {
		return null;
	}
	return fromByteArray(_fromPrefixLength(prefix, bytesLength));
}