import parseData, { IPv4_ParseFlags } from './parseData';
import type { IPv4_ParseType } from './parseData';

/**
 * Checks `string` for IPv4 validity for given `flag` parse permissions.
 * @utility
 * @param {string} string ip address.
 * @param {number} [flag=31] options flag (default = 31).
 * - 1 - allow decimal values in parts.
 * - 2 - allow octet values in parts.
 * - 4 - allow hex values in parts.
 * - 8 - allow variable number of parts (2, 3 or 4 parts).
 * - 16 - allow "long" notation (only 1 part).
 * @param {Function} [parser] parser for given `flag` (*assumes correct*).
 * @returns {boolean} `true` if `string` is valid IPv4, else `false`.
 * @example
 * IPv4_isValid('192.168.11.5')
 * // => true
 * IPv4_isValid('0xC00002EB', 1 | 16) // allow decimal long
 * // => false
 * @error INVALID_IPv4_STRING
 */
export default function IPv4_isValid(string: string, flag: number = IPv4_ParseFlags.ALL, parser?: IPv4_ParseType): boolean {
	return typeof parseData(string, flag, parser) !== 'number';
}