[![Build Status](https://travis-ci.org/dacodekid/gulp-factory.svg?branch=master)](https://travis-ci.org/dacodekid/gulp-factory)
# gulp-factory
a factory to create instant gulp-plugins and **enforcing [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

---
Majority of gulp-plugins share the same boilerplate code (except its implementation that wrapped inside `through.obj(...)`). `gulp-factory` takes care of them all as per **[gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)** - including `error handling`. All you need is just a few line of code to complete your `gulp-plugins`.

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

The following guidelines are covered as `warnings`.
> Note: Below gulp guidelines are covered by reading your plugin/app's `package.json`. You could disable them with `warnings: false`.

- [x] **gpg 4.0**: Verifies whether your `package.json` has `test` command
- [x] **gpg 5.0**: Verifies whether your `package.json` has `gulpplugin` as a keyword
- [x] **gpg 13.0**: Verifies whether your plugin requires `gulp` as a dependency or peerDependency in your `package.json`

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
  showProperties: true,
  warnings: true,
  packageJsonPath: './'
}
```

#### options.pluginName
Type: `string`, **required**  
Default: Empty

> Unless `homeMade` mode enabled, plugin must be prefixed with `gulp-`. Will throw error otherwise.

#### options.pluginFn ([file, encode])
Type: `function`, **required**  
Default: null


> `gulp-factory` supplies only `file & encode` arguments (both optional) and takes care of calling your `callback`. So, your plugin function could be in either one of the following signature.

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

#### options.warnings
Type: `boolean`  
Default: `true`

> To cover gulp guidelines 4, 5 & 13, `gulp-factory` will try to load plugin's `package.json` from `packageJsonPath` and checks whether :

> - a `test` command exists in `scripts` section
- a keyword `gulpplugin` exists in `keywords` section
- `gulp` is required in `dependencies` or `peerDependencies` section

> and outputs just a `console.log` warning message(s). The `test` warning could be a false positive. For example, the below will not show a warning

```json
"test:tape": "tape *.js",
"test": "npm run test:tape"
```

> but this one will.

```json
"test:tape": "tape *.js",
```

> If you find these warnings less useful for your (home-made) plugins, please turn it off by setting `warnings: false`.

#### options.packageJsonPath
Type: `string`  
Default: `./`

> Pass a relative path to your plugin/app's `package.json`.


## gulpUtil
> `gulp-factory` exposes [gulp-util](https://github.com/gulpjs/gulp-util) for your plugins' convenience.

```javascript
const gulpUtil = require('gulp-factory').gulpUtil;
```

## Examples
> [Examples](https://github.com/dacodekid/gulp-factory/tree/master/examples)  
**TODO** : Add More Examples
