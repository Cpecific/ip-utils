/**
 * @file Took best practices from ipaddr and ip-utils and combined them together
 * @author cpecific
 * @email vahonin.prog@gmail.com
 */
;
export type IPv4Range =
	'unicast' | 'unspecified' | 'multicast' | 'linkLocal' | 'loopback'
	| 'broadcast' | 'carrierGradeNat' | 'private' | 'reserved';
export type IPv6Range =
	'unicast' | 'unspecified' | 'multicast' | 'linkLocal' | 'loopback'
	| 'uniqueLocal' | 'ipv4Mapped' | 'rfc6145' | 'rfc6052' | '6to4' | 'teredo' | 'reserved';

type RangeList<T extends string> = {
	[K in T]: Network[];
};

export type IPvTypes = IPv4 | IPv6;
export type IPvBytes = IPv4Bytes | IPv6Bytes;
export type IPvBytesLength = IPv4Bytes['length'] | IPv6Bytes['length'];
// type IPvParts = IPv4Parts | IPv6Parts;
// type IPvPartsLength = IPv4Parts["length"] | IPv6Parts["length"];
// type IPvNames = 'ipv4' | 'ipv6';

/**
 * Modifies passing array.
 * @param bytes assumes network address
 * @param prefix netmask length
 */
function setFirstHostBytes(bytes: IPvBytes, prefix: number) {
	const length = bytes.length;
	// IPv4
	if (length === 4) {
		// numberOfAddresses = Math.pow(2, cidrZeros) must be > 2
		// cidrZeros <= 1
		if ((length * 8) - prefix <= 1) { return; }
	}
	for (let i = length - 1; i >= 0; --i) {
		// [0x00FF] 255 + 1
		// 0xFF + 1 = 256 => 256 - 256 = 0x00 (1)
		// 0x00 + 1 = 1 => 0x01
		if (++bytes[i] > 0xFF) {
			bytes[i] = 0x00;
		}
		else { return; }
	}
}
/**
 * Modifies passing array.
 * @param bytes assumes broadcast address
 * @param prefix netmask length
 */
function setLastHostBytes(bytes: IPvBytes, prefix: number) {
	const length = bytes.length;
	// IPv4
	if (length === 4) {
		// numberOfAddresses = Math.pow(2, cidrZeros) must be > 2
		// cidrZeros <= 1
		if ((length * 8) - prefix <= 1) { return; }
	}
	for (let i = length - 1; i >= 0; --i) {
		// [0x100] 256 - 1
		// 0x00 - 1 = -1 => 256 - 1 = 0xFF (-1)
		// 0x01 - 1 = 0 => 0x00
		if (--bytes[i] < 0x00) {
			bytes[i] = 0xFF;
		}
		else { return; }
	}
}

export function networkMatch<T extends string, D extends string | undefined = undefined>(
	addr: IPvTypes,
	rangeList: RangeList<T>,
	defaultName?: D
) {
	const kind = addr.kind();
	for (const rangeName in rangeList) {
		const rangeNetworks = rangeList[rangeName];
		for (let i = rangeNetworks.length - 1; i >= 0; --i) {
			const network = rangeNetworks[i];
			if (kind === network.addr.kind()) {
				if (network.throwsContains(addr)) {
					return rangeName as T;
				}
			}
		}
	}
	return typeof defaultName === 'undefined' ?
		'unicast' as const :
		defaultName as ([D] extends [undefined] ? never : D);
}

//! fromPrefixLength
function _fromPrefixLength(
	prefix: number,
	bytesLength: IPvBytesLength | number
) {
	if (prefix < 0 || prefix > (bytesLength * 8)) {
		return `ipaddr: invalid prefix length for ${bytesLength} bytes length`;
	}
	const filledBytesCount = Math.floor(prefix / 8);
	const bytes = Array<number>(bytesLength)
		.fill(0xFF, 0, filledBytesCount)
		.fill(0, filledBytesCount);
	if (filledBytesCount < bytesLength) {
		bytes[filledBytesCount] = ~(0xff >> (prefix % 8)) & 0xff;
	}
	return bytes;
}
/**
 * Network mask from prefix length.
 * @param prefix - netmask length
 * @param bytesLength - total number of bytes
 */
export function throwsFromPrefixLength(
	prefix: number,
	bytesLength: IPvBytesLength | number
) {
	const ret = _fromPrefixLength(prefix, bytesLength);
	if (typeof ret === 'string') { throw new Error(ret); }
	return ret;
}
/**
 * Network mask from prefix length.
 * In case of an error returns undefined.
 * @param prefix - netmask length
 * @param bytesLength - total number of bytes
 */
export function fromPrefixLength(
	prefix: number,
	bytesLength: IPvBytesLength | number
) {
	const ret = _fromPrefixLength(prefix, bytesLength);
	if (typeof ret === 'string') { return undefined; }
	return ret;
}

