function checkAuthCookie() {
  return /authCookie=/.test(document.cookie);
}

function hideLogin() {
  document.getElementById('loginView')
    .classList
    .add('not-displayed');
}

function createRequest() {
  var
    password = document.getElementsByName('password')[0].value,
    request = new XMLHttpRequest();

  request.open('post', 'login', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send('{"password" : "' + password + '"}');
  return request;
}

function checkSuccess(xmlHttpRequest) {
  return xmlHttpRequest.status === 200;
}

window.addEventListener('load', function() {
  var
    request,
    loginButton = document.getElementById('loginButton');

  if (checkAuthCookie()) {
    hideLogin();
  } else {
    loginButton.onclick = function() {
      loginButton.disabled = true;
      
      request = createRequest();
      request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
          if (checkSuccess(request) && checkAuthCookie()) {
            hideLogin();
          } else {
            loginButton.disabled = false;
          }
        }
      };
 
      return false;
    } 
  }
});
