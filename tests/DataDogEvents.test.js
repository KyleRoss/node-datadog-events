const test = require('ava');
const nock = require('nock');
const DataDogEvents = require('../lib/DataDogEvents');
const response = require('./fixtures/response');

const shortcutMethods = ['error', 'warning', 'info', 'success'];

// Setup nock to mock the datadog api endpoint
nock('https://app.datadoghq.com')
  .persist()
  .post(/\/api\/v1\/events(\?api_key)?/)
  .reply((uri, body) => {
    const apiKey = uri.match(/\?api_key=(.*)/);

    if(apiKey === null || !['test', 'error'].includes(apiKey[1])) {
      return [403, {}];
    }

    if(apiKey[1] === 'error') {
      return [400, {
        errors: ['Some error happened']
      }];
    }

    return [200, response(body)];
  });

/* It should export a class from DataDogEvents.js */
test('exports a class', t => {
  t.is(typeof DataDogEvents.constructor, 'function');
});

/* It should be able to set the API Key using an evironment variable */
test.serial('set api key from environment variable', t => {
  process.env.DATADOG_API_KEY = 'test_api_key';

  const inst = new DataDogEvents();
  t.is(inst.options.apiKey, 'test_api_key');
  delete process.env.DATADOG_API_KEY;
});

/* It should have a "sendEvent" method on the class */
test('has sendEvent method', t => {
  const inst = new DataDogEvents();

  t.is(typeof inst.sendEvent, 'function', 'DataDogEvents.sendEvent()');
});

/* It should throw an error if an API Key is not provided */
test('throws error if API key is not provided', async t => {
  delete process.env.DATADOG_API_KEY;
  const inst = new DataDogEvents();

  await t.throwsAsync(() => {
    return inst.sendEvent('error', 'Event title', 'Event body');
  }, { instanceOf: Error, message: 'DataDog API key was not set' });
});

/* It should send a properly formatted event to the DataDog API */
test('sends event', async t => {
  const inst = new DataDogEvents({ apiKey: 'test' });

  const resp = await inst.sendEvent('info', 'Event title', 'Event body');
  t.deepEqual(resp, {
    alert_type: 'info',
    priority: 'normal',
    tags: [],
    text: '%%%\nEvent body\n%%%',
    title: 'Event title'
  });
});

/* It should throw an error when sending an event with an invalid API key */
test('throw error if invalid API key is provided', async t => {
  const inst = new DataDogEvents({ apiKey: 'invalid' });

  await t.throwsAsync(async () => {
    return await inst.sendEvent('info', 'Event title', 'Event body');
  }, { instanceOf: Error, message: 'Invalid API Key provided' });
});

/* It should throw an error when sending an event when error(s) are returned from the API */
test('throw error if errors returned from the API', async t => {
  const inst = new DataDogEvents({ apiKey: 'error' });

  await t.throwsAsync(async () => {
    return await inst.sendEvent('info', 'Event title', 'Event body');
  }, { instanceOf: Error, message: 'Some error happened' });
});

/* It should send an event with custom options to the DataDog API */
test('sends event with custom options', async t => {
  const date = new Date();
  const inst = new DataDogEvents({ apiKey: 'test' });

  const resp = await inst.sendEvent('info', 'Event title', 'Event body', {
    date: date,
    host: 'another.hostname.tld',
    tags: ['abc', '123'],
    aggregationKey: 'test',
    sourceType: 'customOptions'
  });

  t.deepEqual(resp, {
    aggregation_key: 'test',
    alert_type: 'info',
    date_happened: Math.round(date.getTime() / 1000),
    host: 'another.hostname.tld',
    priority: 'normal',
    source_type_name: 'customOptions',
    tags: ['abc', '123'],
    text: '%%%\nEvent body\n%%%',
    title: 'Event title'
  });
});

/* It should send an event with default options to the DataDog API */
test('sends event with default options', async t => {
  const inst = new DataDogEvents({
    apiKey: 'test',
    host: 'another.hostname.tld',
    aggregationKey: 'test',
    sourceType: 'test',
    tags: ['test'],
    priority: 'low'
  });

  const resp = await inst.sendEvent(null, 'Event title', 'Event body', { markdown: false });

  t.deepEqual(resp, {
    aggregation_key: 'test',
    alert_type: 'info',
    host: 'another.hostname.tld',
    priority: 'low',
    source_type_name: 'test',
    tags: ['test'],
    text: 'Event body',
    title: 'Event title'
  });
});

/* It should send an formatted Error object as the event body */
test('formats events that are an Error object', async t => {
  const inst = new DataDogEvents({ apiKey: 'test' });

  const err = new Error('This is a test');
  const resp = await inst.sendEvent('error', 'Event title', err);

  const expected = ['%%%', '```', err.toString(), err.stack, '```', '%%%'];
  t.is(resp.text, expected.join('\n'));
});

/* It should send an formatted object as the event body */
test('formats events that are an object', async t => {
  const inst = new DataDogEvents({ apiKey: 'test' });

  const obj = { test: 'object', abc: 123 };
  const resp = await inst.sendEvent('error', 'Event title', obj);

  const expected = ['%%%', '```', JSON.stringify(obj, null, 4), '```', '%%%'];
  t.is(resp.text, expected.join('\n'));
});

/* It should have shortcut methods for sending events */
test('has shortcut methods for each event type', t => {
  const inst = new DataDogEvents();

  shortcutMethods.forEach(method => {
    t.is(typeof inst[method], 'function', `DataDogEvents.${method}()`);
  });
});

/* Each shortcut method should send an event */
test('shortcut methods should send events', async t => {
  const inst = new DataDogEvents({ apiKey: 'test' });

  for(const method of shortcutMethods) {
    const resp = await inst[method]('Event title', 'Event body');

    t.deepEqual(resp, {
      alert_type: method,
      priority: 'normal',
      tags: [],
      text: '%%%\nEvent body\n%%%',
      title: 'Event title'
    });
  }
});
