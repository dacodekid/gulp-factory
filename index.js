/*eslint no-console: 0*/
'use strict';

const Err = require('gulp-util').PluginError;
const _ = require('lodash');
const through = require('through2');

// main module
module.exports = (opt) => {
  let options = {
    pluginName: '',
    pluginFunction: null,
    flushFunction: null,
    streamSupport: false,
    bufferSupport: true,
    homeMade: false,
    showStack: false,
    showProperties: true,
    warnings: true,
    packagePath: './'
  };

  // is it a valid option?
  if (!_.isPlainObject(opt))
    throw new Err('UNDEFINED:',
      'Pass a valid option', options);

  // if then override default options
  _.assign(options, opt);
  const name = options.pluginName;
  const plugin = options.pluginFunction;
  const flush = options.flushFunction;
  const stream = options.streamSupport;
  const buffer = options.bufferSupport;
  const home_made = options.homeMade;

  // is it a valid plugin name?
  if (_.isString(name) && !_.trim(name))
    throw new Err('UNDEFINED:',
      'Pass a valid name', options);

  // if not home made, then name should start with gulp-
  if (!home_made && !_.startsWith(name, 'gulp-'))
    throw new Err(name + ': ',
      'Name should start with gulp-', options);

  // is it a valid plugin function
  if (!_.isFunction(plugin))
    throw new Err(name + ': ',
      'Pass a valid plugin function', options);

  // is it a valid flush function (or null)
  if (flush && !_.isFunction(flush))
    throw new Err(name + ': ',
      'Pass a valid flush function', options);

  // return vinyl
  return through.obj(
    //transform function
    (file, encode, done) => {

      // if file is null, pass it
      if (file.isNull())
        return done(null, file);

      // is stream supported?
      if (file.isStream() && !stream)
        return done(new Err(name + ': ',
          'Stream not supported', options));

      // is buffer supported?
      if (file.isBuffer() && !buffer)
        return done(new Err(name + ': ',
          'Buffer not supported', options));

      // unrwap plugin
      try {
        plugin(file, encode);
      } catch (e) {
        return done(new Err(name + ': ',
          e, options));
      }

      //pass to callback
      return done(null, file);
    },
    //flush function
    done => {
      if(_.isFunction(flush)) {
        try {
          flush();
        } catch (e) {
          return done(new Err(name + ': ',
            e, options));
        }
      }
      return done();
    }
  );
};

// export gulp-util for convenience
module.exports.gulpUtil = require('gulp-util');
