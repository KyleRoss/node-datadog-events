# datadog-events

[![npm](https://img.shields.io/npm/v/datadog-events.svg?style=for-the-badge)](https://www.npmjs.com/package/datadog-events) [![npm](https://img.shields.io/npm/dt/datadog-events.svg?style=for-the-badge)](https://www.npmjs.com/package/datadog-events) [![David](https://img.shields.io/david/KyleRoss/node-datadog-events.svg?style=for-the-badge)](https://david-dm.org/KyleRoss/node-datadog-events) [![Travis](https://img.shields.io/travis/KyleRoss/node-datadog-events/master.svg?style=for-the-badge)](https://travis-ci.org/KyleRoss/node-datadog-events) [![license](https://img.shields.io/github/license/KyleRoss/node-datadog-events.svg?style=for-the-badge)](https://github.com/KyleRoss/node-datadog-events/blob/master/LICENSE) [![Beerpay](https://img.shields.io/beerpay/KyleRoss/node-datadog-events.svg?style=for-the-badge)](https://beerpay.io/KyleRoss/node-datadog-events)


Send events to DataDog **without** DogStatsD or StatsD, using the standard DataDog API. Supports Node 6+.

## Getting Started
### Install
```sh
npm install datadog-events --save
```

### Use
By default, a function is exported that will create a new instance of `DataDogEvents` for you. You may either use the default or create your own instance of the class:

#### Default Exports
```js
const ddEvents = require('datadog-events')({ /* options */ });

async function doSomething() {
    // ...
    
    if(err) {
        await ddEvents.error('Some error!', 'These are some details');
    }
}
```

#### Create Instance
```js
const DataDogEvents = require('datadog-events').DataDogEvents;
const ddEvents = new DataDogEvents({ /* options */ });
```

## API Documentation
### Options

#### Global DataDogEvents Options
The following options are available when creating a new instance of `DataDogEvents` or when calling the default export function.

| Option         | Type          | Required? | Description                                                                                                             | Default                       |
|----------------|---------------|-----------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------|
| apiKey         | String        | Yes       | Your DataDog API key. This may be populated using environment variable `DATADOG_API_KEY`.                               | `process.env.DATADOG_API_KEY` |
| domain         | String        | No        | DataDog domain to use for the API. Useful for switching to the EU version (ex. `datadoghq.eu`).                         | `"datadoghq.com"`             |
| titlePrefix    | String        | No        | Optional text to prefix all event titles with.                                                                          | `null`                        |
| bodyPrefix     | String        | No        | Optional text to prefix all event bodies with.                                                                          | `null`                        |
| bodyPostfix    | String        | No        | Optional test to postfix all event bodies with.                                                                         | `null`                        |
| priority       | String        | No        | Priority for all events. Can be either `normal` or `low`.                                                               | `"normal"`                    |
| host           | String        | No        | Optional host name to attach to all events.                                                                             | `null`                        |
| tags           | Array[String] | No        | Optional tags to attach to all events.                                                                                  | `[]`                          |
| aggregationKey | String        | No        | Optional key that will allow DataDog to aggregate all events under.                                                     | `null`                        |
| sourceType     | String        | No        | Optional source type name. See [here](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/). | `null`                        |
| markdown       | Boolean       | No        | Format all event bodies as markdown.                                                                                    | `true`                        |

#### Event Options
The following options may be provided when sending events with any of the methods documented below. Most of these options will override the global options listed above and are all optional.

| Option         | Type          | Description                                                                                                             |
| -------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| date           | Date          | Date object of the event. By default, it will be the current date/time.                                                 |
| priority       | String        | Priority for the event. Can be either `normal` or `low`.                                                                |
| host           | String        | Optional host name to attach to the event.                                                                              |
| tags           | Array[String] | Tags to append to the event. Tags provided will be appended to the global `options.tags`.                               |
| aggregationKey | String        | Optional key that will allow DataDog to aggregate all events under.                                                     |
| sourceType     | String        | Optional source type name. See [here](https://docs.datadoghq.com/integrations/faq/list-of-api-source-attribute-value/). |
| markdown       | Boolean       | Format the body as markdown.                                                                                            |

### DataDogEvents Class
The main class for `datadog-events`.

#### constructor([options={}])
The constructor for `DataDogEvents`.

| Argument | Type    | Required? | Description                                                     |
| -------- | ------- | --------- | --------------------------------------------------------------- |
| options  | ?Object | No        | [Global options](#global-datadogevents-options) for the class.  |

##### Example
```js
// Shortcut
const ddEvents = require('datadog-events')({ /* options */ });

// Create your own instance
const DataDogEvents = require('datadog-events').DataDogEvents;
const ddEvents = new DataDogEvents({ /* options */ });
```

###### Returns - _DataDogEvents_
> Returns instance of DataDogEvents.

### Methods

#### ddEvents.<error|warning|info|success>(title, body[, options={}])
Shortcut methods for `ddEvents.sendEvent()`. Will send an event with the given type of the method.

| Argument | Type                | Required? | Description                                                                                                                                                       |
| -------- | ------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title    | String              | Yes       | Title for the event.                                                                                                                                              |
| body     | String|Object|Error | Yes       | The body of the event. If `options.markdown` is `true`, it will be formatted as markdown. If an Object or Error is passed in, it will be formatted into markdown. |
| options  | ?Object             | No        | Optional [event options](#event-options).                                                                                                                         |

##### Example
```js
ddEvents.error('There was an error!', error)
    .then(response => console.log(response));

await ddEvents.success('Completed a process!', '**The process was completed!**');
```
###### Returns - _Promise[Object]_
> Promise resolves with object returned from the DataDog API containing `status` and `event` keys. Rejects with error if failed to send.

#### ddEvents.sendEvent(type, title, body[, options={}])
Sends an event to DataDog.

| Argument | Type                | Required? | Description                                                                                                                                                       |
| -------- | ------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type     | String              | Yes       | Alert type of the event. Can be `error`, `warning`, `info` or `success`.                                                                                          |
| title    | String              | Yes       | Title for the event.                                                                                                                                              |
| body     | String|Object|Error | Yes       | The body of the event. If `options.markdown` is `true`, it will be formatted as markdown. If an Object or Error is passed in, it will be formatted into markdown. |
| options  | ?Object             | No        | Optional [event options](#event-options).                                                                                                                         |

##### Example
```js
ddEvents.sendEvent('warning', 'Something happened', '**Warning:** Something crazy happened')
    .then(resp => console.log(resp));

await ddEvents.sendEvent('info', 'Results from my process', resultsObject);
```

###### Returns - _Promise[Object]_
> Promise resolves with object returned from the DataDog API containing `status` and `event` keys. Rejects with error if failed to send.


### Properties
#### ddEvents.options - _Object_
The [global options](#global-datadogevents-options) for the current instance of DataDogEvents. You may change any of the options at any time.

### Environment Variables
| Environment Variable | Type   | Option           | Description                                 |
|----------------------|--------|------------------|---------------------------------------------|
| DATADOG_API_KEY      | String | `options.apiKey` | Sets the API Key for DataDog automatically. |
| DATADOG_DOMAIN       | String | `options.domain` | Sets the domain for the DataDog API.        |

## Tests
Tests run automatically in Travis, although you may run them on your own machine. If you do, you must have your own DataDog account and API key. Make sure you add the `DATADOG_API_KEY` environment variable before running the tests.

```sh
DATADOG_API_KEY=MY_API_KEY npm run test
```

## License
MIT License. See [License](https://github.com/KyleRoss/node-datadog-events/blob/master/LICENSE) in the repository.
