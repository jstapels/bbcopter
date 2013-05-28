/**
 * @module plugins
 */
var util = require('util');
var EventEmmiter = require('events').EventEmmiter;
var packet = require('./packet');


/**
 * The plugin manager. All plugins must register with this manager.
 */
function PluginManager() {
	this.plugins = [];
}

PluginManager.prototype.registerPlugin = function(plugin) {
	
};

PluginManager.prototype.unregisterPlugin = function(plugin) {
	
};



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
Plugin.prototype = Object.create(EventEmmiter.prototype);
Plugin.prototype.constructor = Plugin;

// Public methods

/**
 * Called when the plugin is first initialized.
 * <p>
 * Note that this plugin doesn't have access to other plugins at this time.
 * All referenced to dependant plugins need to happen during the activattion.
 */
Plugin.prototype.initialize = function() {
  
};

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
