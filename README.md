# datadog-events

[![npm](https://img.shields.io/npm/v/datadog-events.svg?style=for-the-badge)](https://www.npmjs.com/package/datadog-events) [![npm](https://img.shields.io/npm/dt/datadog-events.svg?style=for-the-badge)](https://www.npmjs.com/package/datadog-events) [![David](https://img.shields.io/david/KyleRoss/node-datadog-events.svg?style=for-the-badge)](https://david-dm.org/KyleRoss/node-datadog-events) [![Travis](https://img.shields.io/travis/KyleRoss/node-datadog-events/master.svg?style=for-the-badge)](https://travis-ci.org/KyleRoss/node-datadog-events) [![license](https://img.shields.io/github/license/KyleRoss/node-datadog-events.svg?style=for-the-badge)](https://github.com/KyleRoss/node-datadog-events/blob/master/LICENSE) [![Beerpay](https://img.shields.io/beerpay/KyleRoss/node-datadog-events.svg?style=for-the-badge)](https://beerpay.io/KyleRoss/node-datadog-events)

Send events to [DataDog](https://www.datadoghq.com/) **without** DogStatsD or StatsD, using the standard DataDog API.

[DataDog](https://www.datadoghq.com/) is a powerful platform for monitoring your applications with one of the features being events that you can track and alert on. Typically DataDog utilizes `DogStatsD` or `StatsD` to send event data to the platform but they also provide methods within their API. This package was written as a means to quickly send events via the DataDog API without the need of the extra dependencies that cannot be utilized in certain environments such as serverless.

This package officially supports Node 10+, although it should work with Node 8+.

## Install
Requires Node 8+ and NPM.

Install with NPM:
```
npm install datadog-events --save
```

## Usage
```js
const ddEvents = require('datadog-events')({
  // options...
});

async function doSomething() {
  // ...

  if(err) {
    await ddEvents.error('There was an error!', 'These are the details');
  }
}
```

## API
<a name="module_datadog-events"></a>

### datadog-events

* [datadog-events](#module_datadog-events)
    * [ddEvents](#exp_module_datadog-events--ddEvents) ⇒ [<code>DataDogEvents</code>](#DataDogEvents) ⏏
        * [.DataDogEvents](#module_datadog-events--ddEvents.DataDogEvents) : [<code>DataDogEvents</code>](#DataDogEvents)

<a name="exp_module_datadog-events--ddEvents"></a>

#### ddEvents ⇒ [<code>DataDogEvents</code>](#DataDogEvents) ⏏
Creates a new instance of the [DataDogEvents](#datadogevents) class without the `new` keyword.

**Kind**: Exported DataDogEvents Instance  
**Returns**: [<code>DataDogEvents</code>](#DataDogEvents) - New instance of DataDogEvents class.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Options to pass to DataDogEvents. |

**Example**  
```js
const ddEvents = require('datadog-events')({
  // options...
});
```
<a name="module_datadog-events--ddEvents.DataDogEvents"></a>

##### ddEvents.DataDogEvents : [<code>DataDogEvents</code>](#DataDogEvents)
Access to the uninstantiated DataDogEvents class.

**Kind**: static DataDogEvents Class of [<code>ddEvents</code>](#exp_module_datadog-events--ddEvents)  
**Example**  
```js
const { DataDogEvents } = require('datadog-events');
const ddEvents = new DataDogEvents({
  // options...
});
```
<a name="DataDogEvents"></a>

### DataDogEvents
**Kind**: global class  

* [DataDogEvents](#DataDogEvents)
    * [new DataDogEvents([options])](#new_DataDogEvents_new)
    * [dataDogEvents.options](#DataDogEvents+options)
    * [dataDogEvents.&lt;success|info|warning|error&gt;(title, body, [options])](#DataDogEvents+&lt;success|info|warning|error&gt;) ⇒ [<code>Promise.&lt;DataDogResponse&gt;</code>](#DataDogResponse)
    * [dataDogEvents.sendEvent(type, title, body, [options])](#DataDogEvents+sendEvent) ⇒ [<code>Promise.&lt;DataDogResponse&gt;</code>](#DataDogResponse)

<a name="new_DataDogEvents_new"></a>

#### new DataDogEvents([options])
Creates an instance of DataDogEvents.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Options to configure DataDogEvents. See [DataDogEvents.options](#DataDogEvents+options). |

**Example**  
```js
const { DataDogEvents } = require('datadog-events');
const ddEvents = new DataDogEvents({
  // options...
});
```
<a name="DataDogEvents+options"></a>

#### dataDogEvents.options
Configuration options for DataDogEvents. Either set these options when creating a new instance or they may be changed
after the instance is created using `ddEvents.options.OPTION = VALUE`.

**Kind**: instance property of [<code>DataDogEvents</code>](#DataDogEvents)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| apiKey | <code>String</code> |  | Your DataDog API key. May be set using the environment variable `DATADOG_API_KEY`. |
| [domain] | <code>String</code> | <code>&#x27;datadoghq.com&#x27;</code> | The DataDog API domain to use. Allows switching for sandbox or UK APIs. May be set using the environment variable `DATADOG_DOMAIN`. |
| [titlePrefix] | <code>String</code> |  | Optional text to prefix all event titles with. |
| [bodyPrefix] | <code>String</code> |  | Optional text to prefix all event bodies with. |
| [bodyPostfix] | <code>String</code> |  | Optional text to append to all event bodies. |
| [priority] | <code>String</code> | <code>&#x27;normal&#x27;</code> | Priority for all events. Can be either `normal` or `low`. |
| [host] | <code>String</code> |  | Optional hostname to attache to all events. |
| [tags] | <code>Array.&lt;String&gt;</code> | <code>[]</code> | Optional array of string tags to attach to all events. |
| [aggregationKey] | <code>String</code> |  | Optional key that will allow DataDog to aggregate all events under. |
| [sourceName] | <code>String</code> |  | Optional source type name. See [here](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/). |
| [markdown] | <code>Boolean</code> | <code>true</code> | Format all event bodies as Markdown. |

<a name="DataDogEvents+&lt;success|info|warning|error&gt;"></a>

#### dataDogEvents.&lt;success\|info\|warning\|error&gt;(title, body, [options]) ⇒ [<code>Promise.&lt;DataDogResponse&gt;</code>](#DataDogResponse)
Shortcut methods for `ddEvents.sendEvent()`.

**Kind**: instance method of [<code>DataDogEvents</code>](#DataDogEvents)  
**Returns**: [<code>Promise.&lt;DataDogResponse&gt;</code>](#DataDogResponse) - Response from the DataDog API.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| title | <code>String</code> |  | The title of the event. |
| body | <code>String</code> |  | The body of the event which may contain markdown. |
| [options] | [<code>EventOptions</code>](#EventOptions) | <code>{}</code> | Additional options to configure the event. |

**Example**  
```js
// Send info event
await ddEvents.info('Title', 'This is an informational event');

// Send error event
await ddEvents.error('Some error!', 'There was an error');

// Send warning event
await ddEvents.warning('Something happened', 'This is a warning event');

// Send success event
await ddEvents.success('Success!', 'Process completed successfully!');
```
<a name="DataDogEvents+sendEvent"></a>

#### dataDogEvents.sendEvent(type, title, body, [options]) ⇒ [<code>Promise.&lt;DataDogResponse&gt;</code>](#DataDogResponse)
Sends an event to DataDog.

**Kind**: instance method of [<code>DataDogEvents</code>](#DataDogEvents)  
**Returns**: [<code>Promise.&lt;DataDogResponse&gt;</code>](#DataDogResponse) - Response from the DataDog API.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>String</code> |  | The alert type to send (can be `error`, `warning`, `info` or `success`). |
| title | <code>String</code> |  | The title of the event. |
| body | <code>String</code> |  | The body of the event which may contain markdown. |
| [options] | [<code>EventOptions</code>](#EventOptions) | <code>{}</code> | Additional options to configure the event. |

**Example**  
```js
// Send an event
await ddEvents.sendEvent('success', 'Completed Process', 'The process completed successfully!');

// Send an error
const error = new Error('Something bad happened!');
await ddEvents.sendEvent('error', 'There was an error!', error);

// Send an object
const myObj = { hello: 'world' };
await ddEvents.sendEvent('info', 'Process Results', myObj);

// Send event with markdown
await ddEvents.sendEvent('warning, 'Something happened', 'There was an issue with **myserver**: `Unable to communicate with endpoint`');
```
<a name="EventOptions"></a>

### EventOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [date] | <code>Date</code> | <code>new Date()</code> | Date object for the event. By default, it will be the current date/time. |
| [priority] | <code>String</code> | <code>&#x27;normal&#x27;</code> | Priority for the event. Can be either `normal` or `low`. |
| [host] | <code>String</code> |  | Optional hostname to attach to the event. |
| [tags] | <code>Array.&lt;String&gt;</code> | <code>[]</code> | Array of string tags to append to the event. Tags provided will be concatenated with the global `options.tags`. |
| [aggregationKey] | <code>String</code> |  | Optional key that will allow DataDog to aggregate all events under. |
| [sourceType] | <code>String</code> |  | Optional source type name. See [here](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/). |
| [markdown] | <code>Boolean</code> | <code>true</code> | Format the body as Markdown. |

<a name="DataDogResponse"></a>

### DataDogResponse : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| aggregation_key | <code>String</code> | The aggregation key for the event. |
| alert_type | <code>String</code> | The type of the event. One of `error, warning, info, success`. |
| date_happened | <code>Number</code> | POSIX timestamp of the event. |
| host | <code>String</code> | The hostname provided with the event. |
| priority | <code>String</code> | The priority of the event. One of `normal, low`. |
| source_type_name | <code>String</code> | The provided source type. |
| tags | <code>Array.&lt;String&gt;</code> | Array of string tags attached to the event. |
| text | <code>String</code> | The body of the event. |
| title | <code>String</code> | The event title. |

## Contributing
Feel free to open an issue or submit PRs! This project uses [Semantic Release](https://github.com/semantic-release/semantic-release) for automating releases. All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard in order for releases to be created.

## License
[MIT](LICENSE) © Kyle Ross

