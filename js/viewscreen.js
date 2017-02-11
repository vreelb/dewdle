var canvas;

function resizeCanvas() {
	if (canvas.width != $('#canvas-contain').width()) {
		var scale = $('#canvas-contain').width() / canvas.width;
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

	if (on_air) {
		$('#indicator').css({
			'width': canvas.getWidth()-20,
			'height': canvas.getHeight()-20,
		});
	} else {
		$('#indicator').css({
			'width': canvas.getWidth(),
			'height': canvas.getHeight(),
		});
	}
}

var on_air = false;
function onAir() {
	$('#indicator').css({
		'width': canvas.getWidth()-20,
		'height': canvas.getHeight()-20,
		'border': '10px solid rgba(255, 0, 0, .9)',
	});
	on_air = true;
}
function offAir() {
	$('#indicator').css({
		'width': canvas.getWidth(),
		'height': canvas.getHeight(),
		'border': 'none',
	});
	on_air = false;
}

var color_updated = false;
function evalMessage(data) {
	switch (true) {
		case (data === 'UP'):				// going on air
			onAir();
			break;
		case (data === 'DOWN'):				// going off air
			offAir();
			break;
		case (data.substring(0,5) === 'COLOR'):
			if ($('#drawing-color').val() !== data.substring(5,12)) {
				color_updated = true;
				$('#drawing-color').val(data.substring(5,12)).change();
			}
			break;
		default:
			canvas.setWidth(CANVAS_WIDTH);
			canvas.setHeight(CANVAS_HEIGHT);
			canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
			resizeCanvas();
	}
}

var dissappear, countdown, timer;
function handleConnect() {
	$('#indicator').css({
		'background-image': 'none',
	}).html('');
	timer = FADE_TIMER/1000;
	if (dissappear) {
		clearTimeout(dissappear);
		clearInterval(countdown);
		console.log('connection resumed');
	}
}
function handleDisconnect() {
	$('#indicator').css({
		'background-image': 'repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,0,0,.5) 35px, rgba(255,0,0,.5) 70px)',
	}).html('<h1>Connection Lost</h1>');
	if (on_air) {
		$('#indicator').append('<h2>Render going down in '+timer+' seconds...</h2>');
	} else {
		$('#indicator').append('<h2>Render is down.</h2>');
	}
	console.log('waiting for reconnect...');
	dissappear = setTimeout(function() {
		console.log('connection not resumed, by now we\'re not live');
		dissappear = false;
		offAir();
	}, FADE_TIMER);
	if (on_air) {
		timer--;
		countdown = setInterval(function() {
			if (timer > 0) {
				$('#indicator h2').html('Render going down in '+timer--+' seconds...');
			} else {
				clearInterval(countdown);
				$('#indicator h2').html('Render is down.');
			}
		}, 1000);
	}
}

$(window).resize(function() { // handle ui canvas size changes
	resizeCanvas();
});

function bindSpacebar() {
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
}

$(document).ready(function() {
	$('#drawing-color').change(function() {
		if (!color_updated) {
			socket.send('COLOR'+this.value);
		}
		color_updated = false;
	});
	$('#indicator').html('<h1>No Connection</h1><h2>Trying to connect...</h2>');
});