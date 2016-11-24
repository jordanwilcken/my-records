'use strict';

var
  fs = require('fs'),

  config = require('config'),
  bcrypt = require('bcrypt-nodejs'),
  cookieParser = require('cookie-parser'),
  uuid = require('node-uuid'),
  qPromises = require('q'),

  http    = require( 'http'     ),
  express = require( 'express'  ),
  helmet = require('helmet'),
  requestLogger = require('morgan'),
  bodyParser = require('body-parser'),
  upload = require('multer')(),

  appLogger = require('./app-logger.js'),
  recordRepo = require('./record-repository.js'),
  errs = require('./errs.js'),

  port = process.env.PORT || 3000,
  app     = express(),
  router = express.Router(),
  server  = http.createServer( app ),
  authCookies = [];

app.use(helmet());
app.use(bodyParser.json()); // for parsing application/json
app.use(cookieParser(config.get('secret')));
app.use(router);
app.use(express.static(__dirname + '/public'));
router.use(requestLogger('combined', {stream: fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})}));

function twoHoursFromNow() {
  var
    millisecondsPerSecond = 1000,
    secondsPerMinute = 60,
    minutesPerHour = 60,
    twoHours = 2,
    freturn = new Date(Date.now() + twoHours * minutesPerHour * secondsPerMinute * millisecondsPerSecond);

  appLogger.log('function "twoHoursFromNow" will return %s', freturn); 
  return freturn;
}

app.post('/login', function(request, response) {
  var
    newAuthCookieValue, newAuthCookieExpiration;

  if (!bcrypt.compareSync(request.body.password, config.get('password'))) {
    response.status(401).send("invalid credentials");
    return;
  }

  newAuthCookieValue = uuid.v1();
  newAuthCookieExpiration = twoHoursFromNow();
  authCookies.push({ cookieValue: newAuthCookieValue, expiration: newAuthCookieExpiration }); 
  response
    .cookie('authCookie', newAuthCookieValue, { signed: true, expires: newAuthCookieExpiration})
    .send();
});

function authCookieNotInList(cookie) {
  return authCookies.filter(function(aCookie) { return aCookie.cookieValue === cookie; }).length === 0;
}

function authCookieExpired(cookie) {
  var expiration = authCookies
    .filter(function(aCookie) { return aCookie.cookieValue === cookie; })
	.map(function(aCookie) { return aCookie.expiration; })
    [0]; 
 
  return expiration < new Date(Date.now());
}

function checkAuthenticated(request, response, next) {
  //if (authCookieNotInList(request.signedCookies.authCookie)
  //  || authCookieExpired(request.signedCookies.authCookie)) {
  //  authCookies = authCookies.filter(function(cookie) { return cookie.cookieValue !== request.signedCookies.authCookie; });
  //  response.status(401).send('You are not authenticated');
  //  return;
  //}

  //appLogger.log('function "checkAuthenticated" will now call function "next"');
  next();
}

app.all('*', checkAuthenticated);

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

app.get('/list', function(request, response) {
  recordRepo.getItems()
    .then(
      response.send.bind(response),
      (err) => {
        console.log("had an err with getItems " + err);
        response.status(500).send();
    });
});

app.get('/:id', function(request, response) {
  function returnData(data) {
    response.send(data);
  }

  function handleError(err) {
    appLogger.log('invoking function "handleError" with error %s', err);
    if (err === errs.RECORD_NOT_FOUND) {
      response.status(404).send('record not found');
    } else {
      response.status(500).send('sorry, trouble on the server');
    }
  }

  recordRepo.get(request.params.id)
    .then(returnData, handleError);
});

app.post('/', upload.single('pdf'), function(req, res) {
  var buffer = req.file && req.file.buffer ? req.file.buffer : undefined;
  recordRepo.add({desc: req.body.desc, pdf: buffer}).then(
    res.send.bind(res),
    res.status(400).send.bind(res));
});

app.post('/:id', upload.single('pdf'), function(req, res) {
  var
    proposedID = req.body.newID && req.body.newID.length > 0
      ? req.body.newID
      : req.params.id,
    buffer = req.file && req.file.buffer ? req.file.buffer : undefined;

  recordRepo.update(req.params.id, {id: proposedID, desc: req.body.desc, pdf: buffer})
    .then(
      res.send.bind(res),
      res.status(400).send.bind(res));
});

// ----------------- BEGIN START SERVER -------------------
server.listen( port );
appLogger.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
);
// ------------------ END START SERVER --------------------
