const assert = require('chai').assert;
const datadogEvents = require('./');

describe ('Exports', () => {
    it('should export a function', () => {
        assert.isFunction(datadogEvents);
    });
    
    it ('should have access to the DataDogEvents class', () => {
        assert.isFunction(datadogEvents.DataDogEvents);
    });
    
    it ('should create a new instance', () => {
        let events = datadogEvents();
        assert.instanceOf(events, datadogEvents.DataDogEvents);
    });
    
    it ('should allow setting custom options', () => {
        let events = datadogEvents({
            titlePrefix: 'test'
        });
        
        assert.equal(events.options.titlePrefix, 'test');
    });
});

describe ('DataDogEvents', () => {
    describe('Default Options', () => {
        let events = datadogEvents();
        
        it('should should have all default options', () => {
            assert.hasAllKeys(events.options, [
                'apiKey',
                'titlePrefix',
                'bodyPrefix',
                'bodyPostfix',
                'priority',
                'host',
                'tags',
                'aggregationKey',
                'sourceType',
                'markdown'
            ]);
        });
        
        it('should set apiKey to evnvironment variable', () => {
            assert.isString(events.options.apiKey);
        });
        
        it ('should set all default options', () => {
            assert.equal(events.options.titlePrefix, null);
            assert.equal(events.options.bodyPrefix, null);
            assert.equal(events.options.bodyPostfix, null);
            assert.equal(events.options.priority, 'normal');
            assert.equal(events.options.host, null);
            assert.isArray(events.options.tags);
            assert.equal(events.options.aggregationKey, null);
            assert.equal(events.options.sourceType, null);
            assert.equal(events.options.markdown, true);
        });
    });
    
    describe ('Custom Options', () => {
        let events = datadogEvents({
            apiKey: 'test',
            titlePrefix: 'test',
            bodyPrefix: 'test',
            bodyPostfix: 'test',
            priority: 'low',
            host: 'test.test',
            tags: ['app:test'],
            aggregationKey: '1234567890',
            sourceType: 'test'
        });
        
        it('should set the custom options correctly', () => {
            assert.equal(events.options.apiKey, 'test');
            assert.equal(events.options.titlePrefix, 'test');
            assert.equal(events.options.bodyPrefix, 'test');
            assert.equal(events.options.bodyPostfix, 'test');
            assert.equal(events.options.priority, 'low');
            assert.equal(events.options.host, 'test.test');
            assert.deepEqual(events.options.tags, ['app:test']);
            assert.equal(events.options.aggregationKey, '1234567890');
            assert.equal(events.options.sourceType, 'test');
            assert.equal(events.options.markdown, true);
        });
        
        it ('should allow setting options after instantiation', () => {
            events.options.priority = 'normal';
            events.options.tags.push('my-test-app');
            
            assert.equal(events.options.priority, 'normal');
            assert.deepEqual(events.options.tags, ['app:test', 'my-test-app']);
        });
    });
    
    describe ('Constructor Errors', () => {
        it('should throw error if API key is not set', () => {
            assert.throws(datadogEvents.bind(null, { apiKey: null }), Error);
        });
    });
    
    describe ('Methods', () => {
        let events = datadogEvents();
        
        beforeEach(() => {
            events.options = {
                apiKey: process.env.DATADOG_API_KEY,
                titlePrefix: null,
                bodyPrefix: null,
                bodyPostfix: null,
                priority: 'normal',
                host: null,
                tags: [],
                aggregationKey: null,
                sourceType: null,
                markdown: true
            };
        });
        
        describe('_prepareParams()', () => {
            it ('should have method', () => {
                assert.isFunction(events._prepareParams);
            });
            
            it ('should return object with correct keys', () => {
                let params = events._prepareParams({});
                assert.isObject(params);
                assert.hasAllKeys(params, [
                    'title',
                    'text',
                    'priority',
                    'tags',
                    'alert_type'
                ]);
            });
            
            it ('should return custom options when provided', () => {
                let params = events._prepareParams({
                    title: 'test',
                    body: 'test',
                    priority: 'low',
                    tags: ['app:test'],
                    type: 'warning',
                    date: new Date(),
                    host: 'test.test',
                    aggregationKey: '1234567890',
                    sourceType: 'test'
                });
                
                assert.hasAllKeys(params, [
                    'title',
                    'text',
                    'priority',
                    'tags',
                    'alert_type',
                    'date_happened',
                    'host',
                    'aggregation_key',
                    'source_type_name'
                ]);
            });
            
            it ('should merge tags', () => {
                events.options.tags.push('app:test');
                let params = events._prepareParams({
                    tags: ['my-test-tag']
                });
                
                assert.deepEqual(params.tags, ['app:test', 'my-test-tag']);
            });
            
            it ('should add markdown identifiers when options.markdown=true', () => {
                let params = events._prepareParams({
                    body: 'test'
                });
                
                assert.equal(params.text, '%%% \n test \n %%%');
            });
            
            it('should not add markdown identifiers when options.markdown=false', () => {
                events.options.markdown = false;
                let params = events._prepareParams({
                    body: 'test'
                });

                assert.equal(params.text, 'test');
            });
            
            it ('should markdownify errors', () => {
                let params = events._prepareParams({
                    body: new Error('test')
                });
                
                assert.match(params.text, /^%%%/i);
                assert.include(params.text, 'Error: test');
                assert.match(params.text, /%%%$/i);
            });
            
            it('should markdownify objects', () => {
                let params = events._prepareParams({
                    body: { test : 'test' }
                });

                assert.match(params.text, /^%%%/i);
                assert.include(params.text, '"test": "test"');
                assert.match(params.text, /%%%$/i);
            });
            
            it('should markdownify errors/objects even when options.markdown=false', () => {
                events.options.markdown = false;
                let params = events._prepareParams({
                    body: new Error('test')
                });

                assert.match(params.text, /^%%%/i);
                assert.match(params.text, /%%%$/i);
            });
            
            it ('should add prefixes and postfixes', () => {
                events.options.titlePrefix = 'test! ';
                events.options.bodyPrefix = 'body! ';
                events.options.bodyPostfix = ' !body';
                
                let params = events._prepareParams({
                    title: 'test',
                    body: 'body'
                });
                
                assert.equal(params.title, 'test! test');
                assert.equal(params.text, '%%% \n body! body !body \n %%%');
            });
        });
        
        describe ('sendEvent()', () => {
            it('should have method', () => {
                assert.isFunction(events.sendEvent);
            });
            
            it('should send an event', (done) => {
                events.sendEvent('info', 'test title', 'test body')
                    .then(res => {
                        assert.isObject(res);
                        assert.containsAllKeys(res, [
                            'status',
                            'event'
                        ]);
                        assert.equal(res.status, 'ok');
                        done();
                    })
                    .catch(done);
            });
            
            it ('should return error when API key is not provided', (done) => {
                events.options.apiKey = null;
                events.sendEvent('info', 'test title', 'test body')
                    .then(() => {
                        done(new Error('Should not return successful!'));
                    })
                    .catch(e => {
                        assert.instanceOf(e, Error);
                        assert.equal(e.message, 'Invalid API Key provided');
                        done();
                    });
            });
        });
        
        describe('error()', () => {
            it('should have method', () => {
                assert.isFunction(events.error);
            });
        });
        
        describe('warning()', () => {
            it('should have method', () => {
                assert.isFunction(events.warning);
            });
        });
        
        describe('info()', () => {
            it('should have method', () => {
                assert.isFunction(events.info);
            });
        });
        
        describe('success()', () => {
            it('should have method', () => {
                assert.isFunction(events.success);
            });
        });
    });
});
