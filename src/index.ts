
import IPv4 from './IPv4';
import IPv6 from './IPv6';
import type { IPvClass } from './types';


export { default as IPv4 } from './IPv4';
export { default as IPv6 } from './IPv6';
export { default as Network } from './Network';
export {
	default as IpUtilsError,
	Codes,
	Messages,
} from './Error';
export {
	default as fromByteArray,
	throwsFromByteArray,
} from './fromByteArray';
export {
	default as fromNetworkMask,
	throwsFromNetworkMask,
} from './utils/fromNetworkMask';
export {
	default as fromPrefixLength,
	throwsFromPrefixLength,
} from './fromPrefixLength';
export {
	default as fromValidByteArray,
	throwsFromValidByteArray,
} from './fromValidByteArray';
export {
	default as isEqual,
} from './utils/isEqual';
export {
	default as isNetworkHostMask,
} from './utils/isNetworkHostMask';
export {
	default as isNetworkMask,
} from './utils/isNetworkMask';
export {
	default as isValid,
} from './isValid';
export {
	default as isValidByteArray,
} from './isValidByteArray';
export {
	default as matchNetwork,
	throwsMatchNetwork,
	matchNetworkBoolean,
} from './utils/matchNetwork';
export {
	RangeItem,
	RangeList,
	default as matchNetworkRange,
	createRangeList,
} from './matchNetworkRange';
export {
	default as parse,
	throwsParse,
} from './parse';
export {
	default as parseIPv4,
	throwsParseIPv4,
} from './parseIPv4';
export {
	default as parseNetwork,
	throwsParseNetwork,
} from './parseNetwork';
export {
	default as toByteArray,
	throwsToByteArray,
} from './toByteArray';
export {
	default as toString,
	throwsToString,
} from './toString';
export {
	default as toValidString,
	throwsToValidString,
} from './toValidString';

export * from './types';

// TODO operate on buffers in-place (set data at offset)
// TODO #toGroup6 Converts an IPv4 address object to an IPv6 address group
// TODO .fromBigInteger(bigInteger) Convert a BigInteger to a v6 address object
// TODO #bigInteger Return the address as a BigInteger
// better use bigint-buffer, as it is optimized stuff
// TODO .fromArpa(ip6.arpa) Convert an ip6.arpa address to an Address6 object
// TODO #regularExpression(optionalSubString, optionalSubstring) Generate a regular expression that can be used to find or validate all variations of this address.
// бляяя сложна, заебусь, луче не надо

/**
 * Typescript type narrowing.
 * @param {IPvClass} addr `IP` instance.
 * @returns {boolean} `true` if `addr` is of `IPv4` class, else `false`.
 */
export function isIPv4(addr: IPvClass): addr is IPv4 { return (addr instanceof IPv4); }
/**
 * Typescript type narrowing.
 * @param {IPvClass} addr `IP` instance.
 * @returns {boolean} `true` if `addr` is of `IPv6` class, else `false`.
 */
export function isIPv6(addr: IPvClass): addr is IPv6 { return (addr instanceof IPv6); }




