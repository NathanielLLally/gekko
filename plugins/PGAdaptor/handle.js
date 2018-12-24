const _ = require('lodash');
const fs = require('fs');

const util = require('../../core/util.js');
const config = util.getConfig();
const dirs = util.dirs();

const log = require(util.dirs().core + 'log');
const pg = require('pg');

class PGAdaptor {
  //  factory pattern utility function
  //
  static async create(settings) {
    let self = null;
    try {
      self = new PGAdaptor(await Promise.resolve(settings));
    } catch (rejectedValue) {
      log.error("PGAdaptor borked, ",rejectedValue);
      throw rejectedValue;
    }
    return self;
  };

  static async createInit(settings) {
    let self = await PGAdaptor.create(settings);
    self.init()
    return self;
  };

  constructor (config) {
    _.bindAll(this);
    this.adapter = '';
    this.config = config;
    this.adapter = this.config.postgresql;
    this.version = this.adapter.version;
    this.mode = util.gekkoMode();
    this.connectionString = this.config.postgresql.connectionString;
    this.pool = null;
    this.poolCheck = null;
    this.client = null;
    this.table = null;
  };
  init (table) {
    if (table == null)
      util.die("handle.table implement me");
    this.handlePool = new pg.Pool({
      connectionString: this.connectionString + '/' + this.dbName()
    });
    this.handlePoolPostgres = new pg.Pool({
      connectionString: this.connectionString + '/postgres',
    });
    this.checkExists(this.table);
  };
  dbName() {
    return this.config.postgresql.database; 
  };
  createDatabase(done) {
    this.client.query("CREATE DATABASE " + this.dbName, err => {
        if(err) {
          log.debug("database already exists");
        }

        log.debug("Postgres connection pool is ready, db " + this.dbName);
        done();
        this.initTable();
        });
  };
  initTable(table) {
    const query =
      "CREATE TABLE IF NOT EXISTS "
      +table+` (
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

    this.pool.query(query, (err) => {
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

        log.debug("Check database exists: " + this.dbName + " tables "+table+";");
        handle.query("select count(*) from pg_catalog.pg_database where datname = $1", [this.dbName],
            (err, res) => {
            if(err) { throw(err); }

            if(res.rows[0].count !== '0') {
              // database exists
              log.debug("Database exists: " + this.dbName);
              log.debug("Postgres connection pool is ready, db " + this.dbName);
              this.initTables();
              done();
              return;
            }

            this.createDatabase(handle, done);
          });
    });
  }
}


// verify the correct dependencies are installed
const pluginHelper = require(dirs.core + 'pluginUtil');
const pluginMock = {
  slug: 'PostgreSQL Adaptor',
  dependencies: config.postgresql.dependencies
}

const cannotLoad = pluginHelper.cannotLoad(pluginMock);
if(cannotLoad) {
  util.die(cannotLoad);
}


module.exports = PGAdaptor;
//module.exports = pool;
