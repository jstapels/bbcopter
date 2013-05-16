/**
 * Contains a list of all the different types of Packets that plugins can use.
 */

exports.Packet = Object.freeze({
	// Input Data Types
	REQUEST_YAW : "Request Yaw",
	REQUEST_ROLL : "Request Roll",
	REQUEST_PITCH : "Request Pitch",
	REQUEST_POWER : "Request Power",
	
	// Sensor Data Types
    IMU_YAW : "IMU Yaw",
    IMU_ROLL : "IMU Roll",
    IMU_PITCH : "IMU Pitch",
	
	// Output Data Types
	MOTOR_0 : "Motor 0",
	MOTOR_1 : "Motor 1",
	MOTOR_2 : "Motor 2",
	MOTOR_3 : "Motor 3",
	SERVO_0 : "Servo 0",
	SERVO_1 : "Servo 1",
	SERVO_2 : "Servo 2",
	SERVO_3 : "Servo 3"
});