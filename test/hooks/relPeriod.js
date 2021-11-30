const {equal, deepEqual, ok} = require("assert");
const OrbitsTimer = require("../../index");

describe("OrbitsTimer#relPeriod", () => {

	it("Triggers 'relPeriod'", () => {

		const timer = new OrbitsTimer({
			now:       0,
			anchor:    0,
			rel_now:   0,
			rel_start: 0,
			speed:     1,
		});

		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

		const results = flow.map(a => false);

		const expectedperiod4Result = [0,0.25,0.5,0.75,0,0.25,0.5,0.75,0,0.25,0.5];

		const period4Result = [];

		timer.relPeriod(4, (state, value, cancel) => period4Result.push(value));

		for(let now of flow) timer.handleState(timer.getState(now));
		
		deepEqual(expectedperiod4Result, period4Result);

	});

	it("Triggers 'relPeriod' with base on specific moment", () => {
		const timer = new OrbitsTimer({
			now:       0,
			anchor:    0,
			rel_now:   0,
			rel_start: 0,
			speed:     1,
		});
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = flow.map( a => false );
		const expectedperiod4Result = [0.25,0.5,0.75,0,0.25,0.5,0.75,0,0.25,0.5,0.75];
		const period4Result = [];
		const period7Result = [];
		timer.relPeriod({period: 4, base: 3}, (state, value, cancel) => period4Result.push(value));
		for(let now of flow) timer.handleState(timer.getState(now));
		deepEqual(expectedperiod4Result, period4Result);
	});



	it("Triggers 'relPeriod' (time speed 3)", () => {

		const timer = new OrbitsTimer({
			now:       0,
			anchor:    0,
			rel_now:   0,
			rel_start: 0,
			speed:     3,
		});

		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

		const results = flow.map(a => false);

		const expectedperiod4Result = 	[0,0.75,0.5,0.25,0,0.75,0.5,0.25,0,0.75,0.5];

		const period4Result = [];

		timer.relPeriod(4, (state, value, cancel) => period4Result.push(value));
		for(let now of flow) timer.handleState(timer.getState(now));
		deepEqual(expectedperiod4Result, period4Result);

	});

	it("Triggers 'relPeriod' (time speed 3) with base on specific moment", () => {
		const timer = new OrbitsTimer({
			now:       0,
			anchor:    0,
			rel_now:   0,
			rel_start: 0,
			speed:     3,
		});
		const flow = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		const results = flow.map( a => false );
		const expectedperiod4Result = [0.25,0,0.75,0.5,0.25,0,0.75,0.5,0.25,0,0.75];
		const period4Result = [];
		const period7Result = [];
		timer.relPeriod({period: 4, base: 3}, (state, value, cancel) => period4Result.push(value));
		for(let now of flow) timer.handleState(timer.getState(now));
		deepEqual(expectedperiod4Result, period4Result);
	});

});


