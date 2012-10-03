var toolkit = require('jsdx-toolkit');
var Display = require('jsdx-display');

var Desktop = module.exports = function(app, settings) {
	var self = this;

	self.app = app;
	self.settings = settings;

	self.widgets = {
		window: null,
		logo: null
	};
};

Desktop.prototype.init = function(callback) {
	var self = this;

	/* Initailizing desktop window */
	self.app.createWindow(function(window) {
		self.widgets.window = window;

		window.on('destroy', function() {
			self.app.quit();
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

		/* Initializing Layout */
		var layout = new toolkit.Group;
		window.add(layout);

		/* Logo */
		var logo = self.widgets.logo = new toolkit.Text(self.settings.desktop.logo.value);
		logo.setFontName('Droid Sans 72');
		logo.setColor(2, 17, 18, 255);
		logo.setAnchorFromGravity(toolkit.GRAVITY_CENTER);
		logo.x = window.width * 0.5;
		logo.y = window.height * 0.5;
		logo.scale(0.5, 0.5);
		logo.opacity = 0;
//		logo.rotate(0, toolkit.GRAVITY_CENTER);
		layout.add(logo);

		/* Animation */
		logo.animate(toolkit.EASE_OUT_CUBIC, 1000, {
			'scale-x': 1.0,
			'scale-y': 1.0,
			'opacity': 255
		}, function() {
			logo.animate(toolkit.EASE_OUT_CUBIC, 2000, {
				'rotation-angle-y': 360
			}, { loop: true });
		});

		if (callback)
			callback();
	});
};
