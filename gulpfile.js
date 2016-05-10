const gulp  = require('gulp');
const babel = require('gulp-babel');
const srcFiles      = ['lib/**/*.js'];

gulp.task('build', function() {
  return gulp.src(srcFiles)
    .pipe(babel({
      babelrc: false,
      presets: ["es2015"]
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(srcFiles, ['build']);
});

gulp.task('default', ['build'], function() { });
