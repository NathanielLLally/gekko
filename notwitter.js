const _ = require('lodash')
  , util = require('./core/util')
  , config = require('config')
  , gekko = require('./index.js')
  , JSON = require('JSON')
  , async = require('async')
  , ansicolor = require ('ansicolor').nice
  , asTable = require ('as-table').configure ({ delimiter: ' | ' })
  , Promise = require('bluebird')
  , ccxt     = require('ccxt')
  , program = require('commander')
  , verbose   = process.argv.includes ('--verbose')
  , debug     = process.argv.includes ('--debug')
  , mode      = 'realtime'
;

const version = gekko.version;


console.log(JSON.stringify(gekko, null, 2));

gekko.log("Hello!");

var pipes = {};
async function initPipes(broker) {
  var promises;
  try {
    promises = broker.capabilities.markets.map(
      async function(o) {
        let currency = o.pair[0];
        let asset = o.pair[1];
        let ex = broker.exchange;
        var mc = {...config};
        //var mc = config;
        if (_.has(mc,'multitrader.'+ex))
          mc.trader = mc.multitrader[ex]

        mc.watchKey = ex+currency+asset;
//        mc.broker = broker;

        mc.trader = {
          enabled: false,
          key: '',
          secret: '',
          username: '',
          passphrase: '',
        };
        mc.watch = {
          exchange: ex,
          currency: currency,
          asset: asset,
        };
//        mc.candleWriter.market = mc.market;
        mc.candleWriter.asset = asset;
        mc.candleWriter.currency = currency;
        mc.candleWriter.exchange = ex;
        var merge = {
          market: mc.market,
          asset: asset,
          currency: currency,
          exchange: ex,
        };
        Object.assign(mc.PGAdapter, merge);
        return await PipelineFactory.createInit({ config: mc, mode: mode });
      }
    );
  } catch (e) {
    console.log(e.fullStack)
    util.die(e, false);
  };
  return await Promise.all(promises);
}
// instantiates global exchange[]
//
async function initExchange (exName, opts = {}) {
  return new Promise((resolve, reject) => {

		let exchangeFound = ccxt.exchanges.indexOf (exName) > -1
		if (exchangeFound) {
			let e = new ccxt[exName] ({
				verbose,
        ...opts
			})
      e['name'] = exName
      resolve(e);

		} else {
      let e = new Error('CCXT does not support exchange [' + exName + "]\n" + 
        printSupportedExchanges());
      reject(e);
		}
	})
}

(async function main() {


  //initialize gekko & ccxt
  //
  let promises = Object.keys(config.multitrader).map( (ex) => {
      let gc = {
        ...config.multitrader[ex],
      }
      gc.apiKey = gc.key;
      gc.password = gc.passphrase;
      return initExchange(ex, gc);
    });
  let ccxt = await Promise.all(promises);
  ccxt.map( async (ex) => {
    console.log("loading ccxt markets for exchange "+ex.name) 
    await ex.loadMarkets(); //see arbitrage for a better way to loadMarkets
  });

  promises = Object.keys(config.multitrader).map( async (ex) => {
    var broker = null;
    //broker still needs to be initialized with a pair
    let conf = {
      ...config.multitrader[ex],
      exchange: ex,
      private: true
    }
    let cap = gekko.Checker.getExchangeCapabilities(ex);
    conf.currency = _.first(_.first(cap.markets).pair).toUpperCase() 
    conf.asset = _.last(_.first(cap.markets).pair).toUpperCase() 
    try {
      broker = await gekko.BrokerFactory.create(conf);
    } catch(e) {
      util.die(e,false);
    };

    log.info("Initializing gekko broker for "+ex);

    try {
      pipes = await initPipes( broker );
    } catch(e) {
//      util.die(e, false);
    }
    log.debug('created pipelines');
  });
  await Promise.all(promises);


      //_.map(['fetchDepositAddress', 'createDepositAddress', 'withdraw'],
      //_.map(['fetchDepositAddress', 'createDepositAddress'],
//      log.info('assets:' + JSON.stringify(cap.assets));
//      log.info('currencies: '+JSON.stringify(cap.currencies));

})();
