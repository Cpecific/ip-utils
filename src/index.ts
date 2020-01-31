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
export type IPvBytesLength = IPv4Bytes["length"] | IPv6Bytes["length"];
// type IPvParts = IPv4Parts | IPv6Parts;
// type IPvPartsLength = IPv4Parts["length"] | IPv6Parts["length"];
// type IPvNames = 'ipv4' | 'ipv6';

function add(bytes: IPvBytes, value: number) {
	let temp = 0;
	for (let i = bytes.length - 1; i >= 0; --i) {
		bytes[i] += value + temp;
		if (bytes[i] > 0xFF) {
			bytes[i] = 0;
			temp = 1;
		}
		else if (bytes[i] < 0) {
			bytes[i] = 0xFF;
			temp = -1;
		}
		else { temp = 0; }
	}
	// if (temp !== 0) { return null; }
	return bytes;
}

export function autoConstructor(bytes: number[]) {
	if (bytes.length === 4) {
		return new IPv4(bytes);
	}
	else if (bytes.length === 16) {
		return new IPv6(bytes);
	}
	throw new Error('ipaddr: invalid bytes length for auto-constructor')
}
export function subnetMatch<T extends string, D extends string | undefined = undefined>(
	addr: IPvTypes,
	rangeList: RangeList<T>,
	defaultName?: D
) {
	const kind = addr.kind();
	for (const rangeName in rangeList) {
		const rangeSubnets = rangeList[rangeName];
		for (const subnet of rangeSubnets) {
			if (kind === subnet.addr.kind()) {
				if (subnet.contains(addr)) {
					return rangeName as T;
				}
			}
		}
	}
	return typeof defaultName === 'undefined' ?
		'unicast' as const :
		defaultName as ([D] extends [undefined] ? never : D);
}
/**
* subnetMaskFromPrefixLength
*/
export function fromPrefixLength(
	prefix: number,
	bytesLength: IPvBytesLength
) {
	if (prefix < 0 || prefix > (bytesLength * 8)) {
		throw new Error(`ipaddr: invalid prefix length for ${bytesLength} bytes length`);
	}
	const bytes = Array<number>(bytesLength).fill(0);
	const filledOctetCount = Math.floor(prefix / 8);
	for (let j = 0; j < filledOctetCount; j++) {
		bytes[j] = 0xFF;
	}
	if (filledOctetCount < bytesLength) {
		bytes[filledOctetCount] = Math.pow(2, prefix % 8) - (1 << 8) - (prefix % 8);
	}
	return bytes;
}
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
/**
* prefixLengthFromSubnetMask
*/
function fromSubnetMask(bytes: IPvBytes): number | null {
	let cidr = 0;
	let stop = false;
	for (const byte of bytes) {
		if (!(byte in bitTable)) {
			// invalid subnet ip
			return null;
		}
		const bits = bitTable[byte as keyof typeof bitTable];
		if (stop) {
			if (bits !== 0) {
				// invalid subnet ip (в предыдущих байтах был !== 0xFF, т.е. текущий все последующие должны быть === 0)
				return null;
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
* Находятся ли ip адреса в одной подсети
*/
export function matchCIDR(first: IPvBytes, second: IPvBytes, cidrBits: number, partSize: number) {
	if (first.length !== second.length) {
		throw new Error('ipaddr: cannot match CIDR for objects with different lengths');
	}
	for (let idx = 0; cidrBits > 0; ++idx) {
		let shift = partSize - cidrBits;
		if (shift < 0 ?
			first[idx] !== second[idx] :
			(first[idx] >> shift) !== (second[idx] >> shift)
		) {
			return false;
		}
		cidrBits -= partSize;
	}
	return true;
}
export class Network {
	private maskBytes?: IPvBytes;
	constructor(public addr: IPvTypes, public cidrBits: number) {
		if (cidrBits < 0 || cidrBits > addr.bytes.length * 8) {
			throw new Error('ipaddr: CIDR mask length is invalid');
		}
	}
	mask() {
		if (!this.maskBytes) {
			this.maskBytes = fromPrefixLength(this.cidrBits, this.addr.bytes.length) as IPvBytes;
		}
		return this.maskBytes;
	}
	get maskLength() { return this.cidrBits; }
	get cidrZeros() { return (this.addr.bytes.length * 8) - this.cidrBits; }
	get numberOfAddresses() { return Math.pow(2, this.cidrZeros); }
	networkAddressBytes(): IPvBytes {
		const bytes = this.addr.toByteArray();
		const mask = this.mask();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] &= mask[i];
		}
		return bytes;
	}
	broadcastAddressBytes(): IPvBytes {
		const bytes = this.addr.toByteArray();
		const mask = this.mask();
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] |= (mask[i] ^ 255);
		}
		return bytes;
	}
	firstHostBytes(): IPvBytes {
		const bytes = this.networkAddressBytes();
		if (this.cidrZeros <= 1) { return bytes; }
		return add(bytes, 1);
	}
	lastHostBytes(): IPvBytes {
		const bytes = this.networkAddressBytes();
		const numberOfAddresses = this.numberOfAddresses;
		return add(
			bytes,
			numberOfAddresses + (numberOfAddresses <= 2 ? -1 : -2)
		);
	}
	networkAddress(): IPvTypes {
		try {
			const bytes = this.networkAddressBytes();
			return autoConstructor(bytes);
		} catch (e) {
			throw new Error('ipaddr: the address does not have IPv4 CIDR format');
		}
	}
	broadcastAddress(): IPvTypes {
		try {
			// ip.fromLong(networkAddress + numberOfAddresses - 1)
			const bytes = this.broadcastAddressBytes();
			return autoConstructor(bytes);
		} catch (e) {
			throw new Error('ipaddr: the address does not have IPv4 CIDR format');
		}
	}
	contains(addr: IPvTypes | IPvBytes) {
		if (addr instanceof Array) {
			return matchCIDR(addr, this.addr.bytes, this.cidrBits, 8);
		}
		return matchCIDR(addr.bytes, this.addr.bytes, this.cidrBits, 8);
	}
	toString() {
		return this.addr.toString() + '/' + this.cidrBits;
	}
}


