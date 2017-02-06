const PORT = "12180";

var http = require("http");
var net = require("net");
var sendHeartbeats = require('ws-heartbeats');

var wss = new (require("ws")).Server({host: "::", port: PORT});
var sockets_draw = [];
var sockets_control = [];
var sockets_render = [];

var temp_canvas = '{"objects":[],"background":""}';
var status = "DOWN";

function socketSend(page, message) {
	if (page == "draw") {
		sockets_draw.forEach(function(sock) {
			sock.send(message);
		});
	} else if (page == "control") {
		sockets_control.forEach(function(sock) {
			sock.send(message);
		});
	} else if (page == "render") {
		sockets_render.forEach(function(sock) {
			sock.send(message);
		});
	}
}

wss.on("connection", function connection(ws) {
	var page = ws.upgradeReq.url.substring(1);		// see who connected
	var place = -1;
	if (page == "draw") {							// save that for later...
		place = sockets_draw.push(ws);
	} else if (page == "control") {
		place = sockets_control.push(ws);
	} else if (page == "render") {
		place = sockets_render.push(ws);
	}
	place--;
	console.log(page+" "+place+" connected");

	sendHeartbeats(ws, {"heartbeatTimeout":30000, "heartbeatInterval":10000});

	if ((page == "draw")||(page == "control")) {
		ws.send(temp_canvas);
		ws.send(status);
	}

	ws.on("message", function incoming(message) {
		console.log("received '"+message+"' from "+page+" "+place);

		switch (message) {
			case "UP":					// going on air
			case "DOWN":				// going off air
				status = message;		// keep track of the status either way
				socketSend("draw", message);
				socketSend("control", message);
				break;
			default:					// sending a canvas
				temp_canvas = message;	// keep track of the canvas state
				socketSend("draw", message);
				socketSend("control", message);
				socketSend("render", message);
		}

	});

	ws.on("close", function () {
		if (page == "draw") {
			delete sockets_draw[place];
		} else if (page == "control") {
			delete sockets_control[place];
		} else if (page == "render") {
			delete sockets_render[place];
		}
		console.log(page+" "+place+" disconnected");
	});
});

console.log("server listening on port "+PORT+"...");