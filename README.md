
Installation:
```bash
	npm install @orbits/timer
```



Import/require:
```javascript
	const Timer = require("@orbits/timer");
```
or:
```javascript
	import Timer from "@orbits/timer";
```


Constructor:
Without options - for use only for basic effects
```javascript
	const timer = new Timer();
```


With options - for managing specific timelines (with specific speed and offset)
```javascript
	const timer = new Timer({
		// Absolute (unmanagable) time attributes,
		// The options are used mainly for testing purpose
		// Will tick alwais with speed 1
		now:       timestamp, // Optionsl, Default: Date.now()
		anchor:    timestamp, // Optionsl, Default: Date.now()
		
		// Relative managable time attributes
		rel_now:   timestamp, // Current 'game time' Default 0
		rel_start: timestamp, // When the 'game time' has started
		speed:     number,    // How fast lerative time ticks, compared to absolute time
	});
```


Starting the timer:
```javascript
	timer.start(min_step); // min_step - minimal tick interval in ms, default - 40
```
And the clock will start ticking.
By default, timer will use requestAnimationFrame (if in browser)
or (tick_fn) => setTimeout(tick_fn, min_step) if it runs in nodejs

```javascript
	// Using custom tick caller
	timer.start(min_step, tick_fn => setTimeout(tick_fn, 20));
```



## Basic effects
timer.at
```javascript
	// Callback will be invoked once when 'now' reaches the value of timestamp
	timer.at(timestamp, function(state){
		// ...
	});
```

timer.interval
```javascript
	timer.interval(interval, function(state, cancel){ // 'interval' is in milliseconds
		// cancel() is function that will remove interval from timer queue
	});

	// or the interval can be set to count from specific moment:
	timer.interval({ base: timestamp, interval: value }, function(state, cancel){ // 'value'is in milliseconds
		// cancel() is function that will remove interval from timer queue
	});
```




timer.transition
```javascript
	timer.transition(duration, function(state, phase, cancel){ // 'duration'is in milliseconds
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
	});

	// or with more specific attributes 
	timer.transition({
		start:    timestamp,           // When the transition is started
		duration: duration,            // Duration in milliseconds
		timing_function: x => 1 / x    // Optional timing function that will modify value of phase
	}, function(state, phase, cancel){
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
		// Note: If current time is before options.start, phase will be always 0
		// Note: If current time is after options.start + options.duration,
		// will be called once with phase 1, then remove the hook from queue
	});
```
When the transition reaches it's end phase, will be removed from queue


timer.period
```javascript
	timer.period(duration, function(state, phase, cancel){ // 'duration'is in milliseconds
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the period from timer queue
	});

	// or with more specific attributes 
	timer.period({
		base:    timestamp,            // When the period is started
		duration: duration,            // Duration in milliseconds
	}, function(state, phase, cancel){
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
	});
```
Same as transition, but will be repeated continuously and will act proportionaly 
before start and after end




## Relative time

timer.relAt
```javascript
	// Callback will be invoked when 'state.rel_now' reaches the value of timestamp
	timer.at(timestamp, function(state){
		// ...
	});
```


timer.relInterval
```javascript
	timer.relInterval(interval, function(state, cancel){ // 'interval'is in milliseconds
		// cancel is function that will remove interval from timer queue
	});

	// or the interval can be set to count from specific moment:
	timer.relInterval({
		base: timestamp,	// When the interval is started
		interval: value,    // In milliseconds
	}, function(state, cancel){
		// cancel is function that will remove interval from timer queue
	});
```


timer.relTransition
```javascript
	timer.relTransition(duration, function(state, phase, cancel){ // 'duration'is in milliseconds
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
	});

	// or with more specific attributes 
	timer.relTransition({
		start:    timestamp,           // When the transition is started, default is current rel_now
		duration: duration,            // Duration in milliseconds
		timing_function: x => 1 / x    // Optional timing function that will modify value of phase or name of one of built-in functions
	}, function(state, phase, cancel){
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
	});
```
Unlike timer.transition, it will not be removed when transition ends as the time speed 
can be set to -1 and the relative time can flow backwards


timer.relPeriod
```javascript
	timer.relPeriod(duration, function(state, phase, cancel){ // 'duration'is in milliseconds
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the period from timer queue
	});

	// or with more specific attributes 
	timer.relPeriod({
		base:    timestamp,            // When the period is started
		duration: duration,            // Duration in milliseconds
		timing_function: "LINEAR"      // Optional, can be custom function, default 'LINEAR'
	}, function(state, phase, cancel){
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
	});
```
Same as transition, but will be repeated continuously


# Builtin timing functions
 - LINEAR (this is default)
 - EASE_IN_SINE
 - EASE_OUT_SINE
 - EASE_IN_OUT_SINE
 - EASE_IN_QUAD
 - EASE_OUT_QUAD
 - EASE_IN_OUT_QUAD
 - EASE_IN_CUBIC
 - EASE_OUT_CUBIC
 - EASE_IN_OUT_CUBIC
 - EASE_IN_QUART
 - EASE_OUT_QUART
 - EASE_IN_OUT_QUART
 - EASE_IN_QUINT
 - EASE_OUT_QUINT
 - EASE_IN_OUT_QUINT
 - EASE_IN_EXPO
 - EASE_OUT_EXPO
 - EASE_IN_OUT_EXPO
 - EASE_IN_CIRC
 - EASE_OUT_CIRC
 - EASE_IN_OUT_CIRC
 - EASE_IN_BACK
 - EASE_OUT_BACK
 - EASE_IN_OUT_BACK
 - EASE_IN_ELASTIC
 - EASE_OUT_ELASTIC
 - EASE_IN_OUT_ELASTIC
 - EASE_IN_BOUNCE
 - EASE_OUT_BOUNCE
 - EASE_IN_OUT_BOUNCE


from https://easings.net/