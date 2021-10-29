const { ok, equal } = require("assert");
const OrbitsTimer = require("../../index");

describe("timer.getState", () => {

	it("Computes state as expected at speed 1", () => {
		
		const n = 0;
		const timer = new OrbitsTimer({now: n, anchor: n});

		const {now, delta, rel_now, rel_delta} = timer.state;
		
		const expected_state_flow = [
			[ 0, 0, 0, 0 ],
			[ 1, 1, 1, 1 ],
			[ 2, 1, 2, 1 ],
			[ 3, 1, 3, 1 ],
			[ 4, 1, 4, 1 ],
			[ 5, 1, 5, 1 ],
			[ 6, 1, 6, 1 ],
			[ 7, 1, 7, 1 ],
			[ 8, 1, 8, 1 ],
			[ 9, 1, 9, 1 ],
		];

		let state;
		for(let [now, delta, rel_now, rel_delta] of expected_state_flow){
			state = timer.state = timer.getState(now);
			equal(now,       state.now);
			equal(delta,     state.delta);
			equal(rel_now,   state.rel_now);
			equal(rel_delta, state.rel_delta);
			// timer.state = state;
		}
	});

	it("Computes state as expected at speed 2", () => {
		
		const n = 0;
		const timer = new OrbitsTimer({now: n, anchor: n, speed: 2});

		const {now, delta, rel_now, rel_delta} = timer.state;
		
		const expected_state_flow = [
			[ 0, 0, 0,     0 ],
			[ 1, 1, 1 * 2, 2 ],
			[ 2, 1, 2 * 2, 2 ],
			[ 3, 1, 3 * 2, 2 ],
			[ 4, 1, 4 * 2, 2 ],
			[ 5, 1, 5 * 2, 2 ],
			[ 6, 1, 6 * 2, 2 ],
			[ 7, 1, 7 * 2, 2 ],
			[ 8, 1, 8 * 2, 2 ],
			[ 9, 1, 9 * 2, 2 ],
		];

		let state;
		for(let [now, delta, rel_now, rel_delta] of expected_state_flow){
			state = timer.state = timer.getState(now);
			equal(now,       state.now);
			equal(delta,     state.delta);
			equal(rel_now,   state.rel_now);
			equal(rel_delta, state.rel_delta);
		}
	});

});


