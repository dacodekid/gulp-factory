/*eslint no-console: 0*/
'use strict';

const _ = require('lodash');
const through = require('through2');
const Err = require('gulp-util').PluginError;

// main module
module.exports = opt => {
  let options = {
    pluginName: '',
    pluginFn: null,
    flushFn: null,
    streamSupport: false,
    bufferSupport: true,
    homeMade: false,
    showStack: false,
    showProperties: true
  };

  // is it a valid option?
  if (!_.isPlainObject(opt))
    throw new Err('UNDEFINED:',
      'Pass a valid option', options);

  // if then override default options
  _.assign(options, opt);

  // assign to local values for readability & performance?
  const name = options.pluginName;
  const pluginFn = options.pluginFn;
  const flushFn = options.flushFn;
  const streamSupport = options.streamSupport;
  const bufferSupport = options.bufferSupport;
  const homeMade = options.homeMade;
  const errOptions = {
    showStack: options.showStack,
    showProperties: options.showProperties
  };

  // is it a valid plugin name?
  if (_.isString(name) && !_.trim(name))
    throw new Err('UNDEFINED:',
      'Pass a valid name', errOptions);

  // if not home made, then name should start with gulp-
  if (!homeMade && !_.startsWith(name, 'gulp-'))
    throw new Err(name + ': ',
      'Name should start with gulp-', errOptions);

  // is it a valid plugin function
  if (!_.isFunction(pluginFn))
    throw new Err(name + ': ',
      'Pass a valid plugin function', errOptions);

  // is it a valid flush function (or null)
  if (flushFn && !_.isFunction(flushFn))
    throw new Err(name + ': ',
      'Pass a valid flush function', errOptions);

  // return vinyl
  return through.obj(
    //transform function
    (file, encode, done) => {

      // if file is null, pass it
      if (file.isNull())
        return done(null, file);

      // is stream supported?
      if (file.isStream() && !streamSupport)
        return done(new Err(name + ': ',
          'Stream not supported', errOptions));

      // is buffer supported?
      if (file.isBuffer() && !bufferSupport)
        return done(new Err(name + ': ',
          'Buffer not supported', errOptions));

      // unrwap plugin
      try {
        pluginFn(file, encode);
      } catch (e) {
        return done(new Err(name + ': ',
          e, errOptions));
      }

      //pass to callback
      return done(null, file);
    },
    //flush function
    done => {
      if(_.isFunction(flushFn)) {
        try {
          flushFn();
        } catch (e) {
          return done(new Err(name + ': ',
            e, errOptions));
        }
      }
      return done();
    }
  );
};

// export gulp-util for convenience
module.exports.gulpUtil = require('gulp-util');
