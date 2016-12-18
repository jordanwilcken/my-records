'use strict';

var config = require('config');
var qPromises = require('q');

var errs = require('./errs.js');
var appLogger = require('./app-logger.js');

function checkDescLegit(record) {
  var
    desc = record.desc;

  appLogger.log('checking if %s is a legitimate record description', record.desc);
  return desc
    && desc.constructor.name === "String"
    && desc.length > 0;
}

function checkBufferLegit(record) {
  var
    buffer = record.pdf;

  appLogger.log('checking that a legitimate buffer has been passed.');
  return buffer
    && buffer.constructor.name === "Buffer"
    && buffer.length > 0;
}

function connect() {
  var
    db,
    deferred = qPromises.defer();

  appLogger.log('now attempting to connect to database');
  db = new sqlite.Database(config.get("dbFile"), sqlite.OPEN_READWRITE, function(err) {
    if (err) {
      appLogger.log('handling db connection failure');
      deferred.reject("there was an error connecting to the database - terribly sorry!");
    } else {
      appLogger.log('successful connection to db');
      deferred.resolve(db);
    }
  });

  return deferred.promise;
}

function reportError(deferred) {
  if (!deferred || !deferred.reject)
    throw new Error("Error handling is not properly configured.");

  return (err) => {
    appLogger.log('rejecting a promise with the error %s', err);
    deferred.reject(err);
  }
}

function reportErr(err) {
  appLogger.log('rejecting a promise with the error %s', err);
}

function getItems() {
  var deferred = qPromises.defer();

  deferred.resolve([
    { id: 0, desc: "the first record", pdf: "this is not a real pdf" },
    { id: 1, desc: "the second record", pdf: "this is not a real pdf either" }
  ]);
  
  return deferred.promise;
}

function get(id) {
  var
    deferred = qPromises.defer();

  deferred.resolve("Here is the pdf I got for you.");

  return deferred.promise;
}

function onRunFinished(deferred) {
  return function(err) {
    if (err || this.changes === 0) {
      appLogger.log('failed db operation with err: %s', err);
      deferred.reject("it appears that the operation failed - terribly sorry!");
    }else {
      appLogger.log('successfully run db operation');
      deferred.resolve("success!");
    }
  };
}

function add(record) {
  var
    deferred = qPromises.defer();

  deferred.resolve("record added");

  return deferred.promise;
}

function update(id, record) {
  var
    deferred = qPromises.defer();

  deferred.resolve("update successfull!");

  return deferred.promise;
}

module.exports = {
  add: add,
  update: update,
  get: get,
  getItems: getItems,
};
