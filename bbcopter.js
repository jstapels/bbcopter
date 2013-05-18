//load node module requirements
var fs = global.fs = require('fs');
var util = require('util');
var async = require('async');
var log = global.log = require('./tools/logger.js');
var plugins = [];
log.init();

//math librarys
var _Math = {};
_Math.FourthOrderFilter = require('./math/fourthOrderFilter.js');

//load configuration file
//var config = global.config = JSON.parse(fs.readFileSync('./config/config.json'));
var config = global.config = require('./config/config.json');
//load global variables informations
var gl = global.gl = new require("./config/global.js")(config);

/**
 * We load sensors here depending the config.json.
 * if Degree of freedom (DOF) is 6 we will not load the mag module, if DOF is 9 it will include the mag.
 */
try {
	var accel = global.accel = require(config.sensors.accel);
} catch(err) {
	log.error("Cannot load Accel module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
	process.exit(1);
}

try {
	var gyro = global.gyro = require(config.sensors.gyro);
} catch(err) {
	log.error("Cannot load Gyro module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
	process.exit(1);
}
if (global.DOF == 9) {
	try {
		var mag = global.mag = require(config.sensors.mag);
	} catch(err) {
		log.error("Cannot load mag module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
		process.exit(1);
	}
}

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

// we load web server
if (config.webserver) {
	try {
		var webserver = require("bbcopterWebServer");
	} catch(err) {
		log.error("Cannot load webserver module!\nPlease do npm install before launching the code.");
	}
}

/**
 * Plugins must be under plugins folder. Each plugin must have its own folder.
 * Config file must contain the folder name in the plugin parameter.
 * All plugin must have main.js in its folder to make the quad recognize it.
 */
if (config.plugins.length > 0) {
	for (var i = 0; i < config.plugins.length; i++) {

		try {
			plugins.push(require('./plugins/' + config.plugins[i] + "/main.js"));
		} catch(err) {
			log.error("Cannot load plugin " + config.plugins[i] + ". Error during the load of the plugin.");
		}
	};
}

//INITIALIZING SENSORS

//use WATERFALL to make sure that all function was executed in order
async.waterfall([

//Accelerator init
function(callback) {
	accel.init(function(err) {
		if (err) {
			log.error("Error while initializing the accelerometer, error message : " + err);
			if (!config.debug) {
				exit(1);
			}
		}
		callback(null);
	});
},

//Gyrometer init
function(callback) {
	gyro.init(function(err) {
		if (err) {
			log.error("Error while initializing the gyrometer, error message : " + err);
			if (!config.debug) {
				exit(1);
			}
		}
		callback(null);
	});
},

//Magnometer init
function(callback) {
	if (global.DOF == 9) {
		mag.init(function(err) {
			if (err) {
				log.error("Error while initializing the magnometer, error message : " + err);
				if (!config.debug) {
					exit(1);
				}
			}
			callback(null);
		});
	} else {
		callback(null);
	}
}], function(err) {
	if (err) {
		global.status = global.SENSOR_ERROR;
		clog.error("Initialization will continue because debugger is activated, please don't try to fly!");
	}
});

//TODO: Finish the async here 
if ( typeof motor != "undefined") {
	//for now, only 4 engine
	motor.init(4);
} else {
	log.error("Quad have no motor available");
}

receiver.init();
