window.addEventListener('load', function() {
  var
    recordRepo = new humble.RecordRepo(),

    makeRecordsView = function(listEl) {
      return function(recordCollection) {
        return new humble.RecordsView(listEl, new humble.RecordsViewModel(recordCollection));
      };
    },

    makeErrorView = function(err) { },

    recordListEl = document.getElementsByTagName('ul')[0];

  recordRepo.getAllRecords()
	.then(makeRecordsView(recordListEl), makeErrorView);
});
