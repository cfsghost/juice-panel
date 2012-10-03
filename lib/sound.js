
var toolkit = require('jsdx-toolkit');

var Sound = module.exports = function(app) {
	var self = this;

	self.app = app;
	self.routes = {};
	self.triggers = {};
	self.queues = {};
	self.loops = {};
	self.sources = {
		tick: 'tick.wav',
		dataTick: 'data-tick.wav',
		layerTick: 'layer-tick.wav'
	};

	toolkit.gst_init();

	for (var ev in self.sources) {
		var soundfile = __dirname + '/../data/sounds/' + self.sources[ev];

		self.routes[ev] = 0;
		self.loops[ev] = 0;
		self.queues[ev] = 0;
		self.triggers[ev] = [];
		self.triggers[ev][0] = new toolkit.GstVideoTexture;
		self.triggers[ev][0].loadFile(soundfile);
		self.triggers[ev][1] = new toolkit.GstVideoTexture;
		self.triggers[ev][1].loadFile(soundfile);
		self.triggers[ev][2] = new toolkit.GstVideoTexture;
		self.triggers[ev][2].loadFile(soundfile);
	}
};

Sound.prototype.trigger = function(ev) {
	var self = this;
	var trigger = self.triggers[ev];

	self.queues[ev]++;
	if (self.queues[ev] == 1) {

		self.loops[ev] = setInterval(function() {
			if (self.queues[ev] <= 0) {
				self.queues[ev] = 0;
				clearInterval(self.loops[ev]);
				return;
			}

			self.queues[ev]--;

			trigger[self.routes[ev]].pause().setProgress(0).play();

			self.routes[ev]++;
			if (self.routes[ev] == 2)
				self.routes[ev] = 0;
		}, 50);
	}
};
