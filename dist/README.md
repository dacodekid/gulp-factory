[![Build Status](https://travis-ci.org/dacodekid/gulp-factory.svg?branch=master)](https://travis-ci.org/dacodekid/gulp-factory)
# gulp-factory
a factory to create instant gulp-plugins and **enforcing [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

---
Except its implementation (wrapped inside `through.obj(...)`), majority of gulp-plugins share the same boilerplate code. With `gulp-factory`, you can eliminate them all and just concentrate on your plugin instead - all by implicitly practicing **[gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

## Features
Currently `gulp-factory` enforces / follows the below **[gulp plugin guidelines (gpg)](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)** by default:

- [x] **gpg  6.0**: Does not throw errors inside a stream
- [x] **gpg  7.0**: Prefix any errors (uses [PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)) with the name of your plugin
- [x] **gpg  8.0**: Throws error if your plugin name doesn't prefixed with "gulp-" (if `homeMade` option set to `true`, it won't)
- [x] **gpg  9.1**: If `file.contents` is null (non-read), it ignores the file and pass it along
- [x] **gpg  9.2**: If `file.contents` is a Stream and you don't support that (`streamSupport: false`), emits an error
- [x] **gpg 10.0**: Does not pass the file object downstream until you are done with it
- [x] **gpg 12.0**: Uses modules from gulp's recommended modules

The following guidelines are covered as `warnings` (v 1.1.1).
> Note: The below gulp guidelines are covered by reading your app's package.json.
So, these warnings could be `false possitive`. If you don't want these warnings
please disable warnings in `options` => `warnings: false`.

- [x] **gpg 4.0**: Verifies whether your `package.json` has `test` command
- [x] **gpg 5.0**: Verifies whether your `package.json` has `gulpplugin` as a keyword
- [x] **gpg 13.0**: Verifies whether your plugin requires `gulp` as a dependency or peerDependency in your `package.json`

## Examples
- [Examples](https://github.com/dacodekid/gulp-factory/tree/master/examples)
**TODO** : Add More Examples



- a `test` command exists in `scripts` section
- a keyword `gulpplugin` exists in `keywords` section
- a word `gulp` exists in `dependencies` or `peerDependencies` section

and outputs just a `console.log` warning message. These warnings could be false positive. For example, the below will

## Installation
```sh
npm install --save gulp-factory
```

## Usage
Your plugins could be either a `module` or just a `function`.
For example, you only need the below code to create a **completely working `front-matter` gulp-plugin**.
```javascript
// index.js
const gm = require('gray-matter');
const factory = require('gulp-factory');

module.exports = options => {
  options = options || {};

  function pluginFn(file, encode) {
    const raw = gm(file.contents.toString(encode), options);
    file.yml = raw.data || {};
    file.contents = new Buffer(raw.content);
  }

  return factory('gulpfactory-gray-matter', pluginFn, { homeMade: true });
};
```

Then from your `gulpfile.js`
```javascript
// gulpfile.js
const gulp = require('gulp');
const grayMatter = require('./');

gulp.task('default', function yaml() {
  return gulp.src('./fixtures/*.md')
    .pipe(grayMatter({delims: '---'}))
    .pipe(gulp.dest('./fixtures/output'));
})
```

or just turn any of your `function` into a `gulp-plugin`

```javascript
// gulpfile.js
const gulp = require('gulp');
const gm = require('gray-matter');
const factory = require('gulp-factory');

function pluginFn(file, encode) {
  const raw = gm(file.contents.toString(encode), {delims: '---'});
  file.yml = raw.data || {};
  file.contents = new Buffer(raw.content);
}

gulp.task('default', function yaml() {
  return gulp.src('./fixtures/*.md')
    .pipe(factory('gulpfactory-gray-matter', pluginFn, { homeMade: true }))
    .pipe(gulp.dest('./fixtures/output'));
})
```

## API
```javascript
  factory(pluginName, pluginFunction[, factoryOptions])
```
### Arguments
#### pluginName
Type: `string`, **required**

Unless your plugin is in `homeMade` mode, your plugin must be prefixed with `gulp-`. Will throw error otherwise.

#### pluginFunction
Type: `function`, **required**

By default, `gulp-factory` supplies only `file & encode` and it takes care of calling your `callback`. So, your plugin function could be in either one of the following signature.

```javascript
function pluginFunction() {
  // If you have no file based operations but
  // Just wrapping a function
}
```
Or
```javascript
function pluginFunction(file) {
  // Your file operations
  // Remember that you do not have to return anything or callback
}
```
Or
```javascript
function pluginFunction(file, encode) {
  // Your file/encode operations
  try {
    const fileData = file.contents.toString(encode);
    file.contents = new Buffer('new content');    
  } catch (e) {
    // Just throw your error and
    // gulp-factory will catch and throw PluginError
    // Along with your pluginName as it's prefix
    throw e;
  }
}
```
In case if you have to throw an error, just `throw ` it as above and `gulp-factory` will wrap it with `PluginError` and prefix it with `pluginName`.

#### factoryOptions
Type: `object`, **optional**

**Default values**
```javascript
{
  showStack: false,
  showProperties: true,
  streamSupport: false,
  bufferSupport: true,
  homeMade: false,
  warnings: true
}
```

##### showStack
Type: `boolean`  
Default: `false`

Refer [gulp-util's PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)

##### showProperties
Type: `boolean`  
Default: `true`

Refer [gulp-util's PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)

##### streamSupport
Type: `boolean`  
Default: `false`

Whether your plugin supports `stream`. Throws __PluginError__ if the `file` is `Stream`.

##### bufferSupport
Type: `boolean`  
Default: `true`

Whether your plugin supports `buffer`. Throws __PluginError__ if the `file` is `Buffer`.

##### homeMade
Type: `boolean`  
Default: `false`

By default, `gulp-factory` operates in `factory` mode: which requires all your plugins prefixed with `gulp-`. However if you would just like to test your plugins on your local repository or wrapping your existing functions as gulp-plugins and have no plan to list them under [gulp plugin registry](http://gulpjs.com/plugins/), just set `homeMade: true` and `gulp-factory` won't enforce `gulp-` prefix.

##### warnings
Type: `boolean`  
Default: `true`

To cover gulp guidelines 4, 5 & 13, `gulp-factory` will try to load your plugin/app's `package.json` and checks whether :
- a `test` command exists in `scripts` section
- a keyword `gulpplugin` exists in `keywords` section
- a word `gulp` exists in `dependencies` or `peerDependencies` section

and outputs just a `console.log` warning message. These warnings could be false positive. For example, the below will not show a warning
```json
"test:mocha": "mocha *.js",
"test": "npm run test:mocha"
```
but this one will.
```json
"test:mocha": "mocha *.js",
```
If you find these warnings less useful for your (home-made) plugins, please turn it off by setting `warnings: false`.


## gulpUtil
From `v0.3.1, gulp-factory` exposes [gulp-util](https://github.com/gulpjs/gulp-util) for your plugins' convenience.
```javascript
const gulpUtil = require('gulp-factory').gulpUtil;
```
