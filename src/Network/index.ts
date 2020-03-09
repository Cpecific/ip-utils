import type { IPvClass } from '../types';
import IpUtilsError, { Codes } from '../Error';
import fromByteArray from '../fromByteArray';
import fromPrefixLength, { throwsFromPrefixLength } from '../utils/fromPrefixLength';
import matchNetwork, { throwsMatchNetwork } from '../utils/matchNetwork';
import parse from '../parse';
import parseNetwork, { throwsParseNetwork } from '../parseNetwork';
import Network_check, { Network_throwsCheck } from './check';


// export {
// 	default as broadcastAddressBytes,
// 	Network_throwsBroadcastAddressBytes as throwsBroadcastAddressBytes,
// } from './broadcastAddressBytes';
// export {
// 	default as check,
// 	Network_throwsCheck as throwsCheck,
// } from './check';
// export {
// 	default as firstHostBytes,
// 	Network_throwsFirstHostBytes as throwsFirstHostBytes,
// } from './firstHostBytes';
// export {
// 	default as lastHostBytes,
// 	Network_throwsLastHostBytes as throwsLastHostBytes,
// } from './lastHostBytes';
// export {
// 	default as networkAddressBytes,
// 	Network_throwsNetworkAddressBytes as throwsNetworkAddressBytes,
// } from './networkAddressBytes';
// export {
// 	default as parseData,
// 	Network_throwsParseData as throwsParseData,
// } from './parseData';


export default class Network {
	addr: IPvClass;
	prefix: number;
	// !parseData
	/**
	 * Parses CIDR `string` and creates network data tuple [ `IP` instance, netmask length ].
	 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
	 * @returns {[IPvClass, number]} tuple [ `IP` instance, netmask length ].
	 * @example
	 * Network.throwsParseData('192.168.11.5/24')
	 * // => [ new IPv4([192, 168, 11, 5]), 24 ]
	 * Network.throwsParseData('::1%eth0/128')
	 * // => [ new IPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 128 ]
	 * Network.throwsParseData('192.168.11.5')
	 * // => throw new IpUtilsError(INVALID_CIDR_STRING)
	 * Network.throwsParseData('::ff::/24')
	 * // => throw new IpUtilsError(INVALID_IP_STRING)
	 * Network.throwsParseData('192.168.11.5/35')
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_CIDR_STRING
	 * @throws {IpUtilsError} INVALID_IP_STRING
	 * @throws {IpUtilsError} PREFIX_IS_NOT_A_NUMBER
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	static throwsParseData(string: string): [IPvClass, number] {
		const ret = this.parseData(string);
		if (typeof ret === 'number') {
			throw new IpUtilsError(ret);
		}
		return ret;
	}
	/**
	 * Parses CIDR `string` and creates network data tuple [ `IP` instance, netmask length ].
	 * @param {string} string cidr notation: ip address and netmask length are separated by slash (/) (ex. `192.168.11.5/24`).
	 * @returns {([IPvClass, number] | number)} tuple[ `IP` instance, netmask length ], or error code.
	 * @example
	 * Network.parseData('192.168.11.5/24')
	 * // => [ new IPv4([192, 168, 11, 5]), 24 ]
	 * Network.parseData('::1%eth0/128')
	 * // => [ new IPv6([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]), 128 ]
	 * Network.parseData('192.168.11.5')
	 * // => INVALID_CIDR_STRING
	 * Network.parseData('::ff::/24')
	 * // => INVALID_IP_STRING
	 * Network.parseData('192.168.11.5/35')
	 * // => INVALID_NETMASK_LENGTH
	 * @error INVALID_CIDR_STRING
	 * @error INVALID_IP_STRING
	 * @error PREFIX_IS_NOT_A_NUMBER
	 * @error INVALID_NETMASK_LENGTH
	 */
	static parseData(string: string) {
		const match = string.match(/^(.+)\/(\d+)$/);
		if (!match) {
			return Codes.INVALID_CIDR_STRING;
		}
		const IPv = parse(match[1]);
		if (IPv === null) {
			return Codes.INVALID_IP_STRING;
		}
		const prefix = parseInt(match[2], 10);
		if (typeof prefix !== 'number' || isNaN(prefix)) {
			return Codes.PREFIX_IS_NOT_A_NUMBER;
		}
		if (prefix > IPv.bytes.length * 8) {
			return Codes.INVALID_NETMASK_LENGTH;
		}
		return [IPv, prefix] as [IPvClass, number];
	}

