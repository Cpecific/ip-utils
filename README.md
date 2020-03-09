A library of useful IPv4, IPv6 and Network functions.

# Installation
**npm**
```
npm install @cpecific/ip-utils
```

# Usage
Library is split into *utilities* functions and functions that use *classes*.
If you are tree-shaker to the bone, then go with *utilities* only, if you don't care, then *classes* are for you.
*Utilities* functions have *@utility* tag in documentation, that means that they don't use classes in any way, but *classes* may use them. Obviously, functions that don't have *@utility* tag in documentation definitely use *classes* functions.

Some functions use **unsafe assign** and **unsafe reference** code, please, read documentation before using library functions.

Library is **meant to be used** in typescript, as functions almost **do not check** it's arguments, and you can easily identify such functions in documentation by "(*assumes correct*)", "(*assumes positive integer*)" etc.

All functions are richly documented down to what they throw (or what errors they could encounter but not tell you) and example usage.

Library splits functions into two similary named functions whenever there is an error to throw. For example, code below tells you, that `fromByteArray` will return *class* object if successfull, and `null` on error. `throwsFromByteArray` on error will throw `IpUtilsError` with integer error code (`const enum Codes` are re-exported from `'@cpecific/ip-utils/build/--/--/Error'`). `parseData` functions directly return error code, instead of `null`.
```ts
function throwsFromByteArray(bytes: number[]): IPvClass;
function fromByteArray(bytes: number[]): IPvClass | null;
```

