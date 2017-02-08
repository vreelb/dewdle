const PORT = '12180';

var http = require('http');
var net = require('net');
var sendHeartbeats = require('ws-heartbeats');

var wss = new (require('ws')).Server({host: '::', port: PORT});
var sockets_draw = [], sockets_control = [], sockets_render = [];

var temp_canvas = '{"objects":[],"background":""}';
var status, color;

function socketSend(page, message) {
	if (page === 'draw') {
		sockets_draw.forEach(function(sock) {
			sock.send(message);
		});
	} else if (page === 'control') {
		sockets_control.forEach(function(sock) {
			sock.send(message);
		});
	} else if (page === 'render') {
		sockets_render.forEach(function(sock) {
			sock.send(message);
		});
	}
}

wss.on('connection', function connection(ws) {
	var page = ws.upgradeReq.url.substring(1);		// see who connected
	var place = -1;
	if (page == 'draw') {							// save that for later...
		place = sockets_draw.push(ws);
	} else if (page == 'control') {
		place = sockets_control.push(ws);
	} else if (page == 'render') {
		place = sockets_render.push(ws);
	}
	place--;
	console.log(page+' '+place+' connected');

	sendHeartbeats(ws, {'heartbeatTimeout':30000, 'heartbeatInterval':10000});

	if ((page === 'draw')||(page === 'control')) {
		ws.send(temp_canvas);
		if (status) {
			ws.send(status);
		} else {
			ws.send('DOWN');
		}
		if (color) {
			ws.send('COLOR'+color);
		}
	} else if (status === 'DOWN') {
		ws.send(temp_canvas);
	}

	ws.on('message', function incoming(message) {
		switch (true) {
			case (message === 'DOWN'):				// going off air
				socketSend('render', temp_canvas);
			case (message === 'UP'):					// going on air
				status = message;		// keep track of the status either way
				console.log('received "'+message+'" from '+page+' '+place);
				socketSend('render', message);
				break;
			case (message.substring(0,5) === 'COLOR'):
				color = message.substring(5,12);
				console.log('received "'+message+'" from '+page+' '+place);
				break;
			default:					// sending a canvas
				temp_canvas = message;	// keep track of the canvas state
				console.log('received canvas update from '+page+' '+place);
				socketSend('render', message);
		}
		socketSend('draw', message);
		socketSend('control', message);
	});

	ws.on('close', function () {
		if (page === 'draw') {
			delete sockets_draw[place];
		} else if (page === 'control') {
			delete sockets_control[place];
		} else if (page === 'render') {
			delete sockets_render[place];
		}
		console.log(page+' '+place+' disconnected');
	});
});

console.log('server listening on port '+PORT+'...');
