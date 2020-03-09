import fromPrefixLength, { throwsFromPrefixLength } from '../utils/fromPrefixLength';
import type { RangeItem } from '../utils/matchNetworkRange';

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {number[]} broadcast address array of bytes.
 * @example
 * Network_throwsBroadcastAddressBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 191]
 * Network_throwsBroadcastAddressBytes([ [192, 168, 11, 169], 35 ])
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function Network_throwsBroadcastAddressBytes(nw: RangeItem): number[] {
	const bytes = nw[0].slice();
	const mask = throwsFromPrefixLength(nw[1], bytes.length);
	for (let i = bytes.length - 1; i >= 0; --i) {
		bytes[i] |= (mask[i] ^ 255);
	}
	return bytes;
}

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {(number[] | null)} broadcast address array of bytes, or `null` on error.
 * @example
 * Network_broadcastAddressBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 191]
 * Network_broadcastAddressBytes([ [192, 168, 11, 169], 35 ])
 * // => null
 * @error INVALID_NETMASK_LENGTH
 */
export default function Network_broadcastAddressBytes(nw: RangeItem): number[] | null {
	const mask = fromPrefixLength(nw[1], nw[0].length);
	if (mask === null) { return null; }
	const bytes = nw[0].slice();
	for (let i = bytes.length - 1; i >= 0; --i) {
		bytes[i] |= (mask[i] ^ 255);
	}
	return bytes;
}