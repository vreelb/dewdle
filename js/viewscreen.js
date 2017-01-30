var canvas;

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

$(window).resize(function () { // handle ui canvas size changes
	resizeCanvas();
});