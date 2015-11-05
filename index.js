'use strict';

const _ = require('lodash');
const through = require('through2');
const PluginError = require('gulp-util').PluginError;

module.exports = (pluginName, pluginFn, options) => {
  let defOptions = {
    showStack: false,
    showProperties: true,
    streamSupport: false,
    bufferSupport: true,
    homeMade: false
  };

  try {
    // Is it a valid plugin option? If then
    // Override default's value with it
    options = _.isPlainObject(options) ? options : defOptions;
    _.assign(defOptions, options);

    // Guideline 08: pluginName your plugin appropriately:
    // it should begin with "gulp-" if it is a gulp plugin
    // Is it a valid string
    if (!_.isString(pluginName) || !_.trim(pluginName)) {
      pluginName = 'UNDEFINED';
      throw new Error('Pass a valid plugin name');
    }

    // If it's not a homeMade plugin
    // Does the name prefixed with "gulp-"
    if (!defOptions.homeMade && !_.startsWith(pluginName, 'gulp-')) {
      throw new Error('Plugin name must always starts with "gulp-"');
    }

    // Is it a valid plugin function?
    if (!_.isFunction(pluginFn)) {
      throw new Error('Pass a valid plugin function');
    }

    // Return vinyl for next pipe
    return through.obj((file, encode, done) => {
      try {
        // Guideline 09.1 If file.contents is null (non-read)
        // just ignore the file and pass it along
        if (file.isNull()) {
          return done(null, file);
        }
        // Guideline 09.2: If file.contents is a Stream
        // and you don't support that just emit an error
        if (file.isStream() && defOptions.streamSupport === false) {
          throw new Error('Stream not supported');
        }

        // or for buffer...
        if (file.isBuffer() && defOptions.bufferSupport === false) {
          throw new Error('Buffer not supported');
        }

        // Unrwap the plugin
        pluginFn(file, encode);

        // Guideline 10: Do not pass the file object downstream
        // until you are done with it
        done(null, file);
      } catch (e) {
        throw new PluginError(pluginName + ':', e, defOptions);
      }
    });
  } catch (e) {
    // Guideline 06, 07.(1 & 2): Prefix any
    // Errors with the name of your plugin
    throw new PluginError(pluginName + ':', e, defOptions);
  }
};

// Expose gulp-util for convenience
module.exports.gulpUtil = require('gulp-util');
