var humble = humble || {};

humble.RecordsView = function(makeItemElement, recordsViewmodel) {
  var viewElement = document.createElement('ul');

  function showPdf(pdf) {
    window.open(URL.createObjectURL(pdf));
  }

  function showError(err) {
    console.log("You had a err: " + err);
  }

  this.visit = function(record) {
    var itemElement = makeItemElement(record);
    itemElement.onclick = function() {
      recordsViewmodel
        .getRecord(record.rowid)
        .then(showPdf, showError);
    };
    
    viewElement.appendChild(itemElement);
  };

  this.accept = function(getElementVisitor) {
    getElementVisitor()
      .visit(viewElement);
  };

  recordsViewmodel.accept(this);
};
