var toolkit = require('jsdx-toolkit');
var ConnMan = require('jsdx-connman');

var Network = function() {
	this.connman = new ConnMan;
	this.widget = null;
	this.spinner = null;
	this.technologies = [];
	this.statusIcon = null;
	this.currentService = null;
};

Network.prototype.init = function(settings) {
	var self = this;

	this.widget = new toolkit.Widget.BoxLayout;
	this.widget.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;

	/* Initializing Widgets */
	this.spinner = new toolkit.Widget.Spinner;
	this.spinner.animating = false;
	this.spinner.hide();
	this.widget.add(this.spinner);

	/* Initializing connection manager */
	this.connman.init(function() {

		/* Get all technologies */
		var techs = self.connman.GetTechnologies();
		for (var index in techs) {
			var technology = techs[index][1];
			technology.path = techs[index][0];

			self.technologies.push(technology);

			if (technology.Connected) {
				/* Create icons */
				self.statusIcon = new toolkit.Widget.Image;

				if (technology.Type == 'wifi') {
					self.useWifi();
				} else if (technology.Type == 'ethernet') {
					self.useWired();
				}

				self.widget.add(self.statusIcon);
			}
		}

		/* Monitor connection state */
		self.connman.onPropertyChanged(function(name, value) {
			console.log(name, value);

			if (name == 'State') {

				switch(value) {
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

		/* Monitor Signal Strength */
		setInterval(function() {
		}, 30000);

		self.connman.onOnlineServiceChanged(function(name, value) {

			/* Update property of service */
			if (self.currentService) {

				self.currentService[1][name] == value

				self.updateStatus();
			}
		});

		/* Monitor services */
//		self.connman.onServicesChanged(function(services, removed) {

//			if (self.currentService) {
//				console.log(services);

				/* Get connection which we are using currently */
//				for (var index in services) {
					/* Workaround: DBus module has a problem that return empty array rather than empty object */
//					if (services[index][1] instanceof Array) {
						/* No update */
//						continue;
//					}

//					if (services[index][1].State == 'online') {

						/* Switch to new service */
//						if (services[index][0] != self.currentService[0]) {
//							self.currentService = services[index];
//							self.updateStatus();

//							break;
//						}

						/* Update current service status */
//						self.currentService = services[index];
//						self.updateStatus();

//						if (self.currentService[1].Type == 'wifi')
//							console.log(self.currentService[1].Name, self.currentService[1].Strength);

//						break;
//					}

//				}
//			}

//		});
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
		if (self.currentService[1].Strength > 80)
			self.statusIcon.loadFile(__dirname + '/../data/nm-signal-100.png', updateIcon);
		else if (self.currentService[1].Strength > 60)
			self.statusIcon.loadFile(__dirname + '/../data/nm-signal-75.png', updateIcon);
		else if (self.currentService[1].Strength > 40)
			self.statusIcon.loadFile(__dirname + '/../data/nm-signal-50.png', updateIcon);
		else if (self.currentService[1].Strength > 20)
			self.statusIcon.loadFile(__dirname + '/../data/nm-signal-25.png', updateIcon);
		else
			self.statusIcon.loadFile(__dirname + '/../data/nm-signal-00.png', updateIcon);

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

module.exports = {
	id: 'network',
	name: 'Network',
	description: 'Network manager plugin',
	version: '1.0',
	Class: Network
};