export function isIPv4(addr: IPvTypes): addr is IPv4 { return (addr instanceof IPv4); }
export function isIPv6(addr: IPvTypes): addr is IPv6 { return (addr instanceof IPv6); }

interface IPcommon {
	bytes: number[];
	prefixLengthFromSubnetMask(): number | null;
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
	}
	static parser(string: string) {
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
			for (const part of ref) {
				parts.push(parseIntAuto(part));
			}
			return parts;
		}
		match = string.match(ipv4Regexes.longValue);
		if (match) {
			const value = parseIntAuto(match[1]);
			if (value > 0xFFFFFFFF || value < 0) {
				throw new Error('ipaddr: address outside defined range');
			}
			// chrome только парсит, начиная с 1.0.0.0
			if (value < 0x01000000) {
				throw new Error('ipaddr: invalid ip string');
			}
			const parts = Array() as IPv4Bytes;
			for (let shift = 0; shift <= 24; shift += 8) {
				parts.push((value >> shift) & 0xFF);
			}
			return parts.reverse() as IPv4Bytes;
		}
		return null;
	};
	static isIPv4(addr: string) {
		return this.parser(addr) !== null;
	}
	static isValid(string: string) {
		try {
			this.parse(string);
			return true;
		} catch (e) {
			return false;
		}
	}
	static isValidFourPartDecimal(addr: string) {
		return (IPv4.isValid(addr) && ipv4Regexes.fourByte.test(addr));
	}
	static parse(addr: string): IPv4 {
		const parts = this.parser(addr);
		if (parts === null) {
			throw new Error('ipaddr: string is not formatted like ip address');
		}
		return new this(parts);
	};

	bytes: IPv4Bytes;
	constructor(bytes: IPv4Bytes | number[]) {
		if (bytes.length !== 4) {
			throw new Error('ipaddr: ipv4 octet count should be 4');
		}
		for (const byte of bytes) {
			if (!(0 <= byte && byte <= 255)) {
				throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
			}
		}
		this.bytes = bytes as IPv4Bytes;
	}
	kind() {
		return 'ipv4' as const;
	}
	containedBy(arg: [IPvTypes, number] | Network) {
		if (arg instanceof Network) {
			return arg.contains(this);
		}
		// if (addr.kind() !== 'ipv4') {
		// 	throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
		// }
		// return matchCIDR(this.parts, addr.parts, 8, bits);
		// [addr, bits] = arg
		return matchCIDR(this.bytes, arg[0].bytes, arg[1], 8);
	}
	range(): IPv4Range {
		return subnetMatch(this, IPv4.SpecialRanges);
	}
	toIPv4MappedAddress() {
		return new IPv6([
			0, 0, 0, 0, 0,
			0xFFFF,
			(this.bytes[0] << 8) | this.bytes[1],
			(this.bytes[2] << 8) | this.bytes[3]
		]);
		// return IPv6.parse('::ffff:' + (this.toString()));
	}
	prefixLengthFromSubnetMask() {
		return fromSubnetMask(this.bytes);
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
]
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
	// TODO subnetMaskFromPrefixLength(prefix: number): IPv6
	static parser(string: string) {
		/**
		 * assert @param string is trim()
		 * @param string - `(::)?([0-ffff]::?)+[0-ffff](::)?%zone`
		 * @param partsCount - сколько частей (блоков) IP должно быть (для IPv6 transitional — 6, для обычного IPv6 — 8)
		 */
		function expandIPv6(string: string, partsCount: number) {
			if (string.indexOf('::') !== string.lastIndexOf('::')) {
				return null;
			}
			let zoneId = (string.match(ipv6Regexes['zoneIndex']) || [undefined])[0];
			if (zoneId) {
				zoneId = zoneId.substr(1);
				string = string.replace(/%.+$/, '');
			}
			// 2001:db8:85a3:0:0:8a2e:370:7334		7	7
			// 2001:db8:85a3::8a2e:370:7334			6	6
			// 0:0:0:0:0:ffff:c000:0280				7	7
			// ::ffff:c000:0280						4	3
			// 0:0:0:0:0:ffff:192.0.2.128			5	5
			// ::ffff:192.0.2.128					2	1
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
				return null;
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
			const parts = Array<number>() as IPv6Parts;
			for (let k = 0, len = ref.length; k < len; k++) {
				const part = ref[k];
				parts.push(parseInt(part, 16));
			}

			return {
				parts,
				zoneId,
			};
		}

		if (ipv6Regexes.native.test(string)) {
			return expandIPv6(string, 8);
		}

		const match = string.match(ipv6Regexes.transitional);
		if (!match) { return null; }

		const zoneId = match[7] || '';
		const addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
		if (!addr) { return null; }

		const octets = IPv4.parser(match[2]);
		if (octets) {
			addr.parts.push((octets[0] << 8) | octets[1]);
			addr.parts.push((octets[2] << 8) | octets[3]);
		}
		return addr;
	}
	static isIPv6(addr: string): boolean {
		return this.parser(addr) !== null;
	}
	static isValid(string: string): boolean {
		try {
			this.parse(string);
			return true;
		} catch (e) {
			return false;
		}
	};
	static parse(string: string): IPv6 {
		const addr = this.parser(string);
		if (!addr) {
			throw new Error('ipaddr: string is not formatted like ip address');
		}
		return new this(addr.parts, addr.zoneId);
	};

	bytes: IPv6Bytes;
	private parts?: IPv6Parts;
	zoneId: string | undefined;
	constructor(parts: IPv6Bytes | number[], zoneId?: string) {
		if (parts.length === 16) {
			this.bytes = parts as IPv6Bytes;
			// this.parts = Array<number>(8) as IPv6Parts;
			// for (let i = 0; i <= 14; i += 2) {
			// 	this.parts.push((parts[i] << 8) | parts[i + 1]);
			// }
		}
		else if (parts.length === 8) {
			const bytes = Array<number>() as IPv6Bytes;
			for (const part of parts) {
				bytes.push(part >> 8);
				bytes.push(part & 0xFF);
			}
			this.bytes = bytes;
			// this.parts = parts as IPv6Parts;
		}
		else {
			throw new Error('ipaddr: ipv6 part count should be 8 or 16');
		}
		for (const byte of this.bytes) {
			if (!(0 <= byte && byte <= 0xFF)) {
				throw new Error('ipaddr: ipv6 byte should fit in 8 bits');
			}
		}
		this.zoneId = zoneId;
	}

	kind() {
		return 'ipv6' as const;
	}
	getParts() {
		if (this.parts) { return this.parts; }
		const parts = Array<number>(8) as IPv6Parts;
		for (let i = 0; i <= 14; i += 2) {
			parts.push((this.bytes[i] << 8) | this.bytes[i + 1]);
		}
		this.parts = parts;
		return parts;
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

	containedBy(arg: [IPvTypes, number] | Network) {
		if (arg instanceof Network) {
			return arg.contains(this);
		}
		// if (addr.kind() !== 'ipv6') {
		// 	throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one');
		// }
		// return matchCIDR(this.parts, addr.parts, 16, bits);
		// [addr, bits] = arg
		return matchCIDR(this.bytes, arg[0].bytes, arg[1], 8);
	}
	range(): IPv6Range {
		return subnetMatch(this, IPv6.SpecialRanges);
	}
	isIPv4MappedAddress(): boolean {
		return this.range() === 'ipv4Mapped';
	}
	toIPv4Address(): IPv4 {
		if (!this.isIPv4MappedAddress()) {
			throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
		}
		const [high, low] = this.getParts().slice(-2);
		return new IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
	}
	prefixLengthFromSubnetMask() {
		return fromSubnetMask(this.bytes);
	}
	toByteArray() {
		// const bytes: number[] = [];
		// for (const part of this.parts) {
		// 	bytes.push(part >> 8);
		// 	bytes.push(part & 0xff);
		// }
		// return bytes;
		return this.bytes.slice() as IPv6Bytes;
	}
	toNormalizedString() {
		const results: string[] = [];
		for (const part of this.getParts()) {
			results.push(part.toString(16));
		}
		const addr = results.join(':');
		return `${addr}${this.zoneId ? `%${this.zoneId}` : ``}`;
	}
	toFixedLengthString() {
		const results: string[] = [];
		for (const part of this.getParts()) {
			results.push(part.toString(16).padStart(4, '0'));
		}
		const addr = results.join(':');
		return `${addr}${this.zoneId ? `%${this.zoneId}` : ``}`;
	}
	toString() {
		return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, '::');
	}
};


