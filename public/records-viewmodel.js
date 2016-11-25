var humble = humble || {};

humble.RecordsViewmodel = function(recordListings, requestFactory) {
  this.accept = function(visitor) {
    recordListings.forEach(function(record) { visitor.visit(record); });
  };

  this.getRecord = function(recordId) {
    return requestFactory.requestPdf(recordId);
  };
};
