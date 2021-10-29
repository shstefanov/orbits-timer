var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

let raf;
if (isBrowser()) raf = (() => window.requestAnimationFrame )();
else             raf = (fn) => setTimeout(fn, fn.baseInterval || 0);

function error(msg){ throw new Error(msg); }

const defaultOptions = {
	rel_start: 0,
	rel_speed: 1,
	rel_anchor: 0,
}

let tmp_default_anchor;

class Timer {

	constructor({
		rel_now     = 0,
		rel_start   = 0,
		speed       = 1,
		anchor      = (tmp_default_anchor = Date.now()),
		// Setting now value here should help testing and some special cases
		now         = tmp_default_anchor
	} = {} ){
		
		this.options = {
			rel_start,
			speed,
			anchor,
			rel_anchor: rel_now,
		};

		this.state = {
			now: now,
			delta: 0,
			rel_now,
			rel_delta: 0,
		};

		this.reset();
	}

	getState(current_now = Date.now()){
		const {anchor, rel_anchor, speed, rel_start} = this.options;
		const {now, rel_now} = this.state;
		const delta = current_now - now;
		const after_anchor = current_now - anchor;
		const after_rel_anchor = after_anchor * speed;
		const before_rel_anchor = rel_anchor - rel_start;
		const new_rel_now = before_rel_anchor + after_rel_anchor;

		return {
			delta:     current_now - now,
			rel_delta: new_rel_now - rel_now,
			now:       current_now,
			rel_now:   new_rel_now,
		}

		// console.log({now})
	}

	handleState(state){
		this.handleAt(state);
		this.handlePeriods(state);
		this.handleTransitions(state);
		this.handleIntervals(state);
	}




























	reset(){
		// this.started = false;
		this.ats         = new Map();
		this.periods     = new Map();
		this.transitions = new Map();
		this.intervals   = new Map();
		this.immediates = new Set();
		// this.speedChangeRequest = null;

		this.relIntervals = new Set();
		this.relPeriods = new Set();
		this.relAts = new Set();
	}

	// tick(now){
		
	// }

	// start(baseInterval){

	// 	this.started = true;

	// 	let now = Date.now();
	// 	let rel_now = this.options.rel_now;

	// 	this.state = {
	// 		now, rel_now,

	// 		anchor: now,

	// 		delta: 0,
	// 		rel_delta: 0,

	// 		rel_start: this.options.rel_start,
	// 		rel_speed: this.options.rel_speed,
	// 		rel_anchor: this.options.rel_anchor,
	// 	};

	// 	const run = () => {

	// 		if(!this.started) return;

	// 		const prev = now;
	// 		const new_now = Date.now();
	// 		const delta  = new_now - prev;

	// 		const {
	// 			rel_start,
	// 			rel_speed,
	// 			rel_anchor,
	// 		} = this.options;

	// 		const { anchor } = this.state;

	// 		if(delta < run.baseInterval) return raf(run);


	// 		const before_anchor = rel_anchor - rel_start;
	// 		const after_anchor = (new_now - anchor) * rel_speed;
	// 		const rel_new_now = rel_anchor + after_anchor;
	// 		const rel_delta = rel_new_now - rel_now;
	// 		now = new_now;
	// 		rel_now = rel_new_now;
	// 		this.prev_state = this.state;
	// 		const time = this.state = {
	// 			now, delta, anchor,

	// 			rel_now, rel_delta, rel_anchor,

	// 			rel_start, rel_speed // From options
	// 		};

	// 		// console.log((new Date(this.state.rel_now)).toISOString());

	// 		if(rel_delta < 0) console.log("tick deffect: ", rel_delta)

	// 		// Absolute time events
	// 		this.handleAt(time);
	// 		this.handleImmediates(time);
	// 		this.handleIntervals(time);
	// 		this.handlePeriods(time);
	// 		if(this.handleTimeSpeedChange(time)){
	// 			if(rel_delta > 0){
	// 				this.handleRelAts(time);
	// 				this.handleRelIntervals(time);
	// 				this.handleRelPeriods(time);
	// 			}
	// 		}