//! fromNetworkMask
const bitTable = {
	0: 0,
	128: 1,
	192: 2,
	224: 3,
	240: 4,
	248: 5,
	252: 6,
	254: 7,
	255: 8,
};
function _fromNetworkMask(bytes: IPvBytes | number[]) {
	let cidr = 0;
	let stop = false;
	for (let i = 0, len = bytes.length; i < len; ++i) {
		const byte = bytes[i];
		if (!(byte in bitTable)) {
			// invalid network ip
			// return null;
			return 'invalid network ip';
		}
		const bits = bitTable[byte as keyof typeof bitTable];
		if (stop) {
			if (bits !== 0) {
				// invalid network ip (in previous bytes was !== 0xFF, means current and all next must be === 0)
				// return null;
				return 'invalid network ip';
			}
		}
		else if (bits !== 8) {
			// все последующие байты должны быть === 0
			stop = true;
		}
		cidr += bits;
	}
	return cidr;
}
/**
 * Prefix length from network mask.
 */
export function throwsFromNetworkMask(bytes: IPvBytes | number[]): number {
	const ret = _fromNetworkMask(bytes);
	if (typeof ret === 'string') { throw new Error(ret); }
	return ret;
}
/**
 * Prefix length from network mask.
 * In case of an error returns undefined.
 */
export function fromNetworkMask(bytes: IPvBytes | number[]): number | undefined {
	const ret = _fromNetworkMask(bytes);
	if (typeof ret === 'string') { return undefined; }
	return ret;
}

//! matchCIDR
function _matchCIDR(first: IPvBytes | number[], second: IPvBytes | number[], prefix: number) {
	if (first.length !== second.length) {
		return 'ipaddr: cannot match CIDR for objects with different lengths';
	}
	for (let idx = 0; prefix > 0; ++idx) {
		if (prefix >= 8) {
			if (first[idx] !== second[idx]) { return false; }
		} else {
			const shift = 8 - prefix;
			if ((first[idx] >> shift) !== (second[idx] >> shift)) { return false; }
		}
		prefix -= 8;
	}
	return true;
}
/**
 * Whether two IP are within same network.
 */
export function throwsMatchCIDR(first: IPvBytes | number[], second: IPvBytes | number[], prefix: number) {
	const ret = _matchCIDR(first, second, prefix);
	if (typeof ret === 'string') { throw new Error(ret); }
	return ret;
}
/**
 * Whether two IPs are within same network.
 * In case of an error returns undefined.
 */
export function matchCIDR(first: IPvBytes | number[], second: IPvBytes | number[], prefix: number) {
	const ret = _matchCIDR(first, second, prefix);
	if (typeof ret === 'string') { return undefined; }
	return ret;
}
export function matchCIDRBoolean(first: IPvBytes | number[], second: IPvBytes | number[], prefix: number) {
	const ret = _matchCIDR(first, second, prefix);
	if (typeof ret === 'string') { return false; }
	return ret;
}

