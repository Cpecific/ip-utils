import parseData from './parseData';

/**
 * Checks `string` for IPv6 validity.
 * @utility
 * @param {string} string ip address: string.
 * @returns {boolean} `true` if `string` is valid IPv6, else `false`.
 * @example
 * IPv6_isValid('2001:db8:85a3::8a2e:370:7334%eth0')
 * // => true
 * IPv6_isValid('::ff::')
 * // => false
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function IPv6_isValid(string: string): boolean {
	return typeof parseData(string) !== 'number';
}