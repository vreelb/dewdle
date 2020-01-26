function dataURLtoBlob(dataurl) {
	let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

$(document).ready(function() {
	$.getJSON('./config.json', function (json) {
		CONFIG = json;
		let URL = CONFIG.BASE_URL + ':' + CONFIG.WEBSOCKET_PORT + '/control';

		$('#drawing-color').val(CONFIG.COLOR_SELECT[0]);	// set default brush color
		$('#drawing-line-width').val(CONFIG.SIZE_SELECT[0]);	// set default brush size
		$('#line-info').html($('#drawing-line-width').val());
		canvas = this.__canvas = new fabric.StaticCanvas('c');
		resizeCanvas();
		$("#canvas-contain").css({ 'max-height': 960 * (CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT)});

		bindSpacebar();

		socket = openSocket(URL);

		$('#clear-canvas').click(function() {
			canvas.clear();
		});

		$('#save-png').click(function () {
			let tempCanvas = new fabric.Canvas();
			tempCanvas.setWidth(CONFIG.CANVAS_WIDTH);
			tempCanvas.setHeight(CONFIG.CANVAS_HEIGHT);
			tempCanvas.loadFromJSON(getNewCanvasJSON(CONFIG.CANVAS_WIDTH));

			let blob = dataURLtoBlob( tempCanvas.toDataURL({ format: 'png' }));
			saveAs(blob, 'canvas.png');
		});
		$('#save-json').click(function () {
			let blob = new Blob([getNewCanvasJSON(CONFIG.CANVAS_WIDTH)], { type: 'application/json; charset=utf-8' });
			saveAs(blob, 'canvas.json');
		});

		$('#load-json').click(function () {
			if ($('#load-json-text').val().length < 1) {
				return;
			}
			let abort = false;
			let oldWidth = canvas.getWidth();
			let oldHeight = canvas.getHeight();
			canvas.setWidth(CONFIG.CANVAS_WIDTH);
			canvas.setHeight(CONFIG.CANVAS_HEIGHT);
			try {
				canvas.loadFromJSON($('#load-json-text').val(), canvas.renderAll.bind(canvas));
			} catch (e) {
				abort = true;
				canvas.setWidth(oldWidth);
				canvas.setHeight(oldHeight);
				alert('Invalid JSON, loading aborted.');
			} finally {
				$('#load-json-text').val('');
				if (!abort) {
					resizeCanvas();
					sendCanvas();
				}
			}
		});
	});
});
