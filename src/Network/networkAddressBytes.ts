import fromPrefixLength, { throwsFromPrefixLength } from '../utils/fromPrefixLength';
import type { RangeItem } from '../utils/matchNetworkRange';

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {number[]} network address array of bytes.
 * @example
 * Network_throwsNetworkAddressBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 160]
 * Network_throwsNetworkAddressBytes([ [192, 168, 11, 169], 35 ])
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function Network_throwsNetworkAddressBytes(nw: RangeItem): number[] {
	const bytes = nw[0].slice();
	const mask = throwsFromPrefixLength(nw[1], bytes.length);
	for (let i = bytes.length - 1; i >= 0; --i) {
		bytes[i] &= mask[i];
	}
	return bytes;
}

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {(number[] | null)} network address array of bytes, or `null` on error.
 * @example
 * Network_networkAddressBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 160]
 * Network_networkAddressBytes([ [192, 168, 11, 169], 35 ])
 * // => null
 * @error INVALID_NETMASK_LENGTH
 */
export default function Network_networkAddressBytes(nw: RangeItem): number[] | null {
	const mask = fromPrefixLength(nw[1], nw[0].length);
	if (mask === null) { return null; }
	const bytes = nw[0].slice();
	for (let i = bytes.length - 1; i >= 0; --i) {
		bytes[i] &= mask[i];
	}
	return bytes;
}