var toolkit = require('jsdx-toolkit');
var dateFormat = require('dateformat');

var Clock = function() {
	this.widget = null;
	this.timeoutID = null;
};

Clock.prototype.init = function(app, settings) {
	var self = this;

	this.widget = new toolkit.Widget.Label();

	function startTimer() {
		var now = new Date();

		self.widget.text = dateFormat(now, 'HH:MM');

		/* Next minute, do this because reduce power comsumption with avoiding update per second. */
		self.timeoutID = setTimeout(startTimer, (60 - now.getSeconds()) * 1000);
	}

	/* Timer for updating */
	startTimer();

	return this.widget;
};

Clock.prototype.uninit = function() {
	clearTimeout(this.timeoutID);
};

module.exports = {
	id: 'clock',
	name: 'Clock',
	description: 'Digital clock plugin',
	version: '1.0',
	Class: Clock
};
