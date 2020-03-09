import type { IPvClass } from '../types';
import IpUtilsError, { Codes } from '../Error';
import IPv4 from '../IPv4';
import fromNetworkMask, { throwsFromNetworkMask } from '../utils/fromNetworkMask';
import isEqual from '../utils/isEqual';
import matchNetwork, { throwsMatchNetwork } from '../utils/matchNetwork';
import matchNetworkRange from '../matchNetworkRange';
import type { IPv6Range, RangeItem } from '../matchNetworkRange';

import IPv6_check, { IPv6_throwsCheck } from './check';
import IPv6_isValid from './isValid';
import SpecialRanges from './SpecialRanges';
import IPv6_parseData, { IPv6_throwsParseData } from './parseData';


// export {
// 	default as check,
// 	IPv6_throwsCheck as throwsCheck,
// } from './check';
// export {
// 	default as isIPv4MappedAddress,
// } from './isIPv4MappedAddress';
// export {
// 	default as isValid,
// } from './isValid';
// export {
// 	default as parseData,
// 	IPv6_throwsParseData as throwsParseData,
// } from './parseData';
// export {
// 	default as SpecialRanges,
// } from './SpecialRanges';
// export {
// 	default as toFixedLengthString,
// 	IPv6_throwsToFixedLengthString as throwsToFixedLengthString,
// } from './toFixedLengthString';
// export {
// 	default as toNormalizedString,
// 	IPv6_throwsToNormalizedString as throwsToNormalizedString,
// } from './toNormalizedString';
// export {
// 	default as toString,
// 	IPv6_throwsToString as throwsToString,
// } from './toString';


export default class IPv6 implements IPvClass {
	static kind = 'ipv6' as const;
	static bytes = 16 as const;
	static SpecialRanges = SpecialRanges;

	// !parseData
	/**
	 * Creates an object with array of bytes and zone id for valid IPv6 `string`.
	 * @param {string} string ip address: string.
	 * @returns {{bytes: number[], zoneId: string | undefined}} object { bytes: array of bytes, zoneId: string or undefined }.
	 * @example
	 * IPv6.throwsParseData('2001:db8:85a3::8a2e:370:7334%eth0')
	 * // => {
	 * //   bytes: [0x20, 0x01, 0x0d, 0xb8,
	 * //           0x85, 0xa3, 0x00, 0x00,
	 * //           0x00, 0x00, 0x8a, 0x2e,
	 * //           0x03, 0x70, 0x73, 0x34],
	 * //   zone: 'eth0'
	 * // }
	 * IPv6.throwsParseData('::ff::')
	 * // => throws new IpUtilsError(INVALID_IPv6_STRING)
	 * @throws {IpUtilsError} INVALID_IPv6_STRING
	 * @throws {IpUtilsError} INVALID_IPv6_IPv4_TRANSITIONAL_STRING
	 * @throws {IpUtilsError} INVALID_IPv6_AMOUNT_OF_PARTS
	 */
	static throwsParseData = IPv6_throwsParseData;
	/**
	 * Creates an object with array of bytes and zone id for valid IPv6 `string`.
	 * @param {string} string ip address: string.
	 * @returns {({bytes: number[], zoneId: string | undefined} | number)} object { bytes: array of bytes, zoneId: string or undefined }, or error code.
	 * @example
	 * IPv6.parseData('2001:db8:85a3::8a2e:370:7334%eth0')
	 * // => {
	 * //   bytes: [0x20, 0x01, 0x0d, 0xb8,
	 * //           0x85, 0xa3, 0x00, 0x00,
	 * //           0x00, 0x00, 0x8a, 0x2e,
	 * //           0x03, 0x70, 0x73, 0x34],
	 * //   zone: 'eth0'
	 * // }
	 * IPv6.parseData('::ff::')
	 * // => null
	 * @error INVALID_IPv6_STRING
	 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
	 * @error INVALID_IPv6_AMOUNT_OF_PARTS
	 */
	static parseData = IPv6_parseData;

	// !isValid
	/**
	 * Checks `string` for IPv6 validity.
	 * @param {string} string ip address: string.
	 * @returns {boolean} `true` if `string` is valid IPv6, else `false`.
	 * @example
	 * IPv6.isValid('2001:db8:85a3::8a2e:370:7334%eth0')
	 * // => true
	 * IPv6.isValid('::ff::')
	 * // => false
	 * @error INVALID_IPv6_STRING
	 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
	 * @error INVALID_IPv6_AMOUNT_OF_PARTS
	 */
	static isValid = IPv6_isValid;

