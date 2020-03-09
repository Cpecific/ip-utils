import IpUtilsError, { Codes } from '../Error';
import IPv4_parseData from '../IPv4/parseData';

import R from './RegExp';

export interface IPv6_ParseData {
	// parts: number[];
	bytes: number[];
	zoneId: string | undefined;
};

/**
 * @utility
 * @param {string} string `(::)?([0-ffff]::?)+[0-ffff](::)?%zone`.
 * @param {number} partsCount how many parts IP must have (IPv6 — 8, IPv6 transitional IPv4 — 6).
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
function expandIPv6(string: string, partsCount: number) {
	if (string.length === 0) {
		return Codes.INVALID_IPv6_STRING;
	}
	const colon2Pos = string.indexOf('::');
	if (colon2Pos >= 0
		&& colon2Pos !== string.lastIndexOf('::')) {
		return Codes.INVALID_IPv6_STRING;
	}

	let zoneId = (string.match(R.ipv6Regexes.zoneIndex) || [void 0])[0];
	if (zoneId) {
		zoneId = zoneId.substr(1);
		string = string.replace(/%.+$/, '');
	}

	let colonCount = 0;
	let lastColon = -1;
	while ((lastColon = string.indexOf(':', lastColon + 1)) >= 0) {
		++colonCount;
	}
	if (string.substr(0, 2) === '::') {
		--colonCount;
	}
	else if (string.substr(-2, 2) === '::') {
		--colonCount;
	}
	if (colonCount >= partsCount) {
		return Codes.INVALID_IPv6_AMOUNT_OF_PARTS;
	}
	if (colon2Pos >= 0) {
		let replacementCount = partsCount - colonCount;
		if (replacementCount < 2) {
			return Codes.INVALID_IPv6_AMOUNT_OF_PARTS;
		}
		let replacement = ':';
		for (; replacementCount > 0; --replacementCount) {
			replacement += '0:';
		}
		string = string.replace('::', replacement);

		if (string.substr(0, 1) === ':') {
			string = string.substr(1);
		}
		if (string.substr(-1, 1) === ':') {
			string = string.substr(0, string.length - 1);
		}
	}

	const ref = string.split(':');
	if (ref.length !== partsCount) {
		return Codes.INVALID_IPv6_AMOUNT_OF_PARTS;
	}
	const bytes = Array<number>(16);
	for (let i = 0; i < ref.length; ++i) {
		const part = ref[i];
		if (part.length === 0) {
			return Codes.INVALID_IPv6_STRING;
		}
		const byte = parseInt(part, 16);
		bytes[i * 2] = byte >> 8;
		bytes[i * 2 + 1] = byte & 0xFF;
	}

	return {
		bytes,
		zoneId,
	} as IPv6_ParseData;
}

/**
 * Creates an object with array of bytes and zone id for valid IPv6 `string`.
 * @utility
 * @param {string} string ip address: string.
 * @returns {{bytes: number[], zoneId: string | undefined}} object { bytes: array of bytes, zoneId: string or undefined }.
 * @example
 * IPv6_throwsParseData('2001:db8:85a3::8a2e:370:7334%eth0')
 * // => {
 * //   bytes: [0x20, 0x01, 0x0d, 0xb8,
 * //           0x85, 0xa3, 0x00, 0x00,
 * //           0x00, 0x00, 0x8a, 0x2e,
 * //           0x03, 0x70, 0x73, 0x34],
 * //   zone: 'eth0'
 * // }
 * IPv6_throwsParseData('::ff::')
 * // => throws new IpUtilsError(INVALID_IPv6_STRING)
 * @throws {IpUtilsError} INVALID_IPv6_STRING
 * @throws {IpUtilsError} INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @throws {IpUtilsError} INVALID_IPv6_AMOUNT_OF_PARTS
 */
export function IPv6_throwsParseData(string: string): IPv6_ParseData {
	const ret = IPv6_parseData(string);
	if (typeof ret === 'number') {
		throw new IpUtilsError(ret);
	}
	return ret;
}

/**
 * Creates an object with array of bytes and zone id for valid IPv6 `string`.
 * @utility
 * @param {string} string ip address: string.
 * @returns {({bytes: number[], zoneId: string | undefined} | number)} object { bytes: array of bytes, zoneId: string or undefined }, or error code.
 * @example
 * IPv6_parseData('2001:db8:85a3::8a2e:370:7334%eth0')
 * // => {
 * //   bytes: [0x20, 0x01, 0x0d, 0xb8,
 * //           0x85, 0xa3, 0x00, 0x00,
 * //           0x00, 0x00, 0x8a, 0x2e,
 * //           0x03, 0x70, 0x73, 0x34],
 * //   zone: 'eth0'
 * // }
 * IPv6_parseData('::ff::')
 * // => null
 * @error INVALID_IPv6_STRING
 * @error INVALID_IPv6_IPv4_TRANSITIONAL_STRING
 * @error INVALID_IPv6_AMOUNT_OF_PARTS
 */
export default function IPv6_parseData(string: string) {
	if (R.ipv6Regexes.native.test(string)) {
		return expandIPv6(string, 8);
	}

	const match = string.match(R.ipv6Regexes.transitional);
	if (!match) {
		return Codes.INVALID_IPv6_STRING;
	}

	const zoneId = match[7] || '';
	const addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
	if (typeof addr === 'number') {
		return addr;
	}

	const octets = IPv4_parseData(match[2]);
	if (typeof octets === 'number') {
		return Codes.INVALID_IPv6_IPv4_TRANSITIONAL_STRING;
	}

	// addr.parts[6] = (octets[0] << 8) | octets[1];
	// addr.parts[7] = (octets[2] << 8) | octets[3];
	addr.bytes[12] = octets[0];
	addr.bytes[13] = octets[1];
	addr.bytes[14] = octets[2];
	addr.bytes[15] = octets[3];
	return addr;
}