var humble = humble || {};

humble.RecordsViewmodel = function(recordListings) {
  this.accept = function(visitor) {
    recordListings.forEach(function(record) { visitor.visit(record); });
  };
};

humble.RecordsViewmodel.prototype.getRecord = function(recordId) {
  function showPdf(pdf) {
    window.open(URL.createObjectURL(pdf));
  }

  function showError(err) {
    console.log("You had a err: " + err);
  }

  humble.requestFactory.requestPdf(recordId)
    .then(showPdf, showError);
};
