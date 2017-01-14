function listMissingRecords() {
  return [];
}

function makeSomeRecords() {
  return [
    { "first record": "a record about squirrels" },
 	{ "second record": "a record about dogs" },
	{ "third record": "a biography" },
	{ "fourth record": "a gossip column" }
  ];
}

function tryGettingTheRecordsList() {
  var
    recordsRepo,
	someRecords = makeSomeRecords();

  function setup() {
    var 
	  setupError,
	  connectionString = require('config')
		.get('connectionString');

    recordsRepo = require('../powershell-records-repo.js')
      .makeRecordsRepo('connectionString');

    setupError = recordsRepo.addRecords(someRecords);
	if (setupError && setupError.length > 0)
	  throw new Error("Failed to setup the get records list test.");
  }

  setup();

  return []
    .concat(listMissingRecords(recordsRepo, someRecords));
}

module.exports = function() {
  var errors = [];

  errors.concat(tryGettingTheRecordsList());

  return errors;
}
