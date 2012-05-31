var fs = require('fs');
var path = require('path');

var Plugin = module.exports = function() {
	this.pluginPath = [
		path.join(__dirname, '..', 'plugins')
	];

	this.availPlugins = {};
	this.plugins = [];
};

Plugin.prototype.init = function(callback) {

	for (var index in this.pluginPath) {

		this.scanPlugin(this.pluginPath[index], function() {
			callback(null);
		});
	}
};

Plugin.prototype.scanPlugin = function(dirPath, callback) {
	var self = this;

	function _load(files, index, complete) {
		if (index == files.length) {
			process.nextTick(complete);

			return;
		}

		var filename = files[index];

		/* Try to load plugin file */
		self.loadPluginFile(path.join(dirPath, filename), function() {

			_load(files, index + 1, complete);
		});
		
	}

	/* Getting file list in specific directory */
	fs.readdir(dirPath, function(err, files) {

		_load(files, 0, function() {

			callback();
		});
	});
};

Plugin.prototype.loadPluginFile = function(filePath, callback) {

	var plugin = require(filePath);

	if ('id' in plugin && 'name' in plugin && 'Class' in plugin) {
		this.registerPlugin(plugin);
	}

	process.nextTick(callback);
};

Plugin.prototype.registerPlugin = function(plugin) {

	this.availPlugins[plugin.id] = plugin;
};

Plugin.prototype.initPlugin = function(id) {

	if (id in this.availPlugins) {
		var p = new this.availPlugins[id].Class;

		this.plugins.push(p);

		return p;
	}

	return null;
};
