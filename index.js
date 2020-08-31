/**
 * @module datadog-events
 */
const DataDogEvents = require('./lib/DataDogEvents');

/**
 * Creates a new instance of the [DataDogEvents](#datadogevents) class without the `new` keyword.
 * @type DataDogEvents
 * @kind DataDogEvents Instance
 * @alias module:datadog-events
 * 
 * @param {?Object} [options={}] Options to pass to DataDogEvents.
 * @returns {DataDogEvents} New instance of DataDogEvents class.
 * 
 * @example
 * const ddEvents = require('datadog-events')({
 *   // options...
 * });
 */
function ddEvents(options = {}) {
  return new DataDogEvents(options);
}

/**
 * Access to the uninstantiated DataDogEvents class.
 * @type DataDogEvents
 * @kind DataDogEvents Class
 * 
 * @example
 * const { DataDogEvents } = require('datadog-events');
 * const ddEvents = new DataDogEvents({
 *   // options...
 * });
 */
ddEvents.DataDogEvents = DataDogEvents;

module.exports = ddEvents;
