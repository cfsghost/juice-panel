var toolkit = require('jsdx-toolkit');
var Display = require('jsdx-display');

var Config = require('./lib/config');
var Plugin = require('./lib/plugin');

/* Global variable */
var application = null;

/* Read config file */
var config = new Config;
config.init(function(err, settings) {

	initApplication(settings, function(err, app) {
		application = app;
	});
});

function initApplication(settings, callback) {

	/* Initializing Plugins */
	var plugin = new Plugin;
	plugin.init(function(err) {

		/* Initializing application */
		var app = new toolkit.Application('Juice Panel');
		app.loadStyleFile(__dirname + '/data/default.css');
		app.curPlugins = [];

		/* Initailizing desktop window */
		app.createWindow(function(window) {
			window.on(toolkit.EVENT_DESTROY, function() {
				app.quit();
			});

			/* Display */
			var display = new Display;

			/* Initializing window */
			window.title = 'Juice Desktop';
			window.windowType = toolkit.WINDOW_TYPE_DESKTOP;
			window.hasDecorator = false;
			window.setColor(0, 0, 0, 255);
			window.width = display.getScreenWidth();
			window.height = display.getScreenHeight();
			window.x = 0;
			window.y = 0;
			window.show();
		});

		/* Initailizing panel */
		app.createWindow(function(window) {
			window.on(toolkit.EVENT_DESTROY, function() {
				app.quit();
			});

			/* Display */
			var display = new Display;

			/* Initializing window */
			window.title = 'Juice Panel';
			window.windowType = toolkit.WINDOW_TYPE_DOCK;
			window.hasDecorator = false;
			window.useAlpha(true);
			window.opacity = 255;
			window.setColor(0, 0, 0, 255);
			window.width = display.getScreenWidth();
			window.height = 26;
			window.x = 0;
			window.y = 0;
			window.show();

			/* Initializing Layout */
			var layout = new toolkit.Group;
			window.add(layout);

			var rightBox = new toolkit.Widget.BoxLayout;
			rightBox.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;
			rightBox.setAnchorFromGravity(toolkit.GRAVITY_EAST);
			rightBox.x = window.width;
			rightBox.y = window.height * 0.5;
			layout.add(rightBox);

			if (settings == null)
				return;

			/* Loading all plugin of settings */
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

						}
					} else {
						rightBox.add(frame);
					}


					/* Initializing plugin */
					var p = plugin.initPlugin(module);
					var w = p.init(pluginConf);

					frame.add(w);

					/* Append to list */
					app.curPlugins.push(p);
				}
			}
			
		});

		app.run();

		callback(null, app);
	});
}