	// 		raf(run);
	// 	}
	// 	run.baseInterval = baseInterval;
	// 	raf(run);
	// }

	// stop(){
	// 	this.started = false;
	// 	this.state = {};
	// 	this.reset();
	// }


	// Hooks

	at(timestamp, fn){
		if(timestamp < this.state.now) return;
		this.ats.set(fn, {
			at:     timestamp,
			cancel: this.removeAt.bind(this, fn),
		});
	}

	removeAt(fn){
		this.ats.delete(fn);
	}

	handleAt(state){
		const {now} = state;
		for(let [fn] of this.ats.entries()){
			const t = this.ats.get(fn);
			if(now >= t.at){
				this.removeAt(fn);
				fn(state);
			}
		}
	}




	period(period, fn){
		const t = typeof period === "number"
		? 	{
				period,
				offset: 0,
				cancel: this.removePeriod.bind(this, fn),
			}
		: 	{
				period: period.period,
				offset: period.base,
				cancel: this.removePeriod.bind(this, fn),
			};
		this.periods.set(fn, t);
	}

	removePeriod(fn){
		this.periods.delete(fn);
	}

	handlePeriods(state){
		const {now} = state;
		for(let [fn] of this.periods.entries()){
			const t = this.periods.get(fn);
			const time_base = now - t.offset;
			const period = t.period;
			const phase = (
				time_base >= 0
					? ( time_base % period)
					: ( (period - 1) + (( time_base + 1 ) % period))
				) / period;
			fn(state, phase, t.cancel);
		}
	}





	transition(duration, fn){
		// const now = Date.now();
		let start, end, dur, timing_function;
		if(typeof duration === "number"){
			dur             = duration;
			start           = this.state.now;
			end             = start + duration;
			timing_function = Timer.LINEAR;
		}
		else{
			start = typeof duration.start === "number" ? duration.start : now;
			dur = duration.duration
			end = start + dur;
			timing_function = duration.timing_function || Timer.LINEAR;
		}

		const t = {
			start, end, duration: dur, timing_function,
			cancel: this.removeTransition.bind(this, fn),
		}
		this.transitions.set(fn, t);
	}


	removeTransition(fn){
		this.transitions.delete(fn);
	}


	handleTransitions(state){
		const { now } = state;
		for(let [fn] of this.transitions.entries()){
			const t = this.transitions.get(fn);
			const { start, end, duration, cancel } = t;
			const path = (state.now - t.start) / t.duration;
			if(path < 0) continue;
			if(path >= 1){
				fn(state, t.timing_function(1), t.cancel);
				this.removeTransition(fn);
			}
			else{
				fn(state, t.timing_function(path), t.cancel);
			}
		}
	}






	interval(interval, fn){
		const t = typeof interval === "number"
		? {
			last_call:  this.state.now - interval,
			anchor:     0,
			interval:   interval,
			cancel:     this.removeInterval.bind(this, fn),
		}
		: {
			last_call:  interval.base - interval.interval,
			anchor:     interval.base,
			interval:   interval.interval,
			cancel:     this.removeInterval.bind(this, fn),
		};
		this.intervals.set(fn, t);
	}

	removeInterval(fn){
		this.intervals.delete(fn);
	}

	handleIntervals(state){
		const { now } = state;
		for(let [fn] of this.intervals.entries()){
			const t = this.intervals.get(fn);
			const c = ( now - t.last_call) / t.interval;
			if(c >= 1){
				t.last_call += t.interval;
				fn(this.getState(t.last_call), t.cancel);
			}
		}
	}










	// Affects only relative time flow
	setRelSpeed(rel_speed, starting_at, cb){
		this.speedChangeRequest = {
			rel_speed, starting_at, cb
		};
	}


	relPeriod(period, fn){
		fn.time = {
			period,
			cancel: this.removeRelPeriod.bind(this, fn),
		};
		this.relPeriods.add(fn);
		return fn;
	}

	removeRelPeriod(fn){
		this.relPeriods.delete(fn);
	}

