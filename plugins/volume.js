var toolkit = require('jsdx-toolkit');
var Soundman = require('jsdx-soundman'); 

var IconType = {
	'MUTE': 0,
	'OFF': 1,
	'LOW': 2,
	'MEDIUM': 3,
	'HIGH': 4
};

var Volume = function() {
	this.app = null;
	this.widget = null;
	this.spinner = null;
	this.icon = null;
	this.soundman = new Soundman;
	this.currentVolume = 0;
};

Volume.prototype.init = function(app, settings) {
	var self = this;

	this.app = app;
	this.widget = new toolkit.Widget.BoxLayout;
	this.widget.orientation = toolkit.Widget.ORIENTATION_HORIZONTAL;

	/* Initializing Widgets */
	this.icon = new toolkit.Widget.Image;
	this.icon.hide();
	this.widget.add(this.icon);

	this.spinner = new toolkit.Widget.Spinner;
	this.spinner.animating = true;
	this.widget.add(this.spinner);

	/* Initializing power API */
	this.soundman.init(function(err) {
		if (err) {
			return;
		}

		self.updateStatus();

		self.soundman.on('SinkNotify', function() {
			self.updateStatus();
		});

		/* Binding input events */
		self.icon.reactive = true;
		self.icon.on(toolkit.EVENT_SCROLL, function(e, info) {
			if (info.direction == toolkit.SCROLL_DIRECTION_UP) {
				self.soundman.setVolume(self.currentVolume + 2);
			} else {
				self.soundman.setVolume(self.currentVolume - 2);
			}
		});
	});

	return this.widget;
};

Volume.prototype.updateStatus = function() {
	var self = this;

	if (self.soundman.isMuted()) {
		self.updateIcon(IconType.MUTE);

		return;
	}

	self.currentVolume = self.soundman.getVolume();
	if (self.currentVolume >= 75)
		self.updateIcon(IconType.HIGH);
	else if (self.currentVolume >= 50)
		self.updateIcon(IconType.MEDIUM);
	else if (self.currentVolume > 0)
		self.updateIcon(IconType.LOW);
	else
		self.updateIcon(IconType.OFF);
};

Volume.prototype.updateIcon = function(type) {
	var self = this;

	var iconPath = __dirname + '/../data';

	function loaded() {
		self.spinner.animating = false;
		self.spinner.hide();
		self.icon.show();
	}

	switch(type) {
		case IconType.MUTE:
			self.icon.loadFile(iconPath + '/audio-volume-mute.png', loaded);
			break;
		case IconType.OFF:
			self.icon.loadFile(iconPath + '/audio-volume-off.png', loaded);
			break;
		case IconType.LOW:
			self.icon.loadFile(iconPath + '/audio-volume-low.png', loaded);
			break;
		case IconType.MEDIUM:
			self.icon.loadFile(iconPath + '/audio-volume-medium.png', loaded);
			break;
		case IconType.HIGH:
			self.icon.loadFile(iconPath + '/audio-volume-high.png', loaded);
			break;
	}
};

Volume.prototype.uninit = function() {
};

module.exports = {
	id: 'volume',
	name: 'Audio volume',
	description: 'Audio volume plugin',
	version: '1.0',
	Class: Volume
};
