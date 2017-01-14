function makeRecordsRepo(connectionString) {
  function addRecords(records) {
    return require('./record-command-factory.js')
	  .makeInsertCommand(connectionString, records)
	  .execute();
  }

  return {
    addRecords: addRecords
  };
}

module.exports.makeRecordsRepo = makeRecordsRepo;
