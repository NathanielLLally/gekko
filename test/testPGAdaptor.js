var chai = require('chai');
var expect = chai.expect;
var should = chai.should;
var assert = chai.assert;
var sinon = require('sinon');
var _ = require('lodash');
var moment = require('moment');
var util = require(__dirname + '/../core/util');
var config = util.getConfig();
var dirs = util.dirs();

/*
config.adapter = 'PGAdaptor';

config.PGAdaptor = {
  path: 'plugins/PGAdaptor',
  version: 0.1,
  connectionString: 'postgres://postgres@mx.ewb.ai:5432', // if default port
  database: 'gekko', // if set, we'll put all tables into a single database.
  schema: 'public',
  tableNamingDelimiter: '_',
  tableNaming: [config.watch.exchange, config.watch.currency, config.watch.asset],
  table: function() {
    let d = config.PGAdaptor.tableNamingDelimiter;
    return config.PGAdaptor.tableNaming.join(d);
  },
  dependencies: [{
    module: 'pg',
    version: '7.4.3'
  }]
}
*/
var pluginParameters = require(dirs.gekko + 'plugins');
var pluginHelper = require(dirs.core + 'pluginUtil');
const pluginMock = {
  slug: 'PostgreSQL Adaptor',
  dependencies: config.PGAdaptor.dependencies
}

const cannotLoad = pluginHelper.cannotLoad(pluginMock);
if(cannotLoad) {
  util.die(cannotLoad);
}

let mc = config;
        mc.PGAdaptor.asset = 'BTC';
        mc.PGAdaptor.currency = 'USD';
        mc.PGAdaptor.exchange = 'gdax';


var pluginMeta =  _.find(pluginParameters, (o) => {return o.slug == 'candleWriter'})
//var pluginMeta = config.PGAdaptor;
pluginHelper.load(pluginMeta, (e) => {console.log('pluginLoader done(), next() thingy')});