	// !parse
	/**
	 * Creates `Network` instance for valid CIDR `string`.
	 * @param {string} string ip address: string.
	 * @returns {Network} `Network` instance.
	 * @example
	 * Network.throwsParse('192.168.11.5/24')
	 * // => Network
	 * Network.throwsParse('0xC00002EB/64')
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_CIDR_STRING
	 * @throws {IpUtilsError} INVALID_IP_STRING
	 * @throws {IpUtilsError} PREFIX_IS_NOT_A_NUMBER
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	static throwsParse = throwsParseNetwork;
	/**
	 * Creates `Network` instance for valid CIDR `string`.
	 * @param {string} string ip address: string.
	 * @returns {(Network | null)} `Network` instance, or `null` on error.
	 * @example
	 * Network.parse('192.168.11.5/24')
	 * // => IPv4
	 * Network.parse('0xC00002EB/64')
	 * // => null
	 * @error INVALID_CIDR_STRING
	 * @error INVALID_IP_STRING
	 * @error PREFIX_IS_NOT_A_NUMBER
	 * @error INVALID_NETMASK_LENGTH
	 */
	static parse = parseNetwork;

	// !check
	/**
	 * Checks if `addr` bytes length and netmask length are valid.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*).
	 * @param {number} prefix netmask length (*assumes integer*).
	 * @returns {boolean} `true` if `addr` bytes length and netmask length is valid.
	 * @example
	 * Network.throwsCheck([0, 0, 0, 0], 24)
	 * // => true
	 * Network.throwsCheck([0, 0], 24)
	 * // => throw new IpUtilsError(INVALID_BYTE_ARRAY_LENGTH)
	 * Network.throwsCheck([0, 0, 0, 0], 35)
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	static throwsCheck(addr: IPvClass | number[], prefix: number): boolean {
		return Network_throwsCheck(addr instanceof Array ? addr : addr.bytes, prefix);
	}
	/**
	 * Checks if `addr` bytes length and netmask length are valid.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*).
	 * @param {number} prefix netmask length (*assumes integer*).
	 * @returns {boolean} `true` if `addr` bytes length and netmask length is valid, else `false`.
	 * @example
	 * Network.check([0, 0, 0, 0], 24)
	 * // => true
	 * Network.check([0, 0], 24)
	 * // => false
	 * Network.check([0, 0, 0, 0], 35)
	 * // => false
	 * @error INVALID_BYTE_ARRAY_LENGTH
	 * @error INVALID_NETMASK_LENGTH
	 */
	static check(addr: IPvClass | number[], prefix: number): boolean {
		return Network_check(addr instanceof Array ? addr : addr.bytes, prefix);
	}

	// !constructor
	/**
	 * Wraps ip address with netmask prefix length.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*) (**unsafe assign**).
	 * @param {number} prefix netmask length (*assumes positive integer*).
	 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
	 */
	constructor(addr: IPvClass | number[], prefix: number) {
		if (addr instanceof Array) {
			addr = fromByteArray(addr) as IPvClass;
			if (addr === null) {
				throw new IpUtilsError(Codes.INVALID_BYTE_ARRAY_LENGTH);
			}
		}
		this.addr = addr;
		this.prefix = prefix;
	}
	/**
	 * Validates netmask length and creates `Network` instance.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*) (**unsafe assign**).
	 * @param {number} prefix netmask length (*assumes integer*).
	 * @returns {Network} `Network` instance.
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 * @throws {IpUtilsError} INVALID_BYTE_ARRAY_LENGTH
	 */
	static throwsConstruct(addr: IPvClass | number[], prefix: number): Network {
		this.throwsCheck(addr, prefix);
		return new Network(addr, prefix);
	}
	/**
	 * Validates netmask length and creates `Network` instance.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*) (**unsafe assign**).
	 * @param {number} prefix netmask length (*assumes integer*).
	 * @returns {(Network | null)} `Network` instance, or `null` on error.
	 * @error INVALID_NETMASK_LENGTH
	 * @error INVALID_BYTE_ARRAY_LENGTH
	 */
	static construct(addr: IPvClass | number[], prefix: number): Network | null {
		if (!this.check(addr, prefix)) { return null; }
		if (addr instanceof Array) {
			addr = fromByteArray(addr) as IPvClass;
			if (addr === null) {
				return null;
			}
		}
		return new Network(addr, prefix);
	}
	// !mask
	// network mask
	private _mask?: number[] | null;
	/**
	 * @returns {number[]} network mask (bytes) of `this.prefix` length (**unsafe reference**).
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsMask(): number[] {
		if (typeof this._mask === 'undefined') {
			this._mask = throwsFromPrefixLength(this.prefix, this.addr.bytes.length);
		}
		else if (this._mask === null) {
			// throw new Error('ipaddr: called .mask() which returned null, later called .throwsMask() which always returns IPvBytes');
			// as we know throwsFromPrefixLength will only throw one type of error.
			throw new IpUtilsError(Codes.INVALID_NETMASK_LENGTH);
		}
		return this._mask;
	}
	/**
	 * @returns {(number[] | null)} network mask (bytes) of `this.prefix` length (**unsafe reference**), or `null` on error.
	 * @error INVALID_NETMASK_LENGTH
	 */
	mask(): number[] | null {
		if (typeof this._mask === 'undefined') {
			this._mask = fromPrefixLength(this.prefix, this.addr.bytes.length);
		}
		return this._mask;
	}

