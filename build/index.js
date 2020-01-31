"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
// type IPvParts = IPv4Parts | IPv6Parts;
// type IPvPartsLength = IPv4Parts["length"] | IPv6Parts["length"];
// type IPvNames = 'ipv4' | 'ipv6';
function add(bytes, value) {
    var temp = 0;
    for (var i = bytes.length - 1; i >= 0; --i) {
        bytes[i] += value + temp;
        if (bytes[i] > 0xFF) {
            bytes[i] = 0;
            temp = 1;
        }
        else if (bytes[i] < 0) {
            bytes[i] = 0xFF;
            temp = -1;
        }
        else {
            temp = 0;
        }
    }
    // if (temp !== 0) { return null; }
    return bytes;
}
function autoConstructor(bytes) {
    if (bytes.length === 4) {
        return new IPv4(bytes);
    }
    else if (bytes.length === 16) {
        return new IPv6(bytes);
    }
    throw new Error('ipaddr: invalid bytes length for auto-constructor');
}
exports.autoConstructor = autoConstructor;
function subnetMatch(addr, rangeList, defaultName) {
    var e_1, _a;
    var kind = addr.kind();
    for (var rangeName in rangeList) {
        var rangeSubnets = rangeList[rangeName];
        try {
            for (var rangeSubnets_1 = (e_1 = void 0, __values(rangeSubnets)), rangeSubnets_1_1 = rangeSubnets_1.next(); !rangeSubnets_1_1.done; rangeSubnets_1_1 = rangeSubnets_1.next()) {
                var subnet_1 = rangeSubnets_1_1.value;
                if (kind === subnet_1.addr.kind()) {
                    if (subnet_1.contains(addr)) {
                        return rangeName;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (rangeSubnets_1_1 && !rangeSubnets_1_1.done && (_a = rangeSubnets_1.return)) _a.call(rangeSubnets_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return typeof defaultName === 'undefined' ?
        'unicast' :
        defaultName;
}
exports.subnetMatch = subnetMatch;
/**
* subnetMaskFromPrefixLength
*/
function fromPrefixLength(prefix, bytesLength) {
    if (prefix < 0 || prefix > (bytesLength * 8)) {
        throw new Error("ipaddr: invalid prefix length for " + bytesLength + " bytes length");
    }
    var bytes = Array(bytesLength).fill(0);
    var filledOctetCount = Math.floor(prefix / 8);
    for (var j = 0; j < filledOctetCount; j++) {
        bytes[j] = 0xFF;
    }
    if (filledOctetCount < bytesLength) {
        bytes[filledOctetCount] = Math.pow(2, prefix % 8) - (1 << 8) - (prefix % 8);
    }
    return bytes;
}
exports.fromPrefixLength = fromPrefixLength;
var bitTable = {
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
function fromSubnetMask(bytes) {
    var e_2, _a;
    var cidr = 0;
    var stop = false;
    try {
        for (var bytes_1 = __values(bytes), bytes_1_1 = bytes_1.next(); !bytes_1_1.done; bytes_1_1 = bytes_1.next()) {
            var byte = bytes_1_1.value;
            if (!(byte in bitTable)) {
                // invalid subnet ip
                return null;
            }
            var bits = bitTable[byte];
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
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (bytes_1_1 && !bytes_1_1.done && (_a = bytes_1.return)) _a.call(bytes_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return cidr;
}
/**
* Находятся ли ip адреса в одной подсети
*/
function matchCIDR(first, second, cidrBits, partSize) {
    if (first.length !== second.length) {
        throw new Error('ipaddr: cannot match CIDR for objects with different lengths');
    }
    for (var idx = 0; cidrBits > 0; ++idx) {
        var shift = partSize - cidrBits;
        if (shift < 0 ?
            first[idx] !== second[idx] :
            (first[idx] >> shift) !== (second[idx] >> shift)) {
            return false;
        }
        cidrBits -= partSize;
    }
    return true;
}
exports.matchCIDR = matchCIDR;
var Network = /** @class */ (function () {
    function Network(addr, cidrBits) {
        this.addr = addr;
        this.cidrBits = cidrBits;
        if (cidrBits < 0 || cidrBits > addr.bytes.length * 8) {
            throw new Error('ipaddr: CIDR mask length is invalid');
        }
    }
    Network.prototype.mask = function () {
        if (!this.maskBytes) {
            this.maskBytes = fromPrefixLength(this.cidrBits, this.addr.bytes.length);
        }
        return this.maskBytes;
    };
    Object.defineProperty(Network.prototype, "maskLength", {
        get: function () { return this.cidrBits; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Network.prototype, "cidrZeros", {
        get: function () { return (this.addr.bytes.length * 8) - this.cidrBits; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Network.prototype, "numberOfAddresses", {
        get: function () { return Math.pow(2, this.cidrZeros); },
        enumerable: true,
        configurable: true
    });
    Network.prototype.networkAddressBytes = function () {
        var bytes = this.addr.toByteArray();
        var mask = this.mask();
        for (var i = bytes.length - 1; i >= 0; --i) {
            bytes[i] &= mask[i];
        }
        return bytes;
    };
    Network.prototype.broadcastAddressBytes = function () {
        var bytes = this.addr.toByteArray();
        var mask = this.mask();
        for (var i = 0; i < bytes.length; i++) {
            bytes[i] |= (mask[i] ^ 255);
        }
        return bytes;
    };
    Network.prototype.firstHostBytes = function () {
        var bytes = this.networkAddressBytes();
        if (this.cidrZeros <= 1) {
            return bytes;
        }
        return add(bytes, 1);
    };
    Network.prototype.lastHostBytes = function () {
        var bytes = this.networkAddressBytes();
        var numberOfAddresses = this.numberOfAddresses;
        return add(bytes, numberOfAddresses + (numberOfAddresses <= 2 ? -1 : -2));
    };
    Network.prototype.networkAddress = function () {
        try {
            var bytes = this.networkAddressBytes();
            return autoConstructor(bytes);
        }
        catch (e) {
            throw new Error('ipaddr: the address does not have IPv4 CIDR format');
        }
    };
    Network.prototype.broadcastAddress = function () {
        try {
            // ip.fromLong(networkAddress + numberOfAddresses - 1)
            var bytes = this.broadcastAddressBytes();
            return autoConstructor(bytes);
        }
        catch (e) {
            throw new Error('ipaddr: the address does not have IPv4 CIDR format');
        }
    };
    Network.prototype.contains = function (addr) {
        if (addr instanceof Array) {
            return matchCIDR(addr, this.addr.bytes, this.cidrBits, 8);
        }
        return matchCIDR(addr.bytes, this.addr.bytes, this.cidrBits, 8);
    };
    Network.prototype.toString = function () {
        return this.addr.toString() + '/' + this.cidrBits;
    };
    return Network;
}());
exports.Network = Network;
function isIPv4(addr) { return (addr instanceof IPv4); }
exports.isIPv4 = isIPv4;
function isIPv6(addr) { return (addr instanceof IPv6); }
exports.isIPv6 = isIPv6;
// const ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
var ipv4Byte = "(?:2(?:5[0-5]|[0-4]\\d)|1?\\d?\\d)";
var ipv4Part = "(0\\d+|0x[0-9a-f]+|" + ipv4Byte + ")";
var ipv4Total = ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part + "\\." + ipv4Part;
var ipv4ByteTotal = ipv4Byte + "\\." + ipv4Byte + "\\." + ipv4Byte + "\\." + ipv4Byte;
var ipv4Regexes = {
    fourOctet: new RegExp("^" + ipv4Total + "$", 'i'),
    fourByte: new RegExp("^" + ipv4ByteTotal + "$", 'i'),
    longValue: new RegExp("^(\\d+|0x[0-9a-f]+)$", 'i'),
};
var IPv4 = /** @class */ (function () {
    function IPv4(bytes) {
        var e_3, _a;
        if (bytes.length !== 4) {
            throw new Error('ipaddr: ipv4 octet count should be 4');
        }
        try {
            for (var bytes_2 = __values(bytes), bytes_2_1 = bytes_2.next(); !bytes_2_1.done; bytes_2_1 = bytes_2.next()) {
                var byte = bytes_2_1.value;
                if (!(0 <= byte && byte <= 255)) {
                    throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (bytes_2_1 && !bytes_2_1.done && (_a = bytes_2.return)) _a.call(bytes_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this.bytes = bytes;
    }
    IPv4.parser = function (string) {
        var e_4, _a;
        function parseIntAuto(part) {
            if (part.substr(0, 1) === '0'
                && part.substr(1, 1).toLowerCase() !== 'x') {
                return parseInt(part, 8);
            }
            else {
                return parseInt(part);
            }
        }
        var match = string.match(ipv4Regexes.fourOctet);
        if (match) {
            var ref = match.slice(1, 6);
            var parts = Array();
            try {
                for (var ref_1 = __values(ref), ref_1_1 = ref_1.next(); !ref_1_1.done; ref_1_1 = ref_1.next()) {
                    var part = ref_1_1.value;
                    parts.push(parseIntAuto(part));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (ref_1_1 && !ref_1_1.done && (_a = ref_1.return)) _a.call(ref_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return parts;
        }
        match = string.match(ipv4Regexes.longValue);
        if (match) {
            var value = parseIntAuto(match[1]);
            if (value > 0xFFFFFFFF || value < 0) {
                throw new Error('ipaddr: address outside defined range');
            }
            // chrome только парсит, начиная с 1.0.0.0
            if (value < 0x01000000) {
                throw new Error('ipaddr: invalid ip string');
            }
            var parts = Array();
            for (var shift = 0; shift <= 24; shift += 8) {
                parts.push((value >> shift) & 0xFF);
            }
            return parts.reverse();
        }
        return null;
    };
    ;
    IPv4.isIPv4 = function (addr) {
        return this.parser(addr) !== null;
    };
    IPv4.isValid = function (string) {
        try {
            this.parse(string);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    IPv4.isValidFourPartDecimal = function (addr) {
        return (IPv4.isValid(addr) && ipv4Regexes.fourByte.test(addr));
    };
    IPv4.parse = function (addr) {
        var parts = this.parser(addr);
        if (parts === null) {
            throw new Error('ipaddr: string is not formatted like ip address');
        }
        return new this(parts);
    };
    ;
    IPv4.prototype.kind = function () {
        return 'ipv4';
    };
    IPv4.prototype.containedBy = function (arg) {
        if (arg instanceof Network) {
            return arg.contains(this);
        }
        // if (addr.kind() !== 'ipv4') {
        // 	throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
        // }
        // return matchCIDR(this.parts, addr.parts, 8, bits);
        // [addr, bits] = arg
        return matchCIDR(this.bytes, arg[0].bytes, arg[1], 8);
    };
    IPv4.prototype.range = function () {
        return subnetMatch(this, IPv4.SpecialRanges);
    };
    IPv4.prototype.toIPv4MappedAddress = function () {
        return new IPv6([
            0, 0, 0, 0, 0,
            0xFFFF,
            (this.bytes[0] << 8) | this.bytes[1],
            (this.bytes[2] << 8) | this.bytes[3]
        ]);
        // return IPv6.parse('::ffff:' + (this.toString()));
    };
    IPv4.prototype.prefixLengthFromSubnetMask = function () {
        return fromSubnetMask(this.bytes);
    };
    IPv4.prototype.toByteArray = function () {
        return this.bytes.slice();
    };
    IPv4.prototype.toNormalizedString = function () {
        return this.toString();
    };
    IPv4.prototype.toString = function () {
        return this.bytes.join('.');
    };
    IPv4.kind = 'ipv4';
    IPv4.bytes = 4;
    IPv4.SpecialRanges = {
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
    return IPv4;
}());
exports.IPv4 = IPv4;
;
var ipv6Part = "[0-9a-f]{1,4}";
var ipv6Colon = "(?:" + ipv6Part + "::?)+";
var zoneIndex = "%[0-9a-z]{1,}";
var ipv6Regexes = {
    zoneIndex: new RegExp(zoneIndex, 'i'),
    native: new RegExp("^(::)?(" + ipv6Colon + ")?(" + ipv6Part + ")?(::)?(" + zoneIndex + ")?$", 'i'),
    transitional: new RegExp(("^((?:" + ipv6Colon + ")|(?:::)(?:" + ipv6Colon + ")?)") +
        "(" + ipv4Total + ")" +
        ("(" + zoneIndex + ")?$"), 'i'),
};
var IPv6 = /** @class */ (function () {
    function IPv6(parts, zoneId) {
        var e_5, _a, e_6, _b;
        if (parts.length === 16) {
            this.bytes = parts;
            // this.parts = Array<number>(8) as IPv6Parts;
            // for (let i = 0; i <= 14; i += 2) {
            // 	this.parts.push((parts[i] << 8) | parts[i + 1]);
            // }
        }
        else if (parts.length === 8) {
            var bytes = Array();
            try {
                for (var parts_1 = __values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                    var part = parts_1_1.value;
                    bytes.push(part >> 8);
                    bytes.push(part & 0xFF);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            this.bytes = bytes;
            // this.parts = parts as IPv6Parts;
        }
        else {
            throw new Error('ipaddr: ipv6 part count should be 8 or 16');
        }
        try {
            for (var _c = __values(this.bytes), _d = _c.next(); !_d.done; _d = _c.next()) {
                var byte = _d.value;
                if (!(0 <= byte && byte <= 0xFF)) {
                    throw new Error('ipaddr: ipv6 byte should fit in 8 bits');
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
        this.zoneId = zoneId;
    }
    // TODO broadcastAddressFromCIDR(addr: string): IPv6
    // TODO subnetMaskFromPrefixLength(prefix: number): IPv6
    IPv6.parser = function (string) {
        /**
         * assert @param string is trim()
         * @param string - `(::)?([0-ffff]::?)+[0-ffff](::)?%zone`
         * @param partsCount - сколько частей (блоков) IP должно быть (для IPv6 transitional — 6, для обычного IPv6 — 8)
         */
        function expandIPv6(string, partsCount) {
            if (string.indexOf('::') !== string.lastIndexOf('::')) {
                return null;
            }
            var zoneId = (string.match(ipv6Regexes['zoneIndex']) || [undefined])[0];
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
            var colonCount = 0;
            var lastColon = -1;
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
            var replacementCount = partsCount - colonCount;
            var replacement = ':' + ('0:'.repeat(replacementCount));
            string = string.replace('::', replacement);
            if (string.substr(0, 1) === ':') {
                string = string.slice(1);
            }
            if (string.substr(-1, 1) === ':') {
                string = string.slice(0, -1);
            }
            var ref = string.split(':');
            var parts = Array();
            for (var k = 0, len = ref.length; k < len; k++) {
                var part = ref[k];
                parts.push(parseInt(part, 16));
            }
            return {
                parts: parts,
                zoneId: zoneId,
            };
        }
        if (ipv6Regexes.native.test(string)) {
            return expandIPv6(string, 8);
        }
        var match = string.match(ipv6Regexes.transitional);
        if (!match) {
            return null;
        }
        var zoneId = match[7] || '';
        var addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
        if (!addr) {
            return null;
        }
        var octets = IPv4.parser(match[2]);
        if (octets) {
            addr.parts.push((octets[0] << 8) | octets[1]);
            addr.parts.push((octets[2] << 8) | octets[3]);
        }
        return addr;
    };
    IPv6.isIPv6 = function (addr) {
        return this.parser(addr) !== null;
    };
    IPv6.isValid = function (string) {
        try {
            this.parse(string);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    ;
    IPv6.parse = function (string) {
        var addr = this.parser(string);
        if (!addr) {
            throw new Error('ipaddr: string is not formatted like ip address');
        }
        return new this(addr.parts, addr.zoneId);
    };
    ;
    IPv6.prototype.kind = function () {
        return 'ipv6';
    };
    IPv6.prototype.getParts = function () {
        if (this.parts) {
            return this.parts;
        }
        var parts = Array(8);
        for (var i = 0; i <= 14; i += 2) {
            parts.push((this.bytes[i] << 8) | this.bytes[i + 1]);
        }
        this.parts = parts;
        return parts;
    };
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
    IPv6.prototype.containedBy = function (arg) {
        if (arg instanceof Network) {
            return arg.contains(this);
        }
        // if (addr.kind() !== 'ipv6') {
        // 	throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one');
        // }
        // return matchCIDR(this.parts, addr.parts, 16, bits);
        // [addr, bits] = arg
        return matchCIDR(this.bytes, arg[0].bytes, arg[1], 8);
    };
    IPv6.prototype.range = function () {
        return subnetMatch(this, IPv6.SpecialRanges);
    };
    IPv6.prototype.isIPv4MappedAddress = function () {
        return this.range() === 'ipv4Mapped';
    };
    IPv6.prototype.toIPv4Address = function () {
        if (!this.isIPv4MappedAddress()) {
            throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
        }
        var _a = __read(this.getParts().slice(-2), 2), high = _a[0], low = _a[1];
        return new IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
    };
    IPv6.prototype.prefixLengthFromSubnetMask = function () {
        return fromSubnetMask(this.bytes);
    };
    IPv6.prototype.toByteArray = function () {
        // const bytes: number[] = [];
        // for (const part of this.parts) {
        // 	bytes.push(part >> 8);
        // 	bytes.push(part & 0xff);
        // }
        // return bytes;
        return this.bytes.slice();
    };
    IPv6.prototype.toNormalizedString = function () {
        var e_7, _a;
        var results = [];
        try {
            for (var _b = __values(this.getParts()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var part = _c.value;
                results.push(part.toString(16));
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        var addr = results.join(':');
        return "" + addr + (this.zoneId ? "%" + this.zoneId : "");
    };
    IPv6.prototype.toFixedLengthString = function () {
        var e_8, _a;
        var results = [];
        try {
            for (var _b = __values(this.getParts()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var part = _c.value;
                results.push(part.toString(16).padStart(4, '0'));
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
        var addr = results.join(':');
        return "" + addr + (this.zoneId ? "%" + this.zoneId : "");
    };
    IPv6.prototype.toString = function () {
        return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, '::');
    };
    IPv6.kind = 'ipv6';
    IPv6.bytes = 16;
    IPv6.SpecialRanges = {
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
    return IPv6;
}());
exports.IPv6 = IPv6;
;
function isValid(string) {
    return (IPv4.isValid(string) || IPv6.isValid(string));
}
exports.isValid = isValid;
function parse(string) {
    try {
        return IPv4.parse(string);
    }
    catch (e) {
        try {
            return IPv6.parse(string);
        }
        catch (e) {
            throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
        }
    }
}
exports.parse = parse;
/**
* @alias parseSubnet
* @param string `IPvFormat / cidrBits`
*/
function parseCIDR(string) {
    var match = string.match(/^(.+)\/(\d+)$/);
    if (!match) {
        throw new Error('ipaddr: string is not formatted like CIDR range');
    }
    var addr = parse(match[1]);
    var maskLength = parseInt(match[2]);
    return new Network(addr, maskLength);
}
exports.parseCIDR = parseCIDR;
exports.parseSubnet = parseCIDR;
function parseIPv4(string) {
    var addr = parse(string);
    if (isIPv6(addr)) {
        if (!addr.isIPv4MappedAddress()) {
            throw new Error('ipaddr: expected IPv4-mapped IPv6 address');
        }
        return addr.toIPv4Address();
    }
    else {
        return addr;
    }
}
exports.parseIPv4 = parseIPv4;
function fromByteArray(bytes) {
    switch (bytes.length) {
        case 4:
            return new IPv4(bytes);
        case 16:
            return new IPv6(bytes);
    }
    throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
}
exports.fromByteArray = fromByteArray;
function subnet(bytes, cidrBits) {
    return new Network(autoConstructor(bytes), cidrBits);
}
exports.subnet = subnet;
exports.network = subnet;
function toByteArray(string) {
    return parse(string).bytes;
}
exports.toByteArray = toByteArray;
function toString(bytes) {
    switch (bytes.length) {
        case 4:
            return IPv4.prototype.toString.call({ bytes: bytes });
        case 16:
            return IPv6.prototype.toString.call({ bytes: bytes, zoneId: undefined });
    }
    throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
}
exports.toString = toString;
var std = {
    parse: parse,
    parseCIDR: parseCIDR,
    parseIPv4: parseIPv4,
    fromByteArray: fromByteArray,
    subnet: subnet,
    toByteArray: toByteArray,
    toString: toString,
};
var safe;
(function (safe) {
    function parse(string) {
        try {
            return std.parse(string);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.parse = parse;
    function parseCIDR(string) {
        try {
            return std.parseCIDR(string);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.parseCIDR = parseCIDR;
    safe.parseSubnet = parseCIDR;
    function parseIPv4(string) {
        try {
            return std.parseIPv4(string);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.parseIPv4 = parseIPv4;
    function fromByteArray(bytes) {
        try {
            return std.fromByteArray(bytes);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.fromByteArray = fromByteArray;
    function subnet(bytes, cidrBits) {
        try {
            return std.subnet(bytes, cidrBits);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.subnet = subnet;
    safe.network = subnet;
    function toByteArray(string) {
        try {
            return std.toByteArray(string);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.toByteArray = toByteArray;
    function toString(bytes) {
        try {
            return std.toString(bytes);
        }
        catch (e) {
            return undefined;
        }
    }
    safe.toString = toString;
})(safe = exports.safe || (exports.safe = {}));
