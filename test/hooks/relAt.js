const {equal, deepEqual, ok} = require("assert");
const OrbitsTimer = require("../../index");

describe("OrbitsTimer#relAt", () => {

	it("Triggers 'relAt' at spped 1", () => {

		const timer = new OrbitsTimer({
			now:       0,
			anchor:    0,
			rel_now:   0,
			rel_start: 0,
			speed:     1,
		});

		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

		const results = flow.map(a => false);

		const expectedResults = [
			false, false, false,
			false, true,  false,
			false, false, false,
			true,  false
		];

		timer.relAt(4, state => { results[state.now] = true; });
		timer.relAt(9, state => { results[state.now] = true; });

		for(let now of flow) timer.handleState(timer.getState(now));

		deepEqual(expectedResults, results);

	});


	it("Triggers 'relAt' at spped 7", () => {

		const timer = new OrbitsTimer({
			now:       0,
			anchor:    0,
			rel_now:   0,
			rel_start: 0,
			speed:     7,
		});

		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

		const results = flow.map(a => false);

		const expectedResults = [
			false, false, true,
			false, false, true,
			false, false, false,
			false, false
		];

		timer.relAt(14, state => { results[state.now] = true; });
		timer.relAt(35, state => { results[state.now] = true; });

		for(let now of flow) timer.handleState(timer.getState(now));
		
		deepEqual(expectedResults, results);

	});

});




