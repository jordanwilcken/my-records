'use strict';

var express      = require('express');
var loginRouter  = express.Router();
var config       = require('config');
var bcrypt       = require('bcrypt-nodejs');
var uuid         = require('node-uuid');

var appLogger = require('./app-logger.js');

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

loginRouter.route('/').post(function(request, response) {
  var
    newAuthCookieValue, newAuthCookieExpiration;

  if (!bcrypt.compareSync(request.body.password, config.get('password'))) {
    response.status(401).send("invalid credentials");
    return;
  }

  newAuthCookieValue = uuid.v1();
  newAuthCookieExpiration = twoHoursFromNow();
  //authCookies.push({ cookieValue: newAuthCookieValue, expiration: newAuthCookieExpiration }); 
  response
    .cookie('authCookie', newAuthCookieValue, { signed: true, expires: newAuthCookieExpiration})
    .send();
});

module.exports = loginRouter;
