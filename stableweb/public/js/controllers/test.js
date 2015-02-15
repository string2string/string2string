var test = angular.module('controllers.test', ['snap']);

function Test($rootScope, $scope, $http) {
  var canvas = $('#chalkboard')[0];
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;  
  var ctx = canvas.getContext('2d');
  var brushDiameter = 7;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';  
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';  
  ctx.lineWidth = brushDiameter;
  ctx.lineCap = 'round';
  ctx.globalCompositeOperation="destination-over";
  var backgroundImage = new Image();
  backgroundImage.src = '/img/bg.png';

  function draw(xLast, yLast, x, y) {
    ctx.strokeStyle = 'rgba(255,255,255,'+(0.4+Math.random()*0.2)+')';
    ctx.beginPath();
    ctx.moveTo(xLast, yLast);   
    ctx.lineTo(x, y);
    ctx.stroke();
          
    // Chalk Effect
    // change 7.5 to lower for more rectangles
    var length = Math.round(
      Math.sqrt(Math.pow(x-xLast,2)+Math.pow(y-yLast,2))/(7.5/brushDiameter));
    var xUnit = (x-xLast)/length;
    var yUnit = (y-yLast)/length;
    for(var i=0; i<length; i++ ) {
      var xCurrent = xLast+(i*xUnit); 
      var yCurrent = yLast+(i*yUnit);
      var xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;     
      var yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
      ctx.clearRect(xRandom, yRandom, Math.random()*2+2, Math.random()+1);
    }
  }

  //points passed in as [x1,y1,x2,y2]
  function drawPoints(points) {
    //need at least 2 points
    if (points.length < 4) {
      return;
    }
    points = getCurvePoints(points);
    var xLast = points[0];
    var yLast = points[1];
    //start at 2nd point
    for (i = 2; i < points.length; i+=2) {
      draw(xLast, yLast, points[i], points[i+1]);
      xLast = points[i];
      yLast = points[i+1];
    }
  }

  function drawPointsWait(points) {
    if (points.length < 4) {
      return;
    }
    points = getCurvePoints(points);
    var xLast = points[0];
    var yLast = points[1];
    var i = 2;
    var execDraw = function(intervalObj) {
      if (i >= points.length) {
        clearInterval(intervalObj.id);
        return;
      }
      draw(xLast, yLast, points[i], points[i+1]);
      xLast = points[i];
      yLast = points[i+1];
      i += 2;
    }
    var intervalObj = {}
    intervalObj.id = setInterval(function() {
      execDraw(intervalObj);
    }, 5);
  }

  function inflatePoints(points) {
    for (var i = 0; i < points.length; ++i) {
      if (i % 2 === 0) {
        points[i] = points[i]*canvas.width;
      } else {
        points[i] = points[i]*canvas.height;
      }
    }
    return points;
  }

  function eraseAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  //code to save file
  function saveAsFile(data, name) {
    function destroyClickedElement(event) {
      document.body.removeChild(event.target);
    }
    var fileNameToSaveAs = name;

    var downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download File';
    if (window.webkitURL)
    {
      // Chrome allows the link to be clicked
      // without actually adding it to the DOM.
      downloadLink.href = data;
    }
    else
    {
      // Firefox requires the link to be added to the DOM
      // before it can be clicked.
      downloadLink.href = data;
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
    }

    downloadLink.click();
  }

  function cloneCanvas(oldCanvas) {

    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one with background
    context.drawImage(backgroundImage,
      0,0,backgroundImage.width,backgroundImage.height,
      0,0,newCanvas.width,newCanvas.height);
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
  }

  //list of canvases
  
  var cachedBoards = {};
  $scope.cachedBoardIds = [];

  $scope.downloadCachedBoard = function(id) {
    saveAsFile(cachedBoards[id], 'canvas'+id+'.png');
  }

  var socket = io($rootScope.baseUrl);
  //socket.emit('my other event', { my: 'data' });
  socket.on('eraseAll', function() {
    var time = (new Date).getTime();
    cachedBoards[time] = cloneCanvas(canvas).toDataURL();
    $scope.cachedBoardIds.push(time);
    eraseAll();
  });
  socket.on('draw', function(data) {
    var points = inflatePoints(data.data);
    drawPoints(points);
  });
  socket.on('init', function(data) {
    for (var i = 0; i < data.data.length; ++i) {
      drawPoints(inflatePoints(data.data[i]))
    }
  });
  socket.emit('init');

  $scope.downloadBoard = function() {
    var newCanvas = cloneCanvas(canvas);
    var data = newCanvas.toDataURL();
    saveAsFile(data, 'canvas'+(new Date()).getTime()+'.png');
  }
}

test.controller('TestCtrl', ['$rootScope', '$scope', '$http', Test]);

