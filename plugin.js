/**
 * @module plugins
 */
var util = require('util');
var events = require('events');
var packet = require('./packet');


/**
 * The plugin manager. All plugins must register with this manager.
 */
function PluginManager() {
    
}



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
	events.EventEmitter.call(this);
    
    this.name = "Abstract Plugin";
    this.description = "An abstract description";
    this.major = 0;
    this.minor = 0;
    this.requirePackets = [];
    this.optionalPackets = [];
    this.requiredPins = [];
    this.optionalPins = [];
    this.providedPackets = [];
    
    this._packets = {};
}

util.inherits(Plugin, events.EventEmitter);

Plugin.prototype.activate = function(plugins) {
    console.log("Plugin: " + this.name + " activated");
};

Plugin.prototype.deactivate = function(plugins) {
    console.log("Plugin: " + this.name + " deactivated");
};

Plugin.prototype.getPacket = function(type) {
	return this._packets[type];
};

Plugin.prototype.setPacket = function(type, value) {
    var old = this._packets[type];
	this._packets[type] = value;
        
    if (old != value) {
        this.emit(type, value);
    }
};

// Module exports.
exports.Plugin = Plugin;
