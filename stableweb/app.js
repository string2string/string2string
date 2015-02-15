//file used to load other routes
'use strict';
(require('rootpath')());

var express = require('express');
var app = module.exports = express();
var http = require('http');
var configs = require('config/configs');
configs.configure(app);

//configure endpoints:
require('routes/api')(app);
require('routes/index')(app);

var errorHandler = require('controllers/errorhandler').errorHandler;
app.use(errorHandler);
var server = http.createServer(app);

var io = require('socket.io')(server);

var DELIM = '~';
var PDELIM = ',';
/*
protocol:
points as list of x,y
  E - erase all
  e - points list (might be slow)
  P - list of points as P~x1,y1,x2,y2
 */
var points = [];
function relayBoardInfo(line) {
  var data = line.split(DELIM);
  var msgType = data.shift();
  if (msgType === 'E') {
    io.sockets.emit('eraseAll');
  } else if (msgType === 'P') {
    if (data[0]) {
      data = data[0].split(PDELIM);
    } else {
      return;
    }
    data = data.map(function(elem) {
      return parseFloat(elem);
    });
    io.sockets.emit('draw', {data: data});
    points.push(data);
  } else {
    console.log('Invalid line: ', line);
  }
}

app.post('/chalkboard', function(req, res, next) {
  if (req.query.id !== 'string2string') {
    return res.sendStatus(401);
  }
  relayBoardInfo(req.query.query);
  res.sendStatus(200);
});

io.sockets.on('connection', function(socket) {

  socket.on('init', function() {
    socket.emit('init', {data: points});
  });
  
});

console.log('listening on port ' + configs.settings.port);
server.listen(configs.settings.port);