	// !check
	/**
	 * Validates length and data of `bytes` and `zoneId`.
	 * @param {number[]} bytes ip address: array of bytes (length = 16).
	 * @param {string} [zoneId] zone string.
	 * @returns {boolean} `true` if `bytes` is valid IPv6 bytes array and `zoneId` is valid argument.
	 * @example
	 * IPv6.throwsCheck([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34], 'eth0')
	 * // => true
	 * IPv6.throwsCheck([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
	 * // => throw new IpUtilsError(INVALID_IPv6_INPUT_ARRAY_LENGTH)
	 * IPv6.throwsCheck([-2, -8, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512, 1024, 873])
	 * // => throw new IpUtilsError(INVALID_IPv6_BYTE_ARRAY)
	 * IPv6.throwsCheck([], 17)
	 * // => throw new IpUtilsError(INVALID_IPv6_ZONE)
	 * @throws {IpUtilsError} INVALID_IPv6_INPUT_ARRAY_LENGTH
	 * @throws {IpUtilsError} INVALID_IPv6_BYTE_ARRAY
	 * @throws {IpUtilsError} INVALID_IPv6_ZONE
	 */
	static throwsCheck = IPv6_throwsCheck;
	/**
	 * Validates length and data of `bytes` and `zoneId`.
	 * @param {number[]} bytes ip address: array of bytes (length = 16).
	 * @param {string} [zoneId] zone string.
	 * @returns {boolean} `true` if `bytes` is valid IPv6 bytes array and `zoneId` is valid argument, else `false`.
	 * @example
	 * IPv6.check([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34], 'eth0')
	 * // => true
	 * IPv6.check([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
	 * // => false
	 * IPv6.check([-2, -8, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512, 1024, 873])
	 * // => false
	 * IPv6.check([], 17)
	 * // => false
	 * @error INVALID_IPv6_INPUT_ARRAY_LENGTH
	 * @error INVALID_IPv6_BYTE_ARRAY
	 * @error INVALID_IPv6_ZONE
	 */
	static check = IPv6_check;

	// !parse
	/**
	 * Creates `IPv6` instance for valid IPv6 `string`.
	 * @param {string} string ip address.
	 * @returns {IPv6} `IPv6` instance.
	 * @example
	 * IPv6.throwsParse('2001:db8:85a3::8a2e:370:7334%eth0')
	 * // => IPv6
	 * IPv6.throwsParse('::ff::')
	 * // => throw new IpUtilsError(INVALID_IPv6_STRING)
	 * @throws {IpUtilsError} INVALID_IPv6_STRING
	 * @throws {IpUtilsError} INVALID_IPv6_IPv4_TRANSITIONAL_STRING
	 * @throws {IpUtilsError} INVALID_IPv6_AMOUNT_OF_PARTS
	 */
	static throwsParse(string: string): IPv6 {
		const data = this.throwsParseData(string);
		return new this(data.bytes, data.zoneId);
	}
	/**
	 * Creates `IPv6` instance for valid IPv6 `string`.
	 * @param {string} string ip address.
	 * @returns {(IPv6 | null)} `IPv6` instance, or `null` on error.
	 * @example
	 * IPv6.parse('2001:db8:85a3::8a2e:370:7334%eth0')
	 * // => IPv6
	 * IPv6.parse('::ff::')
	 * // => null
	 * @error INVALID_IPv6_STRING
	 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
	 * @error INVALID_IPv6_AMOUNT_OF_PARTS
	 */
	static parse(string: string): IPv6 | null {
		const data = this.parseData(string);
		if (typeof data === 'number') { return null; }
		return new this(data.bytes, data.zoneId);
	}

