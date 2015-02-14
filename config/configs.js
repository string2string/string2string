'use strict';
(require('rootpath')());

var bodyParser = require('body-parser');
var cookieparser = require('cookie-parser');
var compress = require('compression');
var express = require('express');
var helmet = require('helmet');
var methodOverride = require('method-override');
var morgan = require('morgan');
var path = require('path');
var session = require('express-session');

var settings = require('./settings');

//exported configurations
var config = {
  configure: function(app) {
    app.use(helmet());
    app.use(morgan('short'));
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(compress());
    app.use(bodyParser());
    app.use(cookieparser());
    app.use(methodOverride());
    app.use(session({
      secret: settings.sessionSecret,
      key: 'sid'
    }));
  },
  settings: settings
}

module.exports = config;