	relAt(timestamp, fn){
		if(timestamp < this.state.rel_now) return;
		fn.time = {
			at: timestamp,
			cancel: this.removeRelAt.bind(this, fn),
		};
		this.relAts.add(fn);
		return fn;
	}

	removeRelAt(fn){
		this.relAts.delete(fn);
	}

}



const { sin, cos, pow, sqrt, PI } = Math;

Timer.LINEAR            = x => x;
Timer.EASE_IN_SINE      = x => 1 - cos((x * PI) / 2);
Timer.EASE_OUT_SINE     = x => 1 - sin((x * PI) / 2);
Timer.EASE_IN_OUT_SINE  = x => -(cos(PI * x) - 1) / 2;
Timer.EASE_IN_QUAD      = x => x * x;
Timer.EASE_OUT_QUAD     = x => 1 - (1 - x) * (1 - x);
Timer.EASE_IN_OUT_QUAD  = x => x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
Timer.EASE_IN_CUBIC     = x => x * x * x;
Timer.EASE_OUT_CUBIC    = x => 1 - pow(1 - x, 3);
Timer.EASE_IN_OUT_CUBIC = x => x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
Timer.EASE_IN_QUART     = x => x * x * x * x;
Timer.EASE_OUT_QUART    = x => 1 - pow(1 - x, 4);
Timer.EASE_IN_OUT_QUART = x => x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
Timer.EASE_IN_QUINT     = x => x * x * x * x * x;
Timer.EASE_OUT_QUINT    = x => 1 - pow(1 - x, 5);
Timer.EASE_IN_OUT_QUINT = x => x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
Timer.EASE_IN_EXPO      = x => x === 0 ? 0 : pow(2, 10 * x - 10);
Timer.EASE_OUT_EXPO     = x => x === 1 ? 1 : 1 - pow(2, -10 * x);
Timer.EASE_IN_OUT_EXPO  = x => x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2;

Timer.EASE_IN_CIRC      = x => 1 - sqrt(1 - pow(x, 2));
Timer.EASE_OUT_CIRC     = x => sqrt(1 - pow(x - 1, 2));
Timer.EASE_IN_OUT_CIRC  = x => x < 0.5 ? (1 - sqrt(1 - pow(2 * x, 2))) / 2 : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;

Timer.EASE_IN_BACK      = x => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return c3 * x * x * x - c1 * x * x;
}
Timer.EASE_OUT_BACK     = x => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
}
Timer.EASE_IN_OUT_BACK  = x => {
	const c1 = 1.70158;
	const c2 = c1 * 1.525;
	return x < 0.5
	  ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
	  : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

Timer.EASE_IN_ELASTIC   = x => {
	const c4 = (2 * PI) / 3;
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
}
Timer.EASE_OUT_ELASTIC  = x => {
	const c4 = (2 * PI) / 3;
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
}
Timer.EASE_IN_OUT_ELASTIC   = x => {
	const c5 = (2 * PI) / 4.5;
	return x === 0
	  ? 0
	  : x === 1
	  ? 1
	  : x < 0.5
	  ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
	  : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
}


Timer.EASE_IN_BOUNCE   = x => 1 - Timer.EASE_OUT_BOUNCE(1 - x);
Timer.EASE_OUT_BOUNCE  = x => {
	const n1 = 7.5625;
	const d1 = 2.75;

	if (x < 1 / d1) {
	    return n1 * x * x;
	} else if (x < 2 / d1) {
	    return n1 * (x -= 1.5 / d1) * x + 0.75;
	} else if (x < 2.5 / d1) {
	    return n1 * (x -= 2.25 / d1) * x + 0.9375;
	} else {
	    return n1 * (x -= 2.625 / d1) * x + 0.984375;
	}
}
Timer.EASE_IN_OUT_BOUNCE   = x => {
	return x < 0.5
	? (1 - Timer.EASE_OUT_BOUNCE(1 - 2 * x)) / 2
	: (1 + Timer.EASE_OUT_BOUNCE(2 * x - 1)) / 2;
}








module.exports = Timer;