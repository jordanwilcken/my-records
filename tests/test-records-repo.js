function listMissingRecords() {
  return [];
}


function tryGettingTestRecords(testDB) {
  var
    recordsRepo,
    recordsRepoMetadata,
    errors = [],
    testDBMetadata = testDB.getRecordMetadata(),
    recordsGateway = require('../records-gateway.js');

  function visitConnectionString(connectionString) {
    recordsRepo = require('../powershell-records-repo.js')
	  .makeRecordsRepo(connectionString);
  }

  testDB.acceptConnectionVisitor(visitConnectionString);

  recordsRepoMetadata = recordsGateway.getMetadata(
	recordsRepo.getMetadata());

  if (!testDBMetadata.equals(recordsRepoMetadata))
  	errors.push("Failed to get records from test database.");

  return errors;
}

module.exports = function() {
  var
    errors = [],
	testDBPath = require('config').get('testDBPath');
	testDB = require('./test-db.js')(testDBPath);

  errors = errors.concat(tryGettingTestRecords(testDB));

  return errors;
}
