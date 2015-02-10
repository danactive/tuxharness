/*global require*/
(function () {
    'use strict';
    var app,
        appRoot = require('app-root-path'),
        express = require('express'),
        getJsonViaString,
        path = require("path"),
        pkg,
        recipe,
        recipeFilename,
        setHomeRoute,
        setJsonRoute,
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

    getJsonViaString = function (url, cb) {
        var httpRequest = require('request');
        httpRequest(url, {"json": true}, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                cb(new ReferenceError("Service call failed with HTTP status code " + response.statusCode + " due to error:" + error));
            } else {
                cb(null, body);
            }
        });
    };

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
                harness.missingData = true;
            } else {
                datum = harness.data;
            }
            harness.datum = datum;

            if (harness.view === undefined) {
                harness.view = {};
                harness.view.path = "N/A";
                harness.missingRoute = true;
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
        var setRoute = function (arg) {
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
                getJsonViaString(harness.data, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    out.view = harness.view && harness.view.path;
                    out.data = result;
                    setRoute(out);
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
    setJsonRoute = function (harnessRule) {
        var data = {"tuxharness": "error"},
            routeFound = false,
            query,
            url = require('url'),
            urnParts;
        // express
        app.get('/json', function (req, res) {
            urnParts = url.parse(req.url, true);
            query = urnParts.query;

            harnessRule.forEach(function (harness) {
                if (query && query.route && (harness.route === query.route)) {
                    routeFound = true;
                    if (typeof harness.data === "string") {
                        getJsonViaString(harness.data, function (err, result) {
                            if (err) {
                                res.status(500).json({"error": err});
                            }
                            res.json(result);
                        });
                    } else if (typeof harness.data === "function") {
                        harness.data(function (result) {
                            res.json(result);
                        });
                    } else {
                        data = harness.data || {"Route is missing data": "N/A"};
                        res.json(data);
                    }
                }
            });
            if (routeFound === false) {
                res.status(500).json({"error": "Route not found; Query string required `route`"});
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
    setJsonRoute(recipe.harnesses);

    // start server
    server = app.listen(serverPort, function () {
        var host = server.address().address,
            port = server.address().port;
        host = (host === "0.0.0.0") ? "localhost" : host;

        console.log('tuxharness app running at http://%s:%s', host, port);
    });
})();
