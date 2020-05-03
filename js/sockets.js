// Socket logic and other js to include on all pages

// Command Constants
const COMMAND_UP = 'UP';
const COMMAND_DOWN = 'DOWN';
const COMMAND_COLOR = 'COLOR';
const COMMAND_SIZE = 'SIZE';

let CONFIG;

// Sends the stringified message object over the given websocket
function stringSend(msg) {
  socket.send(JSON.stringify(msg));
}

function openSocket(URL) {
  if ('WebSocket' in window) {
    let open = false;
    const ws = new WebSocket(URL);
    console.log('STATUS: Attempting to connect to `' + URL + '`...');

    ws.onopen = function () {
      console.log('STATUS: Connection to `' + URL + '` opened.');
      open = true;
      socket = this;
      handleConnect();
    };

    ws.onmessage = function (evt) {
      evalMessage(evt.data);
    };

    ws.onclose = function () {
      if (open) {
        console.log('STATUS: WebSocket connection to `' + URL + '` is closed.');
        handleDisconnect();
      }

      setTimeout(function () {
        open = false;
        openSocket(URL);
      }, CONFIG.RECONNECT_INTERVAL);
    };

    return ws;
  } else {
    console.log('ERROR: This browser does not support WebSockets.');
  }
}
