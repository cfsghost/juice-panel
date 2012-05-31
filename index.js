var toolkit = require('jsdx-toolkit');
var Display = require('jsdx-display');

var Config = require('./lib/config');
var Plugin = require('./lib/plugin');

/* Read config file */
var config = new Config;
config.init(function(err, settings) {

	initApplication(settings);
});

function initApplication(settings) {

	/* Initializing Plugins */
	var plugin = new Plugin;
	plugin.init(function(err) {

		/* Initializing application */
		var app = new toolkit.Application('Juice Panel');

		app.createWindow(function(window) {
			window.on(toolkit.EVENT_DESTROY, function() {
				app.quit();
			});

			/* Display */
			var display = new Display;

			/* Initializing window */
			window.useAlpha(true);
			window.opacity = 255;
			window.setColor(0, 0, 0, 255);
			window.width = display.getScreenWidth();
			window.height = 26;
			window.title = 'Juice Panel';
			window.show();

			/* Initializing Layout */
			var layout = new toolkit.Widget.BoxLayout;
			layout.orientation = toolkit.Widget.ORIENTATION_VERTICAL;
			layout.show();
			window.add(layout);

			if (settings == null)
				return;

			/* Loading all plugin of settings */
			if ('plugins' in settings) {

				for (var index in settings.plugins) {
					var id = settings.plugins[index].id
					var p = plugin.initPlugin(id);

					var w = p.init();
					layout.add(w);

					w.show();
				}
			}
			
		});

		app.run();
	});
}
