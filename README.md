[![Build Status](https://travis-ci.org/dacodekid/gulp-factory.svg?branch=master)](https://travis-ci.org/dacodekid/gulp-factory)
# gulp-factory (v2.0.0)
a factory to create instant gulp-plugins and **enforcing [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

## BREAKING CHANGE (v 2.0.0):
For simplicity & flexibility, API has changed as of V2.0.0. Now you'll pass `pluginName` & `pluginFn` as a part of `options`.

## v 2.0.0 Changes
- API signature has been changed
- An optional `flushFn` (refer [through2 API](https://github.com/rvagg/through2#api)) has been added.
- Removed `options.warnings`, that covered guidelines: 4, 5 & 13, as they seems no purpose served.

---
- [Intro](https://github.com/dacodekid/gulp-factory#intro)
- [Quick Sample](https://github.com/dacodekid/gulp-factory#quick-sample)
- [Installation](https://github.com/dacodekid/gulp-factory#installation)
- [Features](https://github.com/dacodekid/gulp-factory#features)
- [Usage](https://github.com/dacodekid/gulp-factory#usage)
- [API](https://github.com/dacodekid/gulp-factory#api)
  - [options](https://github.com/dacodekid/gulp-factory#options)
    - [pluginName](https://github.com/dacodekid/gulp-factory#optionspluginname)
    - [pluginFn](https://github.com/dacodekid/gulp-factory#optionspluginfn-file-encode)
    - [flushFn](https://github.com/dacodekid/gulp-factory#optionsflushfn-)
    - [streamSupport](https://github.com/dacodekid/gulp-factory#optionsstreamsupport)
    - [bufferSupport](https://github.com/dacodekid/gulp-factory#optionsbuffersupport)
    - [homeMade](https://github.com/dacodekid/gulp-factory#optionshomemade)
    - [showStack](https://github.com/dacodekid/gulp-factory#optionsshowstack)
    - [showProperties](https://github.com/dacodekid/gulp-factory#optionsshowproperties)
- [gulpUtil](https://github.com/dacodekid/gulp-factory#gulputil)
- [Examples](https://github.com/dacodekid/gulp-factory#examples)

# Intro
Majority of gulp-plugins share the same boilerplate code (except its implementation that wrapped inside `through.obj(...)`). `gulp-factory` takes care of them all as per **[gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)** - including `error handling`. All you need is just a few line of code to complete your `gulp-plugins`.

## Quick Sample


```javascript
// a fully functional plugin
var factory = require ('gulp-factory');

function plugin() {
  return factory({
    pluginName: 'gulp-text-changer',
    pluginFn: (file) => {
      file.contents = new Buffer('changed from plugin');
    }
  });
}
```


```javascript
// and calling from gulpfile.js
var changer = require ('./plugins/changer.js');
var gulp = require('gulp');

gulp.task('default', function () {
  return gulp.src('./fixtures/*.txt')
    .pipe(changer())
    .pipe(gulp.dest('dist'));
});
```


## Installation
```sh
npm install --save gulp-factory
```

## Features
Currently `gulp-factory` enforces / follows the below **[gulp plugin guidelines (gpg)](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)** by default:

- [x] Does not throw errors inside a stream (6)
- [x] Prefix any errors (uses [PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)) with the name of your plugin (7)
- [x] Throws error if your plugin name doesn't prefixed with "gulp-" (if `homeMade` option set to `true`, it won't) (8)
- [x] If `file.contents` is null (non-read), it ignores the file and pass it along (9.1)
- [x] If `file.contents` is a Stream and you don't support that (`streamSupport: false`), emits an error (9.2)
- [x] Does not pass the file object  downstream until you are done with it (10)
- [x] Uses modules from gulp's recommended modules (12)

## Usage
Your plugins could be either a `module` or just a `function`.
For example, you only need the below code to create a **completely working `front-matter` gulp-plugin**.

```javascript
// index.js
var gm = require('gray-matter');
var factory = require('gulp-factory');

module.exports = function (options) {
  options = options || {};

	// plugin implementation
  function plugin(file, encode) {
    var raw = gm(file.contents.toString(encode), options);
    file.yml = raw.data || {};
    file.contents = new Buffer(raw.content);
  }

  // return factory
  return factory({
  	pluginName: 'gulpfactory-gray-matter',
  	pluginFn: plugin,
  	homeMade: true
  });
};
```

Then from your `gulpfile.js`

```javascript
// gulpfile.js
var gulp = require('gulp');
var grayMatter = require('./');

gulp.task('default', function yaml() {
  return gulp.src('./fixtures/*.md')
    .pipe(grayMatter({delims: '---'}))
    .pipe(gulp.dest('./fixtures/output'));
})
```

or just turn any of your `function` into a `gulp-plugin`

```javascript
// gulpfile.js
var gulp = require('gulp');
var gm = require('gray-matter');
var factory = require('gulp-factory');

// plugin implementation
function plugin(file, encode) {
  var raw = gm(file.contents.toString(encode), {delims: '---'});
  file.yml = raw.data || {};
  file.contents = new Buffer(raw.content);
}

gulp.task('default', function yaml() {
  return gulp.src('./fixtures/*.md')
    .pipe(factory({
  	   pluginName: 'gulpfactory-gray-matter',
	   pluginFn: pluginFn,
  	   homeMade: true
    })
    .pipe(gulp.dest('./fixtures/output'));
})
```

## API

```javascript
  factory (options)
```

### ```options```

```javascript
// default values
{
  pluginName: '',
  pluginFn: null,
  flushFn: null,
  streamSupport: false,
  bufferSupport: true,
  homeMade: false,
  showStack: false,
  showProperties: true
}
```

#### options.pluginName
Type: `string`, **required**  
Default: Empty

> Unless `homeMade` mode enabled, plugin must be prefixed with `gulp-`. Will throw error otherwise.

#### options.pluginFn ([file, encode])
Type: `function`, **required**  
Default: null


> `gulp-factory` supplies only `file & encode` arguments (both are optional) and takes care of calling your `callback`. So, your plugin function could be in either one of the following signature.

```javascript
function pluginFunction() {
  // If you have no file based operations but
  // Just wrapping a function
}
```

```javascript
// or......
function pluginFunction(file) {
  // Your file operations
  // Remember that you do not have to return anything or callback
}
```

```javascript
// or......
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

> If needed, just `throw` an error as above and `gulp-factory` will wrap it with `PluginError` and`pluginName` prefix.

#### options.flushFn ()
Type: `function`, **optional**  
Default: null

> This function will be passed to `through2's` flush argument. Also will call it's `callback` function. If needed, just `throw` an error as above and `gulp-factory` will wrap it with `PluginError` and`pluginName` prefix.

#### options.streamSupport
Type: `boolean`  
Default: `false`

> Whether your plugin supports `stream`. Throws __PluginError__ if the `file` is `Stream`.

#### options.bufferSupport
Type: `boolean`  
Default: `true`

> Whether your plugin supports `buffer`. Throws __PluginError__ if the `file` is `Buffer`.

#### options.homeMade
Type: `boolean`  
Default: `false`

> By default, `gulp-factory` operates in `factory` mode:- that requires all your plugins prefixed with `gulp-`. However if you would just like to test your plugins on your local repository or wrapping your existing functions as gulp-plugins and have no plan to list them under [gulp plugin registry](http://gulpjs.com/plugins/), just set `homeMade: true` and `gulp-factory` won't enforce `gulp-` prefix.

#### options.showStack
Type: `boolean`  
Default: `false`

> Refer [gulp-util's PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)

#### options.showProperties
Type: `boolean`  
Default: `true`

> Refer [gulp-util's PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)

## gulpUtil
> `gulp-factory` exposes [gulp-util](https://github.com/gulpjs/gulp-util) for your plugins' convenience.

```javascript
const gulpUtil = require('gulp-factory').gulpUtil;
```

## Examples
> [Examples](https://github.com/dacodekid/gulp-factory-examples)  
