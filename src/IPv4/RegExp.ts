// const ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
const ipv4DecimalOctet = "(?:2(?:5[0-5]|[0-4]\\d)|1?\\d?\\d)";
// const ipv4Part = "0\\d+|0x[0-9a-f]+|" + ipv4DecimalOctet;
const ipv4Part = "00*(?:[1-3][0-7]?|[4-7])?[0-7]?|[1-9]\\d{0,2}|0x0*[0-9a-f]{0,2}";
const ipv4VariablePart = "00*(?:[1-3][0-7]?|[4-7])?[0-7]{0,9}|[1-9]\\d{0,9}|0x0*[0-9a-f]{0,8}";
const ipv4DecimalOctetTotal = ipv4DecimalOctet + "\\." + ipv4DecimalOctet + "\\." + ipv4DecimalOctet + "\\." + ipv4DecimalOctet;
const ipv4PartsTotal = "(" + ipv4Part + ")\\.(" + ipv4Part + ")\\.(" + ipv4Part + ")\\.(" + ipv4Part + ")";
const ipv4VariablePartsTotal = "(" + ipv4VariablePart + ")\\.(" + ipv4VariablePart + ")(?:\\.(" + ipv4VariablePart + ")(?:\\.(" + ipv4VariablePart + "))?)?";
const ipv4Regexes = {
	// only used in isValidFourPartDecimal
	fourDecimalOctets: new RegExp("^" + ipv4DecimalOctetTotal + "$", 'i'),
	fourParts: new RegExp("^" + ipv4PartsTotal + "$", 'i'),
	fourVariableParts: new RegExp("^" + ipv4VariablePartsTotal + "$", 'i'),
	longValue: new RegExp("^(" + ipv4VariablePart + ")$", 'i'),
};
export default {
	ipv4DecimalOctet,
	ipv4Part,
	ipv4VariablePart,
	ipv4DecimalOctetTotal,
	ipv4PartsTotal,
	ipv4VariablePartsTotal,
	ipv4Regexes
}