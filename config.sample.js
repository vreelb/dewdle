// URL of the server (include trailing slash)
var URL = "ws://" + location.hostname + ":12180/";
// be sure to update the PORT in server.js as well

// desired resolution of rendered image
const CANVAS_W = 1920;
const CANVAS_H = 1080;

// color choices for the draw page
const COLOR_SELECT = [
	"#FFFF00",
	"#FF0000",
	"#0000FF",
	"#000000",
];
// the control page can select a custom color
