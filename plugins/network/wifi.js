var toolkit = require('jsdx-toolkit');
var Display = require('jsdx-display');

var Wifi = module.exports = function(app, connman) {
	var self = this;

	self.app = app;
	self.connman = connman;
	self.display = new Display;
	self.authDialog = {
		connectStatus: '',
		state: null,
		window: null,
		container: null,
		formTopLine: null,
		formBottomLine: null,
		form: null,
		passphrase_entry: null,
		connect_button: null,
		cancel_button: null,
		connectingLayer: null,
		connectingTopLine: null,
		connectingBottomLine: null,
		actionMessage: null,
		spinner: null
	};
};

Wifi.prototype.configureAuth = function() {
	var self = this;

	self.connman.Agent.on('Release', function() {
		console.log('Release');
	});

	self.connman.Agent.on('ReportError', function(path, err) {
		console.log('ReportError:');
		console.log(err);

		self.authDialog.connectStatus = err;

		switch(err) {
		case 'invalid-key':
			self.app.sound.trigger('accessDenied');
			self.authDialog.actionMessage.text = 'Authorization Failed';
			break;
		case 'connect-failed':
			self.app.sound.trigger('disconnect');
			self.authDialog.actionMessage.text = 'Connection Failed';
			break;
		}
	});

	self.connman.Agent.on('RequestBrowser', function(path, url) {
		console.log('RequestBrowser');
	});

	/* Initializing Agent for connectiing access point */
	self.connman.Agent.on('RequestInput', function(path, dict) {
		console.log(dict);

		/* Peixin */
		return { 'Passphrase': self.authDialog.passphrase_entry.text };

/*
		if ('Passphrase' in dict) {
			if ('WPS' in dict) {
				console.log('WPS');
				return { 'WPS': '08152268' };
			} else {
				return { 'Passphrase': 'CPBAE187' };
			}
		}
*/
	});

	self.connman.Agent.on('Cancel', function() {
		console.log('Cancel');
	});
};

Wifi.prototype.openAuthDialog = function(ap, complete) {
	var self = this;

	if (self.authDialog.window) {
		self.authDialog.window.show();

		self.app.sound.trigger('layerTick');

		if (complete)
			complete();

		return;
	}

	/* Configure Authorization */
	self.configureAuth();

	/* Create dialog for security */
	self.app.createWindow(function(window) {

		function connectingDialogInit(container) {

			var connectingLayer = self.authDialog.connectingLayer = new toolkit.Group;
			connectingLayer.opacity = 0;
			connectingLayer.x = self.authDialog.window.width;
			container.add(connectingLayer);

			// Line
			var line = self.authDialog.connectingTopLine = new toolkit.Rectangle(255, 255, 255, 255);
			line.opacity = 20;
			line.x = -self.authDialog.window.width;
			line.y = 20;
			line.width = self.authDialog.window.width;
			line.height = 20;
			container.add(line);

			var line = self.authDialog.connectingBottomLine = new toolkit.Rectangle(255, 255, 255, 255);
			line.opacity = 20;
			line.x = self.authDialog.window.width;
			line.y = self.authDialog.window.height - 40;
			line.width = window.width;
			line.height = 20;
			container.add(line);

			var spinner = self.authDialog.spinner = new toolkit.Widget.Spinner;
			spinner.setAnchorFromGravity(toolkit.GRAVITY_CENTER);
			spinner.x = self.authDialog.window.width * 0.5;
			spinner.y = self.authDialog.window.height * 0.5 - 30;
			connectingLayer.add(spinner);

			spinner.animate(toolkit.EASE_OUT_CUBIC, 2000, {
				'rotation-angle-y': 360
			}, { loop: true });
			spinner.setAnimate(toolkit.ANIMATION_STOP);

			var message = self.authDialog.actionMessage = new toolkit.Widget.Label('Connecting');
			message.className = 'network_dialog_action_message';
			message.setAnchorFromGravity(toolkit.GRAVITY_CENTER);
			message.x = self.authDialog.window.width * 0.5;
			message.y = self.authDialog.window.height * 0.5 + 50;
			connectingLayer.add(message);

			function _effectLoop() {
				var op = 0;

				if (message.opacity == 0)
					op = 255;
				else
					op = 0;

				message.animate(toolkit.EASE_IN_CUBIC, 800, {
					'opacity': op
				}, _effectLoop);
			}

			_effectLoop();
			message.setAnimate(toolkit.ANIMATION_STOP);
		}

		// Initializing window
		self.authDialog.window = window;

		window.title = 'Access Point Authorization';
		window.hasDecorator = false;
//		window.setAnchorFromGravity(toolkit.GRAVITY_CENTER);
		window.useAlpha = true;
		window.setColor(0, 0, 0, 0);
		window.width = 480;
		window.height = 320;
		window.x = (self.display.getScreenWidth() - window.width) * 0.5;
		window.y = (self.display.getScreenHeight() - window.height) * 0.5;
		window.show();

		var container = self.authDialog.container = new toolkit.Group;
		window.add(container);

		// Background
		var background = new toolkit.Rectangle(2, 17, 18, 230);
		background.width = window.width;
		background.height = window.height;
		container.add(background);

		// Initializing connecting dialog
		connectingDialogInit(container);

		// Initializing authorization dialog
		var form = self.authDialog.form = new toolkit.Group;
		container.add(form);

		// Line
		var line = self.authDialog.formTopLine = new toolkit.Rectangle(255, 255, 255, 255);
		line.opacity = 20;
		line.x = -window.width;
		line.y = 20;
		line.width = window.width;
		line.height = 20;
		container.add(line);

		var line = self.authDialog.formBottomLine = new toolkit.Rectangle(255, 255, 255, 255);
		line.opacity = 20;
		line.x = window.width;
		line.y = window.height - 40;
		line.width = window.width;
		line.height = 20;
		container.add(line);

		var message = new toolkit.Widget.Label('Require authorization, please type the passphrase.');
		message.x = 50;
		message.y = 100;
		form.add(message);

		var passphrase_entry = self.authDialog.passphrase_entry = new toolkit.Widget.Entry;
		//var passphrase_entry = self.authDialog.passphrase_entry = new toolkit.Text;
		passphrase_entry.className = 'entry';
		passphrase_entry.y = 150;
		passphrase_entry.width = window.width;
		passphrase_entry.height = 60;
		form.add(passphrase_entry);
		passphrase_entry.focus();

		var connect_button = self.authDialog.connect_button = new toolkit.Widget.Button('Connect');
		connect_button.width = 120;
		connect_button.height = 60;
		connect_button.x = window.width - 120;
		connect_button.y = window.height - 60;
		connect_button.on('click', function() {
			self._connectAccessPoint(ap);
		});
		form.add(connect_button);

		var cancel_button = self.authDialog.cancel_button = new toolkit.Widget.Button('Cancel');
		cancel_button.width = 120;
		cancel_button.height = 60;
		cancel_button.x = window.width - 240;
		cancel_button.y = window.height - 60;
		form.add(cancel_button);
		cancel_button.on('click', function() {

			self.app.sound.trigger('layerTick');

			self.authDialog.window.hide();
		});

		// Initializing state of UI
		var state = self.authDialog.state = new toolkit.State(500);
		state.set('prompt', [
			[ self.authDialog.formTopLine, 'x', toolkit.EASE_OUT_QUAD, 0 ],
			[ self.authDialog.formBottomLine, 'x', toolkit.EASE_OUT_QUAD, 0 ],
			[ self.authDialog.connectingTopLine, 'x', toolkit.EASE_OUT_QUAD, -window.width ],
			[ self.authDialog.connectingBottomLine, 'x', toolkit.EASE_OUT_QUAD, window.width ],
			[ self.authDialog.form, 'opacity', toolkit.EASE_OUT_CUBIC, 255 ],
			[ self.authDialog.form, 'x', toolkit.EASE_OUT_CUBIC, 0 ],
			[ self.authDialog.connectingLayer, 'opacity', toolkit.EASE_OUT_CUBIC, 0 ],
			[ self.authDialog.connectingLayer, 'x', toolkit.EASE_OUT_CUBIC, window.width ]
		]);

		state.set('connecting', [
			[ self.authDialog.formTopLine, 'x', toolkit.EASE_OUT_QUAD, -window.width ],
			[ self.authDialog.formBottomLine, 'x', toolkit.EASE_OUT_QUAD, window.width ],
			[ self.authDialog.connectingTopLine, 'x', toolkit.EASE_OUT_QUAD, 0 ],
			[ self.authDialog.connectingBottomLine, 'x', toolkit.EASE_OUT_QUAD, 0 ],
			[ self.authDialog.form, 'opacity', toolkit.EASE_OUT_CUBIC, 0 ],
			[ self.authDialog.form, 'x', toolkit.EASE_OUT_CUBIC, -window.width ],
			[ self.authDialog.connectingLayer, 'opacity', toolkit.EASE_OUT_CUBIC, 255 ],
			[ self.authDialog.connectingLayer, 'x', toolkit.EASE_OUT_CUBIC, 0 ]
			
		]);

		self.app.sound.trigger('layerTick');

		if (complete)
			complete();
	});
};

