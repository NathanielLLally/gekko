// The heart schedules and emit ticks every 20 seconds.

var util = require(__dirname + '/../util');
var log = require(util.dirs().core + 'log');
var EventEmitter = require('events').EventEmitter;

var _ = require('lodash');
var moment = require('moment');

if (util.getConfig().watch.tickrate)
  var TICKRATE = util.getConfig().watch.tickrate;
else if(util.getConfig().watch.exchange === 'okcoin')
  var TICKRATE = 2;
else
  var TICKRATE = 20;

//var _singleton = null;
class Heart extends  EventEmitter {
  constructor() {
    super(); //must call super for "this" to be defined.
    this.lastTick = false;
    _.bindAll(this);
//    this.emit = this.emit.bind(this)
//    this.emit.bind(this, "tick")
//    this.scheduleTicks = this.scheduleTicks.bind(this)
//    this.pump = this.pump.bind(this)
  }
  pump() {
    log.debug('scheduling ticks');
    this.scheduleTicks();
  }

  static getInstance() {
    if (_singleton == null)
      _singleton = new Heart();
    return _singleton;
  }

  //setInterval(this.emit.bind(this, "tick"), 1000);
  tick() {
    //var _this = Heart.getInstance();
    var _this = this;
    console.log(_this);

    if(_this.lastTick) {
      // make sure the last tick happened not to lang ago
      // @link https://github.com/askmike/gekko/issues/514
      if(_this.lastTick < moment().unix() - TICKRATE * 3)
        util.die('Failed to tick in time, see https://github.com/askmike/gekko/issues/514 for details', true);
    }

    _this.lastTick = moment().unix();

    _this.emit('tick');
  }

  scheduleTicks() {
    var _this = this;
//    this.emit.bind(this, "tick")
    this.emit.bind(this, "tick")
    setInterval( _this.tick ,
      +moment.duration(TICKRATE, 's')
    );

    // start!
     // _.defer(_this.tick);
     _this.emit("tick");
    //  _.defer(function() {this.tick}.bind(this));
  }

};
module.exports = Heart;
