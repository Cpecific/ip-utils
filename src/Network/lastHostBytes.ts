import type { RangeItem } from '../utils/matchNetworkRange';

import Network_broadcastAddressBytes, { Network_throwsBroadcastAddressBytes } from './broadcastAddressBytes';

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {number[]} last host array of bytes.
 * @example
 * Network_throwsLastHostBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 190]
 * Network_throwsLastHostBytes([ [192, 168, 11, 169], 35 ])
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function Network_throwsLastHostBytes(nw: RangeItem): number[] {
	const bytes = Network_throwsBroadcastAddressBytes(nw);
	if ((bytes.length * 8) - nw[1] > 1) {
		--bytes[bytes.length - 1];
	}
	return bytes;
}

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {(number[] | null)} last host array of bytes, or `null` on error.
 * @example
 * Network_lastHostBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 190]
 * Network_lastHostBytes([ [192, 168, 11, 169], 35 ])
 * // => null
 * @error INVALID_NETMASK_LENGTH
 */
export default function Network_lastHostBytes(nw: RangeItem): number[] | null {
	const bytes = Network_broadcastAddressBytes(nw);
	if (bytes === null) { return null; }
	if ((bytes.length * 8) - nw[1] > 1) {
		--bytes[bytes.length - 1];
	}
	return bytes;
}