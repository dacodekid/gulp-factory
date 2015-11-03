# gulp-factory
a factory to create instant gulp-plugins and **enforcing [gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

---
Except its implementation code (wrapped inside ```through.obj(...)```), majority of gulp-plugins share the same boilerplate code. With ```gulp-factory```, you can eliminate them all and just concentrate on plugin implementation instead - all by implicitly practicing **[gulp plugin guidelines](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)**.

## Features
Currently ```gulp-factory``` enforces / follows the following **[gulp plugin guidelines (gpg)](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md)** by default:

- [gpg 6] Does not throw errors inside a stream
- [gpg 7] Prefix any errors (uses [PluginError](https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options)) with the name of your plugin
- [gpg 8] Throws error if your plugin name doesn't prefixed with "gulp-" (if ```homeMade``` option set to ```true```, it won't)
- [gpg 9.1] If ```file.contents``` is null (non-read), it ignores the file and pass it along
- [gpg 9.2] If ```file.contents``` is a Stream and you don't support that (```streamSupport: false```), emits an error
- [gpg 10] Does not pass the file object downstream until you are done with it
- [gpg 12] Uses modules from [gulp's recommended modules page](https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/recommended-modules.md)

**TODO**

The following guidelines could be covered as ```suggestions```
- [ ] [gpg 4] Verify whether your plugin has ```test.js```
- [ ] [gpg 5] Verify whether your ```package.json``` has ```gulpplugin``` as a keyword
- [ ] [gpg 13] Verify whether your plugin requires ```gulp``` as a dependency or peerDependency
- [ ] add more examples


## Usage
Your plugins could be either a ```module``` that takes its own ```options```
```javascript
const factory = require('gulp-factory');

module.exports = (options) {

  function pluginFunction(file, encodee) {
    // body...
  }

  factory('gulp-pluginName', pluginFunction, {
    bufferSupport: true,
    streamSupport: false  
  });
};
```

or just a ```function```

```javascript
const gulp = require('gulp');
const factory = require('gulp-factory');

const plugin = function pluginFn(file, encode) {
  // body
}

gulp.task('defalut',
  factory('pluginName',pluginFn), {
    homeMade: true
  });
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
