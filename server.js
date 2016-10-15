'use strict';

var
  config = require('config'),
  qPromises = require('q'),
  bcrypt = require('bcrypt-nodejs'),
  cookieParser = require('cookie-parser'),
  webToken = require('jsonwebtoken'),
  uuid = require('node-uuid'),
  http    = require( 'http'     ),
  express = require( 'express'  ),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  upload = require('multer')(),
  

  recordRepo = require('./record-repository.js'),
  errs = require('./errs.js'),

  port = process.env.PORT || 3000,
  app     = express(),
  router = express.Router(),
  server  = http.createServer( app ),
  authCookies = [];

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser(config.get('secret')));
app.use(router);
app.use(express.static(__dirname + '/public'));
router.use(logger('combined'));

function twoHoursFromNow() {
  var
    millisecondsPerSecond = 1000,
    secondsPerMinute = 60,
    minutesPerHour = 60,
    twoHours = 2;

  return new Date(Date.now() + twoHours * minutesPerHour * secondsPerMinute * millisecondsPerSecond);
}

app.post('/login', function(request, response) {
  var newAuthCookieValue;

  if (!bcrypt.compareSync(request.body.password, config.get('password'))) {
    response.status(401).send("invalid credentials");
    return;
  }

  newAuthCookieValue = uuid.v1();
  authCookies.push(newAuthCookieValue); 
  response
    .cookie('authCookie', newAuthCookieValue, { signed: true, expires: twoHoursFromNow()})
    .send();
});

function checkAuthenticated(request, response, next) {
  var
    authCookieNotInList = !request.signedCookies.authCookie
      || authCookies.indexOf(request.signedCookies.authCookie) === -1;

  if (authCookieNotInList) {
    response.status(401).send('You are not authenticated');
    return;
  }

  next();
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

app.post('/', upload.single('pdf'), function(req, res) {
  recordRepo.add({desc: req.body.desc, pdf: req.file.buffer}).then(
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
console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
);
// ------------------ END START SERVER --------------------
