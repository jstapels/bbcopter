var kinematicsAngle = [0.0,0.0,0.0];
var gyroAngle = [0.0,0.0];
var correctedRateVector = [0.0,0.0,0.0];
var earthAccel = [0.0,0.0,0.0];

var Kp = 0.0;                   					// proportional gain governs rate of convergence to accelerometer/magnetometer
var Ki = 0.0;                   					// integral gain governs rate of convergence of gyroscope biases
var halfT = 0.0;                					// half the sample period
var q0 = 0.0, q1 = 0.0, q2 = 0.0, q3 = 0.0;       // quaternion elements representing the estimated orientation
var exInt = 0.0, eyInt = 0.0, ezInt = 0.0;  		// scaled integral error
  
var previousEx = 0.0;
var previousEy = 0.0;
var previousEz = 0.0;

var accelCutoff = 0.0;
var Kinematic = {};

function isSwitched(previousError, currentError) {
  if ( (previousError > 0 &&  currentError < 0) ||
	   (previousError < 0 &&  currentError > 0)) {
    return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////
// argUpdate
////////////////////////////////////////////////////////////////////////////////
function argUpdate(gx, gy, gz, ax, ay, az, G_Dt) {
  
  var norm;
  var vx, vy, vz;
  var q0i, q1i, q2i, q3i;
  var ex, ey, ez;
    
  halfT = G_Dt/2;
  
  // normalise the measurements
  norm = Math.sqrt(ax*ax + ay*ay + az*az);       
  ax = ax / norm;
  ay = ay / norm;
  az = az / norm;
     	
  // estimated direction of gravity and flux (v and w)
  vx = 2*(q1*q3 - q0*q2);
  vy = 2*(q0*q1 + q2*q3);
  vz = q0*q0 - q1*q1 - q2*q2 + q3*q3;
    
  // error is sum of cross product between reference direction of fields and direction measured by sensors
  ex = (vy*az - vz*ay);
  ey = (vz*ax - vx*az);
  ez = (vx*ay - vy*ax);
    
  // integral error scaled integral gain
  exInt = exInt + ex*Ki;
  if (isSwitched(previousEx,ex)) {
    exInt = 0.0;
  }
  previousEx = ex;
	
  eyInt = eyInt + ey*Ki;
  if (isSwitched(previousEy,ey)) {
    eyInt = 0.0;
  }
  previousEy = ey;

  ezInt = ezInt + ez*Ki;
  if (isSwitched(previousEz,ez)) {
    ezInt = 0.0;
  }
  previousEz = ez;
	
  // adjusted gyroscope measurements
  gx = gx + Kp*ex + exInt;
  gy = gy + Kp*ey + eyInt;
  gz = gz + Kp*ez + ezInt;
    
  // integrate quaternion rate and normalise
  q0i = (-q1*gx - q2*gy - q3*gz) * halfT;
  q1i = ( q0*gx + q2*gz - q3*gy) * halfT;
  q2i = ( q0*gy - q1*gz + q3*gx) * halfT;
  q3i = ( q0*gz + q1*gy - q2*gx) * halfT;
  q0 += q0i;
  q1 += q1i;
  q2 += q2i;
  q3 += q3i;
    
  // normalise quaternion
  norm = Math.sqrt(q0*q0 + q1*q1 + q2*q2 + q3*q3);
  q0 = q0 / norm;
  q1 = q1 / norm;
  q2 = q2 / norm;
  q3 = q3 / norm;
}
  
function eulerAngles()
{
  kinematicsAngle[XAXIS]  = Math.atan2(2 * (q0*q1 + q2*q3), 1 - 2 *(q1*q1 + q2*q2));
  kinematicsAngle[YAXIS] = Math.asin(2 * (q0*q2 - q1*q3));
  kinematicsAngle[ZAXIS]   = Math.atan2(2 * (q0*q3 + q1*q2), 1 - 2 *(q2*q2 + q3*q3));
}


function initializeBaseKinematicsParam() {

  for (var axis = global.XAXIS; axis <= global.ZAXIS; axis++) {
    kinematicsAngle[axis] = 0.0;
  }
  gyroAngle[XAXIS] = 0;
  gyroAngle[YAXIS] = 0;
}

Kinematic.initializeKinematics = function() 
{
  initializeBaseKinematicsParam();
  q0 = 1.0;
  q1 = 0.0;
  q2 = 0.0;
  q3 = 0.0;
  exInt = 0.0;
  eyInt = 0.0;
  ezInt = 0.0;
	
  previousEx = 0;
  previousEy = 0;
  previousEz = 0;

  Kp = 0.2; // 2.0;
  Ki = 0.0005; //0.005;
}

////////////////////////////////////////////////////////////////////////////////
// Calculate ARG
////////////////////////////////////////////////////////////////////////////////
Kinematic.calculateKinematics = function(rollRate, pitchRate, yawRate, longitudinalAccel, lateralAccel, verticalAccel,G_DT) {
    
  argUpdate(rollRate, pitchRate, yawRate, longitudinalAccel, lateralAccel, verticalAccel, G_Dt);
  eulerAngles();
}
  
Kinematic.getGyroUnbias = function(axis) {
  return correctedRateVector[axis];
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
function kinematicsGetDegreesHeading(axis) {
  float tDegrees;
    
  tDegrees = degrees(kinematicsAngle[axis]);
  if (tDegrees < 0.0)
    return (tDegrees + 360.0);
  else
    return (tDegrees);
}
  
//  const byte getType(void) {
    // This is set in each subclass to identify which algorithm used
//    return kinematicsType;
//  }