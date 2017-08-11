URL += 'control';

function dataURLtoBlob(dataurl) {
	let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

$(document).ready(function() {
	$('#drawing-color').val(COLOR_SELECT[0]);	// set default brush color
	$('#drawing-line-width').val(SIZE_SELECT[0]);	// set default brush size
	$('#line-info').html($('#drawing-line-width').val());
	canvas = this.__canvas = new fabric.StaticCanvas('c');
	resizeCanvas();
	$("#canvas-contain").css({'max-height': 960*(CANVAS_WIDTH/CANVAS_HEIGHT)});

	bindSpacebar();

	socket = openSocket(URL);

	$('#clear-canvas').click(function() {
		canvas.clear();
		socket.send(JSON.stringify('{"objects":[],"background":""}'));
	});

	$('#save-png').click(function () {
		let tempCanvas = new fabric.Canvas();
		tempCanvas.setWidth(CANVAS_WIDTH);
		tempCanvas.setHeight(CANVAS_HEIGHT);
		tempCanvas.loadFromJSON(getNewCanvasJSON(CANVAS_WIDTH));

		let blob = dataURLtoBlob( tempCanvas.toDataURL({ format: 'png' }));
		saveAs(blob, 'canvas.png');
	});
	$('#save-json').click(function () {
		let blob = new Blob([getNewCanvasJSON(CANVAS_WIDTH)], { type: 'application/json; charset=utf-8' });
		saveAs(blob, 'canvas.json');
	});

	$('#load-json').click(function () {
		if ($('#load-json-text').val().length < 1) {
			return;
		}
		try {
			JSON.parse($('#load-json-text').val());
		} catch (e) {
			$('#load-json-text').val('');
			alert('Invalid JSON, loading aborted.');
			return;
		}

		canvas.setWidth(CANVAS_WIDTH);
		canvas.setHeight(CANVAS_HEIGHT);
		canvas.loadFromJSON($('#load-json-text').val(), canvas.renderAll.bind(canvas));
		resizeCanvas();
		sendCanvas();
		$('#load-json-text').val('');
	});
});
