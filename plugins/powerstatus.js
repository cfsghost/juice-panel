var toolkit = require('jsdx-toolkit');
var Power = require('jsdx-power'); 

var IconType = {
	'AC_POWER': 0,
	'BATTERY_100': 1,
	'BATTERY_80': 2,
	'BATTERY_60': 3,
	'BATTERY_40': 4,
	'BATTERY_20': 5,
	'BATTERY_00': 6,
	'CHARGING_100': 7,
	'CHARGING_80': 8,
	'CHARGING_60': 9,
	'CHARGING_40': 10,
	'CHARGING_20': 11,
	'CHARGING_00': 12
};

var PowerStatus = function() {
	this.app = null;
	this.widget = null;
	this.spinner = null;
	this.icon = null;
	this.power = new Power;
};

PowerStatus.prototype.init = function(app, settings) {
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
	this.power.init(function() {
		self.updateStatus();

		self.power.onPropertyChanged(function() {
			self.updateStatus();
		});

		/* Hook battery */
		if (self.power.hasBattery) {

			/* Find out the battery */
			for (var index in self.power.devices) {
				var device = self.power.devices[index];
				if (device.type != 'Battery')
					continue;

				device.onPropertyChanged(function() {
					self.updateStatus();
				});
				break;
			}
		}
	});

	return this.widget;
};

PowerStatus.prototype.updateStatus = function() {
	var self = this;

	/* Using AC power right now */
	if (!self.power.onBattery) {
		if (self.power.hasBattery) {

			/* Find out the battery */
			for (var index in self.power.devices) {
				var device = self.power.devices[index];
				if (device.type != 'Battery')
					continue;

				var state = device.state;

				if (state == 'Fully charged') {
					self.updateIcon(IconType.AC_POWER);

					break;
				} else if (state == 'Charging') {

					/* Check percentage of energe */
					var percentage = device.percentage;
					if (percentage > 90)
						self.updateIcon(IconType.CHARGING_100);
					else if (percentage > 70)
						self.updateIcon(IconType.CHARGING_80);
					else if (percentage > 50)
						self.updateIcon(IconType.CHARGING_60);
					else if (percentage > 30)
						self.updateIcon(IconType.CHARGING_40);
					else if (percentage > 10)
						self.updateIcon(IconType.CHARGING_20);
					else
						self.updateIcon(IconType.CHARGING_00);

					break;
				}
			}
		} else {
			self.updateIcon(IconType.AC_POWER);
		}

	} else {

		/* Find out the battery */
		for (var index in self.power.devices) {
			var device = self.power.devices[index];
			if (device.type != 'Battery')
				continue;

			/* Check percentage of energe */
			var percentage = device.percentage;
			if (percentage > 90)
				self.updateIcon(IconType.BATTERY_100);
			else if (percentage > 70)
				self.updateIcon(IconType.BATTERY_80);
			else if (percentage > 50)
				self.updateIcon(IconType.BATTERY_60);
			else if (percentage > 30)
				self.updateIcon(IconType.BATTERY_40);
			else if (percentage > 10)
				self.updateIcon(IconType.BATTERY_20);
			else
				self.updateIcon(IconType.BATTERY_00);

			break;
		}
	}
};

PowerStatus.prototype.updateIcon = function(type) {
	var self = this;

	var iconPath = __dirname + '/../data';

	function loaded() {
		self.spinner.animating = false;
		self.spinner.hide();
		self.icon.show();
	}

	switch(type) {
		case IconType.AC_POWER:
			self.icon.loadFile(iconPath + '/ac-power.png', loaded);
			break;
		case IconType.BATTERY_100:
			self.icon.loadFile(iconPath + '/batt-100.png', loaded);
			break;
		case IconType.BATTERY_80:
			self.icon.loadFile(iconPath + '/batt-80.png', loaded);
			break;
		case IconType.BATTERY_60:
			self.icon.loadFile(iconPath + '/batt-60.png', loaded);
			break;
		case IconType.BATTERY_40:
			self.icon.loadFile(iconPath + '/batt-40.png', loaded);
			break;
		case IconType.BATTERY_20:
			self.icon.loadFile(iconPath + '/batt-20.png', loaded);
			break;
		case IconType.BATTERY_00:
			self.icon.loadFile(iconPath + '/batt-00.png', loaded);
			break;
		case IconType.CHARGING_100:
			self.icon.loadFile(iconPath + '/batt-charging-100.png', loaded);
			break;
		case IconType.CHARGING_80:
			self.icon.loadFile(iconPath + '/batt-charging-80.png', loaded);
			break;
		case IconType.CHARGING_60:
			self.icon.loadFile(iconPath + '/batt-charging-80.png', loaded);
			break;
		case IconType.CHARGING_40:
			self.icon.loadFile(iconPath + '/batt-charging-60.png', loaded);
			break;
		case IconType.CHARGING_20:
			self.icon.loadFile(iconPath + '/batt-charging-40.png', loaded);
			break;
		case IconType.CHARGING_00:
			self.icon.loadFile(iconPath + '/batt-charging-00.png', loaded);
			break;
	}
};

PowerStatus.prototype.uninit = function() {
};

module.exports = {
	id: 'powerstatus',
	name: 'Power Status',
	description: 'Power Status plugin',
	version: '1.0',
	Class: PowerStatus
};
