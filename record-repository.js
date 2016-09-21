var sqlite = require('sqlite3').verbose();
var config = require('config');
var qPromises = require('q');

var errs = require('./errs.js');

function add(pdfBuffer) {
  var
    deferred = qPromises.defer();

  new sqlite.Database(config.get("dbFile"), sqlite.OPEN_READWRITE, (err) => {
    if (err) {
      deferred.reject(new Error(errs.CANT_CONNECT_TO_DB));
    } else {
      deferred.resolve("connected to db");
    }
  });

  return deferred.promise;
}

function getFakeRepo() {
  return {
    add: () => { console.log("book added"); }
  };
}

module.exports = {
  add: add,
  getFakeRepo: getFakeRepo
};
