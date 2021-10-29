const {equal, deepEqual, ok} = require("assert");
const OrbitsTimer = require("../../index");

describe("OrbitsTimer#interval", () => {

	it("Triggers 'interval' (no anchor)", () => {

		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });

		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

		const results = [];

		const expectedIntervalResult = [0,3,6,9];

		timer.interval(3, (state, cancel) => {
			results.push(state.now);
		});

		for(let now of flow) {
			timer.handleState(timer.state = timer.getState(now));
		}
		
		deepEqual(expectedIntervalResult, results);

	});


	it("Triggers 'interval' (with base)", () => {

		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });

		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

		const results = [];

		const expectedIntervalResult = [2,5,8];

		timer.interval({
			base:     2,
			interval: 3
		}, (state, cancel) => {
			results.push(state.now);
		});

		for(let now of flow) {
			timer.handleState(timer.state = timer.getState(now));
		}
		
		deepEqual(expectedIntervalResult, results);

	});




});


