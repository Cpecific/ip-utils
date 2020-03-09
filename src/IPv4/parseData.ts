import R from './RegExp';
import IpUtilsError, { Codes } from '../Error';

export const enum IPv4_ParseFlags {
	/** allows decimal values (ex. `192.0.2.235`, `3221226219`). */
	parseDecimal = 1,
	/** allows octet values (ex. `0300.0000.0002.0353`, `030000001353`). */
	parseOctet = 2,
	/** allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`). */
	parseHex = 4,
	/** allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`). */
	parseVariable = 8,
	/** allows "long" notation, only 1st octet (ex. `3221226219`). */
	parseLong = 16,
	ALL = 31,
	// CANONICAL = 1,
	EXCLUDE_VARIABLE = 25,
	EXCLUDE_LONG = 15,
};

/**
 * @internal
 */
export function IPv4_parseIntDecOctHex(part: string) {
	if (part.substr(0, 1) === '0') {
		if (part.substr(1, 1).toLowerCase() === 'x') {
			return parseInt(part, 16);
		}
		return parseInt(part, 8);
	}
	return parseInt(part, 10);
}
/**
 * @internal
 */
export function IPv4_parseIntDec(part: string) {
	if (part.substr(0, 1) === '0') {
		return null;
	}
	return parseInt(part, 10);
}
/**
 * @internal
 */
export function IPv4_parseIntOct(part: string) {
	if (part.substr(0, 1) === '0'
		&& part.substr(1, 1).toLowerCase() !== 'x') {
		return parseInt(part, 8);
	}
	return null;
}
/**
 * @internal
 */
export function IPv4_parseIntHex(part: string) {
	if (part.substr(0, 1) === '0'
		&& part.substr(1, 1).toLowerCase() === 'x') {
		return parseInt(part, 16);
	}
	return null;
}
/**
 * @internal
 */
export function IPv4_parseIntDecOct(part: string) {
	if (part.substr(0, 1) === '0') {
		if (part.substr(1, 1).toLowerCase() === 'x') {
			return null;
		}
		return parseInt(part, 8);
	}
	return parseInt(part, 10);
}
/**
 * @internal
 */
export function IPv4_parseIntDecHex(part: string) {
	if (part.substr(0, 1) === '0') {
		if (part.substr(1, 1).toLowerCase() !== 'x') {
			return null;
		}
		return parseInt(part, 16);
	}
	return parseInt(part, 10);
}
/**
 * @internal
 */
export function IPv4_parseIntOctHex(part: string) {
	if (part.substr(0, 1) === '0') {
		if (part.substr(1, 1).toLowerCase() === 'x') {
			return parseInt(part, 16);
		}
		return parseInt(part, 8);
	}
	return null;
}

export type IPv4_ParseType = (part: string) => number | null;

/**
 * @internal
 * @param {number} flag options flag (*IPv4_ParseFlags*).
 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
 * @returns {Function} parser corresponding to `flag`.
 * @throws {IpUtilsError} MISSING_IPv4_PARSER_FLAG_ARRAY_VALUES
 */
export function IPv4_getParser(flag: number): IPv4_ParseType {
	if (flag & IPv4_ParseFlags.parseDecimal) {
		if (flag & IPv4_ParseFlags.parseOctet) {
			if (flag & IPv4_ParseFlags.parseHex) {
				return IPv4_parseIntDecOctHex;
			} else {
				return IPv4_parseIntDecOct;
			}
		} else {
			if (flag & IPv4_ParseFlags.parseHex) {
				return IPv4_parseIntDecHex;
			} else {
				return IPv4_parseIntDec;
			}
		}
	} else {
		if (flag & IPv4_ParseFlags.parseOctet) {
			if (flag & IPv4_ParseFlags.parseHex) {
				return IPv4_parseIntOctHex;
			} else {
				return IPv4_parseIntOct;
			}
		} else {
			if (flag & IPv4_ParseFlags.parseHex) {
				return IPv4_parseIntHex;
			} else {
				throw new IpUtilsError(Codes.MISSING_IPv4_PARSER_FLAG_ARRAY_VALUES);
			}
		}
	}
}
/**
 * @internal
 * @param {Function} parser octet parser function.
 * @returns {number} flag corresponding to `parser`.
 * @throws {IpUtilsError} INVALID_IPv4_PARSER
 */
