'use strict';
const express = require('express');
const app = express();
const CONFIG = require('./config.json');
const wss = new (require('ws').Server)(
  {
    host: '::',
    port: CONFIG.WEBSOCKET_PORT,
  },
  function () {
    console.log(
      'Websocket server listening on port ' + CONFIG.WEBSOCKET_PORT + '...'
    );
  }
);
const sendHeartbeats = require('ws-heartbeats');

// Page Constants
const PAGE_DRAW = 'draw';
const PAGE_CONTROL = 'control';
const PAGE_RENDER = 'render';

// Command Constants
const COMMAND_UP = 'UP';
const COMMAND_DOWN = 'DOWN';
const COMMAND_COLOR = 'COLOR';
const COMMAND_SIZE = 'SIZE';

app.use('/draw', express.static(__dirname + '/draw.html'));
app.use('/control', express.static(__dirname + '/control.html'));
app.use('/render', express.static(__dirname + '/render.html'));
app.use('/', express.static(__dirname));
app.all('*', function (req, res) {
  res.redirect('/');
});
app.listen(CONFIG.WEBSERVER_PORT, function () {
  console.log('Web server started on port ' + CONFIG.WEBSERVER_PORT + '...');
});

const socketsDraw    = [];
const socketsControl = [];
const socketsRender  = [];
let tempCanvas = CONFIG.DEFAULT_CANVAS;
let status, color, size;

// Sends the stringified message object over the given websocket
function stringSend(socket, msg) {
  socket.send(JSON.stringify(msg));
}

// Sends the data to all pages of the given type
function socketSend(page, data) {
  let workingSockets = [];

  switch (page) {
    case PAGE_DRAW:
      workingSockets = socketsDraw;
      break;
    case PAGE_CONTROL:
      workingSockets = socketsControl;
      break;
    case PAGE_RENDER:
      workingSockets = socketsRender;
      break;
  }

  workingSockets.forEach(function (sock) {
    stringSend(sock, data);
  });
}

wss.on('connection', function connection(ws, req) {
  const page = req.url.substring(1); // see who connected
  let place = -1;

  // Add current connection to the correct pool based on page type
  switch (page) {
    case PAGE_DRAW:
      place = socketsDraw.push(ws);
      break;
    case PAGE_CONTROL:
      place = socketsControl.push(ws);
      break;
    case PAGE_RENDER:
      place = socketsRender.push(ws);
      break;
  }

  console.log(page + ' ' + --place + ' connected');

  // Keep websocket connection alive
  sendHeartbeats(ws, { heartbeatTimeout: 30000, heartbeatInterval: 10000 });

  // Send current configuration and canvas to new connections
  if (color) {
    stringSend(ws, color);
  }
  if (size) {
    stringSend(ws, size);
  }
  if (page === PAGE_DRAW || page === PAGE_CONTROL) {
    stringSend(ws, tempCanvas);
    if (status) {
      stringSend(ws, status);
    } else {
      stringSend(ws, { command: COMMAND_DOWN });
    }
  } else if (status && status.command === COMMAND_DOWN) {
    stringSend(ws, tempCanvas);
  }

  ws.on('message', function incoming(rawData) {
    const data = JSON.parse(rawData);
    let message = '';

    switch (data.command) {
      case COMMAND_DOWN: // going off air
      case COMMAND_UP: // going on air
        status = data; // keep track of the status
        break;
      case COMMAND_COLOR:
        color = data;
        break;
      case COMMAND_SIZE:
        size = data;
        break;
      default:
        // sending a canvas
        tempCanvas = data; // keep track of the canvas
        message = 'received canvas update';
    }

    message = message !== '' ? message : "received '" + rawData + "'";
    console.log((message += ' from ' + page + ' ' + place));

    socketSend(PAGE_DRAW, data);
    socketSend(PAGE_CONTROL, data);
    socketSend(PAGE_RENDER, data);
  });

  ws.on('close', function () {
    switch (page) {
      case PAGE_DRAW:
        delete socketsDraw[place];
        break;
      case PAGE_CONTROL:
        delete socketsControl[place];
        break;
      case PAGE_RENDER:
        delete socketsRender[place];
        break;
    }

    console.log(page + ' ' + place + ' disconnected');
  });
});
