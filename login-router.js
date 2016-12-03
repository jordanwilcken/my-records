'use strict';

var express      = require('express');

var appLogger = require('./app-logger.js');

function create(extractCredentials, authenticate, authCookieFactory, authCookieRepo) {
  appLogger.log("creating login router");

  var loginRouter  = express.Router();
  loginRouter.route('/').post(function(request, response) {
    var
      newAuthCookie;

    if (!authenticate(extractCredentials(request))) {
      response.status(401).send("invalid credentials");
      return;
    }
  
    newAuthCookie = authCookieFactory.createCookie();
    authCookieRepo.add(newAuthCookie);
    response
      .cookie('authCookie', newAuthCookie.value, { signed: true, expires: newAuthCookie.expiration})
      .send();
  });

  return loginRouter;
}

module.exports.create = create;
