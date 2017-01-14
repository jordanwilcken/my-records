var makeMetadata = require('./record-metadata.js');

module.exports = {
  getMetadata: function(rawMetadata) {
    return makeMetadata(rawMetadata);
  }
};
