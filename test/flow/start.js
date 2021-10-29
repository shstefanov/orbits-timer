const { equal, deepEqual, ok } = require("assert");
const OrbitsTimer = require("../../index");

describe("Start/stop timer", () => {

	it("Starts timer", function(done){
		this.timeout(7000);
		const timer = new OrbitsTimer();
		const now = timer.state.now;
		let d = 0;
		timer.interval(1350, (state, cancel) => {
			d++;
			if(d === 5) {
				cancel();
				setTimeout(() => {
					ok(timer.state.now - now >= 4 * 1350);
					ok(timer.state.now - now <= 5 * 1350);
					done();					
				}, 0 );
			}
		});
		timer.start();
	});

});