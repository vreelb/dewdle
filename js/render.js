URL += 'render';

var canvas;
var color = {
	command: 'COLOR',
	color: COLOR_SELECT[0]
}
var size = {
	command: 'SIZE',
	size: SIZE_SELECT[0]
}

function evalMessage(msg) {
	var data = JSON.parse(msg);
	switch (data.command) {
		case ('UP'):			// going on air
			if (!$('#c').is(':visible')) {
				$('#c').fadeIn(FADE_DURATION);
			}
			break;
		case ('DOWN'):		// going off air
			if ($('#c').is(':visible')) {
				$('#c').fadeOut(FADE_DURATION);
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

var dissappear = false;
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
			$('#c').fadeOut(FADE_DURATION, function() {
				canvas.clear();
			});
		}, FADE_TIMER);
	} else {
		canvas.clear();
	}
}

$(document).ready(function() {
	canvas = this.__canvas = new fabric.StaticCanvas('c');
	canvas.setWidth(CANVAS_WIDTH);
	canvas.setHeight(CANVAS_HEIGHT);
	openSocket(URL);
});
