let canvas;
let color = '#000';
let size = 1;

function evalMessage(msg) {
  let data = JSON.parse(msg);
  switch (data.command) {
    case COMMAND_UP: // going on air
      if (!$('#c').is(':visible')) {
        $('#c').fadeIn(CONFIG.FADE_DURATION);
      }
      break;
    case COMMAND_DOWN: // going off air
      if ($('#c').is(':visible')) {
        $('#c').fadeOut(CONFIG.FADE_DURATION);
      }
      break;
    case COMMAND_COLOR:
      color = data.color;
      break;
    case COMMAND_SIZE:
      size = data.size;
      break;
    default:
      canvas.loadFromJSON(msg, canvas.renderAll.bind(canvas));
  }
}

let dissappear = false;
function handleConnect() {
  if (dissappear) {
    clearTimeout(dissappear);
    dissappear = false;
    console.log('STATUS: Connection resumed, staying up.');
    stringSend(canvas);
    stringSend({ command: COMMAND_UP });
    stringSend({ command: COMMAND_COLOR, color: color });
    stringSend({ command: COMMAND_SIZE, size: size });
  }
}
function handleDisconnect() {
  if ($('#c').is(':visible')) {
    console.log('STATUS: waiting for reconnect before going down...');
    dissappear = setTimeout(function () {
      console.log('STATUS: Connection not resumed, going down.');
      dissappear = false;
      $('#c').fadeOut(CONFIG.FADE_DURATION, function () {
        canvas.clear();
      });
    }, CONFIG.FADE_TIMER);
  } else {
    canvas.clear();
  }
}

$(document).ready(function () {
  $.getJSON('./config.json', function (json) {
    CONFIG = json;

    let URL = CONFIG.BASE_URL + ':' + CONFIG.WEBSOCKET_PORT + '/render';
    canvas = this.__canvas = new fabric.StaticCanvas('c');
    canvas.setWidth(CONFIG.CANVAS_WIDTH);
    canvas.setHeight(CONFIG.CANVAS_HEIGHT);
    openSocket(URL);
  });
});
