'use strict';

//awaity = require('awaity')
const mapAFP = require('awaity/fp/map').default
  , reduceAFP = require('awaity/fp/reduce').default
  , reduceA = require('awaity/reduce').default
  , mapA = require('awaity/map').default
  , filterA = require('awaity/filter').default
  , fs = require('fs-extra')
;

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

let total_weight = animals.reduce((weight, animal, index, animals) => {
    return weight += animal.weight
}, 0)

let initializer = null;

function someFunc(el) {
  if (el != null)
    return "hi there, you're my number "+el;
}

async function someFuncAsync(el) {
  return new Promise((resolve, reject) => {
    if (el != null)
      resolve("hi there, you're my number "+el)
  })
};

async function someFuncAsyncResolve(el) {
  return new Promise((resolve, reject) => {
    if (el != null)
      resolve("hi there, you're my number "+el)
  })
};

Array.prototype.reduce = function(callback, initialVal) {
    var accumulator = (initialVal === undefined) ? undefined : initialVal;
    for (var i = 0; i < this.length; i++) {
        if (accumulator !== undefined)
            accumulator = callback.call(undefined, accumulator, this[i], i, this);
        else
            accumulator = this[i];
    }
    return accumulator;
};

Array.prototype.reduceAsync = async function(prevPromise, promise) {
  const callback = await prevPromise;

  try {
    const el = await promise; 
    if (el != null)
      collection.push(el)
  } catch(e) {
    console.log(e);
  };

  var accumulator = (initialVal === undefined) ? undefined : initialVal;
  for (var i = 0; i < this.length; i++) {
    if (accumulator !== undefined)
      accumulator = callback.call(
        undefined, accumulator, this[i], i, this
      );
    else
      accumulator = this[i];
  }
  return accumulator;
};

/*
Array.prototype.reduceAsync = async function((prevPromise, pr) => {
      const collection = await prevPromise;
      try {
        const el = await pr; 
        if (el != null)
          collection.push(el)
      } catch(e) {
        console.log(e);
      };
      return collection;
    }, Promise.resolve([])
)
*/

Array.prototype.map = function(callback /*, thisArg*/) {
  console.log('protoMap :',arguments[0], arguments[1]);
//  console.log(stringifyObject(arguments, {indent: "\t", singleQuotes: false }));
  var T, A, k
  if (this == null) {
    throw new TypeError('this is null or not defined')
  }

  var O = Object(this)
  var len = O.length >>> 0

  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  if (arguments.length > 1) {
    T = arguments[1]
  }

  A = new Array(len)
  k = 0

  while (k < len) {
    var kValue, mappedValue

    if (k in O) {
      kValue = O[k]
      mappedValue = callback.call(T, kValue, k, O)
      A[k] = mappedValue
    }
    k++
  }

  return A
};

async function getDirectories(path) {
  const files = await fs.readdir(path);

  var p = 'bar';
  const pairs = await Promise.all(files.map(async (file) => {
    const stats = await fs.stat(file);
    return [stats.isDirectory(), file, stats.size];
  }));

//  console.log(pairs)

   return pairs
      .filter(([isDirectory, file, size]) => isDirectory)
      .map(([isDirectory, file, size]) => size);

  // since isDirectory is boolean
  // 
  /*
  return pairs
    .filter(([isDirectory, file]) => isDirectory)
    .map(([isDirectory, file]) => file);
    */
}
//    awaity/esm/filter (Iterable, filterer)
//
//  since the list of promises are unresolved files returned
//    from readdir, 
//
//
async function getDirectorie(path) {
  const promise = fs.readdir(path);

  return filterA(promise, async (file) => {
    const stats = await fs.stat(file);
    return stats.isDirectory();
  });
}

(async function main() {
  /* doesnt return
  let promises = a.map( el => someFuncAsync(el));
//  console.log(promises);
  const out = await filterA(promises, async (el) => {
      try {
        const e = await el;
        if (e != null) return e 
      } catch(e) {
        console.log(e)
      }
  });
  console.log("out");
  console.log(out);
  */

  const dI =await getDirectorie('.');
  console.log(dI)

  const directories = await getDirectories('.');
  console.log("directories ",directories);

  let d = a.map( el => { return el; })
    .reduce((accum, el, cidx, array) => {
      if (el != null) accum.push(el); return accum
    }, []);
  console.log("d-:", d);

/*
    // Just some promises that returns numbers
     return await reduce(paths, async (total, fileName) => {
      const stat = await fs.stat(fileName, 'utf8');
      return total + stat.size;
     }, 0);
*/
  const p = [1,2,null,3].map(i => Promise.resolve(i));
  console.log("col:", p)
  const col = await p.filter(async (i) => {let el = await i; if (el != null) return el})
  console.log("col :",col);


//    .map((i) => Promise.resolve(i))
//  console.log("await map: ",await Promise.all(promise));

//const total = reduceA(promise, async (collection, elP) => {
//    let el = await elP;
//    if (el != null) collection.push(el)
//  } , []) 
  // By ommiting the last argument,
  // we got a function that expects an array of promises
//  console.log("total", total);
})()
