const pThrottle = require('p-throttle');

const now = Date.now();

const throttled = pThrottle(index => {
	const secDiff = ((Date.now() - now) / 1000).toFixed();
	return Promise.resolve(`${index}: ${secDiff}s`);
}, 2, 1000);

for (let i = 1; i <= 6; i++) {
	throttled(i).then(console.log);
}
