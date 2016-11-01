/*global Object */

var gulp = require('gulp'),
	notifier = require('node-notifier'),
	paths = {
		"lint": [".jshintrc", "package.json", "gulpfile.js", "index.js", "test/**/*.js"],
		"test": ["test/unit_tests.js"]
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
			notifier.notify({
				'title': 'tuxharness server',
				'message': 'Restarted'
			});
		});
	});

	return gulp.watch(getViewFolders(), function () {
		plugins.developServer.restart();
		notifier.notify({
			'title': 'tuxharness server',
			'message': 'Restarted'
		});
	});
});

gulp.task('test', function() {
	return gulp.src(paths.test)
		.pipe(plugins.expectFile(paths.test))
		.pipe(plugins.mocha({reporter: 'nyan'}));
});

gulp.task('testcoverage', ['lint'], function(cb) {
	gulp.src(pkg.main)
		.pipe(plugins.expectFile(pkg.main))
		.pipe(plugins.istanbul()) // Covering files
		.pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
		.on('finish', function () {
			gulp.src(paths.test)
				.pipe(plugins.expectFile(paths.test))
				.pipe(plugins.mocha({reporter: 'nyan'}))
				.pipe(plugins.istanbul.writeReports({
					dir: './temp/coverage',
					reportOpts: { dir: './temp/coverage' }
				})) // Creating the reports after tests runned
				.on('end', cb);
		});
});