	// !constructor
	bytes: number[];
	zoneId: string | undefined;
	/**
	 * @param {number[]} bytes ip address: array of bytes (length = 16) (**unsafe assign**).
	 * @param {string} [zoneId] zone string (optional).
	 */
	constructor(bytes: number[], zoneId?: string) {
		this.bytes = bytes;
		this.zoneId = zoneId;
	}
	/**
	 * Validates data and creates `IPv6` instance.
	 * @param {number[]} bytes ip address: array of bytes (length = 16) (**unsafe assign**).
	 * @param {string} [zoneId] zone string (optional).
	 * @returns {IPv6} `IPv6` instance.
	 * @example
	 * IPv6.throwsConstruct([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34])
	 * // => IPv6
	 * IPv6.throwsConstruct([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
	 * // => throw new IpUtilsError(INVALID_IPv6_INPUT_ARRAY_LENGTH)
	 * IPv6.throwsConstruct([-0x2001, -0xdb8, -0x85a3, 0x0, 0x0, 0xFF8a2e, 0xAE370, 0x887334])
	 * // => throw new IpUtilsError(INVALID_IPv6_PART_ARRAY)
	 * IPv6.throwsConstruct([-2, -8, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512, 1024, 873])
	 * // => throw new IpUtilsError(INVALID_IPv6_BYTE_ARRAY)
	 * IPv6.throwsConstruct([], 17)
	 * // => throw new IpUtilsError(INVALID_IPv6_ZONE)
	 * @throws {IpUtilsError} INVALID_IPv6_INPUT_ARRAY_LENGTH
	 * @throws {IpUtilsError} INVALID_IPv6_PART_ARRAY
	 * @throws {IpUtilsError} INVALID_IPv6_BYTE_ARRAY
	 * @throws {IpUtilsError} INVALID_IPv6_ZONE
	 */
	static throwsConstruct(bytes: number[], zoneId?: string): IPv6 {
		this.throwsCheck(bytes, zoneId);
		return new this(bytes, zoneId);
	}
	/**
	 * Validates data and creates `IPv6` instance.
	 * @param {number[]} bytes ip address: array of bytes (length = 16) (**unsafe assign**).
	 * @param {string} [zoneId] zone string (optional).
	 * @returns {(IPv6 | null)} `IPv6` instance, or `null` on error.
	 * @example
	 * IPv6.construct([[0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34]])
	 * // => IPv6
	 * IPv6.construct([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334])
	 * // => null
	 * IPv6.construct([-0x2001, -0xdb8, -0x85a3, 0x0, 0x0, 0xFF8a2e, 0xAE370, 0x887334])
	 * // => null
	 * IPv6.construct([-2, -8, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512, 1024, 873])
	 * // => null
	 * IPv6.construct([], 17)
	 * // => null
	 * @error INVALID_IPv6_INPUT_ARRAY_LENGTH
	 * @error INVALID_IPv6_PART_ARRAY
	 * @error INVALID_IPv6_BYTE_ARRAY
	 * @error INVALID_IPv6_ZONE
	 */
	static construct(bytes: number[], zoneId?: string): IPv6 | null {
		if (!this.check(bytes, zoneId)) { return null; }
		return new this(bytes, zoneId);
	}

	kind() { return 'ipv6' as const; }

	// !isEqual
	/**
	 * Checks whether `this.bytes` and `bytes` byte arrays are equal.
	 * @param {number[]} bytes ip address: array of bytes (length = 16).
	 * @returns {boolean} `true` if `this.bytes` and `bytes` byte arrays are equal, else `false`.
	 * @example
	 * new IPv6([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00,
	 *           0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34])
	 * .isEqual([0xfe, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	 *           0x01, 0xff, 0xfe, 0x23, 0x45, 0x67, 0x89, 0x0a])
	 * // => false
	 */
	isEqual(bytes: number[]): boolean {
		return isEqual(this.bytes, bytes);
	}

	private _parts?: number[];
	/**
	 * Converts `this.bytes` into IPv6 parts (8 groups of 16-bit unsigned integers).
	 * @returns {number[]} array of parts (**unsafe reference**).
	 */
	parts(): number[] {
		if (this._parts) { return this._parts; }
		this._parts = Array();
		for (let i = 0; i <= 14; i += 2) {
			this._parts.push((this.bytes[i] << 8) | this.bytes[i + 1]);
		}
		return this._parts;
	}
	// TODO
	/*toRFC5952String(): string {
		const regex = /((^|:)(0(:|$)){2,})/g;
		const string = this.toNormalizedString();
		let bestMatchIndex = 0;
		let bestMatchLength = -1;
		let match:RegExpExecArray | null;
		while ((match = regex.exec(string))) {
			if (match[0].length > bestMatchLength) {
				bestMatchIndex = match.index;
				bestMatchLength = match[0].length;
			}
		}
		if (bestMatchLength < 0) {
			return string;
		}
		return string.substring(0, bestMatchIndex) + '::' + string.substring(bestMatchIndex + bestMatchLength);
	}*/