//! Network
type IPvNetworkData = [IPvTypes, number];
export class Network {
	addr: IPvTypes;
	prefix: number;
	//! check
	static throwsCheck(addr: IPvTypes, prefix: number) {
		if (prefix < 0 || prefix > addr.bytes.length * 8) {
			throw new Error('ipaddr: CIDR mask length is invalid');
		}
	}
	static check(addr: IPvTypes, prefix: number): boolean {
		if (prefix < 0 || prefix > addr.bytes.length * 8) {
			return false;
		}
		return true;
	}
	//! constructor
	/**
	 * Network (subnet)
	 * @unsafe
	 * @param {IPv4 | IPv6} addr ip class instance
	 * @param prefix number of bits
	 */
	constructor(addr: IPvTypes, prefix: number) {
		this.addr = addr;
		this.prefix = prefix;
	}
	/**
	 * Network (subnet)
	 * @param {IPv4 | IPv6} addr ip class instance
	 * @param prefix number of bits
	 */
	static throwsConstruct(addr: IPvTypes, prefix: number): Network {
		this.throwsCheck(addr, prefix);
		return new Network(addr, prefix);
	}
	/**
	 * Network (subnet)
	 * @param {IPv4 | IPv6} addr ip class instance
	 * @param prefix number of bits
	 */
	static construct(addr: IPvTypes, prefix: number): Network | undefined {
		if (!this.check(addr, prefix)) { return undefined; }
		return new Network(addr, prefix);
	}
	//! mask
	// also known as network mask
	private _mask?: IPvBytes | null;
	throwsMask() {
		if (typeof this._mask === 'undefined') {
			this._mask = throwsFromPrefixLength(this.prefix, this.addr.bytes.length) as IPvBytes;
		}
		else if (this._mask === null) {
			throw new Error('ipaddr: called .mask() which returned null, later called .throwsMask() which always returns IPvBytes');
		}
		return this._mask;
	}
	mask() {
		if (typeof this._mask === 'undefined') {
			this._mask = (fromPrefixLength(this.prefix, this.addr.bytes.length) as IPvBytes | undefined) || null;
		}
		return this._mask;
	}
	//! hostMask
	private _hostMask?: IPvBytes | null;
	throwsHostMask(): IPvBytes {
		if (typeof this._hostMask === 'undefined') {
			const mask = this.throwsMask().slice() as IPvBytes;
			for (let i = mask.length - 1; i >= 0; --i) {
				mask[i] |= (mask[i] ^ 255);
			}
			this._hostMask = mask;
			return mask;
		}
		else if (this._hostMask === null) {
			throw new Error('ipaddr: called .hostMask() which returned null, later called .throwsHostMask() which always returns IPvBytes');
		}
		return this._hostMask;
	}
	hostMask(): IPvBytes | null {
		if (typeof this._hostMask === 'undefined') {
			let mask = this.mask();
			if (mask) {
				mask = mask.slice() as IPvBytes;
				for (let i = mask.length - 1; i >= 0; --i) {
					mask[i] ^= 255;
				}
			}
			this._hostMask = mask;
		}
		return this._hostMask;
	}
	get netmaskLength() { return this.prefix; }
	get cidrBits() { return this.prefix; }
	get cidrZeros() { return (this.addr.bytes.length * 8) - this.prefix; }
	get numberOfAddresses() { return 2 ** this.cidrZeros; }
	//! networkAddressBytes
	throwsNetworkAddressBytes(): IPvBytes {
		const mask = this.throwsMask();
		const bytes = this.addr.toByteArray();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] &= mask[i];
		}
		return bytes;
	}
	networkAddressBytes(): IPvBytes | undefined {
		const mask = this.mask();
		if (!mask) { return undefined; }
		const bytes = this.addr.toByteArray();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] &= mask[i];
		}
		return bytes;
	}
	//! broadcastAddressBytes
	throwsBroadcastAddressBytes(): IPvBytes {
		const mask = this.throwsMask();
		const bytes = this.addr.toByteArray();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] |= (mask[i] ^ 255);
		}
		return bytes;
	}
	broadcastAddressBytes(): IPvBytes | undefined {
		const mask = this.mask();
		if (!mask) { return undefined; }
		const bytes = this.addr.toByteArray();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] |= (mask[i] ^ 255);
		}
		return bytes;
	}
	//! firstHostBytes
	throwsFirstHostBytes(): IPvBytes {
		const bytes = this.throwsNetworkAddressBytes();
		setFirstHostBytes(bytes, this.prefix);
		return bytes;
	}
	firstHostBytes(): IPvBytes | undefined {
		const bytes = this.networkAddressBytes();
		if (typeof bytes === 'undefined') { return undefined; }
		setFirstHostBytes(bytes, this.prefix);
		return bytes;
	}
	//! lastHostBytes
	throwsLastHostBytes(): IPvBytes {
		const bytes = this.throwsBroadcastAddressBytes();
		setLastHostBytes(bytes, this.prefix);
		return bytes;
	}
	lastHostBytes(): IPvBytes | undefined {
		const bytes = this.broadcastAddressBytes();
		if (typeof bytes === 'undefined') { return undefined; }
		setLastHostBytes(bytes, this.prefix);
		return bytes;
	}
	// TODO getHostNumber(addr: IPvTypes)
	//! networkAddress
	throwsNetworkAddress(): IPvTypes {
		const bytes = this.throwsNetworkAddressBytes();
		return throwsAutoConstructor(bytes);
	}
	networkAddress(): IPvTypes | undefined {
		const bytes = this.networkAddressBytes();
		if (!bytes) { return undefined; }
		return autoConstructor(bytes);
	}
	//! broadcastAddress
	throwsBroadcastAddress(): IPvTypes {
		const bytes = this.throwsBroadcastAddressBytes();
		return throwsAutoConstructor(bytes);
	}
	broadcastAddress(): IPvTypes | undefined {
		const bytes = this.broadcastAddressBytes();
		if (!bytes) { return undefined; }
		return autoConstructor(bytes);
	}
	//! contains
	throwsContains(addr: IPvTypes | IPvBytes): boolean {
		if (addr.constructor === Array) {
			return throwsMatchCIDR(addr as IPvBytes, this.addr.bytes, this.prefix);
		}
		return throwsMatchCIDR((addr as IPvTypes).bytes, this.addr.bytes, this.prefix);
	}
	contains(addr: IPvTypes | IPvBytes): boolean {
		if (addr.constructor === Array) {
			return matchCIDRBoolean(addr as IPvBytes, this.addr.bytes, this.prefix);
		}
		return matchCIDRBoolean((addr as IPvTypes).bytes, this.addr.bytes, this.prefix);
	}
	toString() {
		return `${this.addr.toString()}/${this.prefix}`;
	}
}

