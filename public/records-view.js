var humble = humble || {};

function makeItemElement(record) {
  var
    theItemElement = document.createElement("li");
  
  theItemElement.innerHTML = record.desc;
  theItemElement.onclick = function() {
    console.log("tell server I want a pdf. the id of the pdf is " + record.id);
  };
  return theItemElement;
}

humble.RecordsView = function(el, recordsViewModel) {
  recordsViewModel.recordCollection = [
    { id: 0, desc: "cool record" },
    { id: 1, desc: "hot record" },
    { id: 2, desc: "classified record" },
  ];

  recordsViewModel.recordCollection.forEach(function(record) {
    el.appendChild(makeItemElement(record));
  });
}
