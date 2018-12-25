const _ = require('lodash')
  , fs = require('fs')
  , util = require('../../core/util.js')
  , dirs = util.dirs()
  , config = util.getConfig()
  , log = require(dirs.core + 'log')
  , pg = require('pg')
  , pluginHelper = require(dirs.core + 'pluginUtil')
  , Pipeline = require(dirs.core + 'pipelineFactory').Pipeline
;


const pluginMock = {
  slug: 'PostgreSQL Adapter',
  dependencies: config.PGAdapter.dependencies
}

const cannotLoad = pluginHelper.cannotLoad(pluginMock);
if(cannotLoad) {
  util.die(cannotLoad);
}

var _singleton = null;
var _handlePool = null;
var _handlePoolPostgres = null;
class PGAdapter {
  processCandle(candle, done) {
    //let s = PGAdapter.getInstance();
    let s = this;
    s.cache.push(candle);
    if (s.cache.length > 1)
      s.writeCandles();

    done();
  };

  finalize(done) {
//    let s = PGAdapter.getInstance();
    let s = this;
    s.writeCandles();
    s.handlePool = null;
    s.handlePoolPostgres = null;
    done();
  }

  static getInstance() {
    if (_singleton == null)
      try {
        _singleton = PGAdapter.create();
      } catch(e) {
        util.die(e);
      };

    return _singleton;
  };

  //  factory pattern utility function
  //
  static create(settings) {
//    if (_singleton != null)
//      return _singleton;

    let self = null;
    try {
      self = new PGAdapter(settings);
    } catch (rejectedValue) {
      log.error("PGAdapter borked, ",rejectedValue);
      throw rejectedValue;
    }
//    _singleton = self;
    return self;
  };

  static createInit(candleWriterEventCB, settings) {
//    if (PGAdapter._singleton != null)
//      return _singleton;

    let self = PGAdapter.create(settings);
//    _singleton = self;

    self.init(candleWriterEventCB, settings)
    return self;
  };

  constructor (settings) {
    _.bindAll(this);
    this.plugin_config = settings;
    this.config = { PGAdapter: settings };

    //this.plugin_config = (settings != null ) ? settings : config.PGAdapter;
//    console.log('PGAdapter() :',this.config.PGAdapter);
//    this.adapter = this.config.adapter;
    this.version = this.plugin_config.version;
    this.mode = util.gekkoMode();
    this.table = [];
    this.connectionString = this.plugin_config.connectionString;
    this.handlePool = null;
    this.handlePoolPostgres = null;
    this.candleWriterEventCallback = null;

    this.cache = [];
//adaptor, multiwatch- here or not here?
    this.exchange = this.plugin_config.exchange;
    this.currency = this.plugin_config.currency;
    this.asset = this.plugin_config.asset;
  };
  done() {
    if (typeof this.candleWriterEventCallback === 'function')
      this.candleWriterEventCallback();
  }
  tableMoniker() {
    let naming = [this.exchange, 'candles', this.currency, this.asset];
    let d = this.plugin_config.tableNamingDelimiter;
    let r = naming.join(d);
    r.replace(/\-/g, d);
    return r.toLowerCase();
  };
  init (done, settings) {
    let c = (settings == null)?this.config.PGAdapter:settings;

    this.candleWriterEventCallback = done;
    let assertHas = ['tableNamingDelimiter'];
    _.each(assertHas, t => {
      if (!_.has(c, t))
        throw('bad config, missing '+t);
    });

    this.table = this.tableMoniker();

    this.handlePool = new pg.Pool({
      connectionString: this.connectionString + '/' + this.config.PGAdapter.database
    });
    this.handlePoolPostgres = new pg.Pool({
      connectionString: this.connectionString + '/postgres',
    });
    this.checkExists(this.table);
    this.done();
  };
  createDatabase() {
    this.pool.query("CREATE DATABASE " + this.config.PGAdapter.database, err => {
        if(err) {
          log.debug("database already exists");
        }

        log.debug("Postgres connection pool is ready, db " + this.config.PGAdapter.database);
        this.initTable();
        this.done();
  })
  }
  initTables() {
    const query =
      "CREATE TABLE IF NOT EXISTS "
      +this.table+` (
          id BIGSERIAL PRIMARY KEY,
          start integer UNIQUE,
          open double precision NOT NULL,
          high double precision NOT NULL,
          low double precision NOT NULL,
          close double precision NOT NULL,
          vwp double precision NOT NULL,
          volume double precision NOT NULL,
          trades INTEGER NOT NULL
          );`;

    this.handlePool.query(query, (err) => {
        if(err) {
        util.die(err);
        }
        });
  };

  checkExists(table) {
    // We need to check if the db exists first.
    // This requires connecting to the default
    // postgres database first. Your postgres
    // user will need appropriate rights.
    this.handlePoolPostgres.connect((err, handle, done) => {
        if(err) { throw(err); }

        log.debug("Check database exists: " + this.config.PGAdapter.database + " tables "+table+";");
        handle.query("select count(*) from pg_catalog.pg_database where datname = $1", [this.config.PGAdapter.database],
            (err, res) => {
            if(err) { throw(err); }

            if(res.rows[0].count !== '0') {
              // database exists
              log.debug("Database exists: " + this.config.PGAdapter.database);
              log.debug("Postgres connection pool is ready, db " + this.config.PGAdapter.database);
              this.initTables();
              done();
              return;
            }

            this.createDatabase(handle, done);
          });
    });
  };
  writeCandles() {
    if(_.isEmpty(this.cache)){
      return;
    }

    //log.debug('Writing candles to DB!');
    _.each(this.cache, candle => {
      var stmt =  `
    BEGIN; 
    LOCK TABLE ${this.table(candle.pair)} IN SHARE ROW EXCLUSIVE MODE; 
    INSERT INTO ${this.table(candle.pair)}
    (start, open, high,low, close, vwp, volume, trades) 
    VALUES 
    (${candle.start.unix()}, ${candle.open}, ${candle.high}, ${candle.low}, ${candle.close}, ${candle.vwp}, ${candle.volume}, ${candle.trades}) 
    ON CONFLICT ON CONSTRAINT ${this.table(candle.pair)}_start_key
    DO NOTHING; 
    COMMIT; 
    `;

      this.handlePool.connect((err,client,done) => {
        if(err) {
          util.die(err);
        }
        client.query(stmt, (err, res) => {
          done();
          if (err) {
            log.debug(err.stack)
          } else {
            //log.debug(res)
          }
        });
      });
    });

    this.cache = [];
  } //writeCandles
}

var generator = function(done, pluginMeta, pipe_config) {
//console.log('PGAdapter.generator',done, pluginMeta, pipe_config[config.adapter]);
  if(config.candleWriter.enabled) {
//    await PGAdapter.createInit(config);
    let adapter = null;
    try {
      adapter = PGAdapter.createInit(done, pipe_config[config.adapter]);
    } catch(e) {
      util.die(e);
    };
    return adapter; 
  }
};
module.exports = generator;
