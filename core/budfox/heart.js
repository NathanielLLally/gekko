// The heart schedules and emit ticks every 20 seconds.

var util = require(__dirname + '/../util');
var log = require(util.dirs().core + 'log');
var events = require( "events" );

var _ = require('lodash');
var moment = require('moment');

if (util.getConfig().watch.tickrate)
  var TICKRATE = util.getConfig().watch.tickrate;
else if(util.getConfig().watch.exchange === 'okcoin')
  var TICKRATE = 2;
else
  var TICKRATE = 20;

function Heart() {
  if (!(this instanceof Heart)) return new Heart();

  events.EventEmitter.call( this );
  this.lastTick = false;
  return this;
};

//Heart.prototype = new Heart();
Heart.prototype = Object.create(events.EventEmitter.prototype);
//util.makeEventEmitter(Heart);
//util.inherit( Heart, events.EventEmitter );

Heart.prototype.pump = function() {
  log.debug('scheduling ticks');
  this.scheduleTicks();
}
//setInterval(this.emit.bind(this, "tick"), 1000);
Heart.prototype.tick = function() {
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
//    this.emit.bind(this, "tick")
}

Heart.prototype.scheduleTicks = function() {
  var _this = this;
  _this.emit.bind(_this, "tick")
  setInterval(
    _this.tick,
    +moment.duration(TICKRATE, 's')
  );

  // start!
 // _.defer(this.emit.bind(this, "tick"));
  _.defer(_this.tick);
//  this.emit.bind(this, "tick");
//  _.defer(function() {this.tick}.bind(this));
};

module.exports = Heart;
