import IPv4 from './IPv4';
import IPv6 from './IPv6';

/**
 * Checks if ip address `string` is valid.
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
	return (IPv4.isValid(string) || IPv6.isValid(string));
}