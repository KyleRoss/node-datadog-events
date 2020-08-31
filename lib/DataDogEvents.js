const got = require('got');
const merge = require('merge-options');
const isError = require('is-error');

class DataDogEvents {
  /**
   * Creates an instance of DataDogEvents.
   * @param {?Object} [options={}] Options to configure DataDogEvents. See [DataDogEvents.options](#DataDogEvents+options).
   * @example
   * const { DataDogEvents } = require('datadog-events');
   * const ddEvents = new DataDogEvents({
   *   // options...
   * });
   */
  constructor(options = {}) {
    /**
     * Configuration options for DataDogEvents. Either set these options when creating a new instance or they may be changed
     * after the instance is created using `ddEvents.options.OPTION = VALUE`.
     * @property {String} apiKey Your DataDog API key. May be set using the environment variable `DATADOG_API_KEY`.
     * @property {String} [domain='datadoghq.com'] The DataDog API domain to use. Allows switching for sandbox or UK APIs. May be set using the environment variable `DATADOG_DOMAIN`.
     * @property {String} [titlePrefix] Optional text to prefix all event titles with.
     * @property {String} [bodyPrefix] Optional text to prefix all event bodies with.
     * @property {String} [bodyPostfix] Optional text to append to all event bodies.
     * @property {String} [priority='normal'] Priority for all events. Can be either `normal` or `low`.
     * @property {String} [host] Optional hostname to attache to all events.
     * @property {String[]} [tags=[]] Optional array of string tags to attach to all events.
     * @property {String} [aggregationKey] Optional key that will allow DataDog to aggregate all events under.
     * @property {String} [sourceName] Optional source type name. See [here](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/).
     * @property {Boolean} [markdown=true] Format all event bodies as Markdown.
     */
    this.options = Object.assign({
      apiKey: process.env.DATADOG_API_KEY || null,
      domain: process.env.DATADOG_DOMAIN || 'datadoghq.com',
      titlePrefix: '',
      bodyPrefix: '',
      bodyPostfix: '',
      priority: 'normal',
      tags: [],
      markdown: true
    }, options);
    
    ['error', 'warning', 'info', 'success'].forEach(type => {
      /**
       * Shortcut methods for `ddEvents.sendEvent()`.
       * @alias DataDogEvents#&lt;success|info|warning|error&gt;
       * @param {String}  title        The title of the event.
       * @param {String}  body         The body of the event which may contain markdown.
       * @param {EventOptions} [options={}] Additional options to configure the event.
       * @returns {Promise<DataDogResponse>} Response from the DataDog API.
       * @example
       * // Send info event
       * await ddEvents.info('Title', 'This is an informational event');
       * 
       * // Send error event
       * await ddEvents.error('Some error!', 'There was an error');
       * 
       * // Send warning event
       * await ddEvents.warning('Something happened', 'This is a warning event');
       * 
       * // Send success event
       * await ddEvents.success('Success!', 'Process completed successfully!');
       */
      this[type] = (title, body, options) => {
        return this.sendEvent(type, title, body, options);
      };
    });
  }
    
  /**
   * Sends an event to DataDog.
   * @param {String}  type         The alert type to send (can be `error`, `warning`, `info` or `success`).
   * @param {String}  title        The title of the event.
   * @param {String}  body         The body of the event which may contain markdown.
   * @param {EventOptions} [options={}] Additional options to configure the event.
   * @returns {Promise<DataDogResponse>} Response from the DataDog API.
   * @example
   * // Send an event
   * await ddEvents.sendEvent('success', 'Completed Process', 'The process completed successfully!');
   * 
   * // Send an error
   * const error = new Error('Something bad happened!');
   * await ddEvents.sendEvent('error', 'There was an error!', error);
   * 
   * // Send an object
   * const myObj = { hello: 'world' };
   * await ddEvents.sendEvent('info', 'Process Results', myObj);
   * 
   * // Send event with markdown
   * await ddEvents.sendEvent('warning, 'Something happened', 'There was an issue with **myserver**: `Unable to communicate with endpoint`');
   */
  async sendEvent(type, title, body, options = {}) {
    if(!this.options.apiKey) throw new Error('DataDog API key was not set');
    const data = this._prepareParams(Object.assign(options, { title, body, type }));
    
    try {
      const resp = await got.post(`https://app.${this.options.domain}/api/v1/events`, {
        responseType: 'json',
        resolveBodyOnly: true,
        searchParams: {
          api_key: this.options.apiKey
        },
        json: data
      });

      return resp;
    } catch(err) {
      const resp = err.response;

      if(resp) {
        if(resp.statusCode === 403) {
          err.message = 'Invalid API Key provided';
        } else {
          const { body } = resp;
          if(body.errors) err.message = body.errors.join(', ');
        }
      }

      throw err;
    }
  }
    
  /**
   * Prepares parameters to match format of the DataDog API before sending an event.
   * @private
   * @param {Object} cfg  Custom options for the event.
   * @returns {Object} The compiled params object.
   */
  _prepareParams(cfg) {
    const { apiKey, domain, ...opts } = this.options;
    cfg = merge.call({ concatArrays: true, ignoreUndefined: true }, opts, cfg);

    if(typeof cfg.body === 'object') {
      let body = ['```', '```'];
      if(isError(cfg.body)) {
        body.splice(1, 0, cfg.body.toString(), cfg.body.stack);
      } else {
        body.splice(1, 0, JSON.stringify(cfg.body, null, 4));
      }
      
      cfg.body = body.join('\n');
      cfg.markdown = true;
    }

    let text = `${opts.bodyPrefix}${cfg.body}${opts.bodyPostfix}`;

    return {
      alert_type: cfg.type || 'info',
      title: `${cfg.titlePrefix}${cfg.title}`,
      text: cfg.markdown? `%%%\n${text}\n%%%` : text,
      priority: cfg.priority,
      tags: cfg.tags,
      ...(cfg.date && cfg.date instanceof Date) && { date_happened: Math.round(cfg.date.getTime() / 1000) },
      ...cfg.host && { host: cfg.host },
      ...cfg.aggregationKey && { aggregation_key: cfg.aggregationKey },
      ...cfg.sourceType && { source_type_name: cfg.sourceType }
    };
  }
}

/**
 * @typedef {Object} EventOptions
 * @property {Date} [date=new Date()] Date object for the event. By default, it will be the current date/time.
 * @property {String} [priority='normal'] Priority for the event. Can be either `normal` or `low`.
 * @property {String} [host] Optional hostname to attach to the event.
 * @property {String[]} [tags=[]] Array of string tags to append to the event. Tags provided will be concatenated with the global `options.tags`.
 * @property {String} [aggregationKey] Optional key that will allow DataDog to aggregate all events under.
 * @property {String} [sourceType] Optional source type name. See [here](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/).
 * @property {Boolean} [markdown=true] Format the body as Markdown.
 */

/**
 * @typedef {Object} DataDogResponse
 * @property {String} aggregation_key The aggregation key for the event.
 * @property {String} alert_type The type of the event. One of `error, warning, info, success`.
 * @property {Number} date_happened POSIX timestamp of the event.
 * @property {String} host The hostname provided with the event.
 * @property {String} priority The priority of the event. One of `normal, low`.
 * @property {String} source_type_name The provided source type.
 * @property {String[]} tags Array of string tags attached to the event.
 * @property {String} text The body of the event.
 * @property {String} title The event title.
 */


module.exports = DataDogEvents;
