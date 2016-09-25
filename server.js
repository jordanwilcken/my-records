'use strict';

var
  http    = require( 'http'     ),
  express = require( 'express'  ),
  logger = require('morgan'),
  bodyParser = require('body-parser'),

  recordRepo = require('./record-repository.js'),
  errs = require('./errs.js'),

  port = process.env.PORT || 3000,
  app     = express(),
  router = express.Router(),
  server  = http.createServer( app );

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(router);
router.use(logger('combined'));

app.get('/:id', function(request, response) {
  function returnData(data) {
    response.send(data);
  }

  function handleError(err) {
    console.log("error handlin");
    if (err === errs.RECORD_NOT_FOUND) {
      response.status(404).send('record not found');
    } else {
      response.status(500).send('sorry, trouble on the server');
    }
  }

  recordRepo.get(request.params.id)
    .then(returnData, handleError);
});

app.post('/', function(req, res) {
});

// ----------------- BEGIN START SERVER -------------------
server.listen( port );
console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
);
// ------------------ END START SERVER --------------------
