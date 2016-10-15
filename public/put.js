window.addEventListener('load', function() {
  var
    idInput = document.getElementsByTagName('input')[0],
    submit = document.getElementsByTagName('button')[0];

  idInput.addEventListener('input', function() {
    document.getElementsByTagName('form')[0]
      .action = '../' + idInput.value; 
  });
});
