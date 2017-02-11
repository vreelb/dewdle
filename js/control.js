URL = URL + 'control';

$(document).ready(function() {
	$('#drawing-color').val(COLOR_SELECT[0]);	// set default brush color
	canvas = this.__canvas = new fabric.StaticCanvas('c');
	resizeCanvas();
	$("#canvas-contain").css({'max-height': 960*(CANVAS_WIDTH/CANVAS_HEIGHT)});

	bindSpacebar();

	socket = openSocket(URL);

	$('#clear-canvas').click(function() {
		canvas.clear();
		socket.send('{"objects":[],"background":""}');
	});
});
