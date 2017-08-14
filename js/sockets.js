// catch lack of slash in URL
if (URL[URL.length - 1] != '/') {
	URL += '/';
}

function serialSend(msg) {
	socket.send(JSON.stringify(msg));
}

function openSocket(URL) {
	if ('WebSocket' in window) {
		let open = false;
		const ws = new WebSocket(URL);

		ws.onopen = function() {
			console.log('connection opened');
			open = true;
			socket = this;
			handleConnect();
		};

		ws.onmessage = function (evt) {
			evalMessage(evt.data);
		};

		ws.onclose = function() {
			if (open) {
				console.log('connection closed');
				handleDisconnect();
				setTimeout(function() {
					console.log('trying to reconnect...');
					open = false;
					openSocket(URL);
				}, RECONNECT_INTERVAL);
			}
		};

		ws.onerror = function() {
			console.log('connection error');
			setTimeout(function() {
				console.log('trying to connect again...');
				openSocket(URL);
			}, RECONNECT_INTERVAL);
		};
		return ws;
	} else {
		console.log('this browser does not support web sockets');
	}
}
