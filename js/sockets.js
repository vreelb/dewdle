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
        console.log('ERROR: WebSocket connection closed.');
        handleDisconnect();
        setTimeout(function () {
          console.log('STATUS: Trying to reconnect...');
          open = false;
          openSocket(URL);
        }, CONFIG.RECONNECT_INTERVAL);
      }
    };

    ws.onerror = function () {
      console.log('ERROR: Unable to connect to `' + URL + '`');
      setTimeout(function () {
        console.log('STATUS: Trying to connect again...');
        openSocket(URL);
      }, CONFIG.RECONNECT_INTERVAL);
    };
    return ws;
  } else {
    console.log('ERROR: This browser does not support WebSockets.');
  }
}
