var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

let raf;
if (isBrowser()) raf = (() => window.requestAnimationFrame )();
else             raf = (fn) => setTimeout(fn, fn.baseInterval || 0);

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
		this.handleRelAt(state);
		this.handleRelIntervals(state);
		this.handleRelPeriods(state);
		this.handleRelTransitions(state);
	}



	start(min_step=40, tick_fn = raf){
		if(this.tick) return;
		let now = Date.now();
		const state = this.getState(now);
		this.handleState(state);
		this.state = state;
		this.tick = () => {
			const new_now = Date.now();
			const delta = new_now - now;
			if(delta >= min_step){
				const state = this.getState(new_now);
				this.handleState(state);
				this.state = state;
				now = new_now;
			}
			this.tick && tick_fn(this.tick);
		}
		this.tick.baseInterval = min_step;
		tick_fn(this.tick);
	}

	stop(){
		delete this.tick;
	}


	set({
		speed      = 1,
		anchor     = this.state.now,
		rel_anchor = this.state.rel_now
	} = {}){
		this.options = {
			rel_start: this.options.rel_start,
			speed,
			anchor,
			rel_anchor,
		};
	}




















	reset(){
		// this.started = false;
		this.ats           = new Map();
		this.intervals     = new Map();
		this.periods       = new Map();
		this.transitions   = new Map();

		this.relAts         = new Map();
		this.relIntervals   = new Map();
		this.relPeriods     = new Map();
		this.relTransitions = new Map();
	}

	// Hooks

	at(timestamp, fn){
		if(timestamp < this.state.now) return;
		let t = {
			at:     timestamp,
			cancel: this.removeAt.bind(this, fn),
		};
		this.ats.set(fn, t);
		return t;
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
				offset: this.state.now,
				cancel: this.removePeriod.bind(this, fn),
			}
		: 	{
				period: period.period,
				offset: period.base,
				cancel: this.removePeriod.bind(this, fn),
			};
		this.periods.set(fn, t);
		return t;
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
			start = typeof duration.start === "number" ? duration.start : this.state.now;
			dur = duration.duration
			end = start + dur;
			timing_function = duration.timing_function || Timer.LINEAR;
		}

		const t = {
			start, end, duration: dur, timing_function,
			cancel: this.removeTransition.bind(this, fn),
		}
		this.transitions.set(fn, t);
		return t;
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
		return t;
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
				t.last_call = state.now;
				fn(state, t.cancel);
			}
		}
	}





	// Relative time hooks


	relAt(timestamp, fn){
		if(timestamp < this.state.rel_now) return;
		let t = {
			at:     timestamp,
			cancel: this.removeRelAt.bind(this, fn),
		};
		this.relAts.set(fn, t);
		return t;
	}

	removeRelAt(fn){
		this.relAts.delete(fn);
	}

	handleRelAt(state){
		const {rel_now} = state;
		for(let [fn] of this.relAts.entries()){
			const t = this.relAts.get(fn);
			if(rel_now >= t.at){
				this.removeRelAt(fn);
				fn(state);
			}
		}
	}








	relInterval(interval, fn){
		const t = typeof interval === "number"
		? {
			// last_call:  this.state.rel_now - interval,
			offset:     0,
			base:       0,
			interval:   interval,
			cancel:     this.removeRelInterval.bind(this, fn),
		}
		: {
			// last_call:  interval.base,
			offset:     this.state.rel_now - interval.base,
			base:       interval.base,
			interval:   interval.interval,
			cancel:     this.removeRelInterval.bind(this, fn),
		};

		t.last_call = null;

		this.relIntervals.set(fn, t);
		return t;
	}

	removeRelInterval(fn){
		this.relIntervals.delete(fn);
	}

	handleRelIntervals(state){
		const { rel_now } = state;
		for(let [fn] of this.relIntervals.entries()){
			const t = this.relIntervals.get(fn);
			const c = rel_now - t.base;
			const l = c - ( c % t.interval) + t.base;
			if(l !== t.last_call){
				t.last_call = l;
				fn(state, t.cancel);
			}
		}
	}



	relPeriod(period, fn){
		const t = typeof period === "number"
		? 	{
				period,
				offset: this.state.rel_now,
				cancel: this.removeRelPeriod.bind(this, fn),
			}
		: 	{
				period: period.period,
				offset: period.base,
				cancel: this.removeRelPeriod.bind(this, fn),
			};
		this.relPeriods.set(fn, t);
		return t;
	}

	removeRelPeriod(fn){
		this.relPeriods.delete(fn);
	}

	handleRelPeriods(state){
		const {rel_now} = state;
		for(let [fn] of this.relPeriods.entries()){
			const t = this.relPeriods.get(fn);
			const time_base = rel_now - t.offset;
			const period = t.period;
			const phase = (
				time_base >= 0
					? ( time_base % period)
					: ( (period - 1) + (( time_base + 1 ) % period))
				) / period;
			fn(state, phase, t.cancel);
		}
	}






	relTransition(duration, fn){
		// const now = Date.now();
		let start, end, dur, timing_function;
		if(typeof duration === "number"){
			dur             = duration;
			start           = this.state.rel_now;
			end             = start + duration;
			timing_function = Timer.LINEAR;
		}
		else{
			start = typeof duration.start === "number" ? duration.start : this.state.rel_now;
			dur = duration.duration
			end = start + dur;
			timing_function = duration.timing_function || Timer.LINEAR;
		}

		const t = {
			start, end, duration: dur, timing_function,
			cancel: this.removeRelTransition.bind(this, fn),
		}
		this.relTransitions.set(fn, t);
		return t;
	}


	removeRelTransition(fn){
		this.relTransitions.delete(fn);
	}


	handleRelTransitions(state){
		const { rel_now } = state;
		for(let [fn] of this.relTransitions.entries()){
			const t = this.relTransitions.get(fn);
			const { start, end, duration, cancel } = t;
			const path = (rel_now - t.start) / t.duration;
			if(path < 0) return fn(state, t.timing_function(0), t.cancel);
			if(path > 1) return fn(state, t.timing_function(1), t.cancel);
			if(path >= 1){
				fn(state, t.timing_function(1), t.cancel);
				this.removeTransition(fn);
			}
			else{
				fn(state, t.timing_function(path), t.cancel);
			}
		}
	}

}



const { sin, cos, pow, sqrt, PI } = Math;

Timer.LINEAR            = x => x;
Timer.EASE_IN_SINE      = x => 1 - cos((x * PI) / 2);
Timer.EASE_OUT_SINE     = x => sin((x * PI) / 2);
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