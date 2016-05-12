(function() {

'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var paths = {
	src : 'src/*.js',
	tests : 'example/*.js'
};


gulp.task('clean', function(){ //Takes in a callback to let the engine know when it is done.
	return del([
		'dist/**/*' //This tells del to delete all files and folders within the dist Ò
	]);
});

gulp.task('package', ['clean'], function() {
	gulp.src(paths.src)
		.pipe(gulp.dest('dist'))
		.pipe(uglify())
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest('dist'));
});

gulp.task('jshint', function () {
  return gulp.src([paths.tests, paths.src])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'));
});


gulp.task('default', ['jshint', 'package']);

})();