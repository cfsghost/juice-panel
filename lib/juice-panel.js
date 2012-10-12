
var path = require('path');

var toolkit = require('jsdx-toolkit');
var Display = require('jsdx-display');

var Config = require('./config');
var Sound = require('./sound');
var Desktop = require('./desktop');
var Panel = require('./panel');
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

		// Initializing application
		var app = new toolkit.Application('Juice Panel');
		app.display = new Display;
		app.pwd = path.normalize(__dirname + '/..');
		app.loadStyleFile(app.pwd + '/data/default.css');
		app.curPlugins = [];
		app.sound = new Sound;
		app.run();

		/* Initializing Plugins */
		var plugin = app.plugin = new Plugin;
		plugin.init(function(err) {

			// Initailizing desktop 
			var desktop = app.desktop = new Desktop(app, settings);
			desktop.init(function(err) {

				// Initializing panel
				var panel = app.panel = new Panel(app, settings);
				panel.init(function(err) {
					callback(null, app);
				});
			});

			// Signal handler
			process.on('uncaughtException', function(err) {
				console.log(err.stack);

				uninitApplication();
			});
			process.on('SIGHUP', uninitApplication);
			process.on('SIGINT', uninitApplication);
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