export function isIPv4(addr: IPvTypes): addr is IPv4 { return (addr instanceof IPv4); }
export function isIPv6(addr: IPvTypes): addr is IPv6 { return (addr instanceof IPv6); }

interface IPcommon {
	bytes: number[];
	throwsPrefixLengthFromNetworkMask(): number;
	prefixLengthFromNetworkMask(): number | undefined;
	toByteArray(): number[];
	toNormalizedString(): string;
	toString(): string;
}

// const ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
const ipv4Byte = "(?:2(?:5[0-5]|[0-4]\\d)|1?\\d?\\d)";
const ipv4Part = "(0\\d+|0x[0-9a-f]+|" + ipv4Byte + ")";
const ipv4Total = ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part;
const ipv4ByteTotal = ipv4Byte + "\\." + ipv4Byte + "\\." + ipv4Byte + "\\." + ipv4Byte;
const ipv4Regexes = {
	fourOctet: new RegExp("^" + ipv4Total + "$", 'i'),
	fourByte: new RegExp("^" + ipv4ByteTotal + "$", 'i'),
	longValue: new RegExp("^(\\d+|0x[0-9a-f]+)$", 'i'),
};
type IPv4Bytes = [number, number, number, number];
type IPv4Parts = IPv4Bytes;
export class IPv4 implements IPcommon {
	static kind = 'ipv4' as const;
	static bytes = 4 as const;
	static SpecialRanges = {
		unspecified: [new Network(new IPv4([0, 0, 0, 0]), 8)],
		broadcast: [new Network(new IPv4([255, 255, 255, 255]), 32)],
		multicast: [new Network(new IPv4([224, 0, 0, 0]), 4)],
		linkLocal: [new Network(new IPv4([169, 254, 0, 0]), 16)],
		loopback: [new Network(new IPv4([127, 0, 0, 0]), 8)],
		carrierGradeNat: [new Network(new IPv4([100, 64, 0, 0]), 10)],
		private: [
			new Network(new IPv4([10, 0, 0, 0]), 8),
			new Network(new IPv4([172, 16, 0, 0]), 12),
			new Network(new IPv4([192, 168, 0, 0]), 16),
		],
		reserved: [
			new Network(new IPv4([192, 0, 0, 0]), 24),
			new Network(new IPv4([192, 0, 2, 0]), 24),
			new Network(new IPv4([192, 88, 99, 0]), 24),
			new Network(new IPv4([198, 51, 100, 0]), 24),
			new Network(new IPv4([203, 0, 113, 0]), 24),
			new Network(new IPv4([240, 0, 0, 0]), 4),
		]
	};
	//! parser
	private static _parseData(string: string) {
		function parseIntAuto(part: string) {
			if (part.substr(0, 1) === '0'
				&& part.substr(1, 1).toLowerCase() !== 'x') {
				return parseInt(part, 8);
			} else {
				return parseInt(part);
			}
		}
		let match = string.match(ipv4Regexes.fourOctet);
		if (match) {
			const ref = match.slice(1, 6);
			const parts = Array() as IPv4Bytes;
			for (let i = 0; i < ref.length; ++i) {
				const part = ref[i];
				parts.push(parseIntAuto(part));
			}
			return parts;
		}
		match = string.match(ipv4Regexes.longValue);
		if (match) {
			const value = parseIntAuto(match[1]);
			if (value > 0xFFFFFFFF || value < 0) {
				return 'ipaddr: address outside defined range';
			}
			// chrome parses only starting with с 1.0.0.0
			if (value < 0x01000000) {
				return 'ipaddr: invalid IPv4 string';
			}
			const parts = Array(4) as IPv4Bytes;
			for (let idx = 0; idx < 4; ++idx) {
				parts[3 - idx] = (value >> (idx * 8)) & 0xFF;
			}
			return parts;
		}
		return 'ipaddr: invalid IPv4 string';
	}
	static throwsParseData(string: string): IPv4Bytes {
		const ret = IPv4._parseData(string);
		if (typeof ret === 'string') { throw new Error(ret); }
		return ret;
	}
	static parseData(string: string): IPv4Bytes | undefined {
		const ret = IPv4._parseData(string);
		if (typeof ret === 'string') { return undefined; }
		return ret;
	}
	//! parse
	static throwsParse(addr: string): IPv4 {
		const bytes = this.throwsParseData(addr);
		if (typeof bytes === 'undefined') {
			throw new Error('ipaddr: string is not formatted like IPv4 address');
		}
		return this.throwsConstruct(bytes);
	};
	static parse(addr: string): IPv4 | undefined {
		const bytes = this.parseData(addr);
		if (typeof bytes === 'undefined') { return undefined; }
		return new this(bytes);
	};
	//! isIPv4
	static isIPv4(addr: string): boolean {
		return typeof this.parseData(addr) !== 'undefined';
	}
	//! isValid
	static isValid(string: string): boolean {
		const bytes = this.parseData(string);
		if (typeof bytes === 'undefined') { return false; }
		return this.check(bytes);
	}
	static isValidFourPartDecimal(addr: string): boolean {
		return (IPv4.isValid(addr) && ipv4Regexes.fourByte.test(addr));
	}

