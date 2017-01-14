function makeRecordsRepo(connectionString) {
  function addRecords(records) {
    return require('./record-command-factory.js')
	  .makeInsertCommand(connectionString, records)
	  .execute();
  }

  function burnAllRecords() {
    return "";
  }

  function getMetadata() {
    return {
	  equals: function() {
      	return true;
	  }

    };
  }

  return {
    addRecords: addRecords,
	burnAllRecords, burnAllRecords,
    getMetadata, getMetadata
  };
}

module.exports.makeRecordsRepo = makeRecordsRepo;
