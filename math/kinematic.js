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
function argUpdate(kinematic, gx, gy, gz, ax, ay, az, G_Dt) {

	var norm;
	var vx, vy, vz;
	var q0i, q1i, q2i, q3i;
	var ex, ey, ez;
	var self = kinematic;
	
	self.halfT = G_Dt / 2;

	// normalise the measurements
	norm = Math.sqrt(ax * ax + ay * ay + az * az);
	ax = ax / norm;
	ay = ay / norm;
	az = az / norm;

	// estimated direction of gravity and flux (v and w)
	vx = 2 * (self.q1 * self.q3 - self.q0 * self.q2);
	vy = 2 * (self.q0 * self.q1 + self.q2 * self.q3);
	vz = self.q0 * self.q0 - self.q1 * self.q1 - self.q2 * self.q2 + self.q3 * self.q3;

	// error is sum of cross product between reference direction of fields and direction measured by sensors
	ex = (vy * az - vz * ay);
	ey = (vz * ax - vx * az);
	ez = (vx * ay - vy * ax);

	// integral error scaled integral gain
	self.exInt = self.exInt + ex * self.Ki;
	if (isSwitched(self.previousEx, ex)) {
		self.exInt = 0.0;
	}
	self.previousEx = ex;

	self.eyInt = self.eyInt + ey * self.Ki;
	if (isSwitched(self.previousEy, ey)) {
		self.eyInt = 0.0;
	}
	self.previousEy = ey;

	self.ezInt = self.ezInt + ez * self.Ki;
	if (isSwitched(self.previousEz, ez)) {
		self.ezInt = 0.0;
	}
	self.previousEz = ez;

	// adjusted gyroscope measurements
	gx = gx + self.Kp * ex + self.exInt;
	gy = gy + self.Kp * ey + self.eyInt;
	gz = gz + self.Kp * ez + self.ezInt;

	// integrate quaternion rate and normalise
	q0i = (-self.q1 * gx - self.q2 * gy - self.q3 * gz) * self.halfT;
	q1i = (self.q0 * gx + self.q2 * gz - self.q3 * gy) * self.halfT;
	q2i = (self.q0 * gy - self.q1 * gz + self.q3 * gx) * self.halfT;
	q3i = (self.q0 * gz + self.q1 * gy - self.q2 * gx) * self.halfT;
	self.q0 += q0i;
	self.q1 += q1i;
	self.q2 += q2i;
	self.q3 += q3i;

	// normalise quaternion
	norm = Math.sqrt(self.q0 * self.q0 + self.q1 * self.q1 + self.q2 * self.q2 + self.q3 * self.q3);
	self.q0 = self.q0 / norm;
	self.q1 = self.q1 / norm;
	self.q2 = self.q2 / norm;
	self.q3 = self.q3 / norm;
}

function eulerAngles(kinematic) {
	var self = kinematic;
	self.kinematicsAngle[XAXIS] = Math.atan2(2 * (self.q0 * self.q1 + self.q2 * self.q3), 1 - 2 * (self.q1 * self.q1 + self.q2 * self.q2));
	self.kinematicsAngle[YAXIS] = Math.asin(2 * (self.q0 * self.q2 - self.q1 * self.q3));
	self.kinematicsAngle[ZAXIS] = Math.atan2(2 * (self.q0 * self.q3 + self.q1 * self.q2), 1 - 2 * (self.q2 * self.q2 + self.q3 * self.q3));
}
////////////////////////////////////////////////////////////////////////////////
// Calculate ARG
////////////////////////////////////////////////////////////////////////////////
Kinematic.prototype.calculateKinematics = function(rollRate, pitchRate, yawRate, longitudinalAccel, lateralAccel, verticalAccel, G_DT) {

	argUpdate(this, rollRate, pitchRate, yawRate, longitudinalAccel, lateralAccel, verticalAccel, G_Dt);
	eulerAngles(this);
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

module.exports = Kinematic;