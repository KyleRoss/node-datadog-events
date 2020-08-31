const test = require('ava');
const ddEvents = require('../');
const DataDogEvents = require('../lib/DataDogEvents');

test('exports a function', t => {
  t.is(typeof ddEvents, 'function');
});

test('provides access to uninstantiated DataDogEvents class', t => {
  t.is(typeof ddEvents.DataDogEvents, 'function');
  t.is(typeof ddEvents.DataDogEvents.constructor, 'function');
});

test('creates new instance of DataDogEvents without new keyword', t => {
  const inst = ddEvents();
  t.truthy(inst instanceof DataDogEvents);
});

test('able to set custom options', t => {
  const inst = ddEvents({
    titlePrefix: 'test'
  });

  t.is(inst.options.titlePrefix, 'test');
});
