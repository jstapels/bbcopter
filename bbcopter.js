var fs = global.fs = require('fs');
var util = require("util");

var config = global.config = JSON.parse(fs.readFileSync('./config/config.json'));

//global const information
var gl = global.gl = new require("./config/global.js")(config);

//load module
console.log(gl);

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

