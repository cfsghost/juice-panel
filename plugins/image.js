var toolkit = require('jsdx-toolkit');

var Image = function() {
	this.widget = null;
	this.filename = null;
};

Image.prototype.init = function(settings) {
	var self = this;

	this.widget = new toolkit.Widget.Image;

	if ('filename' in settings) {
		self.filename = settings.filename;

		self.widget.loadFile(self.filename);
	}

	return this.widget;
};

Image.prototype.uninit = function() {
};

module.exports = {
	id: 'image',
	name: 'Image',
	description: 'Image plugin',
	version: '1.0',
	Class: Image
};
