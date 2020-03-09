import IpUtilsError, { Codes } from '../Error';
import { bitTable } from './_data';

/**
 * Computes netmask length from `bytes` (network mask).
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16, *variable*).
 * @returns {number} netmask length.
 * @example
 * throwsFromNetworkMask([255, 192, 0, 0]) // 192 = 1100 0000
 * // => 10
 * throwsFromNetworkMask([255, 63, 0, 0]) // 63 = 0011 1111
 * // => throw new IpUtilsError(INVALID_NETMASK)
 * @throws {IpUtilsError} INVALID_NETMASK
 */
export function throwsFromNetworkMask(bytes: number[]): number {
	const ret = fromNetworkMask(bytes);
	if (ret === null) { throw new IpUtilsError(Codes.INVALID_NETMASK); }
	return ret;
}

/**
 * Computes netmask length from `bytes` (network mask).
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4, 16, *variable*).
 * @returns {(number | null)} netmask length, or `null` on error.
 * @example
 * fromNetworkMask([255, 192, 0, 0]) // 192 = 1100 0000
 * // => 10
 * fromNetworkMask([255, 63, 0, 0]) // 63 = 0011 1111
 * // => null
 * @error INVALID_NETMASK
 */
export default function fromNetworkMask(bytes: number[]): number | null {
	let cidr = 0;
	let i = 0;
	for (; i < bytes.length; ++i) {
		const byte = bytes[i];
		if (!(byte in bitTable)) {
			return null;
		}
		const bits = bitTable[byte as keyof typeof bitTable];
		cidr += bits;
		if (bits !== 8) {
			// all next bytes shoud be === 0
			++i;
			break;
		}
	}
	for (; i < bytes.length; ++i) {
		const byte = bytes[i];
		if (byte !== 0) {
			// invalid network mask (in previous bytes was !== 0xFF, means current and all next must be === 0)
			return null;
		}
	}
	return cidr;
}