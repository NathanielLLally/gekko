"use strict";
const util = require('./core/util')
  , dirs = util.dirs()
  , verbose   = process.argv.includes ('--verbose')
  , debug     = process.argv.includes ('--debug')
;

const version = '0.0.1';

const properties = {
  log,
  PipelineFactory,
  BrokerFactory,
  Broker,
  Checker, 
  Trader
} = 
  require(dirs.core + 'log'),
  require(dirs.core + 'pipelineFactory').PipelineFactory,
  require(dirs.broker + 'brokerFactory').BrokerFactory,
  require(dirs.broker + 'brokerFactory').Broker,
  require(dirs.broker + 'exchangeChecker'),
  require(dirs.plugins + 'trader/trader'),
};

module.exports = Object.assign ({ version }, properties);

