const util = require(__dirname + '/core/util')
  , dirs = util.dirs()
  , _ = require('lodash')
  , events = require('events')
  , moment = require('moment')
  , log = require(dirs.core + 'log')
  , PipelineFactory = require(dirs.core + 'pipelineFactory').PipelineFactory
  , BrokerFactory = require(dirs.broker + 'brokerFactory').BrokerFactory
  , Broker = require(dirs.broker + 'brokerFactory').Broker
  , Checker = require(dirs.broker + 'exchangeChecker')
  , Trader = require(dirs.plugins + 'trader/trader')
  , JSON = require('JSON')
  , async = require('async')

require('./exchange/dependencyCheck');

/*
 *  depends on exchange market-data being current, not entirely dynamic
 */

//globals
const config = util.getConfig();
const mode = util.gekkoMode();
var adapter = config[config.adapter];


let beginEventLoop = false;


if (_.has(config, 'multiwatch')) {
  log.debug("has configured exchanges: "+JSON.stringify(config.multiwatch));
}

//exchange/util/genMarketFiles

var pipes = [];

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function initPipes(broker) {
  try {
    const result = _.map(
      broker.capabilities.markets,
      function(o) {
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
        /*
        if (!_.has(config,'multiwatch.'+ mc.watchKey))
          config.multiwatch[config.watchKey] = {
            exchange: ex,
            currency: currency,
            asset: asset,
          };
        if (!_.has(mc,'multiwatch.'+ mc.watchKey))
          mc.multiwatch[mc.watchKey] = {
            exchange: ex,
            currency: currency,
            asset: asset,
          };
          */
//        console.log('PipelineFactory.createInit ',mc);
        var pipe = PipelineFactory.createInit({ config: mc, mode: mode });
        pipes.push(pipe);
      }
    );
    broker.capabilities.markets = _.compact(result);
  } catch (e) {
    e.trace = 'initPipes';
    util.die(e, false);
  };
}

//Object.keys(config.multiwatch).forEach((ex) => { 

  const result = _.map(
    Object.keys(config.multitrader),
    (ex) => {
      var broker = null;

      let conf = {
        ...config.multitrader[ex],
        exchange: ex,
      };
      
      log.info('exchange: '+ex);
      let cap = Checker.getExchangeCapabilities(ex);
      log.info('assets:' + JSON.stringify(cap.assets));
      log.info('currencies: '+JSON.stringify(cap.currencies));
      /*
      try {
        const na = initPipes( broker );
      } catch(e) {
        util.die(e, true);
      }
      log.debug('created pipelines');
      */
    }
  )

