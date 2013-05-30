/**
 * @module plugins
 */
var util = require('util');
var EventEmmiter = require('events').EventEmmiter;

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
  
  this._packetData = {};
  
  this._name = "Abstract Plugin";
  this._description = "An abstract description";
  this._majorVersion = 0;
  this._minorVersion = 0;
  this._requiredEvents = [];
  this._optionalEvents = [];
  this._providedEvents = [];
}

// Inheritance
util.inherits(Plugin, EventEmmiter);

// Properties
Object.defineProperties(Plugin.prototype, {
  'name':            {get: function() { return this._name; }},
  'description':     {get: function() { return this._description; }},
  'version':         {get: function() { return this._majorVersion + "." + this._minorVersion; }},
  'requiredEvents': {get: function() { return this._requiredEvents; }},
  'optionalEvents': {get: function() { return this._optionalEvents; }},
  'providedEvents': {get: function() { return this._providedEvents; }}
  });

// Methods

/**
 * Returns the most recent packet data of the specified type.
 */
Plugin.prototype.getPacket = function(type) {
  return this._packetData[type];
};

Plugin.prototype._setPacket = function(type, value) {
  this._packetData[type] = value;
  this.emit(type, value);
};

/**
 * Called to activate your plugin.
 */
Plugin.prototype.activate = function() {
  console.log('Plugin: ' + this.name + ' activated');
};

/**
 * Called to deactivate your plugin.
 */
Plugin.prototype.deactivate = function() {
  console.log('Plugin: ' + this.name + ' deactivated');
};

/**
 * Called for when interested packets are updated.
 * @param eventName
 * @param value
 */
Plugin.prototype.event(eventName, value) {
  console.log('{event: ' + eventName + ', value: ' + value + '}');
}

// Module exports.
module.exports = Plugin;
