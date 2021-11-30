
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
		now:       timestamp,
		anchor:    timestamp,
		rel_now:   timestamp,
		rel_start: timestamp,
		speed:     number,
	})
```


Starting the timer:
```javascript
	timer.start(min_step); // min_step - minimal tick interval in ms, default - 40
```
And the clock will start ticking



## Basic effects
timer.at
```javascript
	// Callback will be invoked when 'now' reaches the value of timestamp
	timer.at(timestamp, function(state){
		// ...
	})
```

timer.interval
```javascript
	timer.interval(interval, function(state, cancel){ // 'interval'is in milliseconds
		// cancel is function that will remove interval from timer queue
	})

	// or the interval can be set to count from specific moment:
	
	timer.interval({ base: timestamp, interval: value }, function(state, cancel){ // 'value'is in milliseconds
		// cancel is function that will remove interval from timer queue
	})
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
Same as transition, but will be repeated continuously




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
		start:    timestamp,           // When the transition is started
		duration: duration,            // Duration in milliseconds
		timing_function: x => 1 / x    // Optional timing function that will modify value of phase
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
	}, function(state, phase, cancel){
		// 'phase' is number between 0 and 1 and represents the path between begin and end of the transition
		// 'cancel' is function that will remove the transition from timer queue
	});
```
Same as transition, but will be repeated continuously