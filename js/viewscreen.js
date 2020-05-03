let canvas;

function getNewCanvasJSON(newWidth) {
  newWidth = newWidth || CONFIG.CANVAS_WIDTH;

  let canvas2 = new fabric.Canvas();
  canvas2.loadFromJSON(JSON.stringify(canvas)); // duplicate ui canvas
  if (canvas.width != newWidth) {
    const scale = newWidth / canvas.width;
    let obj = canvas2.getObjects();
    for (let i in obj) {
      obj[i].scaleX = obj[i].scaleX * scale;
      obj[i].scaleY = obj[i].scaleY * scale;
      obj[i].left = obj[i].left * scale;
      obj[i].top = obj[i].top * scale;
    }
    canvas2.setWidth(canvas.getWidth() * scale);
    canvas2.setHeight(canvas.getHeight() * scale);
  }
  return JSON.stringify(canvas2);
}

function resizeCanvas(newWidth) {
  newWidth = newWidth || $('#canvas-contain').width();

  if (canvas.width != newWidth) {
    canvas.loadFromJSON(getNewCanvasJSON(newWidth));

    const scale = newWidth / canvas.width;
    canvas.setWidth(canvas.getWidth() * scale);
    canvas.setHeight(canvas.getHeight() * scale);
    canvas.renderAll();
    canvas.calcOffset();
  }

  if (on_air) {
    $('#indicator').css({
      width: canvas.getWidth() - 20,
      height: canvas.getHeight() - 20,
    });
  } else {
    $('#indicator').css({
      width: canvas.getWidth(),
      height: canvas.getHeight(),
    });
  }
}

function sendCanvas() {
  socket.send(getNewCanvasJSON(CONFIG.CANVAS_WIDTH));
}

let on_air = false;
function onAir() {
  $('#indicator').css({
    width: canvas.getWidth() - 20,
    height: canvas.getHeight() - 20,
    border: '10px solid rgba(255, 0, 0, .9)',
  });
  on_air = true;
}
function offAir() {
  $('#indicator').css({
    width: canvas.getWidth(),
    height: canvas.getHeight(),
    border: 'none',
  });
  on_air = false;
}

let color_updated = false;
let size_updated = false;
function evalMessage(msg) {
  let data = JSON.parse(msg);
  switch (data.command) {
    case COMMAND_UP:
      onAir();
      break;
    case COMMAND_DOWN:
      offAir();
      break;
    case COMMAND_COLOR:
      if ($('#drawing-color').val() !== data.color) {
        color_updated = true;
        $('#drawing-color').val(data.color).change();
      }
      break;
    case COMMAND_SIZE:
      if ($('#drawing-line-width').val() !== data.size) {
        size_updated = true;
        $('#drawing-line-width').val(data.size).change();
      }
      break;
    default:
      canvas.setWidth(CONFIG.CANVAS_WIDTH);
      canvas.setHeight(CONFIG.CANVAS_HEIGHT);
      canvas.loadFromJSON(msg, canvas.renderAll.bind(canvas));
      resizeCanvas();
  }
}

let dissappear, countdown, timer;
function handleConnect() {
  $('#indicator')
    .css({
      'background-image': 'none',
    })
    .html('');
  timer = CONFIG.FADE_TIMER / 1000;
  if (dissappear) {
    clearTimeout(dissappear);
    clearInterval(countdown);
    console.log('connection resumed');
  }
}
function handleDisconnect() {
  $('#indicator')
    .css({
      'background-image':
        'repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,0,0,.5) 35px, rgba(255,0,0,.5) 70px)',
    })
    .html('<h1>Connection Lost</h1>');
  if (on_air) {
    $('#indicator').append(
      '<h2>Render going down in ' + timer + ' seconds...</h2>'
    );
  } else {
    $('#indicator').append('<h2>Render is down.</h2>');
  }
  console.log('STATUS: Waiting for reconnect...');
  dissappear = setTimeout(function () {
    console.log("STATUS: Connection not resumed. Canvas is now automatically down.");
    dissappear = false;
    offAir();
  }, CONFIG.FADE_TIMER);
  if (on_air) {
    timer--;
    countdown = setInterval(function () {
      if (timer > 0) {
        $('#indicator h2').html(
          'Render going down in ' + timer-- + ' seconds...'
        );
      } else {
        clearInterval(countdown);
        $('#indicator h2').html('Render is down.');
      }
    }, 1000);
  }
}

$(window).resize(function () {
  // handle ui canvas size changes
  resizeCanvas();
  clearTimeout($.data(this, 'resizeTimer'));
  $.data(
    this,
    'resizeTimer',
    setTimeout(function () {
      size_updated = true;
      $('#drawing-line-width').change();
    }, 200)
  );
});

function bindSpacebar() {
  let key_down = false;
  $(document).keydown(function (event) {
    if (event.keyCode == 32) {
      // spacebar for up/down control
      event.preventDefault();
      if (!key_down) {
        if (on_air) {
          stringSend({ command: COMMAND_DOWN });
        } else {
          sendCanvas();
          stringSend({ command: COMMAND_UP });
        }
      }
      key_down = true;
    }
  });
  $(document).keyup(function (event) {
    if (event.keyCode == 32) {
      setTimeout(function () {
        // prevents animation conflicts
        key_down = false; // prevents held repeats
      }, CONFIG.FADE_DURATION);
    }
  });
}

$(document).ready(function () {
  $('#drawing-color').change(function () {
    if (!color_updated) {
      stringSend({ command: COMMAND_COLOR, color: this.value });
    }
    color_updated = false;
  });
  $('#drawing-line-width').change(function () {
    $('#line-info').html($('#drawing-line-width').val());
    if (!size_updated) {
      stringSend({ command: COMMAND_SIZE, size: this.value });
    }
    size_updated = false;
  });
  $('#indicator').html('<h1>No Connection</h1><h2>Trying to connect...</h2>');
});
