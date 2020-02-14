
var chai = require('chai');
var expect = chai.expect;
var should = chai.should;
var assert = chai.assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var _ = require('lodash');
var moment = require('moment');

var tradeBatcherSpy = sinon.spy(TradeBatcher.prototype, 'write');
