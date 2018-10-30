/**
 * @module datadog-events
 * @description Send events to DataDog **without** DogStatsD or StatsD
 * @author Kyle Ross
 */
"use strict";
const DataDogEvents = require('./lib/events');

/**
 * Shortcut for creating a new instance of DataDogEvents.
 * 
 * @param {?Object} [options={}] Options to pass to DataDogEvents.
 * @returns {DataDogEvents}
 */
function dataDogEvents(options = {}) {
    return new DataDogEvents(options);
}

dataDogEvents.DataDogEvents = DataDogEvents;

module.exports = dataDogEvents;
