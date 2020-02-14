'use strict';
const pThrottle = require('p-throttle')
  , stringifyObject = require('stringify-object');

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

async function someFuncAsyncResolve(el) {
  return new Promise((resolve, reject) => {
    if (el != null)
      resolve("hi there, you're my number "+el)
  })
};

let total_weight = animals.reduce((weight, animal, index, animals) => {
    return weight += animal.weight
}, 0)

let initializer = null;

let b = a.map((el) => someFunc(el)).reduce((accum, el, cidx, array) => {
  if (el != null) accum.push(el); return accum
}, []);

/*
const pretty = stringifyObject(obj, {
    indent: '  ',
    singleQuotes: false
});
*/
/*
Array.prototype.reduceAsync = function() {
  const func = [].slice.apply(arguments)[0];

  return Array.prototype.reduce.call(func);
  console.log(stringifyObject(func, {indent: "\t", singleQuotes: false }));

  /*
  (accum, el, cidx, array) => {
  Array.reduce(prevPromise, curP) => {
  const collection = await previousPromise;
  if (curP != null) collection.push(curP);
  return collection;
  }, Promise.resolve([]);
};
*/

(async function main() {
  /*
  const d = a.map(el => { return el; })
      .reduceAsync( el => el != null );

  console.log(d);
  */

  const e = await a.map((el) => someFuncAsync(el))
      .reduce(async (prevPromise, curP) => {
        const collection = await prevPromise;
        try {
          const el = await curP; 
          if (el != null)
            collection.push(el)
        } catch(e) {
          console.log(e);
        };  
        return collection;
      }, Promise.resolve([]));

  console.log(e);
})()
