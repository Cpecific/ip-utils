import type { IPvClass } from '../types';
import IpUtilsError, { Codes } from '../Error';
import IPv6 from '../IPv6';
import fromNetworkMask, { throwsFromNetworkMask } from '../utils/fromNetworkMask';
import isEqual from '../utils/isEqual';
import matchNetwork, { throwsMatchNetwork } from '../utils/matchNetwork';
import matchNetworkRange from '../matchNetworkRange';
import type { IPv4Range, RangeItem } from '../matchNetworkRange';

import IPv4_check, { IPv4_throwsCheck } from './check';
import IPv4_fromLong from './fromLong';
import SpecialRanges from './SpecialRanges';
import IPv4_parseData, {
	IPv4_ParseFlags,
	IPv4_parseIntDec,
	IPv4_parseIntDecOctHex,
	IPv4_getParser,
	IPv4_throwsParseData,
} from './parseData';
import type { IPv4_ParseType } from './parseData';
import IPv4_toLong from './toLong';


// export {
// 	default as check,
// 	IPv4_throwsCheck as throwsCheck,
// } from './check';
// export {
// 	default as fromLong,
// } from './fromLong';
// export {
// 	default as isValid,
// } from './isValid';
// export {
// 	default as parseData,
// 	IPv4_throwsParseData as throwsParseData,
// 	IPv4_ParseFlags as ParseFlags
// } from './parseData';
// export {
// 	default as SpecialRanges,
// } from './SpecialRanges';
// export {
// 	default as toIPv4MappedBytes,
// } from './toIPv4MappedBytes';
// export {
// 	default as toLong,
// } from './toLong';
// export {
// 	default as toString,
// 	IPv4_throwsToString as throwsToString
// } from './toString';


type IPv4_ParseStringLiterals = 'decimal' | 'octet' | 'hex' | 'variable' | 'long';

let IPv4_parserFlag = IPv4_ParseFlags.ALL;
let IPv4_parser: IPv4_ParseType = IPv4_parseIntDecOctHex;

export default class IPv4 implements IPvClass {
	static kind = 'ipv4' as const;
	static bytes = 4 as const;
	static SpecialRanges = SpecialRanges;
	static ResetParsePermissions() {
		this.SetParsePermissions(IPv4_ParseFlags.ALL);
	}
	/**
	 * @desc Changes permissions for parser.
	 * @param {(string[] | number)} permissions permissions settings:
	 * 
	 * 1) array of permitted notation rules:
	 * - "decimal" - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - "octet" - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - "hex" - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - "variable" - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - "long" - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * 
	 * 2) flag: number (*enum ParseFlags*):
	 * - 1 = "decimal"
	 * - 2 = "octet"
	 * - 4 = "hex"
	 * - 8 = "variable"
	 * - 16 = "long"
	 * @throws {IpUtilsError} INVALID_IPv4_PARSER_FLAG_ARRAY
	 * @throws {IpUtilsError} MISSING_IPv4_PARSER_FLAG_ARRAY_VALUES
	 */
	static SetParsePermissions(permissions: IPv4_ParseStringLiterals[] | number): void {
		if (typeof permissions === 'number') {
			if (IPv4_parserFlag === permissions) { return; }
			IPv4_parserFlag = permissions;
		}
		else {
			let flag = 0;
			for (let i = permissions.length - 1; i >= 0; --i) {
				switch (permissions[i]) {
					case 'decimal':
						flag |= IPv4_ParseFlags.parseDecimal;
						break;
					case 'octet':
						flag |= IPv4_ParseFlags.parseOctet;
						break;
					case 'hex':
						flag |= IPv4_ParseFlags.parseHex;
						break;
					case 'variable':
						flag |= IPv4_ParseFlags.parseVariable;
						break;
					case 'long':
						flag |= IPv4_ParseFlags.parseLong;
						break;
					default:
						throw new IpUtilsError(Codes.INVALID_IPv4_PARSER_FLAG_ARRAY);
				}
			}
			if (IPv4_parserFlag === flag) { return; }
			IPv4_parserFlag = flag;
		}
		IPv4_parser = IPv4_getParser(IPv4_parserFlag);
	}

	// !toLong
	/**
	 * @param {number[]} bytes ip address: array of bytes (length = 4) (*assumes correct*).
	 * @returns {number} unsigned int.
	 * @example
	 * IPv4.toLong([192, 168, 11, 5])
	 * // => 3232238341
	 */
	static toLong = IPv4_toLong;

