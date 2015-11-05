'use strict';
import {gulpUtil} from 'gulp-factory';

module.exports = (content, path) => {
  content = content || '';
  path = path || '';

  return new gulpUtil.File({
    contents: new Buffer(content),
    path: path
  });
};
