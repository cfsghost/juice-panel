
var path = require('path');

var toolkit = require('jsdx-toolkit');
var Display = require('jsdx-display');

var Config = require('./config');
var Sound = require('./sound');
var Desktop = require('./desktop');
var Plugin = require('./plugin');

module.exports = {}

module.exports.run = function(configFile) {
	/* Initializing */
	toolkit.useARGB(true);

	/* Global variable */
	var application = null;

	/* Read config file */
	var config = new Config;
	config.init(configFile, function(err, settings) {

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
			app.pwd = path.normalize(__dirname + '/..');
			app.loadStyleFile(app.pwd + '/data/default.css');
			app.curPlugins = [];
			app.sound = new Sound;
			app.run();

			/* Initailizing desktop */
			var desktop = new Desktop(app, settings);
			desktop.init(function(err) {
				console.log('Initialized desktop');
			});

			/* Initailizing panel */
			app.createWindow(function(window) {
				window.on('destroy', function() {
					app.quit();
				});

				/* Display */
				var display = new Display;

				/* Initializing window */
				window.title = 'Juice Panel';
				window.id = 'panel';
				window.className = 'panel';
				window.windowType = toolkit.WINDOW_TYPE_DOCK;
				window.hasDecorator = false;
				window.useAlpha = true;
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

				/* Left-side container */
				var leftBox = new toolkit.Widget.BoxLayout;
				leftBox.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;
				leftBox.setAnchorFromGravity(toolkit.GRAVITY_WEST);
				leftBox.x = 0;
				leftBox.y = 0;
				layout.add(leftBox);

				/* Right-side container */
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
				
			});

			process.on('uncaughtException', function(err) {
				console.log(err.stack);

				uninitApplication();
			});
			process.on('SIGHUP', uninitApplication);
			process.on('SIGINT', uninitApplication);

			callback(null, app);
		});
	}

	function uninitApplication() {

		/* Uninitializing plugins */
		for (var index in application.curPlugins) {
			var p = application.curPlugins[index];

			if (p.uninit)
				p.uninit();
		}

		process.nextTick(function() {
			process.exit(0);
		});
	}
};