	// !fromLong
	/**
	 * Converts `long` integer into `IPv4` instance.
	 * @param {number} long integer.
	 * @returns {IPv4} `IPv4` instance.
	 * @example
	 * IPv4.fromLong(3232238341)
	 * // => new IPv4([192, 168, 11, 5])
	 */
	static fromLong(long: number): IPv4 {
		return new IPv4(IPv4_fromLong(long));
	}

	// !parseData
	/**
	 * Creates an array of bytes for valid IPv4 `string`.
	 * @param {string} string ip address: string.
	 * @param {number} [flag] options flag (default = value set by IPv4.SetParsePermissions).
	 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * @returns {number[]} array of bytes.
	 * @example
	 * IPv4.throwsParseData('192.168.11.5')
	 * // => [192, 168, 11, 5]
	 * IPv4.throwsParseData('0xC00002EB', 1 | 16) // allow decimal long
	 * // => throw new IpUtilsError(INVALID_IPv4_STRING)
	 * @throws {IpUtilsError} INVALID_IPv4_STRING
	 */
	static throwsParseData(string: string, flag?: number): number[] {
		return typeof flag === 'undefined' ?
			IPv4_throwsParseData(string, IPv4_parserFlag, IPv4_parser) :
			IPv4_throwsParseData(string, flag);
	}
	/**
	 * Creates an array of bytes for valid IPv4 `string`.
	 * @param {string} string ip address: string.
	 * @param {number} [flag] options flag (default = value set by IPv4.SetParsePermissions).
	 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * @returns {(number[] | number)} array of bytes, or error code.
	 * @example
	 * IPv4.parseData('192.168.11.5')
	 * // => [192, 168, 11, 5]
	 * IPv4.parseData('0xC00002EB', 1 | 16) // allow decimal long
	 * // => null
	 * @error INVALID_IPv4_STRING
	 */
	static parseData(string: string, flag?: number): number[] | number {
		return typeof flag === 'undefined' ?
			IPv4_parseData(string, IPv4_parserFlag, IPv4_parser) :
			IPv4_parseData(string, flag);
	}

	// !isValid
	/**
	 * Checks `string` for IPv4 validity.
	 * @param {string} string ip address: string.
	 * @param {number} [flag] options flag (default = value set by IPv4.SetParsePermissions).
	 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * @returns {boolean} `true` if `string` is valid IPv4, else `false`.
	 * @example
	 * IPv4.isValid('192.168.11.5')
	 * // => true
	 * IPv4.isValid('0xC00002EB', 1 | 16) // allow decimal long
	 * // => false
	 * @error INVALID_IPv4_STRING
	 */
	static isValid(string: string, flag?: number): boolean {
		return typeof (typeof flag === 'undefined' ?
			IPv4_parseData(string, IPv4_parserFlag, IPv4_parser) :
			IPv4_parseData(string, flag)) === 'object';
	}
	/**
	 * Checks `string` for IPv4 validity in four part decimal form.
	 * @param {string} string ip address: string.
	 * @returns {boolean} `true` if `string` is valid IPv4 four part decimal notation, else `false`.
	 * @example
	 * IPv4.isValidFourPartDecimal('192.168.11.5')
	 * // => true
	 * IPv4.isValidFourPartDecimal('0xC00002EB')
	 * // => false
	 * @error INVALID_IPv4_STRING
	 */
	static isValidFourPartDecimal(string: string): boolean {
		// return (this.isValid(string) && R.ipv4Regexes.fourDecimalOctets.test(string));
		return typeof IPv4_parseData(string, IPv4_ParseFlags.parseDecimal, IPv4_parseIntDec) === 'object';
	}

	// !check
	/**
	 * Validates length and data of `bytes`.
	 * @param {number[]} bytes ip address: array of bytes (length = 4).
	 * @returns {boolean} `true` if `bytes` is valid IPv4 array.
	 * @example
	 * IPv4.throwsCheck([192, 168, 11, 5])
	 * // => true
	 * IPv4.throwsCheck([192, 168])
	 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY_LENGTH)
	 * IPv4.throwsCheck([-192, -168, 512, 1024])
	 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY)
	 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY_LENGTH
	 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY
	 */
	static throwsCheck = IPv4_throwsCheck;
	/**
	 * Validates length and data of `bytes`.
	 * @param {number[]} bytes ip address: array of bytes (length = 4).
	 * @returns {boolean} `true` if `bytes` is valid IPv4 array, else `false`.
	 * @example
	 * IPv4.check([192, 168, 11, 5])
	 * // => true
	 * IPv4.check([192, 168])
	 * // => false
	 * IPv4.check([-192, -168, 512, 1024])
	 * // => false
	 * @error INVALID_IPv4_BYTE_ARRAY_LENGTH
	 * @error INVALID_IPv4_BYTE_ARRAY
	 */
	static check = IPv4_check;