	//! check
	private static throwsCheck(bytes: IPv4Bytes | number[]) {
		if (bytes.length !== 4) {
			throw new Error('ipaddr: ipv4 octet count should be 4');
		}
		for (let i = 0; i < 4; ++i) {
			const byte = bytes[i];
			if (!(0 <= byte && byte <= 255)) {
				throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
			}
		}
	}
	private static check(bytes: IPv4Bytes | number[]): boolean {
		if (bytes.length !== 4) {
			return false;
		}
		for (let i = 0; i < 4; ++i) {
			const byte = bytes[i];
			if (!(0 <= byte && byte <= 255)) {
				return false;
			}
		}
		return true;
	}
	//! constructor
	bytes: IPv4Bytes;
	constructor(bytes: IPv4Bytes | number[]) {
		this.bytes = bytes as IPv4Bytes;
	}
	/**
	 * Creates IPv4 instance. Throws errors.
	 * @param bytes - 4 octets (**doesn't copy data**)
	 */
	static throwsConstruct(bytes: IPv4Bytes | number[]): IPv4 {
		this.throwsCheck(bytes);
		return new this(bytes);
	}
	/**
	 * Creates IPv4 instance. Returns `undefined` on error.
	 * @param bytes - 4 octets (**doesn't copy data**)
	 */
	static construct(bytes: IPv4Bytes | number[]): IPv4 | undefined {
		if (!this.check(bytes)) { return undefined; }
		return new this(bytes);
	}

	kind() { return 'ipv4' as const; }
	//! containedBy
	throwsContainedBy(arg: IPvNetworkData | Network): boolean {
		// if (addr.kind() !== 'ipv4') {
		// 	throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
		// }
		if (arg.constructor === Array) {
			return throwsMatchCIDR(
				this.bytes,
				(arg as IPvNetworkData)[0].bytes,
				(arg as IPvNetworkData)[1]);
		}
		return (arg as Network).throwsContains(this);
	}
	containedBy(arg: IPvNetworkData | Network): boolean {
		if (arg.constructor === Array) {
			return matchCIDRBoolean(
				this.bytes,
				(arg as IPvNetworkData)[0].bytes,
				(arg as IPvNetworkData)[1]);
		}
		return (arg as Network).contains(this);
	}
	range(): IPv4Range {
		return networkMatch(this, IPv4.SpecialRanges);
	}
	//! toIPv4MappedAddress
	toIPv4MappedAddress() {
		return new IPv6([
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0xFF, 0xFF,
			this.bytes[0] << 8, this.bytes[1],
			this.bytes[2] << 8, this.bytes[3]
		]);
	}
	//! prefixLengthFromNetworkMask
	/**
	 * Consider this as network, and get netmask length
	 */
	throwsPrefixLengthFromNetworkMask(): number {
		return throwsFromNetworkMask(this.bytes);
	}
	prefixLengthFromNetworkMask(): number | undefined {
		return fromNetworkMask(this.bytes);
	}
	toByteArray() {
		return this.bytes.slice() as IPv4Bytes;
	}
	toNormalizedString() {
		return this.toString();
	}
	toString() {
		return this.bytes.join('.');
	}
};


const ipv6Part = "[0-9a-f]{1,4}";
const ipv6Colon = "(?:" + ipv6Part + "::?)+";
const zoneIndex = "%[0-9a-z]{1,}";
const ipv6Regexes = {
	zoneIndex: new RegExp(zoneIndex, 'i'),
	native: new RegExp("^(::)?(" + ipv6Colon + ")?(" + ipv6Part + ")?(::)?(" + zoneIndex + ")?$", 'i'),
	transitional: new RegExp(
		("^((?:" + ipv6Colon + ")|(?:::)(?:" + ipv6Colon + ")?)") +
		"(" + ipv4Total + ")" +
		("(" + zoneIndex + ")?$"), 'i'),
};
type IPv6Bytes = [
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
];
type IPv6Parts = [
	number, number, number, number,
	number, number, number, number,
];
interface IPv6ParseData {
	parts: IPv6Parts;
	zoneId: string | undefined;
};
/**
 * @param string - `(::)?([0-ffff]::?)+[0-ffff](::)?%zone`
 * @param partsCount - how many parts IP must have (IPv6 transitional IPv4 — 6, IPv6 — 8)
 */
