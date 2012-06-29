var toolkit = require('jsdx-toolkit');
var JSDXSystray = require('jsdx-systray');

var Systray = function() {
	this.app = null;
	this.widget = null;
	this.systray = null;
	this.clients = {};
};

Systray.prototype.init = function(app, settings) {
	var self = this;

	self.app = app;

	/* Initializing Layout to embed icons */
	this.widget = new toolkit.Widget.BoxLayout;
	this.widget.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;

	/* Initializing Systray */
	this.systray = new JSDXSystray;

	if (!this.systray.hasSelectionOwner()) {
		/* Systray manager exists already */
		return this.widget;
	}

	/* Become systray manager */
	this.systray.acquireSelection();

	/* Listen to event sender */
	this.systray.on(this.systray.EVENT_ADD_CLIENT, function(w) {
		console.log('ADDED CLIENT! ' + w);

		/* X11 Event */
		var client = new toolkit.Texture(toolkit.TEXTURE_X11);
		client.width = 25;
		client.height = 25;
		client.reactive = true;
		client.hide();

		/* Pass through input event */
		client.on(toolkit.EVENT_PRESS, function(e, data) {
			self.systray.sendEvent(w, self.systray.EVENT_BUTTON_PRESS, data);
		});

		client.on(toolkit.EVENT_RELEASE, function(e, data) {
			self.systray.sendEvent(w, self.systray.EVENT_BUTTON_RELEASE, data);
		});

		self.widget.add(client);
		self.clients[w] = client;
	});

	this.systray.on(this.systray.EVENT_REMOVE_CLIENT, function(w) {

		if (self.clients.hasOwnProperty(w)) {
			console.log('REMOVED CLIENT!');

			self.clients[w].destroy();
			delete self.clients[w];
		}
	});

	this.systray.on(this.systray.EVENT_UNMAP_CLIENT, function(w) {

		if (self.clients.hasOwnProperty(w)) {
			console.log('UNMAPPED CLIENT!');

			self.clients[w].setX11WindowAutoSync(false);
			self.clients[w].hide();
		}
	});

	this.systray.on(this.systray.EVENT_MAP_CLIENT, function(w) {

		if (self.clients.hasOwnProperty(w)) {
			console.log('MAP CLIENT!');

			self.clients[w].setX11Window(w);
			self.clients[w].setX11WindowAutoSync(true);
			self.clients[w].show();
		}
	});

	return this.widget;
};

Systray.prototype.uninit = function() {
};

module.exports = {
	id: 'systray',
	name: 'Systray',
	description: 'Systray plugin',
	version: '1.0',
	Class: Systray
};
