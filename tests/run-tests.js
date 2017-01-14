var errors = [];

errors.concat(
  require('./test-records-repo.js')());

reportErrors(errors);

function reportErrors(errors) {
  if (errors.length === 0) {
    console.log("All tests passed.");
  } else {
    errors.forEach(err => console.log(err));
  }
}
