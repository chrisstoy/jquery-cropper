'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var pkg = require('./package');
var now = new Date();
var scripts = {
  name: 'jquery.cropper.js',
  main: 'dist/jquery.cropper.js',
  src: 'src/*.js',
  dest: 'dist'
};
var replacement = {
  regexp: /@\w+/g,
  filter: function (placeholder) {
    switch (placeholder) {
      case '@VERSION':
        placeholder = pkg.version;
        break;

      case '@YEAR':
        placeholder = now.getFullYear();
        break;

      case '@DATE':
        placeholder = now.toISOString();
        break;
    }

    return placeholder;
  }
};

gulp.task('jshint', ['js+'], function () {
  return gulp.src(scripts.all)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));
});

gulp.task('test', ['js', 'css'], function () {
  return gulp.src('test/*.html')
    .pipe(plugins.qunit());
});

gulp.task('default', ['test']);
