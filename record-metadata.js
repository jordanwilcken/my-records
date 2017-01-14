function RecordMetadata(rawMetadata) {
  this.equals = function(otherMetadata) {
    return false;
  }
}

function constructMetadata(rawMetadata) {
  return new RecordMetadata(rawMetadata);
}

module.exports = constructMetadata;
