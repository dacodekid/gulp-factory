'use strict';

import factory from 'gulp-factory';
import markit from 'markdown-it';

module.exports = (options = {}) => {
  try {
    return factory('markup', (file, encode) => {
      const data = markit(options)
        .render(file.contents.toString(encode));
      file.contents = new Buffer(data);
    }, {
      homeMade: true
    });
  } catch (e) {
    throw e;
  }
};
