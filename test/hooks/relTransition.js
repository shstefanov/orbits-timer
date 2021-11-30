const {equal, deepEqual, ok} = require("assert");
const OrbitsTimer = require("../../index");

describe("OrbitsTimer#relTransition", () => {

	it("Triggers 'relTransition' (duration only)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = [];
		const expectedTransitionResult = [[0,0],[1,0.125],[2,0.25],[3,0.375],[4,0.5],[5,0.625],[6,0.75],[7,0.875],[8,1],[9,1],[10,1]];
		timer.relTransition(8, (state, value, cancel) => results.push([state.now, value]));
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(expectedTransitionResult, results);
	});

	it("Triggers 'relTransition' (start, end, speed: 3)", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 3 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
		const results = [];
		const expectedTransitionResult = [[0,0],[1,0],[2,0],[3,0],[4,0.5],[5,1],[6,1.5],[7,2],[8,2],[9,2],[10,2],[11,2]];
		timer.relTransition({start: 9, duration: 12, timing_function: x => x * 2}, (state, value, cancel) => {
			results.push([state.now, value]);
		});
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(expectedTransitionResult, results);
	});

});


