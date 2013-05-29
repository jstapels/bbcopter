/**
 * A plugin for the MPU6050, collects raw gyro and accel data and calculates the yaw, pitch, and roll.
 */

var MPU = require('mpu6050');
var plugin = require('../../plugin');

var PacketType = plugin.PacketType;
var PluginManager = plugin.PluginManager;
var Plugin = plugin.Plugin;

function MPU6050(config) {
  Plugin.call(this);
  
  // Plugin Metadata
  this.name = "MPU6050";
  this.description = "MPU6050 Sensor Plugin";
  this.majorVersion = 0;
  this.minorVersion = 1;
  this.requirePackets = [];
  this.optionalPackets = [];
  this.providedPackets = [
    PacketType.ACCEL_X,
    PacketType.ACCEL_Y,
    PacketType.ACCEL_Z,
    PacketType.GYRO_X,
    PacketType.GYRO_Y,
    PacketType.GYRO_Z
    ];
  
  // MPU6050 Data
  var device = config.device || "/dev/i2c-2";
  var address = config.address || MPU.DEFAULT_ADDRESS;
  this.mpu = new MPU(device, address);
  
  // Sensor Data
  this.accelX = 0;
  this.accelY = 0;
  this.accelZ = 0;
  this.gyroX = 0;
  this.gyroY = 0;
  this.gyroZ = 0;
}

util.inherits(MPU6050, Plugin);

MPU6050.prototype.activate() {
  mpu.initialize();
}

MPU6050.prototype.deactivate() {
  mpu.setSleepEnabled(1);
}


module.exports = MPU6050;