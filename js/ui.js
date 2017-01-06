var socket, canvas;

function evalMessage(data) {
	console.log('received message "'+data+'"');
}

function sendCanvas() { // set desired width in CANVAS_W
	var canvas2 = new fabric.Canvas();
	canvas2.loadFromJSON(JSON.stringify(canvas)); // duplicate ui canvas
	if (canvas.width != CANVAS_W) {
		var scale = CANVAS_W / canvas.width;
		var obj = canvas2.getObjects();
		for (var i in obj) {
			obj[i].scaleX = obj[i].scaleX * scale;
			obj[i].scaleY = obj[i].scaleY * scale;
			obj[i].left = obj[i].left * scale;
			obj[i].top = obj[i].top * scale;
		}
		canvas2.setWidth(canvas.getWidth() * scale);
		canvas2.setHeight(canvas.getHeight() * scale);
	}

	socket.send(JSON.stringify(canvas2));
}

function resizeCanvas() {
	if (canvas.width != $("#canvas-contain").width()) {
		var scale = $("#canvas-contain").width() / canvas.width;
		var obj = canvas.getObjects();
		for (var i in obj) {
			obj[i].scaleX = obj[i].scaleX * scale;
			obj[i].scaleY = obj[i].scaleY * scale;
			obj[i].left = obj[i].left * scale;
			obj[i].top = obj[i].top * scale;
			obj[i].setCoords();
		}

		canvas.setWidth(canvas.getWidth() * scale);
		canvas.setHeight(canvas.getHeight() * scale);
		canvas.renderAll();
		canvas.calcOffset();
	}

	$("#indicator").css({
		"width": canvas.getWidth()-20,
		"height": canvas.getHeight()-20,
	});
}

function onAir() {
	$("#indicator").css({
		"border": "10px solid rgba(255, 0, 0, .75)",
	});
}
function offAir() {
	$("#indicator").css({
		"border": "10px solid rgba(255, 0, 0, 0)",
	});
}

$(document).ready( function() {
	socket = openSocket(URL);

//////// CANVAS CODE
	(function() {
		var $ = function(id){return document.getElementById(id)};

		canvas = this.__canvas = new fabric.Canvas('c', {
			isDrawingMode: true
		});
		resizeCanvas();

		fabric.Object.prototype.transparentCorners = false;

		var drawingModeEl = $('drawing-mode'),
			drawingOptionsEl = $('drawing-mode-options'),
			drawingColorEl = $('drawing-color'),
			drawingLineWidthEl = $('drawing-line-width'),
			clearEl = $('clear-canvas');

		clearEl.onclick = function() {
			canvas.clear();
			sendCanvas();
		};

		drawingModeEl.onclick = function() {
			canvas.isDrawingMode = !canvas.isDrawingMode;
			if (canvas.isDrawingMode) {
				drawingModeEl.innerHTML = 'Cancel drawing mode';
				drawingOptionsEl.style.display = '';
			}
			else {
				drawingModeEl.innerHTML = 'Enter drawing mode';
				drawingOptionsEl.style.display = 'none';
			}
		};

		$('drawing-mode-selector').onchange = function() {
			canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);


			if (canvas.freeDrawingBrush) {
				canvas.freeDrawingBrush.color = drawingColorEl.value;
				canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
			}
		};

		drawingColorEl.onchange = function() {
			canvas.freeDrawingBrush.color = this.value;
		};
		drawingLineWidthEl.onchange = function() {
			canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
			this.previousSibling.innerHTML = this.value;
		};

		if (canvas.freeDrawingBrush) {
			canvas.freeDrawingBrush.color = drawingColorEl.value;
			canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
			canvas.freeDrawingBrush.shadowBlur = 0;
		}

	})();
//////// EOF CANVAS CODE

	$ = jQuery;
	$("#canvas-contain").on("click", function() {
		sendCanvas();
	});

	$("#fullscreen").on("click", function() {
		goFullscreen();
	});
});

function goFullscreen() {
	if (document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
	} else if (document.documentElement.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen();
	} else if (document.documentElement.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen();
	} else if (document.documentElement.webkitRequestFullscreen) {
		document.documentElement.webkitRequestFullscreen();
	}
}

$(window).resize(function () { // handle ui canvas size changes
	resizeCanvas();
});