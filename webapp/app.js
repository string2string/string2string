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
var chatMessages = [];
var clients = [];
function relayBoardInfo(line) {
  var data = line.split(DELIM);
  var msgType = data.shift();
  if (msgType === 'E') {
    points = [];
    var randomClient;
    if (clients.length > 0) {
      randomClient = Math.floor(Math.random() * clients.length);
      console.log('send erase');
      clients[randomClient].emit('givemeBoardAndErase');
    }
    for (var i = 0; i < clients.length; ++i) {
      if (randomClient !== i) {
        clients[i].emit('eraseAll');
      }
    }
    //io.sockets.emit('eraseAll');
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

var options = {
  l: 'eng',
  binary: 'tesseract'
};
var tesseract = require('node-tesseract');
var fs = require('fs');

io.sockets.on('connection', function(socket) {

  clients.push(socket);

  socket.on('init', function() {
    socket.emit('init', {data: points});
  });

  socket.on('ocr', function() {
    var base64Data = req.body.data.replace(/^data:image\/png;base64,/, '');
    fs.writeFile(__dirname+'/out.png', base64Data, 'base64', function(err) {
      if (err) { 
        fs.unlinkSync(__dirname+'/out.png');
        return io.sockets.emit('ocr', {text: 'failed image serialization'});
      }
      tesseract.process(__dirname+'/out.png', options, function(err, text) {
        if (err) { return io.sockets.emit('ocr', {text: 'N/A'}); }
        fs.unlinkSync(__dirname+'/out.png');
        io.sockets.emit('ocr', {text: text});
      });
    });
  });

  // socket.on('chat', function(data) {
  //   chatMessages.push(data.line);
  //   io.sockets.emit('chat', {data: data.line});
  //   if (chatMessages.length > 50) {
  //     chatMessages.shift();
  //   }
  // });

  socket.on('disconnect', function() {
      var index = clients.indexOf(socket);
      if (index !== -1) {
          clients.splice(index, 1);
      }
  });
});

console.log('listening on port ' + configs.settings.port);
server.listen(configs.settings.port);