export function isValid(string: string) {
	return (IPv4.isValid(string) || IPv6.isValid(string));
}
export function parse(string: string): IPvTypes {
	try {
		return IPv4.parse(string);
	}
	catch (e) {
		try {
			return IPv6.parse(string);
		} catch (e) {
			throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
		}
	}
}
/**
* @alias parseSubnet
* @param string `IPvFormat / cidrBits`
*/
export function parseCIDR(string: string): Network {
	const match = string.match(/^(.+)\/(\d+)$/);
	if (!match) {
		throw new Error('ipaddr: string is not formatted like CIDR range');
	}
	const addr = parse(match[1]);
	const maskLength = parseInt(match[2]);
	return new Network(addr, maskLength);
}
export const parseSubnet = parseCIDR;
export function parseIPv4(string: string): IPv4 {
	const addr = parse(string);
	if (isIPv6(addr)) {
		if (!addr.isIPv4MappedAddress()) {
			throw new Error('ipaddr: expected IPv4-mapped IPv6 address');
		}
		return addr.toIPv4Address();
	} else {
		return addr;
	}
}
export function fromByteArray(bytes: IPvBytes | number[]): IPvTypes {
	switch (bytes.length) {
		case 4:
			return new IPv4(bytes);
		case 16:
			return new IPv6(bytes);
	}
	throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
}
export function subnet(bytes: IPvBytes | number[], cidrBits: IPvBytesLength | number): Network {
	return new Network(
		autoConstructor(bytes),
		cidrBits
	);
}
export const network = subnet;
export function toByteArray(string: string): IPvBytes {
	return parse(string).bytes;
}
export function toString(bytes: IPvBytes | number[]): string {
	switch (bytes.length) {
		case 4:
			return IPv4.prototype.toString.call({ bytes });
		case 16:
			return IPv6.prototype.toString.call({ bytes, zoneId: undefined });
	}
	throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
}

