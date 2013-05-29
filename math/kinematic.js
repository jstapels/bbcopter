function isSwitched(previousError, currentError) {
	if ((previousError > 0 && currentError < 0) || (previousError < 0 && currentError > 0)) {
		return true;
	}
	return false;
}

function Kinematic() {
	this.kinematicsAngle = [0.0, 0.0, 0.0];
	this.gyroAngle = [0.0, 0.0];
	this.correctedRateVector = [0.0, 0.0, 0.0];
	this.earthAccel = [0.0, 0.0, 0.0];

	this.Kp = 0.0;
	// proportional gain governs rate of convergence to accelerometer/magnetometer
	this.Ki = 0.0;
	// integral gain governs rate of convergence of gyroscope biases
	this.halfT = 0.0;
	// half the sample period
	this.q0 = 1.0;
	this.q1 = 0.0;
	this.q2 = 0.0;
	this.q3 = 0.0;
	// quaternion elements representing the estimated orientation
	this.exInt = 0.0;
	this.eyInt = 0.0;
	this.ezInt = 0.0;
	// scaled integral error

	this.previousEx = 0.0;
	this.previousEy = 0.0;
	this.previousEz = 0.0;

	this.accelCutoff = 0.0;

	this.Kp = 0.2;
	// 2.0;
	this.Ki = 0.0005;
	//0.005;
}

////////////////////////////////////////////////////////////////////////////////
// argUpdate
////////////////////////////////////////////////////////////////////////////////
function argUpdate(gx, gy, gz, ax, ay, az, G_Dt) {

	var norm;
	var vx, vy, vz;
	var q0i, q1i, q2i, q3i;
	var ex, ey, ez;

	this.halfT = G_Dt / 2;

	// normalise the measurements
	norm = Math.sqrt(ax * ax + ay * ay + az * az);
	ax = ax / norm;
	ay = ay / norm;
	az = az / norm;

	// estimated direction of gravity and flux (v and w)
	vx = 2 * (this.q1 * this.q3 - this.q0 * this.q2);
	vy = 2 * (this.q0 * this.q1 + this.q2 * this.q3);
	vz = this.q0 * this.q0 - this.q1 * this.q1 - this.q2 * this.q2 + this.q3 * this.q3;

	// error is sum of cross product between reference direction of fields and direction measured by sensors
	ex = (vy * az - vz * ay);
	ey = (vz * ax - vx * az);
	ez = (vx * ay - vy * ax);

	// integral error scaled integral gain
	this.exInt = this.exInt + ex * this.Ki;
	if (isSwitched(this.previousEx, ex)) {
		this.exInt = 0.0;
	}
	this.previousEx = ex;

	this.eyInt = this.eyInt + ey * this.Ki;
	if (isSwitched(this.previousEy, ey)) {
		this.eyInt = 0.0;
	}
	this.previousEy = ey;

	this.ezInt = this.ezInt + ez * this.Ki;
	if (isSwitched(this.previousEz, ez)) {
		this.ezInt = 0.0;
	}
	this.previousEz = ez;

	// adjusted gyroscope measurements
	gx = gx + this.Kp * ex + this.exInt;
	gy = gy + this.Kp * ey + this.eyInt;
	gz = gz + this.Kp * ez + this.ezInt;

	// integrate quaternion rate and normalise
	q0i = (-this.q1 * gx - this.q2 * gy - this.q3 * gz) * halfT;
	q1i = (this.q0 * gx + this.q2 * gz - this.q3 * gy) * halfT;
	q2i = (this.q0 * gy - this.q1 * gz + this.q3 * gx) * halfT;
	q3i = (this.q0 * gz + this.q1 * gy - this.q2 * gx) * halfT;
	this.q0 += q0i;
	this.q1 += q1i;
	this.q2 += q2i;
	this.q3 += q3i;

	// normalise quaternion
	norm = Math.sqrt(this.q0 * this.q0 + this.q1 * this.q1 + this.q2 * this.q2 + this.q3 * this.q3);
	this.q0 = this.q0 / norm;
	this.q1 = this.q1 / norm;
	this.q2 = this.q2 / norm;
	this.q3 = this.q3 / norm;
}

function eulerAngles() {
	this.kinematicsAngle[XAXIS] = Math.atan2(2 * (this.q0 * this.q1 + this.q2 * this.q3), 1 - 2 * (this.q1 * this.q1 + this.q2 * this.q2));
	this.kinematicsAngle[YAXIS] = Math.asin(2 * (this.q0 * this.q2 - this.q1 * this.q3));
	this.kinematicsAngle[ZAXIS] = Math.atan2(2 * (this.q0 * this.q3 + this.q1 * this.q2), 1 - 2 * (this.q2 * this.q2 + this.q3 * this.q3));
}
////////////////////////////////////////////////////////////////////////////////
// Calculate ARG
////////////////////////////////////////////////////////////////////////////////
Kinematic.prototype.calculateKinematics = function(rollRate, pitchRate, yawRate, longitudinalAccel, lateralAccel, verticalAccel, G_DT) {

	argUpdate(rollRate, pitchRate, yawRate, longitudinalAccel, lateralAccel, verticalAccel, G_Dt);
	eulerAngles();
}

Kinematic.prototype.getGyroUnbias = function(axis) {
	return this.correctedRateVector[axis];
}
// returns the kinematicsAngle of a specific axis in SI units (radians)
//  const float getData(byte axis) {
//    return kinematicsAngle[axis];
//  }
// return heading as +PI/-PI
//  const float getHeading(byte axis) {
//    return(kinematicsAngle[axis]);
//  }

// This really needs to be in Radians to be consistent
// I'll fix later - AKA
// returns heading in degrees as 0-360
Kinematic.prototype.kinematicsGetDegreesHeading = function(axis) {
	var tDegrees;

	tDegrees = degrees(this.kinematicsAngle[axis]);
	if (tDegrees < 0.0)
		return (tDegrees + 360.0);
	else
		return (tDegrees);
}

//  const byte getType(void) {
// This is set in each subclass to identify which algorithm used
//    return kinematicsType;
//  }