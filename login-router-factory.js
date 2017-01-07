'use strict';

var config       = require('config');
var bcrypt       = require('bcrypt-nodejs');
var uuid         = require('node-uuid');

var appLogger = require('./app-logger.js');
var loginRouter = require('./login-router.js');

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

var authCookieFactory = {
  createCookie: function() {
    return {
      value: uuid.v1(),
      expiration: twoHoursFromNow()
    };
  }
};

var authCookieRepo = (function() {
  function add(authCookie) {
    console.log("adding an auth cookie to the auth cookie repo: " + authCookie);
  }

  return {
    add: add
  };
}());

function extractCredentials(request) {
  if (!request || !request.body || !request.body.password) {
    appLogger("unable to extract credentials - invalid request");
    throw new Error("request is not valid");
  }

  return request.body.password;
}

function authenticate(password) {
  if (!password) {
    appLogger("falsey password passed to authenticate");
    throw new Error("password is not valid");
  }

  return bcrypt.compareSync(password, config.get('password'));
}

function create() {
  return loginRouter.create(
    extractCredentials,
    authenticate,
    authCookieFactory,
    authCookieRepo);
}

module.exports.create = create;
