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
const Trader = require(dirs.plugins + 'trader/trader').Trader;
const JSON = require('JSON');

//const Trader = require(__dirname  + '/exchange/wrappers/gdax');

require('./exchange/dependencyCheck');

//globals
const config = util.getConfig();


if (_.has(config, 'list_update_import')) {
  console.log("has configured exchanges: "+JSON.stringify(config.list_update_import));
}

//exchange/util/genMarketFiles

//main
console.log(JSON.stringify(config.watch.gdax));
var trader = new Trader(() => {}, "gdax");

trader.init();

trader.on('postInit', () => {
		console.log('\tGekko v' + util.getVersion() + " using exchange " + config.watch.exchange);
//	console.log("market config: "+JSON.stringify(trader.broker.marketConfig));
//	console.log("capabilities: "+JSON.stringify(trader.broker.capabilities));
	
//	console.log(trader.broker.capabilities);
  beginEventLoop = true;
});

(function wait () {
  if (beginEventLoop)
    trader.broadcastDeferredEmit();
  setTimeout(wait, 50);
})();