function expandIPv6(string: string, partsCount: number) {
	if (string.indexOf('::') !== string.lastIndexOf('::')) {
		return 'ipaddr: invalid IPv6 string';
	}
	let zoneId = (string.match(ipv6Regexes['zoneIndex']) || [undefined])[0];
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
	if (string.substr(-2, 2) === '::') {
		--colonCount;
	}
	if (colonCount > partsCount) {
		return 'ipaddr: invalid amount of IPv6 parts';
	}
	const replacementCount = partsCount - colonCount;
	const replacement = ':' + ('0:'.repeat(replacementCount));
	string = string.replace('::', replacement);
	if (string.substr(0, 1) === ':') {
		string = string.slice(1);
	}
	if (string.substr(-1, 1) === ':') {
		string = string.slice(0, -1);
	}

	const ref = string.split(':');
	const parts = Array<number>(8) as IPv6Parts;
	for (let idx = 0; idx < ref.length; idx++) {
		const part = ref[idx];
		parts[idx] = parseInt(part, 16);
	}

	return {
		parts,
		zoneId,
	} as IPv6ParseData;
}
export class IPv6 implements IPcommon {
	static kind = 'ipv6' as const;
	static bytes = 16 as const;
	static SpecialRanges = {
		unspecified: [new Network(new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128)],
		linkLocal: [new Network(new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10)],
		multicast: [new Network(new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8)],
		loopback: [new Network(new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128)],
		uniqueLocal: [new Network(new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7)],
		ipv4Mapped: [new Network(new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96)],
		rfc6145: [new Network(new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96)],
		rfc6052: [new Network(new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96)],
		'6to4': [new Network(new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16)],
		teredo: [new Network(new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32)],
		reserved: [new Network(new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32)],
	};
	// TODO broadcastAddressFromCIDR(addr: string): IPv6
	// TODO networkMaskFromPrefixLength(prefix: number): IPv6
	//! parser
	private static _parseData(string: string) {
		if (ipv6Regexes.native.test(string)) {
			return expandIPv6(string, 8);
		}

		const match = string.match(ipv6Regexes.transitional);
		if (!match) { return 'ipaddr: invalid IPv6 string'; }

		const zoneId = match[7] || '';
		const addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
		if (typeof addr === 'string') { return addr; }

		const octets = IPv4.throwsParseData(match[2]);
		if (!octets) { return 'ipaddr: invalid IPv4 string (IPv6 transitional IPv4)'; }

		addr.parts[6] = (octets[0] << 8) | octets[1];
		addr.parts[7] = (octets[2] << 8) | octets[3];
		return addr;
	}
	static throwsParseData(string: string): IPv6ParseData {
		const ret = this._parseData(string);
		if (typeof ret === 'string') { throw new Error(ret); }
		return ret;
	}
	static parseData(string: string): IPv6ParseData | undefined {
		const ret = this._parseData(string);
		if (typeof ret === 'string') { return undefined; }
		return ret;
	}
	//! parse
	static throwsParse(string: string): IPv6 {
		const addr = this.throwsParseData(string);
		return this.throwsConstruct(addr.parts, addr.zoneId);
	}
	static parse(string: string): IPv6 | undefined {
		const addr = this.parseData(string);
		if (typeof addr === 'undefined') { return undefined; }
		return new this(addr.parts, addr.zoneId);
	}
	static isIPv6(addr: string): boolean {
		return typeof this.parseData(addr) !== 'undefined';
	}
	static isValid(string: string): boolean {
		const data = this.parseData(string);
		if (typeof data === 'undefined') { return false; }
		if (!this.check(data.parts, data.zoneId)) { return false; }
		return true;
	}

	//! check
	static throwsCheck(bytes: IPv6Bytes | number[], zoneId?: string) {
		switch (bytes.length) {
			case 8:
				for (let i = 0; i < bytes.length; ++i) {
					const part = bytes[i];
					if (!(0 <= part && part <= 0xFFFF)) {
						throw new Error('ipaddr: IPv6 parts should fit in 16 bits');
					}
				}
				break;
			case 16:
				for (let i = 0; i < bytes.length; ++i) {
					const byte = bytes[i];
					if (!(0 <= byte && byte <= 0xFF)) {
						throw new Error('ipaddr: IPv6 byte should fit in 8 bits');
					}
				}
				break;
			default:
				throw new Error('ipaddr: IPv6 part count should be 8 or 16');
		}
		if (typeof zoneId !== 'string' && typeof zoneId !== 'undefined') {
			throw new Error('ipaddr: invalid zoneId argument');
		}
	}
	static check(bytes: IPv6Bytes | number[], zoneId?: string): boolean {
		switch (bytes.length) {
			case 8:
				for (let i = 0; i < bytes.length; ++i) {
					const part = bytes[i];
					if (!(0 <= part && part <= 0xFFFF)) {
						return false;
					}
				}
				break;
			case 16:
				for (let i = 0; i < bytes.length; ++i) {
					const byte = bytes[i];
					if (!(0 <= byte && byte <= 0xFF)) {
						return false;
					}
				}
				break;
			default:
				return false;
		}
		if (typeof zoneId !== 'string' && typeof zoneId !== 'undefined') {
			return false;
		}
		return true;
	}
	//! constructor
	bytes: IPv6Bytes;
	zoneId: string | undefined;
	constructor(bytes: IPv6Bytes | number[], zoneId?: string) {
		switch (bytes.length) {
			case 8:
				for (let i = 7; i >= 0; --i) {
					const part = bytes[i];
					bytes[i * 2] = part >> 8;
					bytes[i * 2 + 1] = part & 0xFF;
				}
				break;
		}
		this.bytes = bytes as IPv6Bytes;
		this.zoneId = zoneId;
	}
	/**
	 * Creates IPv6 instance. Throws errors.
	 * @param {number[]} bytes - bytes or parts (**modifies input**).
	 * @param {string} zoneId
	 */
	static throwsConstruct(bytes: IPv6Bytes | IPv6Parts | number[], zoneId?: string): IPv6 {
		this.throwsCheck(bytes, zoneId);
		return new this(bytes, zoneId);
	}
	/**
	 * Creates IPv6 instance. Returns `undefined` on error.
	 * @param {number[]} bytes - bytes or parts (**modifies input**).
	 * @param {string} zoneId
	 */
	static construct(bytes: IPv6Bytes | IPv6Parts | number[], zoneId?: string): IPv6 | undefined {
		if (!this.check(bytes, zoneId)) { return undefined; }
		return new this(bytes, zoneId);
	}

