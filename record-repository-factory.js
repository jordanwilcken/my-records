function makeRecordRepo() {
//  return require('./record-repository.js');

  return require('./fake-record-repository.js');
}

module.exports.makeRecordRepo = makeRecordRepo;
