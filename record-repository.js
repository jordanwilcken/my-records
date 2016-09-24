var sqlite = require('sqlite3').verbose();
var config = require('config');
var qPromises = require('q');

var errs = require('./errs.js');

function checkDescLegit(record) {
  var
    desc = record.desc;

  return desc
    && desc.constructor.name === "String"
    && desc.length > 0;
}

function checkBufferLegit(record) {
  var
    buffer = record.pdf;

  return buffer
    && buffer.constructor.name === "Buffer"
    && buffer.length > 0;
}

function connect() {
  var
    db,
    deferred = qPromises.defer();

  db = new sqlite.Database(config.get("dbFile"), sqlite.OPEN_READWRITE, function(err) {
    if (err) {
      deferred.reject("there was an error connecting to the database - terribly sorry!");
    } else {
      deferred.resolve(db);
    }
  });

  return deferred.promise;
}

function reportError(deferred) {
  if (!deferred || !deferred.reject)
    throw new Error("Error handling is not properly configured.");

  return (err) => deferred.reject(err);
}


function get(id) {
  var
    deferred = qPromises.defer();

  function onGetFinished(err, row) {
    if (err) {
      deferred.reject("there was a problem getting the record");
    } else if (!row) {
      deferred.reject("record not found");
    } else {
      deferred.resolve(row);
    }
  }

  function getRowAndClose(db) {
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
      deferred.reject("it appears that the operation failed - terribly sorry!");
    }else {
      deferred.resolve("success!");
    }
  };
}

function add(record) {
  var
    deferred = qPromises.defer();

  if (!checkDescLegit(record) || !checkBufferLegit(record)) {
    deferred.reject(new Error(errs.INVALID_RECORD));
  } else {

    function addAndClose(db) {
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

function update(record) {
  var
    deferred = qPromises.defer();
  
  if (!checkDescLegit(record) || !checkBufferLegit(record)) {
    deferred.reject(new Error(errs.INVALID_RECORD));
  } else {
    function updateRowAndClose(db) {
      db.run(
		'UPDATE records SET desc = ?, pdf = ? WHERE rowid = ?',
		record.desc,
		record.pdf,
		record.id,
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
  getFakeRepo: getFakeRepo
};