## Classes
```typescript
import * as IP from '@cpecific/ip-utils';
import * as IP from '@cpecific/ip-utils/build/es5/cjs';
import * as IP from '@cpecific/ip-utils/build/esnext/cjs';
import * as IP from '@cpecific/ip-utils/build/esnext/esm';

const enum Codes /* a list of error codes */ {}
const Messages = [
	/* a list of error messages */
];
class IpUtilsError extends Error {
	code: Codes;
	constructor(code: Codes);
}
interface IPvClass { /* some common functions declarations */}

// Creates IP instance based on length of `bytes`.
function throwsFromByteArray(bytes: number[]): IPvClass;
function fromByteArray(bytes: number[]): IPvClass | null;
// Computes netmask length from `bytes` (network mask).
function throwsFromNetworkMask(bytes: number[]): number;
function fromNetworkMask(bytes: number[]): number | null;
// Creates an IP instance (network mask) for given netmask length = `prefix` and length = `bytesLength`.
function throwsFromPrefixLength(prefix: number, bytesLength: number): IPvClass;
function fromPrefixLength(prefix: number, bytesLength: number): IPvClass | null;
// Validates data of bytes and creates IP instance.
function throwsFromValidByteArray(bytes: number[]): IPvClass;
function fromValidByteArray(bytes: number[]): IPvClass | null;
// Checks whether `first` and `second` byte arrays are equal.
function isEqual(first: number[], second: number[]): boolean;
// Checks if `bytes` is valid network host mask.
function isNetworkHostMask(bytes: number[]): boolean;
// Checks if `bytes` is valid network mask.
function isNetworkMask(bytes: number[]): boolean;
// Checks if ip address string is valid.
function isValid(string: string): boolean;
// Validates length and data of `bytes`.
function isValidByteArray(bytes: number[]): boolean;
// Check whether `first` and `second` are within same network (first `prefix` bits are equal).
function throwsMatchNetwork(first: number[], second: number[], prefix: number): boolean;
function matchNetwork(first: number[], second: number[], prefix: number): boolean | null;
function matchNetworkBoolean(first: number[], second: number[], prefix: number): boolean;
// Iterates over `rangeList` and returns first matching network for given `addr`.
function matchNetworkRange<T extends string, D extends string>(addr: number[] | IPvClass, rangeList: RangeList<T>, defaultName?: D = "unicast"): T | D;
// Typescript identity function, it doesn't "do anything" at runtime, just helps guide type inference at compile time. Use it to defeat type widening.
function createRangeList<T extends string>(rangeList: RangeList<T>): RangeList<T>;
// Creates IP instance if `string` is valid.
function throwsParse(string: string): IPvClass;
function parse(string: string): IPvClass | null;
// Parses ip address `string` and, if `string` is IPv4 string, creates IP instance.
function throwsParseIPv4(string: string): IPv4;
function parseIPv4(string: string): IPv4 | null;
// Parses CIDR `string` and creates `Network` instance.
function throwsParseNetwork(string: string): Network;
function parseNetwork(string: string): Network | null;
// Creates array of bytes if `string` is valid.
function throwsToByteArray(string: string): number[];
function toByteArray(string: string): number[] | null;
// Determines IP version for given array of `bytes` and returns corresponding string notation.
function throwsToString(bytes: number[]): string;
function toString(bytes: number[]): string | null;
// Determines IP version for given array of `bytes` and returns corresponding string notation. Validates data of `bytes`.
function throwsToValidString(bytes: number[]): string;
function toValidString(bytes: number[]): string | null;
// Typescript type narrowing.
function isIPv4(addr: IPvClass): addr is IPv4;
function isIPv6(addr: IPvClass): addr is IPv6;

class IPv4 implements IPvClass {
	static SpecialRanges: RangeList<"unspecified" | "linkLocal" | "multicast" | "loopback" | "reserved" | "broadcast" | "carrierGradeNat" | "private">;
	
	static ResetParsePermissions(): void;
	// Changes permissions for parser.
	/**
	 * Changes permissions for parser.
	 * @param permissions permissions settings:
	 * 1) array of permitted notation rules:
	 * - "decimal" - allows decimal values (ex. `192.0.2.235`, `3221226219`).
	 * - "octet" - allows octet values (ex. `0300.0000.0002.0353`, `030000001353`).
	 * - "hex" - allows hex values (ex. `0xC0.0x00.0x02.0xEB`, `0xC00002EB`).
	 * - "variable" - allows variable number of octets, from 2 to 4 (ex. `192.747`, `192.0.747`, `192.0.2.235`).
	 * - "long" - allows "long" notation, only 1st octet (ex. `3221226219`).
	 * 2) flag: number (*enum ParseFlags*):
	 * - 1 = "decimal"
	 * - 2 = "octet"
	 * - 4 = "hex"
	 * - 8 = "variable"
	 * - 16 = "long"
	 */
	static SetParsePermissions(permissions: string[] | number): void;
	// Converts IPv4 `bytes` array to unsigned int.
	static toLong(bytes: number[]): number;
	// Converts `long` integer into `IPv4` instance.
	static fromLong(long: number): IPv4;
	// Creates an array of bytes for valid IPv4 `string`.
	static throwsParseData(string: string, flag?: number): number[];
	static parseData(string: string, flag?: number): number[] | number; // returns error code
	// Checks `string` for IPv4 validity.
	static isValid(string: string, flag?: number): boolean;
	// Checks `string` for IPv4 validity in four part decimal form.
	static isValidFourPartDecimal(string: string): boolean;
	// Validates length and data of `bytes`.
	static throwsCheck(bytes: number[]): boolean;
	static check(bytes: number[]): boolean;
	// Creates `IPv4` instance for valid IPv4 `string`.
	static throwsParse(string: string, flag?: number): IPv4;
	static parse(string: string, flag?: number): IPv4 | null;

	bytes: number[];
	constructor(bytes: number[]);
	// Validates data and creates `IPv4` instance.
	static throwsConstruct(bytes: number[]): IPv4;
	static construct(bytes: number[]): IPv4 | null;
	// Checks whether `this.bytes` and `bytes` byte arrays are equal.
	isEqual(bytes: number[]): boolean;
	// Checks whether `arg` (Network) contains `IP` instance.
	throwsContainedBy(arg: RangeDataAny): boolean;
	containedBy(arg: RangeDataAny): boolean;
	// Matching range among IPv4.SpecialRanges
	range(): IPv4Range;
	// IPv6 array of bytes in "ipv4Mapped" special range.
	toIPv4MappedBytes(): number[];
	// `IPv6` instance with data converted into "ipv4Mapped" special range.
	toIPv4MappedAddress(): IPv6;
	// Computes netmask length from `this.bytes` (network mask).
	throwsPrefixLengthFromNetworkMask(): number;
	prefixLengthFromNetworkMask(): number | null;
	// Returns a copy of `this.bytes` array.
	toByteArray(): number[];
	// Dot-decimal notation, which consists of four octets of the address expressed individually in decimal numbers and separated by periods
	toNormalizedString(): string;
	toString(): string;
}

class IPv6 implements IPvClass {
	static SpecialRanges: RangeList<"unspecified" | "linkLocal" | "multicast" | "loopback" | "uniqueLocal" | "ipv4Mapped" | "rfc6145" | "rfc6052" | "6to4" | "teredo" | "reserved">;

	// Creates an object with array of bytes and zone id for valid IPv6 `string`.
	static throwsParseData(string: string): { bytes: number[], zoneId: string | undefined };
	static parseData(string: string): { bytes: number[], zoneId: string | undefined } | number; // returns error code
	// Checks `string` for IPv6 validity.
	static isValid(string: string): boolean;
	// Validates length and data of `bytes` and `zoneId`.
	static throwsCheck(bytes: number[], zoneId?: string): boolean;
	static check(bytes: number[], zoneId?: string): boolean;
	// Creates `IPv6` instance for valid IPv6 `string`.
	static throwsParse(string: string): IPv6;
	static parse(string: string): IPv6 | null;

	bytes: number[];
	zoneId: string | undefined;
	constructor(bytes: number[], zoneId?: string);
	// Validates data and creates `IPv6` instance.
	static throwsConstruct(bytes: number[], zoneId?: string): IPv6;
	static construct(bytes: number[], zoneId?: string): IPv6 | null;
	// Checks whether `this.bytes` and `bytes` byte arrays are equal.
	isEqual(bytes: number[]): boolean;
	// Converts `this.bytes` into IPv6 parts (8 groups of 16-bit unsigned integers).
	parts(): number[];
	// Checks whether `arg` (Network) contains `IP` instance.
	throwsContainedBy(arg: [number[], number] | Network): boolean;
	containedBy(arg: [number[], number] | Network): boolean;
	// Matching range among IPv6.SpecialRanges
	range(): IPv6Range;
	// Checks whether ip address is contained by "ipv4Mapped" special range.
	isIPv4MappedAddress(): boolean;
	// Returns `IPv4` instance if ip address contained by "ipv4Mapped" special range.
	throwsToIPv4Address(): IPv4;
	toIPv4Address(): IPv4 | null;
	// Computes netmask length from `this.bytes` (network mask).
	throwsPrefixLengthFromNetworkMask(): number;
	prefixLengthFromNetworkMask(): number | null;
	// Returns a copy of `this.bytes` array.
	toByteArray(): number[];
	// Eight groups of four hexadecimal digits, each group representing 16 bits, groups are separated by colons.
	toFixedLengthString(): string;
	// Eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons.
	toNormalizedString(): string;
	// Eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons. One or more consecutive groups containing only zeros may be replaced with a single empty group, using two consecutive colons (::).
	toString(): string;
}

class Network {
	addr: IPvClass;
	prefix: number;

	// Parses CIDR `string` and creates network data tuple [ `IP` instance, netmask length ].
	static throwsParseData(string: string): [IPvClass, number];
	static parseData(string: string): [IPvClass, number] | number; // returns error code
	// Creates `Network` instance for valid CIDR `string`.
	static throwsParse(string: string): Network;
	static parse(string: string): Network | null;
	// Checks if netmask length is valid.
	static throwsCheck(addr: IPvClass | number[], prefix: number): boolean;
	static check(addr: IPvClass | number[], prefix: number): boolean;
	// Wraps ip address with netmask prefix length.
	constructor(addr: IPvClass | number[], prefix: number);
	// Validates netmask length and creates `Network` instance.
	static throwsConstruct(addr: IPvClass | number[], prefix: number): Network;
	static construct(addr: IPvClass | number[], prefix: number): Network | null;
	// Returns network mask (bytes) of `this.prefix` length.
	throwsMask(): number[];
	mask(): number[] | null;
	// Returns network host mask (bytes) of `this.prefix` length.
	throwsHostMask(): number[];
	hostMask(): number[] | null;

	get netmaskLength(): number;
	get cidrBits(): number;
	get cidrZeros(): number;
	get numberOfAddresses(): number;

	// Returns network address array of bytes.
	throwsFirstHostBytes(): number[];
	firstHostBytes(): number[] | null;
	// Returns `IP` instance with bytes of network address.
	throwsFirstHost(): IPvClass;
	firstHost(): IPvClass | null;
	// Returns last host array of bytes.
	throwsLastHostBytes(): number[];
	lastHostBytes(): number[] | null;
	// Returns `IP` instance with bytes of last host.
	throwsLastHost(): IPvClass;
	lastHost(): IPvClass | null;
	// Returns network address array of bytes.
	throwsNetworkAddressBytes(): number[];
	networkAddressBytes(): number[] | null;
	// Returns `IP` instance with bytes of network address.
	throwsNetworkAddress(): IPvClass;
	networkAddress(): IPvClass | null;
	// Returns broadcast address array of bytes.
	throwsBroadcastAddressBytes(): number[];
	broadcastAddressBytes(): number[] | null;
	// `IP` instance with bytes of broadcast address.
	throwsBroadcastAddress(): IPvClass;
	broadcastAddress(): IPvClass | null;
	// Checks whether `this` contains ip address `addr`.
	throwsContains(addr: IPvClass | number[]): boolean;
	contains(addr: IPvClass | number[]): boolean;
	// Returns string in cidr notation.
	toString(): string;
}
```

