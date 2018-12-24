var key = null;
var settings = null;
var watch = null;
var config = null;

function init() {
  config = require('../../core/util.js').getConfig(key);

  watch = config.watch;
  if(watch) {
    settings = {
      exchange: watch.exchange,
      pair: [watch.currency, watch.asset]
    }
  }
  console.log("postgresUtil getConfig key [",key,"]", watch); 
}

/**
 * Postgres has tables in lowercase if you don't
 * escape their names. Which we don't and so let's
 * just lowercase them.
 */
function useLowerCaseTableNames() {
  return !config.postgresql.noLowerCaseTableName;
}

  // returns DB name (depends on single db setup)
  database: function () {
    init();
      config.postgresql.database :

  table: function (name) {
      name = watch.exchange.replace(/\-/g,'') + '_' + name;
    var fullName = [name, settings.pair.join('_')].join('_');
    return useLowerCaseTableNames() ? fullName.toLowerCase() : fullName;
  },

  startconstraint: function (name) {
    if (useSingleDatabase()) {
      name = watch.exchange.replace(/\-/g,'') + '_' + name;
    }
    var fullName = [name, settings.pair.join('_')].join('_');
    return useLowerCaseTableNames() ? fullName.toLowerCase() + '_start_key' : fullName + '_start_key';
  },

  // postgres schema name. defaults to 'public'
  schema: function () {
    init();
    return config.postgresql.schema ? config.postgresql.schema : 'public';
  }
}
