const {equal} = require("assert");
const OrbitsTimer = require("../../index");

describe("OrbitsTimer#constructor", () => {

	describe("default options", () => {
		const now = Date.now();
		const timer = new OrbitsTimer({now, anchor: now});
		it("has default option rel_start with expected value", () => equal(timer.options.rel_start, 0));
		it("has default option speed with expected value",     () => equal(timer.options.speed, 1));
		it("has default option anchor with expected value",    () => equal(timer.options.anchor, now));
	});

	describe("constructor options", () => {
		const now = Date.now() - 500;
		const timer = new OrbitsTimer({
			now,
			anchor:    now - 500,
			rel_now:   -1000,
			rel_start: -1000,
			speed:     3,
		});
		it("has option rel_start with expected value", () => equal(timer.options.rel_start, -1000));
		it("has option speed with expected value",     () => equal(timer.options.speed, 3));
		it("has option anchor with expected value",    () => equal(timer.options.anchor, now - 500));
	});

});




