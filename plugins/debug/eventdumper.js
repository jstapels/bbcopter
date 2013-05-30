/**
 * A debug plugin for dumping events.
 */

var util = require('util');
var Plugin = require('../../lib/plugin');
var EventType = require('../../lib/eventtype');

function EventDumper() {
  Plugin.call(this);
  
  // Plugin Metadata
  this._name = "EventDumper";
  this._description = "Dumps events.";
  this._majorVersion = 0;
  this._minorVersion = 1;
  this._requireEvents = [];
  this._optionalEvents = [
    EventType.SPEED_XYZ,
    EventType.ANGLE_XYZ
    ];
  this._providedEvents = [];
}

util.inherits(EventDumper, Plugin);

EventDumper.prototype.event = function(eventName, value) {
  console.log('{event: ' + eventName + ', value: ' + value + '}');
};

module.exports = EventDumper;