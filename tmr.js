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

let total_weight = animals.reduce((weight, animal, index, animals) => {
    return weight += animal.weight
}, 0)

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
}

let initializer = null;
let b = a.map((el) => someFunc(el)).reduce((accum, el, cidx, array) => {
  if (el != null) accum.push(el); return accum
}, [])

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
  const promises = a.map((el) => someFuncAsync(el));
      const loadedPlugins = await promises
      .reduce(async (prevPromise, pr) => {
        const collection = await prevPromise;
        try {
          const el = await pr; 
          if (el != null)
            collection.push(el)
        } catch(e) {
          console.log(e);
        };  
        return collection;
      }, Promise.resolve([]));
    console.log(loadedPlugins);
})()
