/**
 * @module pluginmanager
 */

/**
 * The PluginManager is responsible for coordinating all the configured plugins.
 *
 * @constructor
 * @this {PluginManager}
 */
function PluginManager(plugins) {
  this._activated = false;
  this._plugins = [];
  this._providedEvents = {};
  this._registeredCallbacks = {};
  
  if (Array.isArray(plugins)) {
    plugins.forEach(this.registerPlugin, this);
  }
}

/**
 * Adds plugin to the list of managed plugins.
 * @param plugin
 */
PluginManager.prototype._addPlugin = function(plugin) {
  if (this._plugins.indexOf(plugin) !== -1) {
    this._plugins.push(plugin);
  }
};

/**
 * Removes plugin from the list of supported plugins.
 * @param plugin
 */
PluginManager.prototype._removePlugin = function(plugin) {
  var i = this._plugins.indexOf(plugin);
  if (i !== -1) {
    this._plugins.splice(i, 1);
  }
};

/**
 * Add the provided event types for the specified plugin to the lookup table.
 * @param plugin
 */
PluginManager.prototype._addProvidedEvents = function(plugin) {
  plugin.providedEvents.forEach(function(event) {
    if (! event in this._providedEvents) {
      this._providedEvents[event] = [];
    }
    
    this._providedEvents[event].push(plugin);
  }, this);
};

/**
 * Remove the provided packet types for the specified plugin from the lookup table.
 * @param plugin
 */
PluginManager.prototype._removeProvidedEvents = function(plugin) {
  plugin.providedEvents.forEach(function(event) {
    if (event in this._providedEvents) {
      var i = this._providedEvents[event].indexOf(plugin);
      if (i !== -1) {
        this._providedEvents[event].splice(i, 1);       
      }
    }
  }, this);
};

/**
 * Register the specified plugin to receive events for interested packets.
 * @param plugin
 */
PluginManager.prototype._registerEvents = function(plugin) {
  var events = plugin.requiredEvents.concat(plugin.optionalEvents);
  
  events.forEach(function(event) {
    if (event in this._providedEvents) {
      this._providedEvents[event].forEach(function(provider) {
        var callback = function(value) { plugin.event(event, value); };
        provider.addListener(event, callback);
        
        if (! plugin in this._registeredCallbacks) {
          this._registeredCallbacks[plugin] = [];
        }
        
        this._registeredCallbacks[plugin].push([provider, event, callback]);
      }, this);
    } else {
      if (plugin.requiredEvents.indexOf(event) !== -1) {
        throw new Error('Plugin ' + plugin.name + ' requested event ' + event + ', but no plugins provide this.');
      }
    }
  }, this);
};

/**
 * Unregister the specified plugin to no longer receive events for interested packets.
 * @param plugin
 */
PluginManager.prototype._unregisterEvents = function(plugin) {
  if (plugin in this._registeredCallbacks) {
    this._registeredCallbacks[plugin].forEach(function(callbackData) {
      var provider = callbackData[0];
      var event = callbackData[1];
      var callback = callbackData[2];
      provider.removeListener(event, callback);
    }, this);
  }
  
  delete this._registeredCallbacks[plugin];
};

PluginManager.prototype.registerPlugins = function(plugins) {
  // Add plugins to configured plugins.
  plugins.forEach(this._addPlugin, this);
  
  // Create map of packet types.
  plugins.forEach(this._addProvidedPackets, this);
  
  // Register event callbacks.
  plugins.forEach(this._registerEvents, this);
};

PluginManager.prototype.unregisterPlugins = function(plugin) {
  // Register event callbacks.
  plugins.forEach(this._unregisterEvents, this);
  
  // Create map of packet types.
  plugins.forEach(this._removeProvidedPackets, this);
  
  // Add plugins to configured plugins.
  plugins.forEach(this._removePlugin, this);
};

PluginManager.prototype.activatePlugins = function() {
  _plugins.forEach(function(plugin) { plugin.activate(); }, this);
};

PluginManager.prototype.deactivatePlugins = function() {
  _plugins.forEach(function(plugin) { plugin.deactivate(); }, this);
};


exports.PluginManager = PluginManager;

