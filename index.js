/*eslint no-console: 0*/

'use strict';

const _ = require('lodash');
const through = require('through2');
const appRoot = require('app-root-path');
const PluginError = require('gulp-util').PluginError;
const chalk = require('gulp-util').colors;

module.exports = (pluginName, pluginFn, options) => {
  let defOptions = {
    showStack: false,
    showProperties: true,
    streamSupport: false,
    bufferSupport: true,
    homeMade: false,
    warnings: true
  };

  // Is it a valid plugin option? If then
  // Override default's value with it
  options = _.isPlainObject(options) ? options : defOptions;
  _.assign(defOptions, options);

  // Guideline 08: pluginName your plugin appropriately:
  // it should begin with "gulp-" if it is a gulp plugin
  // Is it a valid string
  if (!_.isString(pluginName) || !_.trim(pluginName)) {
    // Guideline 06, 07.(1 & 2): Prefix any
    // Errors with the name of your plugin
    pluginName = 'UNDEFINED';
    throw new PluginError(pluginName + ':',
              'Pass a valid plugin name', defOptions);

  }

  // If it's not a homeMade plugin
  // Does the name prefixed with "gulp-"
  if (!defOptions.homeMade && !_.startsWith(pluginName, 'gulp-')) {
    throw new PluginError(pluginName + ':',
              'Plugin name must always starts with "gulp-"', defOptions);
  }

  // Is it a valid plugin function?
  if (!_.isFunction(pluginFn)) {
    throw new PluginError(pluginName + ':',
              'Pass a valid plugin function', defOptions);
  }

  // If warnings enabled,
  // Read package.json and log warnings
  if (defOptions.warnings) {
    try {
      const pkg = require(appRoot + '/package.json');
      const warning = chalk.black.bgYellow;

      // Guideline 5.0 : Add gulpplugin as a keyword in your package.json
      // so you show up on gulp plugin website's search directory
      if(!_.includes(pkg.keywords, 'gulpplugin')) {
        console.log(warning('Warning: Keyword `gulpplugin` ' +
                              'is not found in your `package.json`'));
      }

      // Guideline 13.0: Verify whether your plugin requires gulp
      // as a dependency or peerDependency
      if(_.includes(pkg.dependencies, 'gulp')) {
        console.log(warning('Warning: `gulp` is listed as a dependency ' +
                              'in your `package.json`'));
      }

      // or peerDependency
      if(_.includes(pkg.peerDependencies, 'gulp')) {
        console.log(warning('Warning: `gulp` is listed as a peer ' +
                              'dependency in your `package.json`'));
      }

      // Guideline 4.0: Your plugin must be tested
      // This is just a blunt checking. Could be false possitive
      if(!pkg.scripts.test) {
        console.log(warning('Warning: `test` command not found in your ' +
                              '`package.json`. Have you write tests ' +
                              'for your plugin?'));
      }
    } catch (e) {
      throw new PluginError(pluginName + ':', e, defOptions);
    }
  }

  // Return vinyl for next pipe
  return through.obj((file, encode, done) => {
    // Guideline 09.1 If file.contents is null (non-read)
    // just ignore the file and pass it along
    if (file.isNull()) {
      return done(null, file);
    }
    // Guideline 09.2: If file.contents is a Stream
    // and you don't support that just emit an error
    if (file.isStream() && defOptions.streamSupport === false) {
      return done(new PluginError(pluginName + ':',
                    'Stream not supported', defOptions));
    }

    // or for buffer...
    if (file.isBuffer() && defOptions.bufferSupport === false) {
      return done(new PluginError(pluginName + ':',
                    'Buffer not supported', defOptions));
    }

    // Unrwap the plugin
    try {
      pluginFn(file, encode);
    } catch (e) {
      return done(new PluginError(pluginName + ':', e, defOptions));
    }

    // Guideline 10: Do not pass the file object downstream
    // until you are done with it
    done(null, file);
  });
};

// Expose gulp-util for convenience
module.exports.gulpUtil = require('gulp-util');