## Utilities
```typescript
import * as IP from '@cpecific/ip-utils/build/es5/cjs/utils';
import * as IP from '@cpecific/ip-utils/build/esnext/cjs/utils';
import * as IP from '@cpecific/ip-utils/build/esnext/esm/utils';

// Computes netmask length from `bytes` (network mask).
function throwsFromNetworkMask(bytes: number[]): number;
function fromNetworkMask(bytes: number[]): number | null;
// Creates an array of bytes (network mask) for given netmask length = `prefix` and length = `bytesLength`
function throwsFromPrefixLength(prefix: number, bytesLength: number): number[];
function fromPrefixLength(prefix: number, bytesLength: number): number[] | null;
// Checks whether `first` and `second` byte arrays are equal.
function isEqual(first: number[], second: number[]): boolean;
// Checks if `bytes` is valid network host mask.
function isNetworkHostMask(bytes: number[]): boolean;
// Checks if `bytes` is valid network mask.
function isNetworkMask(bytes: number[]): boolean;
// Checks if ip address `string` is valid.
function isValid(string: string): boolean;
// Validates length and data of `bytes`.
function isValidByteArray(bytes: number[]): boolean;
// Check whether `first` and `second` are within same network (first `prefix` bits are equal).
function throwsMatchNetwork(first: number[], second: number[], prefix: number): boolean;
function matchNetwork(first: number[], second: number[], prefix: number): boolean | null;
function matchNetworkBoolean(first: number[], second: number[], prefix: number): boolean;
// Iterates over `rangeList` and returns first matching network for given `addr`.
function matchNetworkRange<T extends string, D extends string>(addr: number[], rangeList: RangeList<T>, defaultName?: D = "unicast"): T | D;
// Typescript identity function, it doesn't "do anything" at runtime, just helps guide type inference at compile time. Use it to defeat type widening.
function createRangeList<T extends string>(rangeList: RangeList<T>): RangeList<T>;
// Parses ip address `string` and, if `string` is IPv4 string, returns array of bytes.
function throwsParseIPv4(string: string): number[];
function parseIPv4(string: string): number[] | null;
// Parses CIDR `string` and creates network data tuple [ array of bytes, netmask length ].
function throwsParseNetwork(string: string): [number[], number];
function parseNetwork(string: string): [number[], number] | null;
// Creates array of bytes if `string` is valid.
function throwsToByteArray(string: string): number[];
function toByteArray(string: string): number[] | null;
// Determines IP version for given array of `bytes` and returns corresponding string notation.
function throwsToString(bytes: number[]): string;
function toString(bytes: number[]): string | null;
function throwsToValidString(bytes: number[]): string;
// Determines IP version for given array of `bytes` and returns corresponding string notation. Validates data of `bytes`.
function throwsToValidString(bytes: number[]): string;
function toValidString(bytes: number[]): string | null;

module IPv4 {
	// Validates length and data of `bytes`.
	function throwsCheck(bytes: number[]): boolean;
	function check(bytes: number[]): boolean | null;
	// Converts `long` integer into array of bytes.
	function fromLong(long: number): number[];
	// Checks string for IPv4 validity for given flag parse permissions.
	function isValid(string: string, flag?: number, parser?: IPv4_ParseType): boolean;
	// Creates an array of bytes for valid IPv4 `string`.
	function throwsParseData(string: string, flag?: number, parser?: IPv4_ParseType): number[];
	function parseData(string: string, flag?: number, parser?: IPv4_ParseType): number[] |number; // returns error code
	const SpecialRanges: RangeList<"unspecified" | "linkLocal" | "multicast" | "loopback" | "reserved" | "broadcast" | "carrierGradeNat" | "private">;
	// Converts IPv4 array of `bytes` into IPv6 array of bytes in "ipv4Mapped" special range.
	function toIPv4MappedBytes(bytes: number[]): number[];
	// Converts IPv4 `bytes` array to unsigned int.
	function toLong(bytes: number[]): number;
	// Dot-decimal notation, which consists of four octets of the address expressed individually in decimal numbers and separated by periods.
	function throwsToString(bytes: number[]): string;
	function toString(bytes: number[]): string;
}

module IPv6 {
	// Validates length and data of `bytes` and `zoneId`.
	function throwsCheck(bytes: number[], zoneId?: string): boolean;
	function check(bytes: number[], zoneId?: string): boolean | null;
	// Checks whether ip address `bytes` is contained by "ipv4Mapped" special range.
	function isIPv4MappedAddress(bytes: number[]): boolean;
	// Checks string for IPv6 validity.
	function isValid(string: string): boolean;
	// Creates an object with array of bytes and zone id for valid IPv6 `string`.
	function throwsParseData(string: string): { bytes: number[], zoneId: string | undefined };
	function parseData(string: string): { bytes: number[], zoneId: string | undefined } | number; // returns error code
	const SpecialRanges: RangeList<"unspecified" | "linkLocal" | "multicast" | "loopback" | "reserved" | "uniqueLocal" | "ipv4Mapped" | "rfc6145" | "rfc6052" | "6to4" | "teredo">;
	// Eight groups of four hexadecimal digits, each group representing 16 bits, groups are separated by colons.
	function throwsToFixedLengthString(bytes: number[], zoneId?: string): string;
	function toFixedLengthString(bytes: number[], zoneId?: string): string | null;
	// Eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons
	function throwsToNormalizedString(bytes: number[], zoneId?: string): string;
	function toNormalizedString(bytes: number[], zoneId?: string): string | null;
	// Eight groups of four hexadecimal digits, with leading zeroes in a group omitted, each group representing 16 bits, groups are separated by colons. One or more consecutive groups containing only zeros may be replaced with a single empty group, using two consecutive colons (::).
	function throwsToString(bytes: number[], zoneId?: string): string;
	function toString(bytes: number[], zoneId?: string): string | null;
}

module Network {
	// Returns broadcast address array of bytes.
	function throwsBroadcastAddressBytes(nw: RangeByteData): number[];
	function broadcastAddressBytes(nw: RangeByteData): number[] | null;
	// Checks if netmask length is valid.
	function throwsCheck(addr: number[], prefix: number): boolean;
	function check(addr: number[], prefix: number): boolean | null;
	// Returns first host array of bytes.
	function throwsFirstHostBytes(nw: RangeByteData): number[];
	function firstHostBytes(nw: RangeByteData): number[] | null;
	// Returns last host array of bytes.
	function throwsLastHostBytes(nw: RangeByteData): number[];
	function lastHostBytes(nw: RangeByteData): number[] | null;
	// Returns network address array of bytes.
	function throwsNetworkAddressBytes(nw: RangeByteData): number[];
	function networkAddressBytes(nw: RangeByteData): number[] | null;
	// Parses cidr notation `string` and returns tuple [ array of bytes, netmask length ].
	function throwsParseData(string: string): [number[], number];
	function parseData(string: string): [number[], number] | number; // returns error code
}
```