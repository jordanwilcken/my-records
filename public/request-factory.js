var humble = humble || {};

humble.requestFactory = (function() {
  function requestPdf(recordId) {
    function getPdfExecutor(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open('get', recordId, true);
	  request.responseType = 'blob';
      request.onload = function() {
        if (request.status === 200) {
          resolve(request.response);
        } else {
	      reject(request.response);
        }
      };
      request.send();
    }

    return new Promise(getPdfExecutor);
  }

  return {
    requestPdf: requestPdf
  };
}());
