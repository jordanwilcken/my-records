var humble = humble || {};

humble.RecordsViewmodel = function(recordListings) {
  this.accept = function(visitor) {
    recordListings.forEach(function(record) { visitor.visit(record); });
  };

  recordListings = [
    { id: 0, desc: "cool record" },
    { id: 1, desc: "hot record" },
    { id: 2, desc: "classified record" },
  ];
};

humble.RecordsViewmodel.prototype.getRecord = function(recordId) {
  console.log("getting record with id " + recordId);
};
