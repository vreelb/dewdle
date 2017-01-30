const PORT = "12180";

var http = require("http");
var net = require("net");
var sendHeartbeats = require('ws-heartbeats');

var wss = new (require("ws")).Server({port: PORT}), sockets = {}

wss.on("connection", function connection(ws) {
	var page = ws.upgradeReq.url.substring(1);		// see who connected
	sockets[page] = ws;								// save that for later...
	console.log(page+" connected");

	sendHeartbeats(ws, {"heartbeatTimeout":30000, "heartbeatInterval":10000});

	ws.on("message", function incoming(message) {
		console.log("received '"+message+"' from "+page);

		if (page == "draw") {
			if (sockets["render"]) {
				sockets["render"].send(message);
				console.log("sending '"+message+"' to render");
			} else {
				console.log("render not connected, unable to send message to render");
			}
			if (sockets["control"]) {
				sockets["control"].send(message);
				console.log("sending '"+message+"' to control");
			} else {
				console.log("control not connected, unable to send message to control");
			}
		}
	});

	ws.on("close", function () {
		delete sockets[page]
		console.log(page+" disconnected")
	});
});

console.log("server listening on port "+PORT+"...");