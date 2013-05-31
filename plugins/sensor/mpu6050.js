/**
 * A plugin for the MPU6050, collects raw gyro and accel data and calculates the yaw, pitch, and roll.
 */

var util = require('util');
var MPU = require('mpu6050');
var Plugin = require('../../lib/plugin');
var EventType = require('../../lib/eventtype');

function MPU6050(config) {
  Plugin.call(this, config);
  
  // Plugin Metadata
  this._name = "MPU6050";
  this._description = "MPU6050 Sensor Plugin";
  this._majorVersion = 0;
  this._minorVersion = 1;
  this._requireEvents = [];
  this._optionalEvents = [];
  this._providedEvents = [
    EventType.SPEED_XYZ,
    EventType.ANGLE_XYZ
    ];
  
  // Plugin Config
  var device = (config && ('device' in config)) ? config.device : '/dev/i2c-1';
  var address = (config && ('address' in config)) ? config.address : MPU.DEFAULT_ADDRESS;
  this._refreshRate = (config && ('refreshRate' in config)) ? config.refreshRate : 10;
  this._refreshSkew = 0;
  this._lastRefresh = Date.now();
  this._active = false;
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
  this._mpu.initialize();
  var self = this;
  function updatePackets() {
    if (self._active) {
      var ts = Date.now();
      var delta = (ts - self._lastRefresh);
      if (delta >= self._refreshRate) {
        var raw = self._mpu.getMotion6();
        self._lastRefresh = ts;
        console.log("Delta since last reading: " + delta + "ms");
    
        self._accelX = raw[0];
        self._accelY = raw[1];
        self._accelZ = raw[2];
        self._gyroX = raw[3];
        self._gyroY = raw[4];
        self._gyroZ = raw[5];
        
        self._setPacket(EventType.SPEED_XYZ, [self._accelX, self._accelY, self._accelZ]);
        self._setPacket(EventType.ANGLE_XYZ, [self._gyroX, self._gyroY, self._gyroZ]);
      }
      process.nextTick(updatePackets);
    }
  };
  
  this._active = true;
  process.nextTick(updatePackets);
};

MPU6050.prototype.setRefreshRate = function(ms) {
  this._refreshRate = ms;
};

MPU6050.prototype.getRawData = function() {
  return this._mpu.getMotion6();
};

MPU6050.prototype.deactivate = function() {
  this._active = false;
  this._mpu.setSleepEnabled(1);
};

module.exports = MPU6050;