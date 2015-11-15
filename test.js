'use strict';

const test = require('tape');
const factory = require('./');
const File = factory.gulpUtil.File;
const Stream = require('stream');

function fixture(data) {
  return new File({
    contents: data
  });
}
test('factory object', assert => {
  assert.equal(typeof factory.gulpUtil, 'object',
    'should expose gulp-util module');

  assert.throws(() => {
    factory('');
  },/Pass a valid option/, 'pass a valid option');

  assert.end();
});

test('name value', assert => {
  assert.throws(() => {
    factory({
      pluginName: ''
    });
  }, /Pass a valid name/, 'pass a valid name');

  assert.throws(() => {
    factory({
      pluginName: 'grunt-'
    });
  }, /Name should start with gulp-/, 'name should start with gulp-');

  assert.doesNotThrow(() => {
    factory({
      pluginName: 'grunt-',
      pluginFn: () => {},
      homeMade: true
    });
  }, /doesn't throw/, 'shoud not throw home-made plugin');

  assert.end();
});

test('file object', assert => {
  assert.doesNotThrow(() => {
    factory({
      pluginName: 'gulp-',
      pluginFn: () => {}
    })
    .write(fixture(null));
  }, /does not throw/, 'will just pass a null file');

  assert.throws(() => {
    factory({
      pluginName: 'gulp-',
      pluginFn: () => {}
    })
    .write(fixture(new Stream()));
  }, /Stream not supported/, 'stream not supported');

  assert.throws(() => {
    factory({
      pluginName: 'gulp-',
      pluginFn: () => {},
      bufferSupport: false
    })
    .write(fixture(new Buffer('buff')));
  }, /Buffer not supported/, 'buffer not supported');

  assert.end();
});

test('plugin function', assert => {
  assert.throws(() => {
    factory({
      pluginName: 'gulp-',
      pluginFn: {}
    });
  }, /Pass a valid plugin function/, 'pass a valid plugin function');

  factory({
    pluginName: 'gulp-test',
    pluginFn: (file, encode) => {
      const content = file.contents.toString(encode) + ' gipsum';
      file.contents = new Buffer(content);
    }
  })
  .on('data', file => {
    assert.equal(file.contents.toString(),
      'Lorem ipsum gipsum', 'transform funtion should write data');
  })
  .write(fixture(new Buffer('Lorem ipsum')));

  assert.end();
});

test('flush function', assert => {
  assert.throws(() => {
    factory({
      pluginName: 'gulp-',
      pluginFn: () => {},
      flushFn: {}
    });
  }, /Pass a valid flush function/, 'pass a valid flush function');

  // need a more meaningful tests
  assert.throws(() => {
    const plugin = factory({
      pluginName: 'gulp-test',
      pluginFn: () => {},
      flushFn: () => {
        throw new Error('Thrown from flush');
      }
    });
    plugin.write(fixture(new Buffer('')));
    plugin.end();
  }, /Thrown from flush/, 'thrown from flush');

  assert.doesNotThrow(() => {
    const plugin = factory({
      pluginName: 'gulp-test',
      pluginFn: () => {},
      flushFn: () => {
        //nothing up here. just passing
      }
    });
    plugin.write(fixture(new Buffer('')));
    plugin.end();
  }, /Just passing through/, 'finish flushing if no error');


  assert.end();
});
