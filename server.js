'use strict';

var
  config = require('config'),
  qPromises = require('q'),
  bcrypt = require('bcrypt-nodejs'),
  webToken = require('jsonwebtoken'),
  uuid = require('node-uuid'),
  http    = require( 'http'     ),
  express = require( 'express'  ),
  logger = require('morgan'),
  bodyParser = require('body-parser'),

  recordRepo = require('./record-repository.js'),
  errs = require('./errs.js'),

  port = process.env.PORT || 3000,
  app     = express(),
  router = express.Router(),
  server  = http.createServer( app ),
  authTokens = [];

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(router);
router.use(logger('combined'));

app.post('/login', function(request, response) {
  var newAuthToken;

  if (!bcrypt.compareSync(request.body.password, config.get('password'))) {
    response.status(401).send("invalid credentials");
    return;
  }

  newAuthToken = webToken.sign({ uuid: uuid.v1() }, config.get('secret'), { expiresIn: '2h' });
  authTokens.push(newAuthToken); 
  response.send(newAuthToken);
});

function checkAuthenticated(request, response, next) {
  var
    authToken = (function(authHeader) {
      var
        regexData = /Bearer (.+)$/.exec(authHeader);

	  return regexData && regexData.length > 1
        ? regexData[1]
        : null;
    }(request.get('Authorization'))),

    authTokenNotInList = authTokens.indexOf(authToken) === -1;

  if (authTokenNotInList) {
    response.status(401).send('You are not authenticated');
  } else {
    next();
  }
}

app.all('*', checkAuthenticated);

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

// ----------------- BEGIN START SERVER -------------------
server.listen( port );
console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
);
// ------------------ END START SERVER --------------------
