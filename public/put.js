window.onload = function() {
  var
    idInput = document.getElementsByTagName('input')[0],
    submit = document.getElementsByTagName('button')[0];

  idInput.addEventListener('input', function() {
    document.getElementsByTagName('form')[0]
      .action = '../' + idInput.value; 
  });

  submit.onclick = function() {
    if (localStorage.getItem("authToken")) {
      return true;
    } else {
      console.log("You do not have an auth token, so there's not much point in submitting this form.");
      return false;
    }
  };
}
