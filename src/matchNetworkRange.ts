import Network from './Network';
import matchNetwork from './utils/matchNetwork';
import type { IPvClass } from './types';

export type { IPv4Range, IPv6Range } from './types';

export type RangeItem = [IPvClass | number[], number] | Network;
export type RangeList<T extends string> = {
	[K in T]: RangeItem[];
};

/**
 * Typescript identity function, it doesn't "do anything" at runtime, just helps guide type inference at compile time.
 * Use it to defeat type widening.
 * @param rangeList
 * @returns {Object} `rangeList`.
 */
export function createRangeList<T extends string>(rangeList: RangeList<T>): RangeList<T> {
	return rangeList;
}

/**
 * Iterates over `rangeList` and returns first matching network for given `addr`.
 * @param {(IPvClass | number[])} addr ip address: `IP` instance of array of bytes (length = 4, 16) (*assumes correct*).
 * @param {Object.<string, ([IPvClass | number[], number] | Network)[]>} rangeList object: keys represent range, values are an array of items, which can be either `Network` instance or [`IP` instance or array of bytes (*assumes correct*), netmask length (*assumes integer*)].
 * @returns {string} matching range name, or 'unicast'.
 * @example
 * matchNetworkRange(new IPv4([192, 168, 11, 5]), {
 *     private: [
 *         [[10, 0, 0, 0], 8],
 *         new Network([172, 16, 0, 0], 12),
 *         new Network([192, 168, 0, 0], 16),
 *     ],
 *     reserved: [
 *         [[192, 0, 0, 0], 24],
 *         [[192, 0, 2, 0], 24],
 *         [[192, 88, 99, 0], 24],
 *         [[198, 51, 100, 0], 24],
 *         [[203, 0, 113, 0], 24],
 *         [[240, 0, 0, 0], 4],
 *     ]
 * })
 * // => 'private'
 */
export default function matchNetworkRange<T extends string>(
	addr: IPvClass | number[],
	rangeList: RangeList<T>
): T | 'unicast';
/**
 * Iterates over `rangeList` and returns first matching network for given `addr`.
 * @param {(IPvClass | number[])} addr ip address: `IP` instance of array of bytes (length = 4, 16) (*assumes correct*).
 * @param {Object.<string, ([IPvClass | number[], number] | Network)[]>} rangeList object: keys represent range, values are an array of items, which can be either `Network` instance or [`IP` instance or array of bytes (*assumes correct*), netmask length (*assumes integer*)].
 * @param {string} defaultName default range name, if no match found.
 * @returns {string} matching range name, or `defaultName`.
 * @example
 * matchNetworkRange(new IPv4([192, 168, 27, 5]), {
 *     private: [
 *         [[10, 0, 0, 0], 8],
 *         new Network([172, 16, 0, 0], 12),
 *         new Network([192, 168, 0, 0], 16),
 *     ],
 *     reserved: [
 *         [[192, 0, 0, 0], 24],
 *         [[192, 0, 2, 0], 24],
 *         [[192, 88, 99, 0], 24],
 *         [[198, 51, 100, 0], 24],
 *         [[203, 0, 113, 0], 24],
 *         [[240, 0, 0, 0], 4],
 *     ]
 * }, 'my-private')
 * // => 'my-private'
 */
export default function matchNetworkRange<T extends string, D extends string>(
	addr: IPvClass | number[],
	rangeList: RangeList<T>,
	defaultName: D
): T | D;
/**
 * Iterates over `rangeList` and returns first matching network for given `addr`.
 * @param {(IPvClass | number[])} addr ip address: `IP` instance of array of bytes (length = 4, 16) (*assumes correct*).
 * @param {Object.<string, ([IPvClass | number[], number] | Network)[]>} rangeList object: keys represent range, values are an array of items, which can be either `Network` instance or [`IP` instance or array of bytes (*assumes correct*), netmask length (*assumes integer*)].
 * @param {string} [defaultName=unicast] default range name, if no match found (default = unicast).
 * @returns {string} matching range name, or defaultName, or 'unicast'.
 */
export default function matchNetworkRange<T extends string, D extends string>(
	addr: IPvClass | number[],
	rangeList: RangeList<T>,
	defaultName?: D
) {
	const bytes = (addr instanceof Array ? addr : addr.bytes);
	for (const rangeName in rangeList) {
		const rangeNetworks = rangeList[rangeName];
		for (let i = rangeNetworks.length - 1; i >= 0; --i) {
			const network = rangeNetworks[i];
			// network.contains(addr)
			let ret = network instanceof Array ?
				matchNetwork(bytes, network[0] instanceof Array ? network[0] : network[0].bytes, network[1]) :
				matchNetwork(bytes, network.addr.bytes, network.prefix);
			if (ret) {
				return rangeName as T;
			}
		}
	}
	return typeof defaultName === 'undefined' ?
		'unicast' as const :
		defaultName;
}