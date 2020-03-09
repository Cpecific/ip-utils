import IpUtilsError, { Codes } from '../Error';

/**
 * Checks if `addr` length and netmask length are valid.
 * @utility
 * @param {number[]} addr ip address: array of bytes (length = 4, 16) (*assumes correct*).
 * @param {number} prefix netmask length (*assumes integer*).
 * @returns {boolean} `true` if `addr` length and netmask length are valid.
 * @example
 * Network_throwsCheck([0, 0, 0, 0], 24)
 * // => true
 * Network_throwsCheck([0, 0], 24)
 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
 * Network_throwsCheck([0, 0, 0, 0], 35)
 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
 */
export function Network_throwsCheck(addr: number[], prefix: number): boolean {
	if (addr.length !== 4 && addr.length !== 16){
		throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
	}
	if (prefix < 0 || prefix > addr.length * 8) {
		throw new IpUtilsError(Codes.INVALID_NETMASK_LENGTH);
	}
	return true;
}

/**
 * Checks if `addr` length and netmask length are valid.
 * @param {number[]} addr ip address: array of bytes (length = 4, 16) (*assumes correct*).
 * @utility
 * @param {number} prefix netmask length (*assumes integer*).
 * @returns {boolean} `true` if `addr` length and netmask length are valid, else `false`.
 * @example
 * Network_check([0, 0, 0, 0], 24)
 * // => true
 * Network_check([0, 0], 24)
 * // => false
 * Network_check([0, 0, 0, 0], 35)
 * // => false
 * @error INVALID_BYTE_ARRAY_LENGTH
 * @error INVALID_NETMASK_LENGTH
 */
export default function Network_check(addr: number[], prefix: number): boolean {
	if (addr.length !== 4 && addr.length !== 16){
		return false;
	}
	if (prefix < 0 || prefix > addr.length * 8) {
		return false;
	}
	return true;
}