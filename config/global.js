function define(config) {
	var gl = {
		OFF : 0x00,
		ON : 0x01,
		/**
		 * Flight control global declaration
		 */
		RATE_FLIGHT_MODE : 0,
		ATTITUDE_FLIGHT_MODE : 1,
		previousFlightMode : this.ATTITUDE_FLIGHT_MODE,
		TASK_100HZ : 1,
		TASK_50HZ : 2,
		TASK_10HZ : 10,
		TASK_1HZ : 100,
		THROTTLE_ADJUST_TASK_SPEED : this.TASK_50HZ,

		flightMode : this.RATE_FLIGHT_MODE,
		frameCounter : 0,
		// main loop executive frame counter
		minArmedThrottle : config.minArmedThrottle,
		// initial value configured by user

		G_Dt : 0.002,
		throttle : 1000,
		motorArmed : this.OFF,
		safetyCheck : this.OFF,
		maxLimit : this.OFF,
		minLimit : this.OFF,
		filteredAccel : [0.0, 0.0, 0.0],
		inFlight : false,
		// true when motor are armed and that the user pass one time the min throttle
		rotationSpeedFactor : 1.0,

		// main loop time variable
		previousTime : 0,
		currentTime : 0,
		deltaTime : 0,
		// sub loop time variable
		oneHZpreviousTime : 0,
		tenHZpreviousTime : 0,
		lowPriorityTenHZpreviousTime : 0,
		lowPriorityTenHZpreviousTime2 : 0,
		fiftyHZpreviousTime : 0,
		hundredHZpreviousTime : 0,

		/**
		 * Heading and heading hold global declaration section
		 */

		headingHoldConfig : 0x00,
		headingHold : 0, // calculated adjustment for quad to go to heading (PID output)
		heading : 0, // measured heading from yaw gyro (process variable)
		relativeHeading : 0, // current heading the quad is set to (set point)
		headingHoldState : this.OFF
	}

	return gl;
}

module.exports = define;
