var humble = humble || {};

humble.viewFactory = (function() {
  function makeRecordsView(recordCollection) {
    return new humble.RecordsView(
      humble.itemElementFactory.make_li_element,
      new humble.RecordsViewmodel(recordCollection));
  }

  function makeErrorView(err) {
    var errorEl = document.createElement('p');
    errorEl.innerHTML = err;

    return {
      accept: function(getElementVisitor) {
        getElementVisitor()
          .visit(errorEl);
      }
    };
  }

  return {
    makeRecordsView: makeRecordsView,
    makeErrorView:   makeErrorView
  };
}());
