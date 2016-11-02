window.addEventListener('load', function() {
  var
    idInput = document.getElementsByName('recordID')[0];

  idInput.addEventListener('input', function() {
    document.getElementsByClassName('record-form')[0]
      .action = '../' + idInput.value; 
  });
});
