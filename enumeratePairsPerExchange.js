const util = require(__dirname + '/core/util');
const dirs = util.dirs();

const _ = require('lodash');
const events = require('events');
const moment = require('moment');
//const orders = require('./orders');
//const Trigger = require('./trigger');
//const exchangeUtils = require('./exchangeUtils');
//const bindAll = exchangeUtils.bindAll;
const log = require(dirs.core + 'log');
const PipelineFactory = require(dirs.core + 'pipelineFactory').PipelineFactory;
const Trader = require(dirs.plugins + 'trader/trader');
const JSON = require('JSON');
const async = require('async');
const Aigle = require('aigle');
Aigle.mixin(_);

//const Trader = require(__dirname  + '/exchange/wrappers/gdax');

require('./exchange/dependencyCheck');

//globals
var config = util.getConfig();
const mode = util.gekkoMode();
var adapter = config[config.adapter];


let beginEventLoop = false;


if (_.has(config, 'multiwatch')) {
  log.debug("has configured exchanges: "+JSON.stringify(config.multiwatch));
}

//exchange/util/genMarketFiles

//main
console.log(JSON.stringify(config.multiwatch.gdax));
var trader = [];
var pipes = [];

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

async function initPipes(self, ex, markets) {
  try {
    const result = await Promise.all(_.map(
      markets, 
      async function(o) {
        let asset = o.pair[1];
        let currency = o.pair[0];
        var cKey = ex+currency+asset;
        var mc = {...config};

        //TODO: for implementing the multitrader 
        //  under this paradigm we need a ratelimiter
        //
        mc[cKey].trader = {
          enabled: false,
          key: '',
          secret: '',
          username: '',
          passphrase: '',
        };
        mc[cKey].watch = {
          exchange: ex,
          currency: currency,
          asset: asset,
        }
        //      mc.trader = config.multitrader[ex];
        var pipe = await PipelineFactory.createInit({ key: cKey, config: mc, mode: mode });
        pipes.push(pipe);
      }
    ));
    self.broker.capabilities.markets = _.compact(result);
  } catch (e) {
    throw "initPipes: "+e;
  }
}

//Object.keys(config.multiwatch).forEach((ex) => { 

(async function main() {
const result = await Promise.all(_.map(
  Object.keys(config.multiwatch),
  (ex) => {
    console.log(ex); 
    trader[ex] = new Trader(() => {}, ex);
    trader[ex].init();

    //let result = await Promise.all(_.map(responseJson, addEnabledProperty));
    //trader.init();
    /*
window.addEventListener("load", () => {
    loadEdit().then(// callback function here);
}, false);

async function loadEdit() {
  // do the await things here.
}
*/


  trader[ex].on('postInit', async () => {
    let self = trader[ex];
    console.log(" trading with exchange " + self.exchangeName);

    var assets = self.broker.capabilities.assets;
    var currencies = self.broker.capabilities.currencies;
    console.log('assets:' + JSON.stringify(self.broker.capabilities.assets));
    console.log('currencies: '+JSON.stringify(self.broker.capabilities.currencies));
    try {
      const na = await initPipes( self, ex, self.broker.capabilities.markets ).then(() => {});
    } catch(e) {
      util.die("postInit listener "+e, true);
    }
    console.log('created pipelines');
  });

  }
));

})();
