'use strict';
const pThrottle = require('p-throttle');
const animals = [
    {
        "name": "cat",
        "size": "small",
        "weight": 5
    },
    {
        "name": "dog",
        "size": "small",
        "weight": 10
    },
    {
        "name": "lion",
        "size": "medium",
        "weight": 150
    },
    {
        "name": "elephant",
        "size": "big",
        "weight": 5000
    }
]

let a = [1, 2, 3, null, 4];
let set = new Set([1, 2, 3, null, 4]);

function someFunc(el) {
  if (el != null)
    return "hi there, you're my number "+el;
}
async function someFuncAsync(el) {
  return new Promise((resolve, reject) => {
    if (el != null)
      resolve("hi there, you're my number "+el)
    else
      reject('no element')
  })
};


/*
const data = await array.reduce(async (accumP, current, index) => {
  const accum = await accumP;
  …
}, Promise.resolve(…));
*/
/*
const throttled = pThrottle(idx => {
  if (idx != null)
    return Promise.resolve(idx)
}, 2, 1000);
for (let el of set) {
  throttled(el).then(console.log);
}

*/

(async function main() {
  const c = await a.map((el) => someFuncAsync(el))
    .reduce(async (prevPromise, pr) => {
      const collection = await prevPromise;
      try {
        const el = await pr; 
        collection.push(el)
      } catch(e) {
      };
      return collection;
    }, Promise.resolve([]));
  console.log(c);
})()
