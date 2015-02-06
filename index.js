/*global require*/
(function () {
    'use strict';
    var app,
        appRoot = require('app-root-path'),
        express = require('express'),
        path = require("path"),
        pkg,
        recipe,
        recipeFilename,
        setHomeRoute,
        setPageRoute,
        setStaticRoute,
        setViewEngine,
        server,
        serverPort;
    app = express();
    pkg = require(path.join(appRoot.path, 'package.json'));
    recipeFilename = pkg.tuxharness;
    if (recipeFilename === undefined) {
        throw new ReferenceError("Missing recipe filename or incorrect path. Definition must be package.json tuxharness key.");
    }
    recipe = require(path.join(appRoot.path, recipeFilename));
    serverPort = recipe.register.port || 4000;

    setViewEngine = function (viewRule) {
        var template = require('consolidate'),
            viewPaths = [];
        // register view engines based on recipe to express
        Object.keys(viewRule).forEach(function (key) {
            app.engine(key, template[key]);
            app.set('view engine', key);
            viewPaths.push(viewRule[key].path);
        });
        app.set('views', viewPaths);
    };
    setHomeRoute = function (out) {
        var dataLength = 300;
        out.harnesses.forEach(function (harness) {
            var datum;
            if (typeof harness.data === "function") {
                datum = "Service call function";
            } else if (typeof harness.data === "object") {
                datum = JSON.stringify(harness.data);
                datum = (datum.length > dataLength) ? datum.substring(0,dataLength) + "..." : datum;
            } else if (harness.data === undefined) {
                datum = "N/A";
            } else {
                datum = harness.data;
            }
            harness.datum = datum;

            if (harness.view === undefined) {
                harness.view = {};
                harness.view.path = "N/A";
            }
        });
        // express
        app.get('/', function (req, res) {
            res.render(path.join(__dirname, "test/views/dust/home.dust"), out);
        });
    };
    setStaticRoute = function (staticRule) {
        var directory = staticRule.directory,
            fs,
            listDirectory = require('serve-index'),
            routeNames = [],
            routePaths = [],
            staticPath;
        staticPath = path.join(appRoot.path, directory);
        if (staticRule.route === "/") {
            fs = require('fs');

            fs.exists(staticPath, function (exists) {
                if (!exists) {
                    throw new ReferenceError("Static path cannot be found: " + staticPath);
                }
                fs.readdir(staticPath, function (err, filenames) {
                    var hasError = (err || filenames === undefined || filenames.length === 0);
                    if (hasError) {
                        throw new ReferenceError("Static path cannot be read: " + staticPath);
                    }
                    filenames.forEach(function (filename) {
                        routeNames.push(filename);
                        routePaths.push(path.join(appRoot.path, directory, filename));
                    });
                });
            });
        } else {
            directory = path.join(staticRule.directory, "/", staticRule.route);
            routeNames = [staticRule.route];
            routePaths = [path.join(appRoot.path, directory)];
        }
        recipe.register.static.directory = directory;
        recipe.register.static.route = routeNames;
        // express
        app.use(express.static(staticPath));
        for (var i = 0, len = routeNames.length; i < len; i++) {
            app.use('/' + routeNames[i], listDirectory(routePaths[i], {'icons': true})); // serve directory listing
        }
    };
    setPageRoute = function (harnessRule) {
        var request = require('request'),
            setRoute = function (arg) {
                // express
                app.get('/' + arg.route, function (req, res) {
                    res.render(arg.view, arg.data);
                });
            };
        harnessRule.forEach(function (harness) {
            var out = {
                    data: {},
                    route: harness.route,
                    view: ""
                };
            if (out.route === undefined) {
                throw new ReferenceError("Route is missing and required.");
            }
            if (harness.data === undefined) {
                out.view = harness.view && harness.view.path;
                setRoute(out);
            } else if (typeof harness.data === "string") {
                request(harness.data, {"json": true}, function (error, response, body) {
                    if (error || response.statusCode !== 200) {
                        throw new ReferenceError("Service call failed with HTTP status code " + response.statusCode + " due to error:" + error);
                    } else {
                        out.view = harness.view && harness.view.path;
                        out.data = body;
                        setRoute(out);
                    }
                });
            } else if (typeof harness.data === "function") {
                harness.data(function (result) {
                    out.view = harness.view && harness.view.path;
                    out.data = result;
                    setRoute(out);
                });
            } else if (typeof harness.data === "object") {
                out.view = harness.view && harness.view.path;
                out.data = harness.data;
                setRoute(out);
            } else {
                throw new ReferenceError("View template data is an odd format");
            }
        });
    };

    if (recipe.register && recipe.register.view) {
        setViewEngine(recipe.register.view);
    }
    if (recipe.register && recipe.register.static) {
        setStaticRoute(recipe.register.static);
    }
    setHomeRoute(recipe);
    setPageRoute(recipe.harnesses);

    // start server
    server = app.listen(serverPort, function () {
        var host = server.address().address,
            port = server.address().port;
        host = (host === "0.0.0.0") ? "localhost" : host;

        console.log('tuxharness app running at http://%s:%s', host, port);
    });
})();
