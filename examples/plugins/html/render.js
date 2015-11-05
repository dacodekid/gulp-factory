'use strict';

import factory from 'gulp-factory';
import jade from 'jade';
import fileExist from 'plugins/helpers/fileExist';
import _ from 'lodash';
import {gulpUtil} from 'gulp-factory';

module.exports = (options = {}) => {
  try {
    return factory('jade-render', (file, encode) => {
      try {
        // If frontMatter exist, override options' values with it
        if (file.frontMatter) {
          _.assign(options, file.frontMatter);
        }

        // Is layout file provided?
        if (!options.layout) {
          throw new Error('Layout not provided');
        }

        // Is layout file exist?
        if (!fileExist(options.layout)) {
          throw new Error('Layout file doesn\'t exist');
        }

        // Copy file.contents to options
        options.content = file.contents.toString(encode);

        // Render
        file.contents = new Buffer(jade.renderFile(options.layout, options));
        file.path = gulpUtil.replaceExtension(file.path, '.html');

      } catch (e) {
        throw e;
      }
    }, {
      homeMade: true
    });
  } catch (e) {
    throw e;
  }
};
