[![Build Status](https://travis-ci.org/dacodekid/gulp-factory.svg?branch=master)](https://travis-ci.org/dacodekid/gulp-factory)
# gulp-factory
a factory to create instant gulp-plugins and **enforcing [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

---
Except its implementation code (wrapped inside ```through.obj(...)```), majority of gulp-plugins share the same boilerplate code. With ```gulp-factory```, you can eliminate them all and just concentrate on plugin implementation instead - all by implicitly practicing **[gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

## Features
Currently ```gulp-factory``` enforces / follows the following **[gulp plugin guidelines (gpg)](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)** by default:

- [x] **gpg  6.0**: Does not throw errors inside a stream
- [x] **gpg  7.0**: Prefix any errors (uses [PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)) with the name of your plugin
- [x] **gpg  8.0**: Throws error if your plugin name doesn't prefixed with "gulp-" (if ```homeMade``` option set to ```true```, it won't)
- [x] **gpg  9.1**: If ```file.contents``` is null (non-read), it ignores the file and pass it along
- [x] **gpg  9.2**: If ```file.contents``` is a Stream and you don't support that (```streamSupport: false```), emits an error
- [x] **gpg 10.0**: Does not pass the file object downstream until you are done with it
- [x] **gpg 12.0**: Uses modules from [gulp's recommended modules

**TODO**

The following guidelines could be covered as ```suggestions```
- [ ] **gpg 4.0**: Verify whether your plugin has ```test.js```
- [ ] **gpg 5.0**: Verify whether your ```package.json``` has ```gulpplugin``` as a keyword
- [ ] **gpg 13.0**: Verify whether your plugin requires ```gulp``` as a dependency or peerDependency
- [ ] add more examples

## Installation
```
npm install --save gulp-factory
```

## Usage
Your plugins could be either a ```module``` or just a ```function```.
For example, you only need the below code to create a **completely working ```front-matter``` gulp-plugin**.
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

Then from your ```gulpfile.js```,
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

or just turn any of your ```function``` into a ```gulp-plugin```

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
#### pluginName (required)
Unless your plugin is in ```homeMade``` mode, your plugin must be prefixed with ```gulp-```. Will throw error otherwise.

#### pluginFunction (required)
By default, ```gulp-factory``` supplies only ```file & encode``` and it takes care of calling your ```callback```. So, your plugin function could be in either one of the following.

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
    // gulp-factory will use PluginError to throw the error  
    // Along with your pluginName as it's prefix
    throw e;
  }
}
```
In case if you have to throw an error, just ```throw ``` it as above and ```gulp-factory``` will wrap it with ```PluginError``` and prefix it with ```pluginName```.

#### factoryOptions (optional)
**Default values**
```javascript
{
  showStack: false,
  showProperties: true,
  streamSupport: false,
  bufferSupport: true,
  homeMade: false
}
```

##### showStack (boolean, default : false)

Refer [gulp-util's PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)

##### showProperties (boolean, default : true)

Refer [gulp-util's PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)

##### streamSupport (boolean, default : false)

Whether your plugin supports ```stream```. Throws __PluginError__ if the ```file``` is ```Stream```.

##### bufferSupport (boolean, default : true)

Whether your plugin supports ```buffer```. Throws __PluginError__ if the ```file``` is ```buffer```.

##### homeMade (boolean, default : false)

By default, ```gulp-factory``` operates in ```factory``` mode: which requires all your plugins prefixed with ```gulp-```. However if you would just like to test your plugins on your local repository or wrapping your existing functions as gulp-plugins and have no plan to list them under [gulp plugin registry](http://gulpjs.com/plugins/), just set ```homeMade: true``` and ```gulp-factory``` won't enforce ```gulp-``` prefix.