	// !parse
	/**
	 * Creates `IPv4` instance for valid IPv4 `string`.
	 * @param {string} string ip address: string.
	 * @param {number} [flag] options flag (default = value set by IPv4.SetParsePermissions).
	 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * @returns {IPv4} `IPv4` instance.
	 * @example
	 * IPv4.throwsParse('192.168.11.5')
	 * // => IPv4
	 * IPv4.throwsParse('0xC00002EB', 1 | 16) // allow decimal long
	 * // => throw new IpUtilsError(INVALID_IPv4_STRING)
	 * @throws {IpUtilsError} INVALID_IPv4_STRING
	 */
	static throwsParse(string: string, flag?: number): IPv4 {
		const bytes = typeof flag === 'undefined' ?
			IPv4_throwsParseData(string, IPv4_parserFlag, IPv4_parser) :
			IPv4_throwsParseData(string, flag);
		return new this(bytes);
	}
	/**
	 * Creates `IPv4` instance for valid IPv4 `string`.
	 * @param {string} string ip address: string.
	 * @param {number} [flag] options flag (default = value set by IPv4.SetParsePermissions).
	 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * @returns {IPv4} `IPv4` instance, or `null` on error.
	 * @example
	 * IPv4.parse('192.168.11.5')
	 * // => IPv4
	 * IPv4.parse('0xC00002EB', 1 | 16) // allow decimal long
	 * // => null
	 * @error INVALID_IPv4_STRING
	 */
	static parse(string: string, flag?: number): IPv4 | null {
		const bytes = typeof flag === 'undefined' ?
			IPv4_parseData(string, IPv4_parserFlag, IPv4_parser) :
			IPv4_parseData(string, flag);
		if (typeof bytes === 'number') { return null; }
		return new this(bytes);
	}

	// !constructor
	bytes: number[];
	/**
	 * @param {number[]} bytes ip address: array of bytes (length = 4) (**unsafe assign**).
	 */
	constructor(bytes: number[]) {
		this.bytes = bytes;
	}
	/**
	 * Validates data and creates `IPv4` instance.
	 * @param {number[]} bytes ip address: array of bytes (length = 4) (**unsafe assign**).
	 * @returns {IPv4} `IPv4` instance.
	 * @example
	 * IPv4.throwsConstruct([192, 168, 11, 5])
	 * // => IPv4
	 * IPv4.throwsConstruct([192, 168])
	 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY_LENGTH)
	 * IPv4.throwsConstruct([-192, -168, 512, 1024])
	 * // => throw new IpUtilsError(INVALID_IPv4_BYTE_ARRAY)
	 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY_LENGTH
	 * @throws {IpUtilsError} INVALID_IPv4_BYTE_ARRAY
	 */
	static throwsConstruct(bytes: number[]): IPv4 {
		this.throwsCheck(bytes);
		return new this(bytes);
	}
	/**
	 * Validates data and creates `IPv4` instance.
	 * @param {number[]} bytes ip address: array of bytes (length = 4) (**unsafe assign**).
	 * @returns {(IPv4 | null)} `IPv4` instance, or `null` on error.
	 * @example
	 * IPv4.construct([192, 168, 11, 5])
	 * // => IPv4
	 * IPv4.construct([192, 168])
	 * // => null
	 * IPv4.construct([-192, -168, 512, 1024])
	 * // => null
	 * @error INVALID_IPv4_BYTE_ARRAY_LENGTH
	 * @error INVALID_IPv4_BYTE_ARRAY
	 */
	static construct(bytes: number[]): IPv4 | null {
		if (!this.check(bytes)) { return null; }
		return new this(bytes);
	}

	kind() { return 'ipv4' as const; }

	// !isEqual
	/**
	 * Checks whether `this.bytes` and `bytes` byte arrays are equal.
	 * @param {number[]} bytes ip address: array of bytes (length = 4).
	 * @returns {boolean} `true` if `this.bytes` and `bytes` byte arrays are equal, else `false`.
	 * @example
	 * new IPv4([192, 168, 11, 5]).isEqual([10, 83, 2, 14])
	 * // => false
	 */
	isEqual(bytes: number[]): boolean {
		return isEqual(this.bytes, bytes);
	}

