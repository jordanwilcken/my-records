'use strict';

var
  fs = require('fs'),

  config = require('config'),
  cookieParser = require('cookie-parser'),
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
  //rootRouter = require('./root-router.js'),
  loginRouter = require('./login-router.js'),
  server  = http.createServer( app ),
  authCookies = [];

app.use(helmet());
app.use(bodyParser.json()); // for parsing application/json
app.use(cookieParser(config.get('secret')));
app.use(router);
app.use('/login', loginRouter);
app.use(express.static(__dirname + '/public'));
router.use(requestLogger('combined', {stream: fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})}));

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
    response
      .set('Content-Type', 'application/pdf')
      .send(data);
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
