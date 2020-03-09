import type { RangeItem } from './matchNetworkRange';

export type IPv4Range =
	'unicast' | 'unspecified' | 'multicast' | 'linkLocal' | 'loopback'
	| 'broadcast' | 'carrierGradeNat' | 'private' | 'reserved';
export type IPv6Range =
	'unicast' | 'unspecified' | 'multicast' | 'linkLocal' | 'loopback'
	| 'uniqueLocal' | 'ipv4Mapped' | 'rfc6145' | 'rfc6052' | '6to4' | 'teredo' | 'reserved';

// export type IPvBytes = number[];// IPv4Bytes | IPv6Bytes;
// export type IPvBytesAny = IPvBytes | number[];
// export type IPvPartsAny = number[];// IPvBytes | IPv6Parts | number[];
// export type IPvBytesLength = number;// IPv4Bytes['length'] | IPv6Bytes['length'];
// type IPvNames = 'ipv4' | 'ipv6';

export type IPv4Bytes = [number, number, number, number];
export type IPv6Bytes = [
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
];
export type IPv6Parts = [
	number, number, number, number,
	number, number, number, number,
];

export interface IPvClass {
	bytes: number[];
	/**
	 * @returns {string} type of `IP` instance.
	 * @example
	 * new IPv4(...).kind()
	 * // => 'ipv4'
	 * new IPv6(...).kind()
	 * // => 'ipv6'
	 */
	kind(): string;
	/**
	 * Checks whether `this.bytes` and `bytes` byte arrays are equal.
	 * @param {number[]} bytes ip address: array of bytes (length = 4, 16).
	 * @returns {boolean} `true` if `this.bytes` and `bytes` byte arrays are equal, else `false`.
	 */
	isEqual(bytes: number[]): boolean;
	/**
	 * Checks whether `arg` (Network) contains `IP` instance.
	 * @param {([number[], number] | Network)} arg network data: `Network` instance or [array of bytes, netmask length] (*assumes correct*).
	 * @returns {boolean} `true` if `arg` contains `IP` instance.
	 * @throws {IpUtilsError} MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	throwsContainedBy(arg: RangeItem): boolean;
	/**
	 * Checks whether `arg` (Network) contains `IP` instance.
	 * @param {([number[], number] | Network)} arg network data: `Network` instance or [array of bytes, netmask length] (*assumes correct*).
	 * @returns {boolean} `true` if `arg` contains `IP` instance, else `false`.
	 * @throws {IpUtilsError} MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	containedBy(arg: RangeItem): boolean;
	/**
	 * Computes netmask length from `this.bytes` (network mask).
	 * @returns {number} netmask length.
	 * @throws {IpUtilsError} INVALID_NETMASK
	 */
	throwsPrefixLengthFromNetworkMask(): number;
	/**
	 * Computes netmask length from `this.bytes` (network mask).
	 * @returns {number} prefix length from network mask `this.bytes`.
	 * @returns {(number | null)} netmask length, or `null` on error.
	 * @error INVALID_NETMASK
	 */
	prefixLengthFromNetworkMask(): number | null;
	/**
	 * @returns {number[]} a copy of `this.bytes`.
	 */
	toByteArray(): number[];
	toNormalizedString(): string;
	toString(): string;
}