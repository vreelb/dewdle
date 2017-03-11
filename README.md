# Dewdle
An open source Telestrator.

## Installation
For full installation details please see [INSTALL](https://github.com/vreelb/Dewdle/blob/master/INSTALL).
### Dependencies
* [Node.js](https://nodejs.org/) ([MIT](https://opensource.org/licenses/MIT)) - Communication between the control panel and CEF keyer is done using a simple Node server.

Installed by running `npm install` in the project root:
* [ws](http://websockets.github.io/ws/) ([MIT](https://opensource.org/licenses/MIT)) - Node needs web socket support.
* [ws-heartbeats](https://www.npmjs.com/package/ws-heartbeats) ([ISC](https://opensource.org/licenses/ISC)) - Helps keep web sockets alive.

### Recommended Keyer Programs
For usage in a streaming environment:
* [OBS Studio](https://obsproject.com/) ([GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)) - Version 18.0 includes 'Browser Plugin', earlier versions will need to manually install it.

For usage in a broadcast environment:
* [Exavideo Exacore Keyer](https://github.com/exavideo/exacore) ([GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html)) - The Exacore keyer is used for overlaying graphics onto a video feed.
* [Exacore CEF Plugin](https://github.com/exavideo/exacore-cef-plugin) ([BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause)) - The Exacore keyer needs CEF support.

## Usage
Dewdle is split into 3 pages (each of which can have multiple instances):
* Draw - Designed to be operated by talent to create drawings; has full drawing controls.
* Control - Designed for a control room operator; previews the drawing and controls live status.
* Render - Designed to be what is transparently overlaid onto a video feed, any program doing that should point at this page.

## License
Dewdle is licensed under GPL-3.0: [LICENSE](https://github.com/vreelb/Dewdle/blob/master/LICENSE)
### FOSS Inclusions
The following are included, whole or in part, within this project. All included materials must have compatible licenses.
* [jQuery](http://jquery.com/) - [MIT](https://jquery.org/license/)
* [Fabric.js](http://fabricjs.com/) - [MIT](https://opensource.org/licenses/MIT)
