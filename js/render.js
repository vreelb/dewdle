URL = URL + "render";

var canvas;

function evalMessage(data) {
	switch (true) {
		case (data==="UP"):			// going on air
			if (!$("#c").is(":visible")) {
				$("#c").fadeIn(FADE_DURATION);
			}
			break;
		case (data==="DOWN"):		// going off air
			if ($("#c").is(":visible")) {
				$("#c").fadeOut(FADE_DURATION);
			}
			break;
		case (data.substring(0,5)=="COLOR"):
			break;
		default:
			canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
	}
}

var dissappear;
function handleConnect() {
	if (dissappear) {
		clearTimeout(dissappear);
		console.log("connection resumed, staying up");
		socket.send(JSON.stringify(canvas));
		socket.send("UP");
	}
}
function handleDisconnect() {
	if ($("#c").is(":visible")) {
		console.log("waiting for reconnect before going down...");
		dissappear = setTimeout( function() {
			console.log("connection not resumed, going down");
			dissappear = false;
			$("#c").fadeOut(FADE_DURATION, function() {
				canvas.clear();
			});
		}, FADE_TIMER);
	} else {
		canvas.clear();
	}
}

$(document).ready( function() {
	canvas = this.__canvas = new fabric.StaticCanvas('c');
	canvas.setWidth(CANVAS_WIDTH);
	canvas.setHeight(CANVAS_HEIGHT);
	openSocket(URL);
});
