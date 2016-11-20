var humble = humble || {};

humble.itemElementFactory = (function() {
  function make_li_element(record) {
    var
      theItemElement = document.createElement("li");
    
    theItemElement.innerHTML = record.desc;

    return theItemElement;
  }

  return {
    make_li_element: make_li_element
  };
}());