	kind() { return 'ipv6' as const; }

	private _parts?: IPv6Parts;
	parts() {
		if (this._parts) { return this._parts; }
		this._parts = Array() as IPv6Parts;
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

	//! containedBy
	throwsContainedBy(arg: IPvNetworkData | Network): boolean {
		// if (addr.kind() !== 'ipv6') {
		// 	throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one');
		// }
		if (arg.constructor === Array) {
			return throwsMatchCIDR(this.bytes, (arg as IPvNetworkData)[0].bytes, (arg as IPvNetworkData)[1]);
		}
		return (arg as Network).throwsContains(this);
	}
	containedBy(arg: IPvNetworkData | Network): boolean {
		if (arg.constructor === Array) {
			return matchCIDRBoolean(this.bytes, (arg as IPvNetworkData)[0].bytes, (arg as IPvNetworkData)[1]);
		}
		return (arg as Network).contains(this);
	}
	range(): IPv6Range {
		return networkMatch(this, IPv6.SpecialRanges);
	}
	isIPv4MappedAddress(): boolean {
		return this.range() === 'ipv4Mapped';
	}
	//! toIPv4Address
	throwsToIPv4Address(): IPv4 {
		if (!this.isIPv4MappedAddress()) {
			throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
		}
		return new IPv4(this.bytes.slice(-4));
	}
	toIPv4Address(): IPv4 | undefined {
		if (!this.isIPv4MappedAddress()) {
			return undefined;
		}
		return new IPv4(this.bytes.slice(-4));
	}
	//! prefixLengthFromNetworkMask
	throwsPrefixLengthFromNetworkMask(): number {
		return throwsFromNetworkMask(this.bytes);
	}
	prefixLengthFromNetworkMask(): number | undefined {
		return fromNetworkMask(this.bytes);
	}
	toByteArray() {
		return this.bytes.slice() as IPv6Bytes;
	}
	toNormalizedString() {
		const isIPv4 = this.isIPv4MappedAddress();
		const results = Array<string>(isIPv4 ? 6 : 8);
		const parts = this.parts();
		for (let i = results.length - 1; i >= 0; --i) {
			const part = parts[i];
			results[i] = part.toString(16);
		}
		let addr = results.join(':');
		if (isIPv4) {
			addr += ':' + IPv4.prototype.toString.call({ bytes: this.bytes.slice(-4) });
		}
		return `${addr}${this.zoneId ? `%${this.zoneId}` : ``}`;
	}
	toFixedLengthString() {
		const isIPv4 = this.isIPv4MappedAddress();
		const results = Array<string>(isIPv4 ? 6 : 8);
		const parts = this.parts();
		for (let i = results.length - 1; i >= 0; --i) {
			const part = parts[i];
			results[i] = part.toString(16).padStart(4, '0');
		}
		let addr = results.join(':');
		if (isIPv4) {
			addr += ':' + IPv4.prototype.toString.call({ bytes: this.bytes.slice(-4) });
		}
		return `${addr}${this.zoneId ? `%${this.zoneId}` : ``}`;
	}
	toString() {
		return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, '::');
	}
};


export function isValid(string: string) {
	return (IPv4.isValid(string) || IPv6.isValid(string));
}
//! parse
export function throwsParse(string: string): IPvTypes {
	const ret = parse(string);
	if (typeof ret !== 'undefined') { return ret; }
	throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
}
export function parse(string: string): IPvTypes | undefined {
	let ret: IPvTypes | undefined = IPv4.parse(string);
	if (typeof ret !== 'undefined') { return ret; }
	return IPv6.parse(string);
}

