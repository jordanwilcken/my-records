window.addEventListener('load', function() {
  var
    recordRepo = new humble.RecordRepo(),

    makeRecordsView = function(listEl) {
      return function(recordCollection) {
        return new humble.RecordsView(
          listEl,
          humble.itemElementFactory.make_li_element,
          new humble.RecordsViewmodel(recordCollection));
      };
    },

    makeErrorView = function(err) { },

    recordListEl = document.getElementsByTagName('ul')[0];

  recordRepo.getAllRecords()
	.then(makeRecordsView(recordListEl), makeErrorView);
});
