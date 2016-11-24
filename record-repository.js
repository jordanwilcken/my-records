'use strict';

var sqlite = require('sqlite3').verbose();
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

  function getRowsAndClose(db) {
    var deferred = qPromises.defer();

    function onGetFinished(err, rows) {
      if (err) {
        appLogger.log('db error while calling function "recordRepo.get - the error: ' + err);
        deferred.reject(errs.SOME_DB_ERR);
      } else if (!rows || rows.length === 0) {
        appLogger.log('no rows fetched');
        deferred.reject(errs.RECORD_NOT_FOUND);
      } else {
        appLogger.log(rows.length + 'rows retrieved.');
        deferred.resolve(rows);
      }
    }

    appLogger.log('now calling function "getRowsAndClose"');
    db.all('SELECT rowid, desc FROM records', onGetFinished);
    db.close();

    return deferred.promise;
  }

  return connect().then(getRowsAndClose, reportErr);
}

function get(id) {
  var
    deferred = qPromises.defer();

  appLogger.log('calling the function "recordRepo.get" with id %n', id);
  function onGetFinished(err, row) {
    if (err) {
      appLogger.log('db error while calling function "recordRepo.get - the error: %s', err);
      deferred.reject(errs.SOME_DB_ERR);
    } else if (!row) {
      appLogger.log('no rows fetched');
      deferred.reject(errs.RECORD_NOT_FOUND);
    } else {
      appLogger.log(
        'row retrieved: rowid=%n, desc=%s, with blob of length %d',
        row.rowid,
        row.desc,
        row.pdf.length);
      deferred.resolve(row);
    }
  }

  function getRowAndClose(db) {
    appLogger.log('now calling function "getRowAndClose"');
    db.get('SELECT * FROM records WHERE rowid = ?', id, onGetFinished);
    db.close();
  }

  connect()
    .then(getRowAndClose, reportError(deferred));

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

  appLogger.log('now calling function "recordRepo.add"');

  if (!checkDescLegit(record) || !checkBufferLegit(record)) {
    appLogger.log('record was invalid, sending rejection');

    deferred.reject(errs.INVALID_RECORD);
  } else {
    function addAndClose(db) {
      appLogger.log('attempting to add record');

      db.run(
		"INSERT INTO records (desc, pdf) VALUES(?, ?)",
		record.desc,
		record.pdf,
		onRunFinished(deferred));
      db.close();
    }

    connect()
	  .then(addAndClose, reportError(deferred));   
  }

  return deferred.promise;
}

function update(id, record) {
  var
    deferred = qPromises.defer();

  appLogger.log('update started');
  
  if (!checkDescLegit(record) || !checkBufferLegit(record)
    || /^\d+$/.test(record.id) === false) {
    appLogger.log('invalid record, sending rejection');

    deferred.reject(new Error(errs.INVALID_RECORD));
  } else {
    function updateRowAndClose(db) {
      appLogger.log('now attempting to update record');

      db.run(
		'UPDATE records SET desc = ?, pdf = ?, rowid = ? WHERE rowid = ?',
		record.desc,
		record.pdf,
		record.id,
        id,
		onRunFinished(deferred));
      db.close();
    }
    
    connect()
      .then(updateRowAndClose, reportError(deferred));
  }

  return deferred.promise;
}


function getFakeRepo() {
  return {
    add: () => { console.log("book added"); }
  };
}

module.exports = {
  add: add,
  update: update,
  get: get,
  getItems: getItems,
  getFakeRepo: getFakeRepo
};
