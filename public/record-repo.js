var humble = humble || {};

(function() {

humble.RecordRepo = function() {
};

humble.RecordRepo.prototype.getAllRecords = function() {
  function getRecordsExecutor(resolve, reject) {
    var request = createRequest();
    request.onload = function() {
      if (checkSuccess(request)) {
        resolve(JSON.parse(request.response));
      } else {
	    reject(request.response);
      }
    };
    request.send();
  }

  return new Promise(getRecordsExecutor);
}

function createRequest() {
  var
    request = new XMLHttpRequest();

  request.open('get', 'list', true);
  return request;
}

function checkSuccess(xmlHttpRequest) {
  return xmlHttpRequest.status === 200;
}

}());