const std = {
	parse,
	parseCIDR,
	parseIPv4,
	fromByteArray,
	subnet,
	toByteArray,
	toString,
};

export namespace safe {
	export function parse(string: string): IPvTypes | undefined {
		try {
			return std.parse(string);
		} catch (e) {
			return undefined;
		}
	}
	export function parseCIDR(string: string): Network | undefined {
		try {
			return std.parseCIDR(string);
		} catch (e) {
			return undefined;
		}
	}
	export const parseSubnet = parseCIDR;
	export function parseIPv4(string: string): IPv4 | undefined {
		try {
			return std.parseIPv4(string);
		} catch (e) {
			return undefined;
		}
	}
	export function fromByteArray(bytes: IPvBytes | number[]): IPvTypes | undefined {
		try {
			return std.fromByteArray(bytes);
		} catch (e) {
			return undefined;
		}
	}
	export function subnet(bytes: IPvBytes | number[], cidrBits: IPvBytesLength | number): Network | undefined {
		try {
			return std.subnet(bytes, cidrBits);
		} catch (e) {
			return undefined;
		}
	}
	export const network = subnet;
	export function toByteArray(string: string): IPvBytes | undefined {
		try {
			return std.toByteArray(string);
		} catch (e) {
			return undefined;
		}
	}
	export function toString(bytes: IPvBytes | number[]): string | undefined {
		try {
			return std.toString(bytes);
		} catch (e) {
			return undefined;
		}
	}
}