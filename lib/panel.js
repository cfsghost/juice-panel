var toolkit = require('jsdx-toolkit');

var Panel = module.exports = function(app, settings) {
	var self = this;

	self.app = app;
	self.settings = settings;

	self.widgets = {
		window: null,
		layout: null,
		leftBox: null,
		rightBox: null
	};
};

Panel.prototype.init = function(callback) {
	var self = this;

	var app = self.app;

	/* Initailizing panel */
	app.createWindow(function(window) {
		self.widgets.window = window;

		window.on('destroy', function() {
			app.quit();
		});

		/* Initializing window */
		window.title = 'Juice Panel';
		window.id = 'panel';
		window.className = 'panel';
		window.windowType = toolkit.WINDOW_TYPE_DOCK;
		window.hasDecorator = false;
		window.useAlpha = true;
		window.opacity = 255;
		window.setColor(0, 0, 0, 255);
		window.width = app.display.getScreenWidth();
		window.height = 26;
		window.x = 0;
		window.y = 0;
		window.show();

		/* Initializing Layout */
		var layout = self.widgets.layout = new toolkit.Group;
		window.add(layout);

		/* Left-side container */
		var leftBox = self.widgets.leftBox = new toolkit.Widget.BoxLayout;
		leftBox.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;
		leftBox.setAnchorFromGravity(toolkit.GRAVITY_WEST);
		leftBox.x = 0;
		leftBox.y = 0;
		layout.add(leftBox);

		/* Right-side container */
		var rightBox = self.widgets.rightBox = new toolkit.Widget.BoxLayout;
		rightBox.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;
		rightBox.setAnchorFromGravity(toolkit.GRAVITY_EAST);
		rightBox.x = window.width;
		rightBox.y = window.height * 0.5;
		layout.add(rightBox);

		if (self.settings == null)
			return;

		/* Loading all plugin of settings */
		var settings = self.settings;
		var plugin = app.plugin;
		if ('plugins' in settings) {

			for (var index in settings.plugins) {
				var pluginConf = settings.plugins[index];
				var module = pluginConf.module
				var frame = new toolkit.Widget.Frame;

				/* Alignment */
				if ("align" in pluginConf) {

					if (pluginConf.align == 'center') {

						frame.setAnchorFromGravity(toolkit.GRAVITY_CENTER);
						frame.x = window.width * 0.5;
						frame.y = window.height * 0.5;
						layout.add(frame);

					} else if (pluginConf.align == 'left') {
						leftBox.add(frame);
					}
				} else {
					rightBox.add(frame);
				}

				/* Initializing plugin */
				var p = plugin.initPlugin(module);
				var w = p.init(app, pluginConf);

				frame.add(w);

				/* Append to list */
				app.curPlugins.push(p);
			}
		}

		if (callback)
			callback(null);
	});
};
