

```javascript
const Timer = require("@orbits/timer");

// With default values
const timer = new Timer();

// Fine tuned ot for restoring previous state:
const now = Date.now();
const timer = new Timer({
	now,
	anchor:    now - 500,
	rel_now:   -1000,
	rel_start: -1000,
	speed:     3,
});

```


TODO - add usage