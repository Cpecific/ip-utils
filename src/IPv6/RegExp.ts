import R4 from '../IPv4/RegExp';

const ipv6Part = "[0-9a-f]{1,4}";
const ipv6Colon = "(?:" + ipv6Part + "::?)+";
const zoneIndex = "%[0-9a-z]{1,}";
const ipv6Regexes = {
	zoneIndex: new RegExp(zoneIndex, 'i'),
	native: new RegExp("^(::)?(" + ipv6Colon + ")?(" + ipv6Part + ")?(::)?(" + zoneIndex + ")?$", 'i'),
	transitional: new RegExp(
		("^((?:::)?(?:" + ipv6Colon + "))") +
		"(" + R4.ipv4PartsTotal + ")" +
		("(" + zoneIndex + ")?$"), 'i'),
};

export default {
	ipv6Part,
	ipv6Colon,
	zoneIndex,
	ipv6Regexes
};