// Budfox is the realtime market for Gekko!
//
// Read more here:
// @link https://github.com/askmike/gekko/blob/stable/docs/internals/budfox.md
//
// > [getting up] I don't know. I guess I realized that I'm just Bud Fox.
// > As much as I wanted to be Gordon Gekko, I'll *always* be Bud Fox.
// > [tosses back the handkerchief and walks away]

var _ = require('lodash');
var async = require('async');

var util = require(__dirname + '/../util');
var dirs = util.dirs();

var Heart = require(dirs.budfox + 'heartClass');
var MarketDataProvider =  require(dirs.budfox + 'marketDataProvider');
var CandleManager = require(dirs.budfox + 'candleManager');
var Readable = require('stream').Readable;

class BudFox extends Readable {
  constructor(config) {
    super({objectMode: true});
    _.bindAll(this);

    // BudFox internal modules:

    this.heart = new Heart;
    this.marketDataProvider = new MarketDataProvider(config);
    this.candleManager = new CandleManager;
//     this.marketDataProvider.retrieve = this.marketDataProvider.retrieve.bind(this.marketDataProvider);
/*
       this.heart.emit = this.heart.emit.bind(this.heart, "tick");
    this.heart.tick = this.heart.tick.bind(this.heart);
//     this.heart.scheduleTicks = this.heart.scheduleTicks.bind(this.heart);

//       this.heart.pump = this.heart.emit.bind(this.heart);
  this.marketDataProvider.relayTrades = this.marketDataProvider.relayTrades.bind(this.marketDataProvider);
  this.pushCandles = this.pushCandles.bind(this.candleManager);
  this.candleManager.processTrades = this.candleManager.processTrades.bind(this.candleManager);
//  this.emit = this.emit.bind(this);
    //    BudFox data flow:
*/
    // relay a marketUpdate event
    this.marketDataProvider.on(
      'marketUpdate',
      e => this.emit('marketUpdate', e)
    );

    // relay a marketStart event
    this.marketDataProvider.on(
      'marketStart',
      e => this.emit('marketUpdate', e)
    );

    // Output the candles
    this.candleManager.on(
      'candles',
      this.pushCandles
    );

    // on every `tick` retrieve trade data
    this.heart.on(
      'tick',
      this.marketDataProvider.retrieve
    );

    // on new trade data create candles
    this.marketDataProvider.on(
      'trades',
      //this.candleManager.processTrades.bind(this.candleManager)
      this.candleManager.processTrades
    );

    this.heart.pump();
  }
  /*
BudFox.prototype = Object.create(Readable.prototype, {
  constructor: { value: BudFox }
});
*/

  _read() {}

  pushCandles(candles) {
    _.each(candles, this.push);
  }
}


module.exports = BudFox;
