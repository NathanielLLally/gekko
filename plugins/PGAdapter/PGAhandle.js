const  util = require('../../core/util.js')
  , dirs = util.dirs()
  , config = util.getConfig()
  , log = require(dirs.core + 'log')
  , pg = require('pg')
;

var _singleton = null;
var _handlePool = null;
var _handlePoolPostgres = null;
class PGAhandle {
  static getInstance() {
    if (_singleton == null)
      try {
        _singleton = new PGAhandle(handle);
      } catch(e) {
        util.die(e);
      };

    return _singleton;
  };
  constructor(settings) {
    this.handlePool = new pg.Pool({
      connectionString: this.connectionString + '/' + this.config.PGAdapter.database
    });
  }
};