export function IPv4_getFlag(parser: IPv4_ParseType): number {
	switch (parser) {
		case IPv4_parseIntDecOctHex:
			return IPv4_ParseFlags.parseDecimal | IPv4_ParseFlags.parseOctet | IPv4_ParseFlags.parseHex;
		case IPv4_parseIntDecOct:
			return IPv4_ParseFlags.parseDecimal | IPv4_ParseFlags.parseOctet;
		case IPv4_parseIntDecHex:
			return IPv4_ParseFlags.parseDecimal | IPv4_ParseFlags.parseHex;
		case IPv4_parseIntDec:
			return IPv4_ParseFlags.parseDecimal;
		case IPv4_parseIntOctHex:
			return IPv4_ParseFlags.parseOctet | IPv4_ParseFlags.parseHex;
		case IPv4_parseIntOct:
			return IPv4_ParseFlags.parseOctet;
		case IPv4_parseIntHex:
			return IPv4_ParseFlags.parseHex;
	}
	throw new IpUtilsError(Codes.INVALID_IPv4_PARSER);
}



/**
 * Creates an array of bytes for valid IPv4 `string`.
 * @utility
 * @param {string} string ip address.
 * @param {number} [flag=31] options flag (default = 31).
 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
 * @param {Function} [parser] parser for given `flag` (*assumes correct*).
 * @returns {number[]} array of bytes.
 * @example
 * IPv4_throwsParseData('192.168.11.5')
 * // => [192, 168, 11, 5]
 * IPv4_throwsParseData('0xC00002EB', 1 | 16) // allow decimal long
 * // => throw new IpUtilsError(INVALID_IPv4_STRING)
 * @throws {IpUtilsError} INVALID_IPv4_STRING
 */
export function IPv4_throwsParseData(string: string, opts: number = IPv4_ParseFlags.ALL, parser?: IPv4_ParseType): number[] {
	const ret = IPv4_parseData(string, opts, parser);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return ret;
}

/**
 * Creates an array of bytes for valid IPv4 `string`.
 * @utility
 * @param {string} string ip address.
 * @param {number} [flag=31] options flag (default = 31).
 * - 1 - allows decimal values (ex. `192.0.2.235`, `3221226219`).
 * - 2 - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
 * - 4 - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
 * - 8 - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
 * - 16 - allows "long" notation, only 1st octet (ex. `3221226219`).
 * @param {Function} [parser] parser for given `flag` (*assumes correct*).
 * @returns {(number[] | number)} array of bytes, or error code.
 * @example
 * IPv4_parseData('192.168.11.5')
 * // => [192, 168, 11, 5]
 * IPv4_parseData('0xC00002EB', 1 | 16) // allow decimal long
 * // => INVALID_IPv4_STRING
 * @error INVALID_IPv4_STRING
 */
export default function IPv4_parseData(string: string, flag: number = IPv4_ParseFlags.ALL, parser?: IPv4_ParseType) {
	var num: number | null;
	var match: RegExpMatchArray | null;
	var part: string;
	var bytes: number[];
	var i: number;
	if (typeof parser === 'undefined') {
		parser = IPv4_getParser(flag);
	}
	if (flag & IPv4_ParseFlags.parseVariable) {
		match = string.match(R.ipv4Regexes.fourVariableParts);
		if (match) {
			bytes = Array(4);
			for (i = 0; i < 4; ++i) {
				part = match[1 + i];
				if (typeof part === 'undefined') {
					--i;
					for (; i < 4; ++i) {
						bytes[i] = (num! >> ((3 - i) * 8)) & 0xFF;
					}
					break;
				}
				else {
					num = parser(part);
					if (num === null || isNaN(num)) {
						return Codes.INVALID_IPv4_STRING;
					}
					bytes[i] = num;
				}
			}
			for (i = 0; i < 4; ++i) {
				if (bytes[i] > 0xFF) {
					return Codes.INVALID_IPv4_STRING;
				}
			}
			return bytes;
		}
	}
	else {
		match = string.match(R.ipv4Regexes.fourParts);
		if (match) {
			bytes = Array(4);
			for (i = 0; i < 4; ++i) {
				part = match[1 + i];
				num = parser(part);
				if (num === null || isNaN(num) || num > 0xFF) {
					return Codes.INVALID_IPv4_STRING;
				}
				bytes[i] = num;
			}
			return bytes;
		}
	}
	if (flag & IPv4_ParseFlags.parseLong) {
		match = string.match(R.ipv4Regexes.longValue);
		if (match) {
			num = parser(match[1]);
			if (num === null || isNaN(num) || num > 0xFFFFFFFF) {
				return Codes.INVALID_IPv4_STRING;
			}
			// chrome parses only starting with с 1.0.0.0
			// if (num < 0x01000000) {
			// 	return 'ipaddr: invalid IPv4 string';
			// }
			bytes = Array(4);
			for (i = 0; i < 4; ++i) {
				bytes[3 - i] = (num / (1 << (i * 8))) & 0xFF;
			}
			return bytes;
		}
	}
	return Codes.INVALID_IPv4_STRING;
}