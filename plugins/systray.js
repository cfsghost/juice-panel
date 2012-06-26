var toolkit = require('jsdx-toolkit');
var JSDXSystray = require('jsdx-systray');

var Systray = function() {
	this.app = null;
	this.widget = null;
	this.systray = null;
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
		/* X11 Event */
//		self.app.getWidgetById('panel').embedX11Window(w);
		console.log(w);

		var client = new toolkit.Texture(toolkit.TEXTURE_X11);
		client.width = 25;
		client.height = 25;
		client.setX11Window(w);

		self.widget.add(client);

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
