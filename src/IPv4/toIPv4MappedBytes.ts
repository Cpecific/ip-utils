
/**
 * Converts IPv4 array of `bytes` into IPv6 array of bytes in "ipv4Mapped" special range.
 * @utility
 * @param {number[]} bytes ip address: array of bytes (length = 4) (*assumes correct*).
 * @returns {number[]} IPv6 array of bytes in "ipv4Mapped" special range.
 * @example
 * IPv4_toIPv4MappedBytes([192, 168, 11, 5])
 * // => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 192, 168, 11, 5]
 */
export default function IPv4_toIPv4MappedBytes(bytes: number[]): number[] {
	return [
		0, 0, 0, 0, 0,
		0, 0, 0, 0, 0,
		0xFF, 0xFF,
		bytes[0] << 8, bytes[1],
		bytes[2] << 8, bytes[3]
	];
}