const util = require('./core/util')
  , dirs = util.dirs()
  , verbose   = process.argv.includes ('--verbose')
  , debug     = process.argv.includes ('--debug')
;

const version = '0.0.1';

const properties = {
  'log ':  require(dirs.core + 'log'),
  'PipelineFactory ':  require(dirs.core + 'pipelineFactory').PipelineFactory,
  'BrokerFactory ':  require(dirs.broker + 'brokerFactory').BrokerFactory,
  'Broker ':  require(dirs.broker + 'brokerFactory').Broker,
  'Checker ':  require(dirs.broker + 'exchangeChecker'),
  'Trader ':  require(dirs.plugins + 'trader/trader'),
};

module.exports = Object.assign ({ version }, properties);

