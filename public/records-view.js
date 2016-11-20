var humble = humble || {};

humble.RecordsView = function(el, makeItemElement, recordsViewmodel) {
  this.visit = function(record) {
    var
      itemElement = makeItemElement(record);

    itemElement.onclick = function() {
      recordsViewmodel.getRecord(record.id);
    };

    el.appendChild(itemElement);
  };

  recordsViewmodel.accept(this);
};
