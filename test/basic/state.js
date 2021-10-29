const { ok, equal } = require("assert");
const OrbitsTimer = require("../../index");

describe("timer.state", () => {

	describe("default state", () => {
		const now = Date.now();
		const timer = new OrbitsTimer({now});
		it("has default state.now",        () => ok("now"        in timer.state));
		it("has default state.delta",      () => ok("delta"      in timer.state));
		it("has default state.rel_now",    () => ok("rel_now"    in timer.state));
		it("has default state.rel_delta",  () => ok("rel_delta"  in timer.state));
	});

	describe("default state values", () => {
		const now = Date.now();
		const timer = new OrbitsTimer({now});
		it("state.now equals to expected value",        () => equal(now , timer.state.now));
		it("state.delta equals to expected value",      () => equal(0,    timer.state.delta));
		it("state.rel_now equals to expected value",    () => equal(0,    timer.state.rel_now));
		it("state.rel_delta equals to expected value",  () => equal(0,    timer.state.rel_delta));
	});

	describe("options state values", () => {
		const now = Date.now();
		const timer = new OrbitsTimer({
			now,
			rel_now: -1000,
			rel_start: -1000,
			speed: 3,
			anchor: Date.now() - 500,
		});
		it("state.now equals to expected value",        () => equal(now ,  timer.state.now));
		it("state.delta equals to expected value",      () => equal(0,     timer.state.delta));
		it("state.rel_now equals to expected value",    () => equal(-1000, timer.state.rel_now));
		it("state.rel_delta equals to expected value",  () => equal(0,     timer.state.rel_delta));
	});


});