Wifi.prototype.connectAccessPoint = function(ap) {
	var self = this;

	/* Connect to access point right now */
	if (ap.Security == 'none' || ap.Favorite) {
		self.openAuthDialog(ap, function() {
			self._connectAccessPoint(ap);
		});

		return;
	}

	self.openAuthDialog(ap, function() {
		self.authDialog.spinner.setAnimate(toolkit.ANIMATION_STOP);
		self.authDialog.actionMessage.setAnimate(toolkit.ANIMATION_STOP);
		self.authDialog.state.setState('prompt');
		self.authDialog.passphrase_entry.focus();
	});
};

Wifi.prototype._connectAccessPoint = function(ap) {
	var self = this;

	self.authDialog.connectStatus = 'connecting';
	self.authDialog.spinner.setAnimate(toolkit.ANIMATION_PLAY);
	self.authDialog.actionMessage.text = 'Connecting';
	self.authDialog.actionMessage.setAnimate(toolkit.ANIMATION_PLAY);
	self.authDialog.state.setState('connecting');
	self.app.sound.trigger('layerTick');
	self.app.sound.trigger('connecting');

	setTimeout(function() {
		self.connman.Wifi.ConnectService(ap.dbusObject, function() {

			process.nextTick(function() {
				if (self.authDialog.connectStatus == 'invalid-key' || self.authDialog.connectStatus == 'connect-failed') {

					// Re-enter passphrase
					setTimeout(function() {
						self.authDialog.spinner.setAnimate(toolkit.ANIMATION_STOP);
						self.authDialog.actionMessage.setAnimate(toolkit.ANIMATION_STOP);
						self.authDialog.state.setState('prompt');
						self.authDialog.passphrase_entry.focus();
					}, 2000);

					return;
				}

				// Connection was established
				self.app.sound.trigger('accepted');
				self.authDialog.actionMessage.text = 'Connection Accepted';

				setTimeout(function() {
					self.app.sound.trigger('layerTick');

					self.authDialog.window.hide();
				}, 2000);
			});
		});
	}, 1000);
};