	// !hostMask
	// network host mask
	private _hostMask?: number[] | null;
	/**
	 * @returns {number[]} network host mask (bytes) of `this.prefix` length (**unsafe reference**).
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsHostMask(): number[] {
		if (typeof this._hostMask === 'undefined') {
			const mask = this.throwsMask().slice();
			for (let i = mask.length - 1; i >= 0; --i) {
				mask[i] |= (mask[i] ^ 255);
			}
			this._hostMask = mask;
		}
		else if (this._hostMask === null) {
			// throw new Error('ipaddr: called .hostMask() which returned null, later called .throwsHostMask() which always returns IPvBytes');
			// as we know throwsFromPrefixLength will only throw one type of error.
			throw new IpUtilsError(Codes.INVALID_NETMASK_LENGTH);
		}
		return this._hostMask;
	}
	/**
	 * @returns {(number[] | null)} network host mask (bytes) of `this.prefix` length (**unsafe reference**), or `null` on error.
	 * @error INVALID_NETMASK_LENGTH
	 */
	hostMask(): number[] | null {
		if (typeof this._hostMask === 'undefined') {
			let mask = this.mask();
			if (mask) {
				mask = mask.slice();
				for (let i = mask.length - 1; i >= 0; --i) {
					mask[i] ^= 255;
				}
			}
			this._hostMask = mask;
		}
		return this._hostMask;
	}

	/**
	 * @alias `this.prefix`
	 */
	get netmaskLength() { return this.prefix; }
	/**
	 * @alias `this.prefix`
	 */
	get cidrBits() { return this.prefix; }
	get cidrZeros() { return (this.addr.bytes.length * 8) - this.prefix; }
	get numberOfAddresses() { return 2 ** this.cidrZeros; }

