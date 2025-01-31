const {equal, deepEqual, ok} = require("assert");
const OrbitsTimer = require("../../index");

describe("OrbitsTimer#relInterval", () => {

	it("Triggers 'relInterval' at speed 1 (no base)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = [];
		const expectedIntervalResult = [0,3,6,9];
		timer.relInterval(3, (state, cancel) => results.push(state.now));
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual( results, expectedIntervalResult );
	});

	it("Triggers 'relInterval' at speed 1 (with positive small base)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = [];
		const expectedIntervalResult = [2,5,8];
		timer.relInterval({
			base:     2 + 3 * Math.round((Math.random() - 0.5) * 200),
			interval: 3
		}, (state, cancel) => {
			results.push(state.now);
		});
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(results, expectedIntervalResult);
	});

	it("Triggers 'relInterval' at speed 1 (with negative small base)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = [];
		const expectedIntervalResult = [2,5,8];
		timer.relInterval({
			base:     -1,
			interval:  3,
		}, (state, cancel) => {
			results.push(state.now);
		});
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(results, expectedIntervalResult);
	});

	it("Triggers 'relInterval' at speed 5 (no base)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 5 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = [];
		const expectedIntervalResult = [ 0, 2, 4, 6, 8, 10 ];
		timer.relInterval(10, (state, cancel) => results.push(state.now));
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(expectedIntervalResult, results);
	});

	it("Triggers 'relInterval' at speed 5 (with base)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 2 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23 ];
		const results = [];
		const expectedIntervalResult = [ 2, 7, 13, 18 ];
		timer.relInterval({ base: 3, interval: 11 }, (state, cancel) => results.push(state.now));
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(expectedIntervalResult, results);
	});

});


