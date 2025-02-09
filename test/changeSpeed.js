const {equal, deepEqual, ok} = require("assert");
const OrbitsTimer = require("../index");

describe("OrbitsTimer#set", () => {

	it("Triggers 'relTransition' and change speed", () => {
		const timer = new OrbitsTimer({ now: 0, anchor: 0, rel_now: 0, rel_start: 0, speed: 1 });
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = [];
		const expectedTransitionResult = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,7],[6,10]];
		timer.relTransition(8, (state, value, cancel) => {
			results.push([state.now, state.rel_now])
			if(state.now === 4) timer.set({speed: 3});
		});
		for(let now of flow) timer.handleState(timer.state = timer.getState(now));
		deepEqual(expectedTransitionResult, results);
	});


});


