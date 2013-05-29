/**
 * @module plugins
 */
var util = require('util');
var EventEmmiter = require('events').EventEmmiter;
var packet = require('./packet');

var PacketType = {
    ACCEL_X : "Acceleration X-Axis (m/s)",
    ACCEL_Y : "Acceleration Y-Axis (m/s)",
    ACCEL_Z : "Acceleration Z-Axis (m/s)",
    
    GYRO_X : "Angle X-Axis (rad)",
    GYRO_Y : "Angle Y-Axis (rad)",
    GYRO_Z : "Angle Z-Axis (rad)"
};  

exports.PacketType = PacketType;

/**
 * The plugin manager. All plugins must register with this manager.
 */
function PluginManager(config) {
  this.activated = false;
	this.plugins = config.plugins || [];
}

PluginManager.prototype.registerPlugin = function(plugin) {
  if (this.plugins.indexOf(plugin) !== -1) {
    this.plugins.push(plugin);
  }
  
  if (activated) {
    activate(plugin);
  }
};

PluginManager.prototype.unregisterPlugin = function(plugin) {
  var i = plugins.indexOf(plugin);
  if (i !== -1) {
    plugins.splice(i, 1);
  }
  
  if (activated) {
    deactivate(plugin);
  }
};

PluginManager.prototype.activate = function(plugin) {
  //plugin.getProvidedPacketTypes();
  plugin.activate();
};

PluginManager.prototype.deactivate = function(plugin) {
  //plugin.getProvidedPacketTypes();
  plugin.deactivate();
};

PluginManager.prototype.activatePlugins = function(plugin) {
  
};

exports.PluginManager = PluginManager;


/**
 * The base plugin object that all plugins should extend.
 * <p>
 * Extend this and then make sure you call the constructor.
 * The activate method will be called once all plugins have been loaded.
 * This allows the plugin to register for events on other required plugins.
 *
 * @constructor
 * @this {Plugin}
 */
function Plugin() {
  EventEmitter.call(this);
  
  // Private methods/functions
  var packetData = {};
  
  // Privileged methods
  this.getPacket = function(type) {
    return packetData[type];
  };

  this.setPacket = function(type, value) {
    var old = packetData[type];
    packetData[type] = value;

    if (old != value) {
      this.emit(type, value);
    }
  };

  // Public variables
  this.name = "Abstract Plugin";
  this.description = "An abstract description";
  this.majorVersion = 0;
  this.minorVersion = 0;
  this.requirePackets = [];
  this.optionalPackets = [];
  this.providedPackets = [];
}

// Extend the EventEmmiter class.
util.inherits(Plugin, EventEmmiter);

// Public methods

/**
 * Called when your plugin is activated.
 */
Plugin.prototype.activate = function() {
  console.log("Plugin: " + this.name + " activated");
};

/**
 * Called when your plugin is deactivates.
 * @param plugins
 */
Plugin.prototype.deactivate = function() {
  console.log("Plugin: " + this.name + " deactivated");
};

// Module exports.
exports.Plugin = Plugin;
