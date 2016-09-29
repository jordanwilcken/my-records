'use strict';

var
  qPromises = require('q'),
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

app.all('*', function(request, response, next) {
  response.redirect('/login');
});

app.post('/login', function(request, response) {
  function checkPassword() {
    var
      deferred = qPromises.defer();

    bcrypt.compare(request.body.password, hash, function(err, res) {
      if (err || !res) {
        deferred.reject('sorry, the credentials are incorrect.');
      } else {
        deferred.resolve('I now give you happy token thing!');
      }
    });

    return deferred.promise;
  }
    checkPassword().then(sendToken, reportPasswordError);
});

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
  recordRepo.add(req.body)
    .then((val) => response.send("success!"), handleError);
});

// ----------------- BEGIN START SERVER -------------------
server.listen( port );
console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
);
// ------------------ END START SERVER --------------------