	// !containedBy
	/**
	 * Checks whether `arg` (Network) contains `IP` instance.
	 * @param {([number[], number] | Network)} arg network data: `Network` instance or [array of bytes, netmask length] (*assumes correct*).
	 * @returns {boolean} `true` if `arg` contains `IP` instance.
	 * @example
	 * const ipv4 = new IPv4([192, 168, 11, 5])
	 * ipv4.throwsContainedBy([ [192, 168, 11, 0], 24 ])
	 * // => true
	 * const nw = new Network([10, 83, 2, 0], 24)
	 * ipv4.throwsContainedBy(nw)
	 * // => false
	 * const nw = new Network([192, 168, 11, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 64)
	 * ipv4.throwsContainedBy(nw)
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
	 * @param {([number[], number] | Network)} arg network data: `Network` instance or [array of bytes, netmask length] (*assumes correct*).
	 * @returns {boolean} `true` if `arg` contains `IP` instance, else `false`.
	 * @example
	 * const ipv4 = new IPv4([192, 168, 11, 5])
	 * ipv4.containedBy([ [192, 168, 11, 0], 24 ])
	 * // => true
	 * const nw = new Network([10, 83, 2, 0], 24)
	 * ipv4.containedBy(nw)
	 * // => false
	 * const nw = new Network([192, 168, 11, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 64)
	 * ipv4.containedBy(nw)
	 * // => false
	 * @throws {IpUtilsError} MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	containedBy(arg: RangeItem): boolean {
		if (arg instanceof Array) {
			return matchNetwork(this.bytes, arg[0] instanceof Array ? arg[0] : arg[0].bytes, arg[1]) === true;
		}
		return matchNetwork(this.bytes, arg.addr.bytes, arg.prefix) === true;
	}

	// !range
	/**
	 * @returns {string} matching range among IPv4.SpecialRanges.
	 * @example
	 * new IPv4([192, 168, 11, 5]).range()
	 * // => 'private'
	 */
	range(): IPv4Range {
		return matchNetworkRange(this.bytes, IPv4.SpecialRanges);
	}

	// !toIPv4MappedBytes
	/**
	 * Converts IPv4 array of bytes into IPv6 array of bytes in "ipv4Mapped" special range.
	 * @returns {number[]} IPv6 array of bytes in "ipv4Mapped" special range.
	 * @example
	 * new IPv4([192, 168, 11, 5]).toIPv4MappedBytes()
	 * // => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 192, 168, 11, 5]
	 */
	toIPv4MappedBytes(): number[] {
		return [
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0xFF, 0xFF,
			this.bytes[0] << 8, this.bytes[1],
			this.bytes[2] << 8, this.bytes[3]
		];
	}

	// !toIPv4MappedAddress
	/**
	 * Converts IPv4 array of bytes into `IPv6` instance with data in "ipv4Mapped" special range.
	 * @returns {IPv6} `IPv6` instance with data in "ipv4Mapped" special range.
	 * @example
	 * new IPv4([192, 168, 11, 5]).toIPv4MappedAddress()
	 * // => new IPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 192, 168, 11, 5])
	 */
	toIPv4MappedAddress(): IPv6 {
		return new IPv6(this.toIPv4MappedBytes());
	}

	// !prefixLengthFromNetworkMask
	/**
	 * Computes netmask length from `this.bytes` (network mask).
	 * @returns {number} netmask length.
	 * @example
	 * new IPv4([255, 192, 0, 0]).throwsPrefixLengthFromNetworkMask() // 192 = 1100 0000
	 * // => 10
	 * new IPv4([255, 63, 0, 0]).throwsPrefixLengthFromNetworkMask() // 63 = 0011 1111
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
	 * new IPv4([255, 192, 0, 0]).prefixLengthFromNetworkMask() // 192 = 1100 0000
	 * // => 10
	 * new IPv4([255, 63, 0, 0]).prefixLengthFromNetworkMask() // 63 = 0011 1111
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
	 * @returns {string} dot-decimal notation, which consists of four octets of the address expressed individually in decimal numbers and separated by periods.
	 */
	toNormalizedString(): string {
		return this.toString();
	}
	/**
	 * @returns {string} dot-decimal notation, which consists of four octets of the address expressed individually in decimal numbers and separated by periods.
	 * @example
	 */
	toString(): string {
		return this.bytes.join('.');
	}
};