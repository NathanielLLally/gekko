"use strict";
const 
   util = require('./core/util')
  , dirs = util.dirs()
  , log = require(dirs.core + 'log')
  , PipelineFactory = require(dirs.core + 'pipelineFactory').PipelineFactory
  , BrokerFactory = require(dirs.broker + 'brokerFactory').BrokerFactory
  , Broker = require(dirs.broker + 'brokerFactory').Broker
  , Trader = require(dirs.plugins + 'trader/trader')
  , Checker = require(dirs.broker + 'exchangeChecker')
;
require('./exchange/dependencyCheck');

const version = '0.0.1';
const config = util.getConfig();
const mode = util.gekkoMode();

//console.log( Object.assign ({ version, props: Object.keys(properties) }, properties))
//module.exports = Object.assign ({ version, props: Object.keys(properties) }, properties);
module.exports = {
  version,
  mode,
  config,
  util,
  dirs,
  log,
  PipelineFactory,
  BrokerFactory,
  Broker,
  Trader,
  Checker
};
