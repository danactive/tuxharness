var expect = require('gulp-expect-file'),
	jshint = require('gulp-jshint'),
	gulp   = require('gulp');
 
gulp.task('lint', function() {
	var files = [".jshintrc", "package.json", "gulpfile.js", "index.js", "test/**/*.js"];
	return gulp.src(files)
		.pipe(expect(files))
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});