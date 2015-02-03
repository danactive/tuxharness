/*global Object */

var gulp = require('gulp'),
	paths = {
		"lint": [".jshintrc", "package.json", "gulpfile.js", "index.js", "test/**/*.js"]
	},
	pkg = require('./package.json'),
	plugins = require('gulp-load-plugins')({"camelize": true});
 
gulp.task('lint', function() {
	return gulp.src(paths.lint)
		.pipe(plugins.expectFile(paths.lint))
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('develop', ["lint"], function() {
	var getConfigPort,
		getViewFolders,
		recipe;

	getConfigPort = function () {
		var errorMsg = "Missing recipe filename or incorrect path. Definition must be package.json tuxharness key.";
		if (pkg.tuxharness === undefined) {
			throw new ReferenceError(errorMsg);
		}
		recipe = require(pkg.tuxharness);
		if (recipe === undefined) {
			throw new ReferenceError(errorMsg);
		}
		return recipe.register.port;
	};

	getViewFolders = function () {
		var paths = [];
		Object.keys(recipe.register.view).forEach(function (viewName) {
			paths.push("./" + recipe.register.view[viewName].path + "/**/*");
		});

		return paths;
	};
	
	plugins.developServer.listen({ "PORT": getConfigPort(), "path": pkg.main });

	gulp.watch(paths.lint, function () {
		gulp.start("lint", function () {
			plugins.developServer.restart();
		});
	});

	gulp.watch(getViewFolders(), function () {
		plugins.developServer.restart();
	});
});