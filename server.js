const WEBSOCKET_PORT = 12180;
const WEBSERVER_PORT = 80;

const express = require('express');
const app = express();
const wss = new (require('ws')).Server({ host: '::', port: WEBSOCKET_PORT});
const sendHeartbeats = require('ws-heartbeats');

app.use('/draw', express.static(__dirname + '/draw.html'));
app.use('/control', express.static(__dirname + '/control.html'));
app.use('/render', express.static(__dirname + '/render.html'));
app.use('/', express.static(__dirname));
app.all('*', function (req, res) {
	res.redirect('/');
});
app.listen(WEBSERVER_PORT, function () {
	console.log('Web server started on port ' + WEBSERVER_PORT + '...')
});

let sockets_draw = [], sockets_control = [], sockets_render = [];
let temp_canvas = '{"objects":[],"background":""}';
let status, color, size;

function stringSend(socket, msg) {
	socket.send(JSON.stringify(msg));
}

function socketSend(page, data) {
	if (page === 'draw') {
		sockets_draw.forEach(function (sock) {
			stringSend(sock, data);
		});
	} else if (page === 'control') {
		sockets_control.forEach(function (sock) {
			stringSend(sock, data);
		});
	} else if (page === 'render') {
		sockets_render.forEach(function (sock) {
			stringSend(sock, data);
		});
	}
}

wss.on('connection', function connection(ws, req) {
	const page = req.url.substring(1); // see who connected
	let place = -1;
	if (page === 'draw') { // save that for later...
		place = sockets_draw.push(ws);
	} else if (page === 'control') {
		place = sockets_control.push(ws);
	} else if (page === 'render') {
		place = sockets_render.push(ws);
	}
	place--;
	console.log(page+' '+place+' connected');

	sendHeartbeats(ws, {'heartbeatTimeout':30000, 'heartbeatInterval':10000});

	// Send current status of everything
	if (color) {
		stringSend(ws, color);
	}
	if (size) {
		stringSend(ws, size);
	}
	if ((page === 'draw') || (page === 'control')) {
		stringSend(ws, temp_canvas);
		if (status) {
			stringSend(ws, status);
		} else {
			stringSend(ws, { command: 'DOWN' });
		}
	} else if (status && (status.command === 'DOWN')) {
		stringSend(ws, temp_canvas);
	}

	ws.on('message', function incoming(raw_data) {
		data = JSON.parse(raw_data);
		let message = 'received \'' + raw_data + '\'';
		switch (data.command) {
			case ('DOWN'): // going off air
			case ('UP'): // going on air
				status = data; // keep track of the status
				break;
			case ('COLOR'):
				color = data;
				break;
			case ('SIZE'):
				size = data;
				break;
			default: // sending a canvas
				temp_canvas = data; // keep track of the canvas
				message = 'received canvas update';
		}
		message += ' from ' + page + ' ' + place;
		console.log(message);
		socketSend('draw', data);
		socketSend('control', data);
		socketSend('render', data);
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

console.log('Websocket server listening on port ' + WEBSOCKET_PORT + '...');
