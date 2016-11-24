window.addEventListener('load', function() {
  var
    recordRepo = new humble.RecordRepo(),
    makeRecordsView = humble.viewFactory.makeRecordsView,
    makeErrorView = humble.viewFactory.makeErrorView,

    appendTheView = function(view) {
      function getElementVisitor() {
        return {
          visit: function(el) {
            document.getElementById("browseView")
              .appendChild(el);
          }
        };
      };

      view.accept(getElementVisitor);
    };

  recordRepo.getAllRecords()
	.then(makeRecordsView, makeErrorView)
    .then(appendTheView, appendTheView);
});
