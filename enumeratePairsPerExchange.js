const util = require(__dirname + '/core/util');
const dirs = util.dirs();

const _ = require('lodash');
var async = require('async');
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

Object.keys(config.multiwatch).forEach((ex) => { 
  console.log(ex); 
  trader[ex] = new Trader(() => {}, ex);
  trader[ex].init();

//trader.init();

var pipes = [];
trader[ex].on('postInit', async () => {
  let self = trader[ex];
		console.log(" trading with exchange " + self.exchangeName);
	
	var assets = self.broker.capabilities.assets;
	var currencies = self.broker.capabilities.currencies;
  console.log('assets:' + JSON.stringify(self.broker.capabilities.assets));
  console.log('currencies: '+JSON.stringify(self.broker.capabilities.currencies));
  _.each(self.broker.capabilities.markets, o => {
    let asset = o.pair[1];
    let currency = o.pair[0];
    var mc = {...config};
    mc.watch = {
      exchange: ex,
      currency: currency,
      asset: asset,
    }
    mc.trader = config.multitrader[ex];
    var pipe = PipelineFactory.createInit({ config: mc, mode: mode });
    pipes.push(pipe);
  });
});

});

