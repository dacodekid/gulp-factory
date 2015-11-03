'use strict';

const chai = require('chai');
const expect = chai.expect;
const factory = require('./');
const File = require('gulp-util').File;
const Stream = require('stream');

describe('Validating arugments', () => {
  it('throws for empty arguments', () => {
    expect(() => {
      factory();
    }).to.throw('Pass a valid plugin name');
  });

  it('throws for empty string', () => {
    expect(() => {
      factory('');
    }).to.throw('Pass a valid plugin name');
  });

  it('throws for whitespace string', () => {
    expect(() => {
      factory('  ');
    }).to.throw('Pass a valid plugin name');
  });

  it('throws for non-string objects', () => {
    expect(() => {
      factory({});
    }).to.throw('Pass a valid plugin name');
  });

  it('throws for invalid name', () => {
    expect(() => {
      factory('grunt-');
    }).to.throw('Plugin name must always starts with "gulp-"');
  });

  it('will not throw for invalid name, if home-made mode enabled', () => {
    expect(() => {
      factory('g', () => {}, {homeMade: true});
    }).not.to.throw(Error);
  });

  it('throws for empty plugin function', () => {
    expect(() => {
      factory('gulp-');
    }).to.throw('Pass a valid plugin function');
  });

  it('throws for non-function argument', () => {
    expect(() => {
      factory('gulp-', {});
    }).to.throw('Pass a valid plugin function');
  });
});

describe('Factory will...', () => {
  function fixture(content) {
    return new File({
      contents: content
    });
  }

  it('pass the file if it is null', () => {
    expect(() => {
      factory('gulp-test', () => {})
      .write(fixture(null));
    }).not.to.throw(Error);
  });

  it('throw error for stream, if not supported', () => {
    expect(() => {
      factory('gulp-test', () => {}, {
        streamSupport: false
      }).write(fixture(new Stream()));
    }).to.throw(/Stream not supported/);
  });

  it('throw error for buffer, if not supported', () => {
    expect(() => {
      factory('gulp-test', () => {}, {
        bufferSupport: false
      }).write(fixture(new Buffer('Lorem ipsum')));
    }).to.throw(/Buffer not supported/);
  });

  it('ALL IS WELL, ALL IS WELL', () => {
    const plugin = factory('gulp-test', file => {
      file.contents = new Buffer('changed from plugin');
    }, {
      bufferSupport: true
    });
    
    plugin.write(fixture(new Buffer('Lorem ipsum')))
    plugin.once('data', file => {
      expect(file.contents.toString()).to.equal('changed from plugin');
    })
    plugin.end();
  });
});
// const it = require('tape');
// const factory = require('./');
// const File = require('gulp-util').File;
//
// function fixture(content) {
//   return new File({
//     contents: content
//   })
// }
//
// // Main factory wrapper
// it('a NAME argument', should => {
//   should.throws(() => {
//     factory()
//   }, /Pass a valid plugin name/, 'shouldn\'t like empty argument');
//
//   should.throws(() => {
//     factory('')
//   }, /Pass a valid plugin name/, 'shouldn\'t like empty string');
//
//   should.throws(() => {
//     factory('');
//   }, /Pass a valid plugin name/, 'shouldn\'t like whitespace string');
//
//   should.throws(() => {
//     factory({})
//   }, /Pass a valid plugin name/, 'shouldn\'t like any other object type');
//
//   should.throws(() => {
//     factory('grunt-');
//   }, /Plugin name must always starts with "gulp-"/, 'must always starts with "gulp-"');
//
//   should.throws(() => {
//     factory('gulp-');
//   }, /Pass a valid plugin function/, 'all is well... all is well');
//
//   should.end();
// });
//

// it('a PLUGIN argument', should => {
//   should.throws(() => {
//     factory('gulp-', {});
//   }, /Pass a valid plugin function/, 'must be a function');
//
//   should.doesNotThrow(() => {
//     factory('gulp-', ()=>{});
//   }, /No error should through/, 'all is well... all is well');
//
//   should.doesNotThrow(() => {
//     factory('gulp-', ()=>{}, {
//       showStack: true
//     });
//   }, /Just for code-coverage/, 'said `all is well` already. TWICE');
//
//   should.end();
// });
//
// it('throw', should => {
//   const stream = factory('gulp-test', () => {
//   }, {bufferSupport: false});
//
//   should.throws(() => {
//     stream.write(fixture(new Buffer('Lorem ipsum')));
//   }, /Buffer not supported/, 'error for buffer if not supported');
//   should.end();
// });
//
// it('should return a vinyl file', should => {
//   const stream = factory('gulp-test', file => {
//     file.contents = new Buffer('changed');
//   }, {bufferSupport: true})
//
//   stream.write(fixture(new Buffer('Lorem ipsum')));
//   stream.once('data', file => {
//     should.equals(file.contents.toString(), 'changed');
//   });
//   // stream.end();
//
//   should.end();
// });