//! parseCIDR
function _parseCIDR(string: string) {
	const match = string.match(/^(.+)\/(\d+)$/);
	if (!match) {
		return 'ipaddr: string is not formatted like CIDR range';
	}
	return [
		throwsParse(match[1]), // addr
		parseInt(match[2]) // maskLength
	] as const;
}
/**
 * @alias throwsParseNetwork
 * @param string `IPvFormat / cidrBits`
 */
export function throwsParseCIDR(string: string): Network {
	const ret = _parseCIDR(string);
	if (typeof ret === 'string') { throw new Error(ret); }
	return Network.throwsConstruct(ret[0], ret[1]);
}
/**
 * @alias parseNetwork
 * @param string `IPvFormat / cidrBits`
 */
export function parseCIDR(string: string): Network | undefined {
	const ret = _parseCIDR(string);
	if (typeof ret === 'string') { return undefined; }
	return Network.construct(ret[0], ret[1]);
}
/**
 * @alias throwsParseCIDR
 * @param string `IPvFormat / cidrBits`
 */
export const throwsParseNetwork = throwsParseCIDR;
/**
 * @alias parseCIDR
 * @param string `IPvFormat / cidrBits`
 */
export const parseNetwork = parseCIDR;

//! parseIPv4
function _parseIPv4(string: string) {
	let addr: IPvTypes | undefined = IPv4.parse(string);
	if (typeof addr !== 'undefined') { return addr; }
	addr = IPv6.parse(string);
	if (typeof addr === 'undefined') { return 'ipaddr: string ins\'t IPv4 nor IPv6 transitional address'; }
	if (!addr.isIPv4MappedAddress()) {
		return 'ipaddr: expected IPv4-mapped IPv6 address';
	}
	return addr.throwsToIPv4Address();
}
export function throwsParseIPv4(string: string): IPv4 {
	const ret = _parseIPv4(string);
	if (typeof ret === 'string') { throw new Error(ret); }
	return ret;
}
export function parseIPv4(string: string): IPv4 | undefined {
	const ret = _parseIPv4(string);
	if (typeof ret === 'string') { return undefined; }
	return ret;
}

//! autoConstructor
function _autoConstructor(bytes: number[]) {
	switch (bytes.length) {
		case 4:
			return new IPv4(bytes);
		case 16:
			return new IPv6(bytes);
	}
	return 'ipaddr: invalid bytes length for auto-constructor';
}
export function throwsAutoConstructor(bytes: number[]): IPvTypes {
	const ret = _autoConstructor(bytes);
	if (typeof ret === 'string') { throw new Error(ret); }
	return ret;
}
export function autoConstructor(bytes: number[]): IPvTypes | undefined {
	const ret = _autoConstructor(bytes);
	if (typeof ret === 'string') { return undefined; }
	return ret;
}

//! fromByteArray
export function throwsFromByteArray(bytes: IPvBytes | number[]): IPvTypes {
	const ret = autoConstructor(bytes);
	if (typeof ret !== 'undefined') { return ret; }
	throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
}
export function fromByteArray(bytes: IPvBytes | number[]): IPvTypes | undefined {
	return autoConstructor(bytes);
}

//! network
/**
 * @alias throwsSubnet
 * @param bytes - byte array of 4 or 16 length
 * @param prefix - netmask length
 */
export function throwsNetwork(bytes: IPvBytes | number[], prefix: number): Network {
	return Network.throwsConstruct(
		throwsAutoConstructor(bytes),
		prefix
	);
}
/**
 * @alias subnet
 * @param bytes - byte array of 4 or 16 length
 * @param prefix - netmask length
 */
export function network(bytes: IPvBytes | number[], prefix: number): Network | undefined {
	const addr = autoConstructor(bytes);
	if (typeof addr === 'undefined') { return undefined; }
	return Network.construct(
		addr,
		prefix
	);
}
/**
 * @alias throwsNetwork
 * @param bytes - byte array of 4 or 16 length
 * @param prefix - netmask length
 */
export const throwsSubnet = throwsNetwork;
/**
 * @alias network
 * @param bytes - byte array of 4 or 16 length
 * @param prefix - netmask length
 */
export const subnet = network;

//! toByteArray
export function throwsToByteArray(string: string): IPvBytes {
	return throwsParse(string).bytes;
}
export function toByteArray(string: string): IPvBytes | undefined {
	const addr = parse(string);
	if (typeof addr === 'undefined') { return undefined; }
	return addr.bytes;
}

//! toString
export function throwsToString(bytes: IPvBytes | number[]): string {
	const ret = toString(bytes);
	if (typeof ret !== 'undefined') { return ret; }
	throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
}
export function toString(bytes: IPvBytes | number[]): string | undefined {
	switch (bytes.length) {
		case 4:
			return new IPv4(bytes).toString();
		case 16:
			return new IPv6(bytes).toString();
	}
	return undefined;
}