	// !containedBy
	/**
	 * Checks whether `arg` (Network) contains `IP` instance.
	 * @param {([IPvClass | number[], number] | Network)} arg network data: `Network` instance or tuple [ `IP` instance or array of bytes (*assumes correct*), netmask length (*assumes positive integer*) ].
	 * @returns {boolean} `true` if `arg` contains `IP` instance.
	 * @example
	 * const ipv6 = new IPv6(
	 *     [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00,
	 *      0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34])
	 * ipv6.throwsContainedBy([ 
	 *     [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00,
	 *      0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
	 *     64])
	 * // => true
	 * const nw = new Network(
	 *     [0xfe, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	 *      0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
	 *     64)
	 * ipv6.throwsContainedBy(nw)
	 * // => false
	 * ipv6.throwsContainedBy([ [192, 168, 11, 5], 24 ])
	 * // => throws new IpUtilsError(MATCH_NETWORK_MISMATCHING_LENGTH)
	 * @throws {IpUtilsError} MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	throwsContainedBy(arg: RangeItem): boolean {
		if (arg instanceof Array) {
			return throwsMatchNetwork(this.bytes, arg[0] instanceof Array ? arg[0] : arg[0].bytes, arg[1]);
		}
		return throwsMatchNetwork(this.bytes, arg.addr.bytes, arg.prefix);
	}
	/**
	 * Checks whether `arg` (Network) contains `IP` instance.
	 * @param {([IPvClass | number[], number] | Network)} arg network data: `Network` instance or tuple [ `IP` instance or array of bytes (*assumes correct*), netmask length (*assumes positive integer*) ].
	 * @returns {boolean} `true` if `arg` contains `IP` instance, else `false`.
	 * @example
	 * const ipv6 = new IPv6(
	 *     [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00,
	 *      0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34])
	 * ipv6.containedBy([ 
	 *     [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00,
	 *      0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
	 *     64])
	 * // => true
	 * const nw = new Network(
	 *     [0xfe, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	 *      0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
	 *     64)
	 * ipv6.containedBy(nw)
	 * // => false
	 * ipv6.containedBy([ [192, 168, 11, 5], 24 ])
	 * // => false
	 * @error MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	containedBy(arg: RangeItem): boolean {
		if (arg instanceof Array) {
			return matchNetwork(this.bytes, arg[0] instanceof Array ? arg[0] : arg[0].bytes, arg[1]) === true;
		}
		return matchNetwork(this.bytes, arg.addr.bytes, arg.prefix) === true;
	}

	// !range
	/**
	 * @returns {string} matching range among IPv6.SpecialRanges.
	 * @example
	 * new IPv6([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00,
	 *           0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34])
	 *     .range()
	 * // => 'reserved'
	 */
	range(): IPv6Range {
		return matchNetworkRange(this.bytes, IPv6.SpecialRanges);
	}

	// !isIPv4MappedAddress
	/**
	 * @returns {boolean} `true` if ip address is contained by "ipv4Mapped" special range, else `false`.
	 */
	isIPv4MappedAddress(): boolean {
		return matchNetwork(this.bytes, [
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0xff, 0xff,
			0, 0, 0, 0
		], 96) === true;
	}

	// !toIPv4Address
	/**
	 * @returns {IPv4} `IPv4` instance if ip address contained by "ipv4Mapped" special range.
	 * @example
	 * new IPv6([0, 0, 0, 0, 0, 0, 0, 0,
	 *           0, 0, 0xff, 0xff, 0xc0, 0xa8, 0xb, 0x5]).throwsToIPv4Address()
	 * // => IPv4([192, 168, 11, 5])
	 * new IPv6([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0,
	 *           0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34]).throwsToIPv4Address()
	 * // => throw new IpUtilsError(INVALID_IPv6_IPv4_CONVERSION)
	 * @throws {IpUtilsError} INVALID_IPv6_IPv4_CONVERSION
	 */
	throwsToIPv4Address(): IPv4 {
		if (!this.isIPv4MappedAddress()) {
			throw new IpUtilsError(Codes.INVALID_IPv6_IPv4_CONVERSION);
		}
		return new IPv4(this.bytes.slice(-4));
	}
	/**
	 * @returns {(IPv4 | null)} `IPv4` instance if ip address contained by "ipv4Mapped" special range, or `null` on error.
	 * @example
	 * new IPv6([0, 0, 0, 0, 0, 0, 0, 0,
	 *           0, 0, 0xff, 0xff, 0xc0, 0xa8, 0xb, 0x5]).toIPv4Address()
	 * // => IPv4([192, 168, 11, 5])
	 * new IPv6([0x20, 0x01, 0xd, 0xb8, 0x85, 0xa3, 0, 0,
	 *           0, 0, 0x8a, 0x2e, 0x3, 0x70, 0x73, 0x34]).toIPv4Address()
	 * // => null
	 * @error INVALID_IPv6_IPv4_CONVERSION
	 */
	toIPv4Address(): IPv4 | null {
		if (!this.isIPv4MappedAddress()) {
			return null;
		}
		return new IPv4(this.bytes.slice(-4));
	}

