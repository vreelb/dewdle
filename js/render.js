let canvas;
let color = {
	command: 'COLOR',
	color: "#000"
}
let size = {
	command: 'SIZE',
	size: "#000"
}

function evalMessage(msg) {
	let data = JSON.parse(msg);
	switch (data.command) {
		case ('UP'): // going on air
			if (!$('#c').is(':visible')) {
				$('#c').fadeIn(CONFIG.FADE_DURATION);
			}
			break;
		case ('DOWN'): // going off air
			if ($('#c').is(':visible')) {
				$('#c').fadeOut(CONFIG.FADE_DURATION);
			}
			break;
		case ('COLOR'):
			color = data;
			break;
		case ('SIZE'):
			size = data;
			break;
		default:
			canvas.loadFromJSON(msg, canvas.renderAll.bind(canvas));
	}
}

let dissappear = false;
function handleConnect() {
	if (dissappear) {
		clearTimeout(dissappear);
		dissappear = false;
		console.log('connection resumed, staying up');
		serialSend(canvas);
		serialSend({ command: 'UP' });
		serialSend(color);
		serialSend(size);
	}
}
function handleDisconnect() {
	if ($('#c').is(':visible')) {
		console.log('waiting for reconnect before going down...');
		dissappear = setTimeout(function() {
			console.log('connection not resumed, going down');
			dissappear = false;
			$('#c').fadeOut(CONFIG.FADE_DURATION, function() {
				canvas.clear();
			});
		}, CONFIG.FADE_TIMER);
	} else {
		canvas.clear();
	}
}

$(document).ready(function() {
	$.getJSON('./config.json', function (json) {
		CONFIG = json;
		let URL = CONFIG.BASE_URL + ':' + CONFIG.WEBSOCKET_PORT + '/render';
		canvas = this.__canvas = new fabric.StaticCanvas('c');
		canvas.setWidth(CONFIG.CANVAS_WIDTH);
		canvas.setHeight(CONFIG.CANVAS_HEIGHT);
		openSocket(URL);
	});
});
