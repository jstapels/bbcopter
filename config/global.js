function define(config) {
	global.OFF = 0;
	global.ON = 1;

	global.XAXIS = 0;
	global.YAXIS = 1;
	global.ZAXIS = 2;
	global.THROTTLE = 3;
	global.MODE = 4;
	global.AUX1 = 5;
	global.AUX2 = 6;
	global.AUX3 = 7;
	global.AUX4 = 8;
	global.AUX5 = 9;

	global.SENSOR_ERROR = "Error with sensor";
	global.MOTOR_ERROR = "Error with motor";
	global.RECEIVER_ERROR = "Error with motor";

	/**
	 * Flight control global declaration
	 */
	global.RATE_FLIGHT_MODE = 0;
	global.ATTITUDE_FLIGHT_MODE = 1;
	global.previousFlightMode = ATTITUDE_FLIGHT_MODE;
	global.TASK_100HZ = 1;
	global.TASK_50HZ = 2;
	global.TASK_10HZ = 10;
	global.TASK_1HZ = 100;
	global.THROTTLE_ADJUST_TASK_SPEED = TASK_50HZ;

	global.flightMode = RATE_FLIGHT_MODE;
	global.frameCounter = 0;
	// main loop executive frame counter
	global.minArmedThrottle = config.minArmedThrottle;
	// initial value configured by user

	global.G_Dt = 0.002;
	global.throttle = 1000;
	global.motorArmed = OFF;
	global.safetyCheck = OFF;
	global.maxLimit = OFF;
	global.minLimit = OFF;
	global.filteredAccel = [0.0, 0.0, 0.0];
	global.inFlight = false;
	// true when motor are armed and that the user pass one time the min throttle
	global.rotationSpeedFactor = 1.0;

	// main loop time variable
	global.previousTime = 0;
	global.currentTime = 0;
	global.deltaTime = 0;
	// sub loop time variable
	global.oneHZpreviousTime = 0;
	global.tenHZpreviousTime = 0;
	global.lowPriorityTenHZpreviousTime = 0;
	global.lowPriorityTenHZpreviousTime2 = 0;
	global.fiftyHZpreviousTime = 0;
	global.hundredHZpreviousTime = 0;

	/**
	 * Heading and heading hold global declaration section
	 */

	global.headingHoldConfig = 0x00;
	global.headingHold = 0; // calculated adjustment for quad to go to heading (PID output)
	global.heading = 0; // measured heading from yaw gyro (process variable)
	global.relativeHeading = 0; // current heading the quad is set to (set point)
	global.headingHoldState = OFF;

	/**
	 * Accelerometer Const
	 */
	global.SAMPLECOUNT = 400
}

module.exports = define;
