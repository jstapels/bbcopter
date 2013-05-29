/**
 * will not be compatible for magnometer.
 * It won't be linked to plugin constructor until it is ready
 */
var async = require('async');
var events = require('events');
var util = require('util');
/**
 *
 Accel variables
 SAMPLECOUNT : 400,
 accelScaleFactor : [0.0, 0.0, 0.0],
 runTimeAccelBias : [0, 0, 0],
 accelOneG : 0.0,
 meterPerSecSec : [0.0, 0.0, 0.0],
 accelSample : [0, 0, 0],
 accelSampleCount : 0

 Gyro variables
 FINDZERO : 49,
 gyroRate : [0.0, 0.0, 0.0],
 gyroZero : [0, 0, 0],
 gyroSample : [0, 0, 0],
 gyroScaleFactor : 0.0,
 gyroHeading : 0.0,
 gyroLastMesuredTime : 0,
 gyroSampleCount : 0

 */
var Accel;
var Gyro;
var _accel;
var _gyro;

//math librarys
var fourthOrderFilter = new require('./math/fourthOrderFilter.js')();

SensorsController.Status = {
	INIT : "Initialization",
	OK : "Sensors Loaded",
	READY : "Sensors Ready",
	POLLING : "Polling",
	ACCEL_MISSING : "Accel Missing",
	GYRO_MISSING : "Gyro Missing",
	ACCEL_GYRO_MISSING : "Accel and Gyro Missing",
	ERROR_INIT_SENSORS : "Error to initialize sensors"
};

util.inherits(SensorsController, events.EventEmitter);

function SensorsController() {
	/**
	 * We load sensors here depending the config.json.
	 * if Degree of freedom (DOF) is 6 we will not load the mag module, if DOF is 9 it will include the mag.
	 */
	this.status = SensorsController.Status.INIT;
	events.EventEmitter.call(this);
	try {
		Accel = require(global.config.sensors.accel);
	} catch(err) {
		changeStatus(this, SensorsController.Status.ACCEL_MISSING);
		log.error("Cannot load Accel module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
		if (!global.config.debug) {
			process.exit(1);
		}
	}

	try {
		gyro = require(config.sensors.gyro);
	} catch(err) {
		if (this.status == SensorsController.Status.ACCEL_MISSING)
			changeStatus(this, SensorsController.Status.ACCEL_GYRO_MISSING);
		else
			changeStatus(this, SensorsController.Status.GYRO_MISSING);
		log.error("Cannot load Gyro module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
		if (!global.config.debug) {
			process.exit(1);
		}
	}
	if (global.DOF == 9) {
		try {
			var mag = require(config.sensors.mag);
		} catch(err) {
			log.error("Cannot load mag module!\nPlease check your config.json file and you need to have the same name for your module under node_module folder");
			if (!global.config.debug) {
				process.exit(1);
			}
		}
	}
	if (this.status == SensorsController.Status.INIT) {
		changeStatus(this, SensorsController.Status.OK);
	}
}

SensorsController.prototype.init = function() {
	//if status isn't OK, we send the status to the event.
	if (this.status != SensorsController.Status.OK) {
		changeStatus(this, this.status);
		return;
	}

	var self = this;
	//INITIALIZING SENSORS

	//use WATERFALL to make sure that all function was executed in order
	async.waterfall([

	//Accelerator init
	function(callback) {
		if ( typeof _accel != "undefined") {
			_accel = new Accel(function(err) {
				if (err) {
					changeStatus(self, SensorsController.Status.ERROR_INIT_SENSORS);
					log.error("Error while initializing the accelerometer, error message : " + err);
					if (!config.debug) {
						exit(1);
					}
				}
				callback(null);
			});
		}
	},

	//Gyrometer init
	function(callback) {
		if ( typeof _gyro != "undefined") {
			_gyro = new Gyro(function(err) {
				if (err) {
					changeStatus(self, SensorsController.Status.ERROR_INIT_SENSORS);
					log.error("Error while initializing the gyrometer, error message : " + err);
					if (!config.debug) {
						exit(1);
					}
				}
				callback(null);
			});
		}
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
			if (config.debug) {
				log.error("Initialization will continue because debugger is activated, please don't try to fly!");
			} else {
				exit(1);
			}
		} else {
			
			//setup fourth Order Filter
			_Math.FourthOrderFilter.setupFourthOrder();
			changeStatus(self, SensorsController.Status.READY);
		}
	});
}
function changeStatus(sensorsController, status) {
	sensorsController.status = status;
	log.debug("Changing status of sensor_controller to : " + status);
	sensorsController.emit('statusChanged', status);
}

SensorsController.prototype.start = function start() {
	if (this.status == SensorsController.Status.READY) {
		changeStatus(this, SensorsController.Status.POLLING);
		poll();
	}
}

SensorsController.prototype.stop = function stop() {
	if (this.status == SensorsController.Status.POLLING)
		changeStatus(this, SensorsController.Status.READY);
}
function measureCriticalSensors() {
	_gyro.measureGyroSum();
	_accel.measureAccelSum();
}

//we need callback to make everything smooth!
var lastLoop = Date.now();
var frame = 0;
function poll() {
	var date = Date.now();
	var delta = date - lastLoop;
	lastLoop = date;
	measureCriticalSensors();
	if (delta >= 10) {
		frame++;
		
		//100hz
		_gyro.evaluateGyroRate();
		_accel.evaluateMetersPerSec();

		for (var axis = XAXIS; axis <= ZAXIS; axis++) {
			filteredAccel[axis] = fourthOrderFilter.computeFourthOrder(_accel.meterPerSecSec[axis], fourthOrderFilter.fourthOrder[axis]);
		}
		
		
		calculateKinematics(gyroRate[XAXIS], gyroRate[YAXIS], gyroRate[ZAXIS], filteredAccel[XAXIS], filteredAccel[YAXIS], filteredAccel[ZAXIS], G_Dt);
		
		
		if (frameCounter >= 100) {
			frameCounter = 0;
		}
	}

	setTimeout(function() {
		if (this.status == SensorsController.Status.POLLING) {
			poll();
		}
	}, 2.5);
}

module.exports = SensorsController;
