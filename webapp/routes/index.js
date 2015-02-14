//route for serving HTML pages and partials
'use strict';
(require('rootpath')());

module.exports = function(app) {
  var path = require('path');
  app.get('/partials/*', function(req, res) {
    var requestedView = path.join('./', req.url);
    res.render(requestedView);
  });

  app.get('/*', function(req, res) {
    res.render('index.html');
  });
}