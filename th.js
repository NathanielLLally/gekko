const _ = require('lodash');
const async = require('async')
  ,  fs = require('fs')

var collection = ['1', '2', '3'];

_.map(collection, (e) => {
  console.log(e);
});
//(async function main() {
var myload = async function(plugin, config) {
  console.log(plugin, config);
  Promise.resolve('weee');
}

async.map(['file1','file2','file3'], fs.stat, function(err, results) {
    // results is now an array of stats for each file
  console.log(result);
});

async.mapValues({
    f1: 'LICENSE',
    f2: 'gekko.js',
    f3: 'th.js'
}, function (file, key, callback) {
  console.log(fs.stat('/home/nathaniel/src/git/gekko/'+file, callback));
}, function(err, result) {
  console.log(result);
    // result is now a map of stats for each file, e.g.
    // {
    //     f1: [stats for file1],
    //     f2: [stats for file2],
    //     f3: [stats for file3]
    // }
});

var result;
async.mapSeries(
   collection,
   myload,
   function(err, _list) {
     if (err)
       return err;
   }
);
