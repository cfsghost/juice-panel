var path = require('path');
var fs = require('fs');

var Config = module.exports = function() {
	this.defConfigFile = path.join(__dirname, '..', 'configs', 'default.json');
};

Config.prototype.init = function(configFile, callback) {

	fs.readFile(configFile || this.defConfigFile, 'utf8', function(err, data) {
		var config = null;

		if (!err)
			config = JSON.parse(data);

		process.nextTick(function() {
			callback(err, config);
		});

	});
};