	// !prefixLengthFromNetworkMask
	/**
	 * Computes netmask length from `this.bytes` (network mask).
	 * @returns {number} netmask length.
	 * @example
	 * new IPv6([0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x00,
	 *           0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
	 *     .throwsPrefixLengthFromNetworkMask() // c0 = 1100 0000
	 * // => 42
	 * new IPv6([0xff, 0xff, 0xff, 0xff, 0xff, 0x3f, 0x00, 0x00,
	 *           0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
	 *     .throwsPrefixLengthFromNetworkMask() // 3f = 0011 1111
	 * // => throw new IpUtilsError(INVALID_NETMASK)
	 * @throws {IpUtilsError} INVALID_NETMASK
	 */
	throwsPrefixLengthFromNetworkMask(): number {
		return throwsFromNetworkMask(this.bytes);
	}
	/**
	 * Computes netmask length from `this.bytes` (network mask).
	 * @returns {(number | null)} netmask length, or `null` on error.
	 * @example
	 * new IPv6([0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x00,
	 *           0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
	 *     .prefixLengthFromNetworkMask() // c0 = 1100 0000
	 * // => 42
	 * new IPv6([0xff, 0xff, 0xff, 0xff, 0xff, 0x3f, 0x00, 0x00,
	 *           0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
	 *     .prefixLengthFromNetworkMask() // 3f = 0011 1111
	 * // => null
	 * @error INVALID_NETMASK
	 */
	prefixLengthFromNetworkMask(): number | null {
		return fromNetworkMask(this.bytes);
	}

	// !toByteArray
	/**
	 * @returns {number[]} a copy of `this.bytes` array.
	 */
	toByteArray(): number[] {
		return this.bytes.slice();
	}

	// !toString
	/**
	 * @returns {string} eight groups of four hexadecimal digits, each group representing 16 bits, groups are separated by colons.
	 * @example
	 * new IPv6([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0').toFixedLengthString()
	 * // => '2001:0db8:85a3:0000:0000:8a2e:0370:7334%eth0'
	 */
	toFixedLengthString(): string {
		const isIPv4 = this.isIPv4MappedAddress();
		const results = Array<string>(isIPv4 ? 6 : 8);
		const parts = this.parts();
		for (let i = results.length - 1; i >= 0; --i) {
			const part = parts[i].toString(16);
			// results[i] = part.padStart(4, '0');
			switch (part.length) {
				case 1:
					results[i] = '000' + part;
					break;
				case 2:
					results[i] = '00' + part;
					break;
				case 3:
					results[i] = '0' + part;
					break;
				case 4:
					results[i] = part;
					break;
			}
		}
		let addr = results.join(':');
		if (isIPv4) {
			addr += `:${this.bytes.slice(-4).join('.')}`;
		}
		return `${addr}${this.zoneId ? `%${this.zoneId}` : ``}`;
	}
	/**
	 * @returns {string} eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons.
	 * @example
	 * new IPv6([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0').toNormalizedString()
	 * // => '2001:db8:85a3:0:0:8a2e:370:7334%eth0'
	 */
	toNormalizedString(): string {
		const parts = this.parts();
		const isIPv4 = this.isIPv4MappedAddress();
		const results = Array<string>(isIPv4 ? 6 : 8);
		for (let i = results.length - 1; i >= 0; --i) {
			const part = parts[i];
			results[i] = part.toString(16);
		}
		let addr = results.join(':');
		if (isIPv4) {
			addr += `:${this.bytes.slice(-4).join('.')}`;
		}
		return `${addr}${this.zoneId ? `%${this.zoneId}` : ``}`;
	}
	/**
	 * @returns {string} eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons.
	 * One or more consecutive groups containing only zeros may be replaced with a single empty group, using two consecutive colons (::).
	 * @example
	 * new IPv6([0x2001, 0xdb8, 0x85a3, 0x0, 0x0, 0x8a2e, 0x370, 0x7334], 'eth0').toString()
	 * // => '2001:db8:85a3::8a2e:370:7334%eth0'
	 */
	toString(): string {
		return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, '::');
	}
};
