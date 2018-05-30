/**
 * @module datadog-events
 * @description Send events to DataDog **without** DogStatsD or StatsD
 * @author Kyle Ross
 */
"use strict";
const axios = require('axios');
const isError = require('is-error');

/**
 * @class DataDogEvents
 */
class DataDogEvents {
    /**
     * Creates an instance of DataDogEvents.
     * @param {?Object} [options={}] Options to configure DataDogEvents
     * 
     * @memberOf DataDogEvents
     */
    constructor(options = {}) {
        this.options = Object.assign({
            apiKey: process.env.DATADOG_API_KEY || null,
            titlePrefix: null,
            bodyPrefix: null,
            bodyPostfix: null,
            priority: 'normal',
            host: null,
            tags: [],
            aggregationKey: null,
            sourceType: null,
            markdown: true
        }, options || {});
        
        if(!this.options.apiKey) 
            throw new Error('DataDog API key was not set');
        
        ['error', 'warning', 'info', 'success'].forEach(type => {
            this[type] = (title, body, options = {}) => {
                return this.sendEvent(type, title, body, options);
            };
        });
    }
    
    /**
     * Sends an event to DataDog.
     * 
     * @param {String}  type         The alert type to send (can be `error`, `warning`, `info` or `success`).
     * @param {String}  title        The title of the event.
     * @param {String}  body         The body of the event which may contain markdown.
     * @param {?Object} [options={}] Additional options to configure the event.
     * @returns {Promise}
     * 
     * @memberOf DataDogEvents
     */
    sendEvent(type, title, body, options = {}) {
        options = Object.assign(options || {}, { title, body, type });
        
        let data = this._prepareParams(options);
        
        return new Promise((resolve, reject) => {
            axios.request({
                method: 'post',
                url: 'https://app.datadoghq.com/api/v1/events',
                params: {
                    api_key: this.options.apiKey
                },
                data
            }).then(resp => {
                resolve(resp.data);
            }).catch(err => {
                let status = err.response.status;
                
                if(status === 403) {
                    err.message = 'Invalid API Key provided';
                } else {
                    let resp = err.response.data;
                    if(resp.errors) err.message = resp.errors.join(', ');
                }
                
                reject(err);
            });
        });
    }
    
    /**
     * Prepares parameters to match format of the DataDog API before sending an event.
     * 
     * @param   {any}    cfg  Custom options for the event.
     * @returns {Object}      The compiled params object.
     * 
     * @memberOf DataDogEvents
     */
    _prepareParams(cfg) {
        let opts = this.options;
        
        if(typeof cfg.body === 'object') {
            if(isError(cfg.body)) {
                cfg.body = [
                    '```',
                    cfg.body.toString(),
                    cfg.body.stack,
                    '```'
                ].join('\n');
            } else {
                cfg.body = [
                    '```',
                    JSON.stringify(cfg.body, null, 4),
                    '```'
                ].join('\n');
            }
            
            cfg.markdown = true;
        }
        
        let params = {
            title: `${opts.titlePrefix || ''}${cfg.title}`,
            text: `${opts.bodyPrefix || ''}${cfg.body}${opts.bodyPostfix || ''}`,
            priority: cfg.priority || opts.priority || 'normal',
            tags: opts.tags || [],
            alert_type: cfg.type || 'info'
        };
        
        if(cfg.markdown || opts.markdown)
            params.text = `%%% \n ${params.text} \n %%%`;
        
        if(cfg.date && cfg.date instanceof Date)
            params.date_happened = Math.round(cfg.date.getTime() / 1000);
        
        if(cfg.host || opts.host)
            params.host = cfg.host || opts.host;
        
        if(cfg.tags && Array.isArray(cfg.tags))
            params.tags = params.tags.concat(cfg.tags);
        
        if(cfg.aggregationKey || opts.aggregationKey)
            params.aggregation_key = cfg.aggregationKey || opts.aggregationKey;
        
        if(cfg.sourceType || opts.sourceType)
            params.source_type_name = cfg.sourceType || opts.sourceType;
        
        return params;
    }
}

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
