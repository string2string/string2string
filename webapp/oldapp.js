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
// var net = require('net');
// var port = configs.settings.socketPort;
// var host = configs.settings.socketIp;
// var boardConnection = net.createConnection(port, host);

// var carrier = require('carrier');
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
var chatMessages = [];
function relayBoardInfo(line) {
  var data = line.split(DELIM);
  var msgType = data.shift();
  if (msgType === 'E') {
    // console.log('E!');
    points = [];
    io.sockets.emit('eraseAll');
  } else if (msgType === 'P') {
    console.log(data);
    if (data[0]) {
      data = data[0].split(PDELIM);
    } else {
      return;
    }
    data = data.map(function(elem) {
      return parseFloat(elem);
    });
    // var newData = [];
    // for (var i = 0; i < data.length; ++i) {
    //   newData.push(data[i].x);
    //   newData.push(data[i].y);
    // }
    io.sockets.emit('draw', {data: data});
    points.push(data);
    // console.log(points);
  } else {
    console.log('Invalid line: ', line);
  }
}
// carrier.carry(boardConnection, relayBoardInfo);
// function reconnect() {
//   setTimeout(function() {
//     boardConnection = net.createConnection(port, host);
//     carrier.carry(boardConnection, relayBoardInfo);
//     boardConnection.on('end', reconnect);
//   }, 3000);
// }

app.post('/chalkboard', function(req, res, next) {
  if (req.query.id !== 'string2string') {
    return res.sendStatus(401);
  }
  relayBoardInfo(req.query.query);
  res.sendStatus(200);
});

// boardConnection.on('end', reconnect);

io.sockets.on('connection', function(socket) {

  socket.on('init', function() {
    socket.emit('init', {data: points});
  });

  socket.on('chat', function(data) {
    chatMessages.push(data.line);
    io.sockets.emit('chat', {data: data.line});
    if (chatMessages.length > 50) {
      chatMessages.shift();
    }
  });
});

console.log('listening on port ' + configs.settings.port);
server.listen(configs.settings.port);