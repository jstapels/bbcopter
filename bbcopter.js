//load node module requirements
var fs = global.fs = require('fs');
var util = require('util');
var async = require('async');
global.log = require('./tools/logger.js');

/**
 * Initialize variables
 */
var plugins = [];


/**
 * Initialize Modules
 */
log.init();

//load configuration file
//var config = global.config = JSON.parse(fs.readFileSync('./config/config.json'));
var config = global.config = require('./config/config.json');
//load global variables informations
var gl = global.gl = new require("./config/global.js")(config);

var SensorController = require('./controller/sensor_controller.js');

// we load web server
if (config.webserver) {
	try {
		var WebServer = require("bbcopterWebServer");
	} catch(err) {
		log.error("Cannot load webserver module!\nPlease do npm install before launching the code.");
	}
}

var sensor= new SensorController();
sensor.on('statusChanged', function(status)
{
	console.log("status changed");
});
sensor.init();

// We load motor module
try {
	var motor = global.motor = require(config.motor);
} catch(err) {
	log.error("Cannot load motor module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
	global.motorOK = false;
}

// We load receiver module
try {
	var receiver = global.receiver = require(config.receiver);
} catch(err) {
	log.error("Cannot load receiver module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
}

/**
 * Plugins must be under plugins folder. Each plugin must have its own folder.
 * Config file must contain the folder name in the plugin parameter.
 * All plugin must have main.js in its folder to make the quad recognize it.
 */
/*
if (config.plugins.length > 0) {
	for (var i = 0; i < config.plugins.length; i++) {

		try {
			var plugin = new require('./plugins/' + config.plugins[i] + "/main.js")();
			console.log(plugin.name);
			plugins.push(plugin);
		} catch(err) {
			log.error("Cannot load plugin " + config.plugins[i] + ". Error during the load of the plugin. Error : " + err);
		}
	};
}

console.log(plugins[0]);
*/