	// !firstHostBytes
	/**
	 * @returns {number[]} network address array of bytes.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsFirstHostBytes()
	 * // => [192, 168, 11, 161]
	 * new Network([192, 168, 11, 169], 35).throwsFirstHostBytes()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsFirstHostBytes(): number[] {
		const bytes = this.throwsNetworkAddressBytes();
		if ((bytes.length * 8) - this.prefix > 1) {
			++bytes[bytes.length - 1];
		}
		return bytes;
	}
	/**
	 * @returns {(number[] | null)} network address array of bytes, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).firstHostBytes()
	 * // => [192, 168, 11, 161]
	 * new Network([192, 168, 11, 169], 35).firstHostBytes()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	firstHostBytes(): number[] | null {
		const bytes = this.networkAddressBytes();
		if (bytes === null) { return null; }
		if ((bytes.length * 8) - this.prefix > 1) {
			++bytes[bytes.length - 1];
		}
		return bytes;
	}

	// !firstHost
	/**
	 * @returns {IPvClass} `IP` instance with bytes of network address.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsFirstHost()
	 * // => new IPv4([192, 168, 11, 161])
	 * new Network([192, 168, 11, 169], 35).throwsFirstHost()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsFirstHost(): IPvClass {
		const bytes = this.throwsFirstHostBytes();
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}
	/**
	 * @returns {(IPvClass | null)} `IP` instance with bytes of network address, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).firstHost()
	 * // => new IPv4([192, 168, 11, 161])
	 * new Network([192, 168, 11, 169], 35).firstHost()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	firstHost(): IPvClass | null {
		const bytes = this.firstHostBytes();
		if (bytes === null) { return null; }
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}

	// !lastHostBytes
	/**
	 * @returns {number[]} last host array of bytes.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsLastHostBytes()
	 * // => [192, 168, 11, 190]
	 * new Network([192, 168, 11, 169], 35).throwsLastHostBytes()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsLastHostBytes(): number[] {
		const bytes = this.throwsBroadcastAddressBytes();
		if ((bytes.length * 8) - this.prefix > 1) {
			--bytes[bytes.length - 1];
		}
		return bytes;
	}
	/**
	 * @returns {(number[] | null)} last host array of bytes, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).lastHostBytes()
	 * // => [192, 168, 11, 190]
	 * new Network([192, 168, 11, 169], 35).lastHostBytes()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	lastHostBytes(): number[] | null {
		const bytes = this.broadcastAddressBytes();
		if (bytes === null) { return null; }
		if ((bytes.length * 8) - this.prefix > 1) {
			--bytes[bytes.length - 1];
		}
		return bytes;
	}

	// !lastHost
	/**
	 * @returns {IPvClass} `IP` instance with bytes of last host.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsLastHost()
	 * // => new IPv4([192, 168, 11, 190])
	 * new Network([192, 168, 11, 169], 35).throwsLastHost()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsLastHost(): IPvClass {
		const bytes = this.throwsLastHostBytes();
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}
	/**
	 * @returns {(IPvClass | null)} `IP` instance with bytes of last host, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).lastHost()
	 * // => new IPv4([192, 168, 11, 190])
	 * new Network([192, 168, 11, 169], 35).lastHost()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	lastHost(): IPvClass | null {
		const bytes = this.lastHostBytes();
		if (bytes === null) { return null; }
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}
	// TODO getHostNumber(addr: IPvClass)

	// !networkAddressBytes
	/**
	 * @returns {number[]} network address array of bytes.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsNetworkAddressBytes()
	 * // => [192, 168, 11, 160]
	 * new Network([192, 168, 11, 169], 35).throwsNetworkAddressBytes()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsNetworkAddressBytes(): number[] {
		const mask = this.throwsMask();
		const bytes = this.addr.bytes.slice();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] &= mask[i];
		}
		return bytes;
	}
	/**
	 * @returns {(number[] | null)} network address array of bytes, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).networkAddressBytes()
	 * // => [192, 168, 11, 160]
	 * new Network([192, 168, 11, 169], 35).networkAddressBytes()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	networkAddressBytes(): number[] | null {
		const mask = this.mask();
		if (mask === null) { return null; }
		const bytes = this.addr.bytes.slice();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] &= mask[i];
		}
		return bytes;
	}

	// !networkAddress
	/**
	 * @returns {IPvClass} `IP` instance with bytes of network address.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsNetworkAddress()
	 * // => new IPv4([192, 168, 11, 160])
	 * new Network([192, 168, 11, 169], 35).throwsNetworkAddress()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsNetworkAddress(): IPvClass {
		const bytes = this.throwsNetworkAddressBytes();
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}
	/**
	 * @returns {(IPvClass | null)} `IP` instance with bytes of network address, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).networkAddress()
	 * // => new IPv4([192, 168, 11, 160])
	 * new Network([192, 168, 11, 169], 35).networkAddress()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	networkAddress(): IPvClass | null {
		const bytes = this.networkAddressBytes();
		if (bytes === null) { return null; }
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}

	// !broadcastAddressBytes
	/**
	 * @returns {number[]} broadcast address array of bytes.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsBroadcastAddressBytes()
	 * // => [192, 168, 11, 191]
	 * new Network([192, 168, 11, 169], 35).throwsBroadcastAddressBytes()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsBroadcastAddressBytes(): number[] {
		const mask = this.throwsMask();
		const bytes = this.addr.bytes.slice();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] |= (mask[i] ^ 255);
		}
		return bytes;
	}
	/**
	 * @returns {(number[] | null)} broadcast address array of bytes, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).broadcastAddressBytes()
	 * // => [192, 168, 11, 191]
	 * new Network([192, 168, 11, 169], 35).broadcastAddressBytes()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	broadcastAddressBytes(): number[] | null {
		const mask = this.mask();
		if (mask === null) { return null; }
		const bytes = this.addr.bytes.slice();
		for (let i = bytes.length - 1; i >= 0; --i) {
			bytes[i] |= (mask[i] ^ 255);
		}
		return bytes;
	}

	// !broadcastAddress
	/**
	 * @returns {IPvClass} `IP` instance with bytes of broadcast address.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsBroadcastAddress()
	 * // => new IPv4([192, 168, 11, 191])
	 * new Network([192, 168, 11, 169], 35).throwsBroadcastAddress()
	 * // => throw new IpUtilsError(INVALID_NETMASK_LENGTH)
	 * @throws {IpUtilsError} INVALID_NETMASK_LENGTH
	 */
	throwsBroadcastAddress(): IPvClass {
		const bytes = this.throwsBroadcastAddressBytes();
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}
	/**
	 * @returns {(IPvClass | null)} `IP` instance with bytes of broadcast address, or `null` on error.
	 * @example
	 * new Network([192, 168, 11, 169], 27).throwsBroadcastAddress()
	 * // => new IPv4([192, 168, 11, 191])
	 * new Network([192, 168, 11, 169], 35).throwsBroadcastAddress()
	 * // => null
	 * @error INVALID_NETMASK_LENGTH
	 */
	broadcastAddress(): IPvClass | null {
		const bytes = this.broadcastAddressBytes();
		if (bytes === null) { return null; }
		// @ts-ignore
		return new this.addr.constructor(bytes);
	}

