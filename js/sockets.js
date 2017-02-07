var socket;

function openSocket(URL) {
	if ("WebSocket" in window) {
		var open = false;
		var ws = new WebSocket(URL);

		ws.onopen = function() {
			console.log('connection opened');
			open = true;
			socket = this;
		};

		ws.onmessage = function (evt) {
			evalMessage(evt.data);
		};

		ws.onclose = function() {
			handleDisconnect();
			if (open) {
				console.log('connection closed');
				setTimeout( function() {
					console.log('trying to reconnect...');
					open = false;
					openSocket(URL);
				}, RECONNECT_INTERVAL);
			}
		};

		ws.onerror = function() {
			handleDisconnect();
			console.log('connection error');
			setTimeout( function() {
				console.log('trying to connect again...');
				openSocket(URL);
			}, RECONNECT_INTERVAL);
		};

	} else {
		console.log('this browser does not support web sockets...');
	}
	return ws;
}
