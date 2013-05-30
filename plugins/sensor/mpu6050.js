/**
 * A plugin for the MPU6050, collects raw gyro and accel data and calculates the yaw, pitch, and roll.
 */

var MPU = require('mpu6050');
var plugin = require('../../plugin');

var EventType = plugin.EventType;
var PluginManager = plugin.PluginManager;
var Plugin = plugin.Plugin;

function MPU6050(config) {
  Plugin.call(this);
  
  // Plugin Metadata
  this.name = "MPU6050";
  this.description = "MPU6050 Sensor Plugin";
  this.majorVersion = 0;
  this.minorVersion = 1;
  this.requireEvents = [];
  this.optionalEvents = [];
  this.providedEvents = [
    EventType.SPEED_XYZ,
    EventType.ANGLE_XYZ
    ];
  
  // Plugin config
  this._refreshRate = config.refreshRate || 10; // refresh rate (in ms)
  this._lastRefresh = Date.now();
  this._active = false;
  
  // MPU6050 Data
  var device = config.device || "/dev/i2c-2";
  var address = config.address || MPU.DEFAULT_ADDRESS;
  this._mpu = new MPU(device, address);
  
  // Sensor Data
  this._accelX = 0;
  this._accelY = 0;
  this._accelZ = 0;
  this._gyroX = 0;
  this._gyroY = 0;
  this._gyroZ = 0;
}

util.inherits(MPU6050, Plugin);

MPU6050.prototype.activate = function() {
  _mpu.initialize();
  
  var self = this;
  var updatePackets = function() {
    var raw = self._mpu.getMotion6();

    self._accelX = raw[0];
    self._accelY = raw[1];
    self._accelZ = raw[2];
    self._gyroX = raw[3];
    self._gyroY = raw[4];
    self._gyroZ = raw[5];
    
    var ts = Date.now();
    console.log("Delta reading: " + (ts - self._lastRefresh) + "ms");
    self._lastRefresh = ts;
    
    self._setPacket(SPEED_XYZ, [self._accelX, self._accelY, self._accelZ]);
    self._setPacket(ANGLE_XYZ, [self._angleX, self._angleY, self._angleZ]);
    
    setTimeout(this, self._refreshRate);
  };
  
  this._active = true;
  setTimeout(updatePackets, this._refreshRate);
};

MPU6050.prototype.getRawData = function() {
  return mpu.getMotion6();
};

MPU6050.prototype.deactivate = function() {
  this._active = false;
  mpu.setSleepEnabled(1);
};

module.exports = MPU6050;