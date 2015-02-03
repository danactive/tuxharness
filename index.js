/*global process, require*/
(function () {
    'use strict';
    var app,
        appRoot,
        express = require('express'),
        fs,
        path = require("path"),
        recipe,
        recipeFilename = process && process.argv && process.argv.length >=3 && process.argv[2],
        server,
        serverPort = 3000,
        listDirectory = require('serve-index'),
        staticPath,
        template = require('consolidate'),
        viewPaths = [];
    app = express();
    if (recipeFilename === undefined) {
        throw new ReferenceError("Missing recipe filename or incorrect path");
    }
    recipe = require(recipeFilename);

    // register view engines based on recipe
    Object.keys(recipe.register.view).forEach(function (key) {
        app.engine(key, template[key]);
        app.set('view engine', key);
        viewPaths.push(recipe.register.view[key].path);
    });
    app.set('views', viewPaths);

    // static assets
    if (recipe.register.static) {
        appRoot = require('app-root-path');
        staticPath = path.join(appRoot.path, recipe.register.static.directory);
        app.use(express.static(staticPath)); // read file content /tux_static/js/sample.js
        if (recipe.register.static.route === "/") {
            fs = require('fs');

            fs.exists(staticPath, function (exists) {
                if (!exists) {
                    throw new ReferenceError("Static path cannot be found: " + staticPath);
                }
                fs.readdir(staticPath, function (err, filenames) {
                    if (err || filenames === undefined || filenames.length === 0) {
                        throw new ReferenceError("Static path cannot be read: " + staticPath);
                    }
                    recipe.register.static.route = [];
                    filenames.forEach(function (filename) {
                        recipe.register.static.route.push(filename);
                        app.use('/' + filename, listDirectory(path.join(appRoot.path, recipe.register.static.directory, filename), {'icons': true})); // serve directory listing
                    });
                });
            });
        } else {
            recipe.register.static.directory += "/" + recipe.register.static.route;
            recipe.register.static.route = [recipe.register.static.route];
            app.use('/' + recipe.register.static.route, listDirectory(path.join(appRoot.path, recipe.register.static.directory), {'icons': true})); // serve directory listing
        }
    }

    // home route
    app.get('/', function (req, res) {
        var out = JSON.parse(JSON.stringify(recipe));
        out.harnesses.forEach(function (harness) {
            if (typeof harness.data === "function") {
                harness.data = "Service call function";
            }
        });
        res.render(path.join(__dirname, "test/views/dust/home.dust"), out);
    });

    // define routes based on recipe
    recipe.harnesses.forEach(function (harness) {
        app.get('/' + harness.route, function (req, res) {
            if (harness.data === undefined) {
                res.render(harness.view.path);
            } else if (typeof harness.data === "string") {
                var request = require('request');
                request(harness.data, {"json": true}, function (error, response, body) {
                    if (error || response.statusCode !== 200) {
                        throw new ReferenceError("Service call failed with code " + response.statusCode + " due to error:" + error);
                    } else {
                        res.render(harness.view.path, body);
                    }
                });
            } else if (typeof harness.data === "function") {
                harness.data(function (out) {
                    res.render(harness.view.path, out);
                });
            } else if (typeof harness.data === "object") {
                res.render(harness.view.path, harness.data);
            }
        });
    });

    // start server
    server = app.listen(serverPort, function () {
        var host = server.address().address,
            port = server.address().port;

        console.log('tuxharness app running at http://%s:%s', host, port);
    });
})();
