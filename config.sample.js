// URL of the server (include trailing slash)
var URL = 'ws://localhost:12180/';
//var URL = 'ws://' + location.hostname + ':12180/';
// be sure to update the PORT in server.js as well

// interval to retry websocket connection (ms)
const RECONNECT_INTERVAL = 1000;

// desired resolution of rendered image
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// duration of the fadeIn/fadeOut effect (ms)
const FADE_DURATION = 500;
// time before connection loss fadeOut (ms)
const FADE_TIMER = 5000;

// color choices for the draw page
const COLOR_SELECT = [
	'#FFFF00',
	'#FF0000',
	'#0000FF',
	'#000000',
];
// the control page can select a custom color

// brush sizes for the draw page (% relative to canvas)
const SIZE_SELECT = [
	1,
	2,
	3,
	4,
];
// the control page can select a custom size

// show/hide single-page operator mode
const SHOW_OP_MODE = true;
