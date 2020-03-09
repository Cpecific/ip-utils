import IPv4_isValid from '../IPv4/isValid';
import IPv6_isValid from '../IPv6/isValid';

/**
 * Checks if ip address `string` is valid.
 * @utility
 * @param {string} string ip address: string (**not** in CIDR notation).
 * @returns {boolean} `true` if ip address is valid, else `false`.
 * @example
 * isValid('192.168.11.5')
 * // => true
 * isValid('::ff::')
 * // => false
 * @error INVALID_IPv4_STRING
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function isValid(string: string): boolean {
	return (IPv4_isValid(string) || IPv6_isValid(string));
}