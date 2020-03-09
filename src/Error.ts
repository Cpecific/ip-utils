export const enum Codes {
	INVALID_BYTE_ARRAY_LENGTH,
	INVALID_NETMASK_LENGTH,
	INVALID_NETMASK,
	INVALID_IP_STRING,
	INVALID_CIDR_STRING,
	PREFIX_IS_NOT_A_NUMBER,

	INVALID_IPv4_PARSER,
	INVALID_IPv4_PARSER_FLAG,
	INVALID_IPv4_PARSER_FLAG_ARRAY,
	MISSING_IPv4_PARSER_FLAG_ARRAY_VALUES,
	INVALID_IPv4_STRING,
	INVALID_IPv4_BYTE_ARRAY,
	INVALID_IPv4_BYTE_ARRAY_LENGTH,

	INVALID_IPv6_STRING,
	INVALID_IPv6_IPv4_TRANSITIONAL_STRING,
	INVALID_IPv6_AMOUNT_OF_PARTS,
	INVALID_IPv6_INPUT_ARRAY_LENGTH,
	INVALID_IPv6_PART_ARRAY,
	INVALID_IPv6_BYTE_ARRAY,
	INVALID_IPv6_ZONE,
	INVALID_IPv6_IPv4_CONVERSION,

	MATCH_NETWORK_MISMATCHING_LENGTH,
};

export const Messages = [
	// INVALID_BYTE_ARRAY_LENGTH
	'invalid binary input length',
	// INVALID_NETMASK_LENGTH
	'invalid netmask length',
	// INVALID_NETMASK
	'invalid netmask',
	// INVALID_IP_STRING
	'invalid ip string',
	// INVALID_CIDR_STRING
	'string is not formatted like CIDR range',
	// PREFIX_IS_NOT_A_NUMBER
	'prefix is not a number',

	// INVALID_IPv4_PARSER
	'invalid IPv4 parser function',
	// INVALID_IPv4_PARSER_FLAG
	'invalid IPv4 parser flag',
	// INVALID_IPv4_PARSER_FLAG_ARRAY
	'invalid values of the parser flag array',
	// MISSING_IPv4_PARSER_FLAG_ARRAY_VALUES
	'none of "decimal", "octet", "hex" are present in permission list',
	// INVALID_IPv4_STRING
	'invalid IPv4 string',
	// INVALID_IPv4_BYTE_ARRAY
	'IPv4 octet should fit in unsigned byte',
	// INVALID_IPv4_BYTE_ARRAY_LENGTH
	'IPv4 octet count should be 4',

	// INVALID_IPv6_STRING
	'invalid IPv6 string',
	// INVALID_IPv6_IPv4_TRANSITIONAL_STRING
	'invalid IPv4 string (IPv6 transitional IPv4)',
	// INVALID_IPv6_AMOUNT_OF_PARTS
	'invalid amount of IPv6 parts',
	// INVALID_IPv6_INPUT_ARRAY_LENGTH
	'IPv6 input array length should be 8 or 16',
	// INVALID_IPv6_PART_ARRAY
	'IPv6 part should fit in 16 bits',
	// INVALID_IPv6_BYTE_ARRAY
	'IPv6 byte should fit in 8 bits',
	// INVALID_IPv6_ZONE
	'invalid zoneId argument',
	// INVALID_IPv6_IPv4_CONVERSION
	'trying to convert a generic ipv6 address to ipv4',

	// MATCH_NETWORK_MISMATCHING_LENGTH
	'cannot match network for objects with different lengths',
] as const;

export default class IpUtilsError extends Error {
	code: Codes;
	constructor(code: Codes) {
		super(Messages[code]);
		this.name = 'IpUtilsError';
		this.code = code;

		// this.constructor = IpUtilsError;
		// this.__proto__ = IpUtilsError.prototype;
	}
}