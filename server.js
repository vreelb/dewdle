const PORT = "12180";

var http = require("http");
var net = require("net");
var sendHeartbeats = require('ws-heartbeats');

var wss = new (require("ws")).Server({port: PORT}), sockets = {}

var temp_canvas = '{"objects":[],"background":""}';
var status = "DOWN";

wss.on("connection", function connection(ws) {
	var page = ws.upgradeReq.url.substring(1);		// see who connected
	sockets[page] = ws;								// save that for later...
	console.log(page+" connected");

	sendHeartbeats(ws, {"heartbeatTimeout":30000, "heartbeatInterval":10000});

	if ((page == "draw")||(page == "control")) {
		ws.send(temp_canvas);
		ws.send(status);
	}

	ws.on("message", function incoming(message) {
		console.log("received '"+message+"' from "+page);

		if (sockets["draw"] && sockets["control"] && sockets["render"]) {
			switch (message) {
				case "UP":			// going on air
				case "DOWN":		// going off air
					status = message;		// keep track of the status either way
					sockets["draw"].send(message);
					sockets["control"].send(message);
					break;
				default:			// sending a canvas
					temp_canvas = message; // keep track of the canvas state
					if (page != "draw") {
						sockets["draw"].send(message);
					}
					if (page != "control") {
						sockets["control"].send(message);
					}
					sockets["render"].send(message);
			}
		} else {
			console.log("not all pages connected, correct before proceeding\npages connected: "+Object.keys(sockets));
		}

	});

	ws.on("close", function () {
		delete sockets[page]
		console.log(page+" disconnected")
	});
});

console.log("server listening on port "+PORT+"...");