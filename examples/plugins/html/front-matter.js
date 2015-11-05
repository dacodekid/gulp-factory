'use strict';

import factory from 'gulp-factory';
import gm from 'gray-matter';

module.exports = (options = {}) => {
  return factory('front-matter', (file, encode) => {
    try {
      const raw = gm(file.contents.toString(encode), options);
      file.frontMatter = raw.data || {};
      file.contents = new Buffer(raw.content);
    } catch (e) {
      throw e;
    }
  }, {homeMade: true});
};
