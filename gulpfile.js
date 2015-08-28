var gulp  = require('gulp');
var babel = require('gulp-babel');

var srcFiles      = ['lib/**/*.js'];

gulp.task('build', function() {
  return gulp.src(srcFiles)
    .pipe(babel({
      stage:2,
      optional: [
        "es7.decorators",
        "es7.classProperties",
        "runtime"
      ]
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(srcFiles, ['build']);
});

gulp.task('default', ['build'], function () {});