	// !contains
	/**
	 * Checks whether `this` contains ip address `addr`.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*).
	 * @returns {boolean} `true` if `this` contains `addr`.
	 * @example
	 * const ipv4 = [192, 168, 11, 5]
	 * const nw = new Network([192, 168, 11, 0], 24)
	 * nw.throwsContains(ipv4)
	 * // => true
	 * const nw = new Network([10, 83, 2, 0], 24)
	 * nw.throwsContains(ipv4)
	 * // => false
	 * const nw = new Network([192, 168, 11, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 64)
	 * nw.throwsContains(ipv4)
	 * // => throws new IpUtilsError(MATCH_NETWORK_MISMATCHING_LENGTH)
	 * @throws {IpUtilsError} MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	throwsContains(addr: IPvClass | number[]): boolean {
		if (addr instanceof Array) {
			return throwsMatchNetwork(addr, this.addr.bytes, this.prefix);
		}
		return throwsMatchNetwork(addr.bytes, this.addr.bytes, this.prefix);
	}
	/**
	 * Checks whether `this` contains ip address `addr`.
	 * @param {(IPvClass | number[])} addr ip address: `IP` instance or array of bytes (length = 4, 16) (*assumes correct*).
	 * @returns {boolean} `true` if `this` contains `addr`, else `false`.
	 * @example
	 * const ipv4 = [192, 168, 11, 5]
	 * const nw = new Network([192, 168, 11, 0], 24)
	 * nw.contains(ipv4)
	 * // => true
	 * const nw = new Network([10, 83, 2, 0], 24)
	 * nw.contains(ipv4)
	 * // => false
	 * const nw = new Network([192, 168, 11, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 64)
	 * nw.contains(ipv4)
	 * // => false
	 * @error MATCH_NETWORK_MISMATCHING_LENGTH
	 */
	contains(addr: IPvClass | number[]): boolean {
		if (addr instanceof Array) {
			return matchNetwork(addr, this.addr.bytes, this.prefix) === true;
		}
		return matchNetwork(addr.bytes, this.addr.bytes, this.prefix) === true;
	}

	// !toString
	/**
	 * @returns {string} cidr notation: ip address and netmask length are separated by slash (/).
	 * @example
	 * new Network([192, 168, 11, 5], 24).toString()
	 * // => '192.168.11.5/24'
	 */
	toString(): string {
		return `${this.addr.toString()}/${this.prefix}`;
	}
}