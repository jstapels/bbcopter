//load node module requirements
var fs = global.fs = require('fs');
var util = require("util");

//load configuration file
var config = global.config = JSON.parse(fs.readFileSync('./config/config.json'));

//load global variables informations
var gl = global.gl = new require("./config/global.js")(config);

/**
 * We load sensors here depending the config.json.
 * if Degree of freedom (DOF) is 6 we will not load the mag module, if DOF is 9 it will include the mag.
 */
try {
	var accel = global.accel = require(config.sensors.accel);
} catch(err) {
	console.log("Cannot load Accel module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
	process.exit(1);
}

try {
	var gyro = global.gyro = require(config.sensors.gyro);
} catch(err) {
	console.log("Cannot load Gyro module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
	process.exit(1);
}
if (global.DOF == 9) {
	try {
		var mag = global.mag = require(config.sensors.mag);
	} catch(err) {
		console.log("Cannot load mag module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
		process.exit(1);
	}
}

// We load motor module
try {
	var motor = global.motor = require(config.motor);
} catch(err) {
	console.log("Cannot load mag module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
	global.motorOK = false;
}