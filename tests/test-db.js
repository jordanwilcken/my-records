function makeConnectionString(dbPath) {
  return "nice connection string";
}

function makeSomeRecords() {
  return [
    { "first record": "a record about squirrels" },
 	{ "second record": "a record about dogs" },
	{ "third record": "a biography" },
	{ "fourth record": "a gossip column" }
  ];
}

function TestDB(dbPath) {
  this.acceptConnectionVisitor = function(visitor) {
    visitor(makeConnectionString(dbPath));
  };

  this.getRecordMetadata = function() {
    return require('../record-metadata.js')(makeSomeRecords());
  };
}

function constructTestDB(dbPath) {
  return new TestDB(dbPath);
}

module.exports = constructTestDB;
