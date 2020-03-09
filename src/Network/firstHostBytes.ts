import type { RangeItem } from '../utils/matchNetworkRange';

import Network_networkAddressBytes, { Network_throwsNetworkAddressBytes } from './networkAddressBytes';

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {number[]} first host array of bytes.
 * @example
 * Network_throwsFirstHostBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 161]
 * Network_throwsFirstHostBytes([ [192, 168, 11, 169], 35 ])
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function Network_throwsFirstHostBytes(nw: RangeItem): number[] {
	const bytes = Network_throwsNetworkAddressBytes(nw);
	if ((bytes.length * 8) - nw[1] > 1) {
		++bytes[bytes.length - 1];
	}
	return bytes;
}

/**
 * @utility
 * @param {[number[], number]} nw network data: tuple[ array of bytes (length = 4, 16, *variable*) (*assumes correct*), netmask length (*assumes integer*) ].
 * @returns {(number[] | null)} first host array of bytes, or `null` on error.
 * @example
 * Network_firstHostBytes([ [192, 168, 11, 169], 27 ])
 * // => [192, 168, 11, 161]
 * Network_firstHostBytes([ [192, 168, 11, 169], 35 ])
 * // => null
 * @error INVALID_NETMASK_LENGTH
 */
export default function Network_firstHostBytes(nw: RangeItem): number[] | null {
	const bytes = Network_networkAddressBytes(nw);
	if (bytes === null) { return null; }
	if ((bytes.length * 8) - nw[1] > 1) {
		++bytes[bytes.length - 1];
	}
	return bytes;
}