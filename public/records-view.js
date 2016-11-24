var humble = humble || {};

humble.RecordsView = function(makeItemElement, recordsViewmodel) {
  var viewElement = document.createElement('ul');

  this.visit = function(record) {
    var itemElement = makeItemElement(record);
    itemElement.onclick = function() {
      recordsViewmodel.getRecord(record.id);
    };
    
    viewElement.appendChild(itemElement);
  };

  this.accept = function(getElementVisitor) {
    getElementVisitor()
      .visit(viewElement);
  };

  recordsViewmodel.accept(this);
};
