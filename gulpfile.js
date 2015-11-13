const factory = require('./');
const gulp = require('gulp');

gulp.task('default', function () {
  return gulp.src('./*.md')
    .pipe(plugin())
    .pipe(gulp.dest('dist'));
});


function plugin() {
  return factory({
    pluginName: 'gulp-',
    pluginFunction: () => {}
  });
}
