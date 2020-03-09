import { createRangeList } from '../matchNetworkRange';

export default createRangeList({
	unspecified: [
		[[0, 0, 0, 0], 8],
	],
	broadcast: [
		[[255, 255, 255, 255], 32],
	],
	multicast: [
		[[224, 0, 0, 0], 4],
	],
	linkLocal: [
		[[169, 254, 0, 0], 16],
	],
	loopback: [
		[[127, 0, 0, 0], 8],
	],
	carrierGradeNat: [
		[[100, 64, 0, 0], 10],
	],
	private: [
		[[10, 0, 0, 0], 8],
		[[172, 16, 0, 0], 12],
		[[192, 168, 0, 0], 16],
	],
	reserved: [
		[[192, 0, 0, 0], 24],
		[[192, 0, 2, 0], 24],
		[[192, 88, 99, 0], 24],
		[[198, 51, 100, 0], 24],
		[[203, 0, 113, 0], 24],
		[[240, 0, 0, 0], 4],
	]
});