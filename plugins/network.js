var toolkit = require('jsdx-toolkit');
var ConnMan = require('jsdx-connman');

var Network = function() {
	this.app = null;
	this.connman = new ConnMan;
	this.widget = null;
	this.spinner = null;
	this.menu = {
		window: null,
		title: null,
		list: null,
		services: []
	};
	this.technologies = [];
	this.statusIcon = null;
	this.currentService = null;
};

Network.prototype.init = function(app, settings) {
	var self = this;

	self.app = app;

	this.widget = new toolkit.Widget.BoxLayout;
	this.widget.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;

	/* Initializing Widgets */
	this.spinner = new toolkit.Widget.Spinner;
	this.spinner.animating = false;
	this.spinner.hide();
	this.widget.add(this.spinner);

	/* Initializing connection manager */
	this.connman.init(function() {

		/* Create icons */
		self.statusIcon = new toolkit.Widget.Image;

		/* Event binding */
		self.statusIcon.reactive = true;
		self.statusIcon.on(toolkit.EVENT_CLICK, function() {
			self.onClick();
		});

		/* Get all technologies */
		var techs = self.connman.GetTechnologies();
		var isConnected = false;
		for (var index in techs) {
			var technology = techs[index][1];
			technology.path = techs[index][0];

			self.technologies.push(technology);

			if (technology.Connected) {

				isConnected = true;

				if (technology.Type == 'wifi') {
					self.useWifi();
				} else if (technology.Type == 'ethernet') {
					self.useWired();
				}
			}
		}

		/* We have devices but connection is still not created */
		if (!isConnected && self.technologies.length > 0) {
			self.updateStatus();
		}

		self.widget.add(self.statusIcon);

		/* Monitor connection state */
		self.connman.onPropertyChanged(function(name, value) {

			if (name == 'State') {

				switch(value) {
				case 'ready':
				case 'online':
					self.connman.GetOnlineService(function(err, service) {

						/* Update Status */
						self.currentService = service;
						self.updateStatus();
					});

					break;

				case 'idle':

					/* Update Status */
					self.currentService = null;
					self.updateStatus();

					break;

				default:

					self.setSpinner(true);
				}
			}
		});

		self.connman.onOnlineServiceChanged(function(name, value) {

			/* Update property of service */
			if (self.currentService) {

				self.currentService[1][name] == value

				self.updateStatus();
			}
		});

	});

	return this.widget;
};

Network.prototype.uninit = function() {
	var self = this;
};

Network.prototype.useWifi = function() {
	var self = this;

	/* Get current Wifi status */
	self.connman.Wifi.GetStatus(function(err, service) {
		if (err)
			return;

		self.currentService = service;

		self.updateStatus();
	});
};

Network.prototype.useWired = function() {
	var self = this;

	/* Get current Wire status */
	self.connman.Wired.GetStatus(function(err, service) {
		if (err)
			return;

		self.currentService = service;

		self.updateStatus();
	});
};

Network.prototype.updateStatus = function() {
	var self = this;

	function updateIcon() {
		self.setSpinner(false);
	}

	if (!self.currentService) {
		self.statusIcon.loadFile(__dirname + '/../data/nm-no-connection.png', updateIcon);

		return;
	}

	switch(self.currentService[1].Type) {
	case 'wifi':

		/* Get Strength to update icon */
		Network.updateStrength(self.statusIcon, self.currentService[1].Strength, updateIcon);

		break;

	case 'ethernet':
		self.statusIcon.loadFile(__dirname + '/../data/nm-adhoc.png', updateIcon);

		break;
	}
};

Network.prototype.setSpinner = function(enabled) {
	var self = this;

	if (enabled) {
		self.statusIcon.hide();
		self.spinner.show();
		self.spinner.animating = true;
	} else {
		self.spinner.animating = false;
		self.spinner.hide();
		self.statusIcon.show();
	}
};

Network.prototype.onClick = function() {
	var self = this;

	function updateMenu(layout) {

		/* Clear */
		for (var index in self.menu.services) {
			self.menu.services[index].destroy();
		}
		self.menu.services = [];

		/* Scan and get access point list */
		self.connman.Wifi.Scan(function() {
			self.connman.Wifi.ListAPs(function(list) {

				for (var index in list) {
					var ap = list[index];
					var isUsed = false;
					if (self.currentService)
						isUsed = (self.currentService[0] == ap.dbusObject) ? true : false;

					var box = new toolkit.Widget.BoxLayout;
					box.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;
					box.width = self.menu.window.width;
//					box.height = 48;
					box.className = 'menu-item';
					box.reactive = true;

					var used = new toolkit.Widget.Image;
					if (isUsed) {
						used.loadFile(__dirname + '/../data/used.png');
					}
					used.width = 24;
					used.height = 24;
					box.add(used);

					var security = new toolkit.Widget.Image;
					if (ap.Security != 'none') {
						security.loadFile(__dirname + '/../data/locked.png');
					}
					security.width = 24;
					security.height = 24;
					box.add(security);
					
					var strength = new toolkit.Widget.Image;
					Network.updateStrength(strength, ap.Strength);
					box.add(strength);

					var ssid = new toolkit.Widget.Label();
					if (isUsed)
						ssid.className = 'network-used';

					if (ap.Name)
						ssid.text = ap.Name;
					else
						ssid.text = '* Hidden *';
					
					box.add(ssid);

					layout.add(box);

					self.menu.services.push(box);
				}
			});
		});
	}

	/* Initailizing menu window */
	if (self.menu.window) {
		if (self.menu.window.isVisible()) {
			self.menu.window.hide();
		} else {
			updateMenu(self.menu.list);

			self.menu.window.show();
		}
	} else {
		self.app.createWindow(function(window) {
			self.menu.window = window;

			window.windowType = toolkit.WINDOW_TYPE_POPUP_MENU;
			window.hasDecorator = false;
			window.setColor(2, 17, 18, 255);
			window.x = 0;
			window.y = self.app.getWidgetById('panel').height;
			window.width = 240;
			window.height = 320;
			window.show();

			/* Initializing layout */
			self.menu.list = new toolkit.Widget.BoxLayout;
			window.add(self.menu.list);

			self.menu.title = new toolkit.Widget.Label('Available Wifi Access Points:');
			self.menu.list.add(self.menu.title);

			updateMenu(self.menu.list);
		});
	}
	
};

/* Internal Functions */
Network.updateStrength = function(widget, strength, callback) {

	/* Get Strength to update icon */
	if (strength > 80)
		widget.loadFile(__dirname + '/../data/nm-signal-100.png', callback);
	else if (strength > 60)
		widget.loadFile(__dirname + '/../data/nm-signal-75.png', callback);
	else if (strength > 40)
		widget.loadFile(__dirname + '/../data/nm-signal-50.png', callback);
	else if (strength > 20)
		widget.loadFile(__dirname + '/../data/nm-signal-25.png', callback);
	else
		widget.loadFile(__dirname + '/../data/nm-signal-00.png', callback);
};

module.exports = {
	id: 'network',
	name: 'Network',
	description: 'Network manager plugin',
	version: '1.0',
	Class: Network
};
