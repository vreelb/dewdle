URL = URL + 'control';

$(document).ready(function() {
	$('#drawing-color').val(COLOR_SELECT[0]);	// set default brush color
	canvas = this.__canvas = new fabric.StaticCanvas('c');
	resizeCanvas();
	$("#canvas-contain").css({'max-height': 960*(CANVAS_WIDTH/CANVAS_HEIGHT)});

	socket = openSocket(URL);

	$('#clear-canvas').click(function() {
		canvas.clear();
		socket.send('{"objects":[],"background":""}');
	});
});

var key_down = false;
$(document).keydown(function(event) {
	if (event.keyCode == 32) {	// spacebar for up/down control
		event.preventDefault();
		if (!key_down) {
			if (on_air) {
				socket.send('DOWN');
			} else {
				socket.send('UP');
			}
		}
		key_down = true;
	}
});
$(document).keyup(function(event) {
	if (event.keyCode == 32) {
		setTimeout(function() {	// prevents animation conflicts
			key_down = false;		// prevents held repeats
		}, FADE_DURATION);
	}
});
