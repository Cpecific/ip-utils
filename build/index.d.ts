export declare type IPv4Range = 'unicast' | 'unspecified' | 'multicast' | 'linkLocal' | 'loopback' | 'broadcast' | 'carrierGradeNat' | 'private' | 'reserved';
export declare type IPv6Range = 'unicast' | 'unspecified' | 'multicast' | 'linkLocal' | 'loopback' | 'uniqueLocal' | 'ipv4Mapped' | 'rfc6145' | 'rfc6052' | '6to4' | 'teredo' | 'reserved';
declare type RangeList<T extends string> = {
    [K in T]: Network[];
};
export declare type IPvTypes = IPv4 | IPv6;
export declare type IPvBytes = IPv4Bytes | IPv6Bytes;
export declare type IPvBytesLength = IPv4Bytes["length"] | IPv6Bytes["length"];
export declare function autoConstructor(bytes: number[]): IPv4 | IPv6;
export declare function subnetMatch<T extends string, D extends string | undefined = undefined>(addr: IPvTypes, rangeList: RangeList<T>, defaultName?: D): T | "unicast" | ([D] extends [undefined] ? never : D);
/**
* subnetMaskFromPrefixLength
*/
export declare function fromPrefixLength(prefix: number, bytesLength: IPvBytesLength): number[];
/**
* Находятся ли ip адреса в одной подсети
*/
export declare function matchCIDR(first: IPvBytes, second: IPvBytes, cidrBits: number, partSize: number): boolean;
export declare class Network {
    addr: IPvTypes;
    cidrBits: number;
    private maskBytes?;
    constructor(addr: IPvTypes, cidrBits: number);
    mask(): IPvBytes;
    get maskLength(): number;
    get cidrZeros(): number;
    get numberOfAddresses(): number;
    networkAddressBytes(): IPvBytes;
    broadcastAddressBytes(): IPvBytes;
    firstHostBytes(): IPvBytes;
    lastHostBytes(): IPvBytes;
    networkAddress(): IPvTypes;
    broadcastAddress(): IPvTypes;
    contains(addr: IPvTypes | IPvBytes): boolean;
    toString(): string;
}
export declare function isIPv4(addr: IPvTypes): addr is IPv4;
export declare function isIPv6(addr: IPvTypes): addr is IPv6;
interface IPcommon {
    bytes: number[];
    prefixLengthFromSubnetMask(): number | null;
    toByteArray(): number[];
    toNormalizedString(): string;
    toString(): string;
}
declare type IPv4Bytes = [number, number, number, number];
export declare class IPv4 implements IPcommon {
    static kind: "ipv4";
    static bytes: 4;
    static SpecialRanges: {
        unspecified: Network[];
        broadcast: Network[];
        multicast: Network[];
        linkLocal: Network[];
        loopback: Network[];
        carrierGradeNat: Network[];
        private: Network[];
        reserved: Network[];
    };
    static parser(string: string): IPv4Bytes | null;
    static isIPv4(addr: string): boolean;
    static isValid(string: string): boolean;
    static isValidFourPartDecimal(addr: string): boolean;
    static parse(addr: string): IPv4;
    bytes: IPv4Bytes;
    constructor(bytes: IPv4Bytes | number[]);
    kind(): "ipv4";
    containedBy(arg: [IPvTypes, number] | Network): boolean;
    range(): IPv4Range;
    toIPv4MappedAddress(): IPv6;
    prefixLengthFromSubnetMask(): number | null;
    toByteArray(): IPv4Bytes;
    toNormalizedString(): string;
    toString(): string;
}
declare type IPv6Bytes = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
declare type IPv6Parts = [number, number, number, number, number, number, number, number];
export declare class IPv6 implements IPcommon {
    static kind: "ipv6";
    static bytes: 16;
    static SpecialRanges: {
        unspecified: Network[];
        linkLocal: Network[];
        multicast: Network[];
        loopback: Network[];
        uniqueLocal: Network[];
        ipv4Mapped: Network[];
        rfc6145: Network[];
        rfc6052: Network[];
        '6to4': Network[];
        teredo: Network[];
        reserved: Network[];
    };
    static parser(string: string): {
        parts: IPv6Parts;
        zoneId: string | undefined;
    } | null;
    static isIPv6(addr: string): boolean;
    static isValid(string: string): boolean;
    static parse(string: string): IPv6;
    bytes: IPv6Bytes;
    private parts?;
    zoneId: string | undefined;
    constructor(parts: IPv6Bytes | number[], zoneId?: string);
    kind(): "ipv6";
    getParts(): IPv6Parts;
    containedBy(arg: [IPvTypes, number] | Network): boolean;
    range(): IPv6Range;
    isIPv4MappedAddress(): boolean;
    toIPv4Address(): IPv4;
    prefixLengthFromSubnetMask(): number | null;
    toByteArray(): IPv6Bytes;
    toNormalizedString(): string;
    toFixedLengthString(): string;
    toString(): string;
}
export declare function isValid(string: string): boolean;
export declare function parse(string: string): IPvTypes;
/**
* @alias parseSubnet
* @param string `IPvFormat / cidrBits`
*/
export declare function parseCIDR(string: string): Network;
export declare const parseSubnet: typeof parseCIDR;
export declare function parseIPv4(string: string): IPv4;
export declare function fromByteArray(bytes: IPvBytes | number[]): IPvTypes;
export declare function subnet(bytes: IPvBytes | number[], cidrBits: IPvBytesLength | number): Network;
export declare const network: typeof subnet;
export declare function toByteArray(string: string): IPvBytes;
export declare function toString(bytes: IPvBytes | number[]): string;
export declare namespace safe {
    function parse(string: string): IPvTypes | undefined;
    function parseCIDR(string: string): Network | undefined;
    const parseSubnet: typeof parseCIDR;
    function parseIPv4(string: string): IPv4 | undefined;
    function fromByteArray(bytes: IPvBytes | number[]): IPvTypes | undefined;
    function subnet(bytes: IPvBytes | number[], cidrBits: IPvBytesLength | number): Network | undefined;
    const network: typeof subnet;
    function toByteArray(string: string): IPvBytes | undefined;
    function toString(bytes: IPvBytes | number[]): string | undefined;
}
export {};
