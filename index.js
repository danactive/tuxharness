/*global require*/
(function () {
    'use strict';
    var app,
        appRoot = require('app-root-path'),
        express = require('express'),
        path = require("path");

    function init() {
        var missingRecipe = "Missing recipe filename or incorrect path. Definition must be package.json tuxharness key",
            packagePath = path.join(appRoot.path, 'package.json'),
            pkg,
            recipe,
            recipePath,
            server,
            serverPort;
        app = express();

        // load files
        try {
            recipe = require(path.join(appRoot.path, "tuxfile.js"));
        } catch (e) {
            try {
                pkg = require(packagePath);
            } catch (e) {
                throw new ReferenceError("Missing package.json in your project root: " + packagePath);
            }
            if (pkg.tuxharness === undefined) {
                throw new ReferenceError(missingRecipe);
            }
            recipePath = path.join(appRoot.path, pkg.tuxharness);
            try {
                recipe = require(recipePath);
            } catch (e) {
                throw new ReferenceError(missingRecipe + ": " + recipePath);
            }
        }

        serverPort = recipe.register && recipe.register.port || 4000;
        if (recipe.harnesses) {
            recipe.formattedHarnesses = formatHarnesses(recipe.harnesses);
        }
        if (recipe.register && recipe.register.view) {
            setViewEngine(recipe.register.view);
        }
        if (recipe.register && recipe.register.static) {
            setStaticRoute(recipe.register.static);
        }
        if (recipe.formattedHarnesses) {
            setExpressRoutes(recipe.formattedHarnesses);
        }
        setHomeRoute(recipe);
        setCatchAllRoute(recipe);

        // start server
        server = app.listen(serverPort, function () {
            var host = server.address().address,
                port = server.address().port;
            host = (host === "0.0.0.0" || host === "::") ? "localhost" : host;

            console.log('tuxharness app running at http://%s:%s', host, port);
        });
    }
    function getHomeHtml(model) {
        var html = [];

        html.push("<html><head><title>tuxharness - harness routes</title><style>.error{color: red;}</style></head><body>");

        if (model.msg) {
            html.push('<p class="error">' + model.msg + '</p>');
        }

        if (model.harnesses) {
            html.push("<h2>Your Routes</h2>");
            model.formattedHarnesses.forEach(function (harness) {
                html.push("<ul>");
                html.push("<li>Route ", (harness.home.disableRouteLink) ? harness.link : (' <a href="' + harness.link + '">' + harness.link + "</a>"), "</li>");
                html.push("<li>View ", harness.home.view + "</li>");
                html.push("<li>Data ", harness.home.datum, (harness.home.missingData) ? "" : (' <a href="' + harness.json.route + '">Examine JSON</a>'), "</li>");
                html.push("</ul>");
            });
        } else {
            html.push('<p class="error">Missing your harness routes.</p>');
        }

        if (model.register && model.register.static) {
            html.push("<h2>Static Route</h2>");
            html.push("<ul>");
            html.push('<li><a href="', model.register.static.route, '">', model.register.static.route, '</a> points to ', model.register.static.directory, '</li>');
            html.push("</ul>");
        }
        html.push("<h2>Debug</h2>");
        html.push("<ul>");
        html.push('<li><a href="/tuxharness-debug-recipe">/tuxharness-debug-recipe</a></li>');
        html.push("</ul>");
        html.push("</body></html>");
        return html.join("");
    }
    function getJsonViaString(url, cb) {
        var httpRequest,
            isSSL = (url.substring(0, 5) === "https");
        httpRequest = (isSSL) ? require('https') : require('http');
        httpRequest.get(url, function(response) {
            var body = '';

            // explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
            response.setEncoding('utf8');

            if (response.statusCode === 200) {
                // Continuously update stream with data
                response.on('data', function(data) {
                    body += data;
                });
                response.on('end', function() {
                    try {
                        cb(null, JSON.parse(body));
                    } catch (e) {
                        cb(new TypeError("Service call failed, unable to parse response as JSON: " + e.message));
                    }
                });
            } else {
                cb(new URIError("Service call failed with HTTP status code: " + response.statusCode));
            }
        }).on('error', function(e) {
            cb(new URIError("Service call failed due to error:" + e.message));
        });
    }
    function setViewEngine(viewRule) {
        var template = require('consolidate'),
            viewPaths = [];
        // register view engines based on recipe to express
        Object.keys(viewRule).forEach(function (key) {
            app.engine(key, template[key]);
            app.set('view engine', key);
            viewPaths.push(viewRule[key].path);
        });
        app.set('views', viewPaths);
    }
    function setHomeRoute(_recipe) {
        var dataLength = 300;
        if (_recipe.formattedHarnesses) {
            _recipe.formattedHarnesses.forEach(function (harness) {
                var datum;
                harness.home = {};
                if (harness.datumType === "function") {
                    datum = "Service call function";
                } else if (harness.datumType === "object") {
                    datum = JSON.stringify(harness.data);
                    datum = (datum.length > dataLength) ? datum.substring(0,dataLength) + "..." : datum;
                } else if (harness.data === undefined) {
                    datum = "N/A";
                    harness.home.missingData = true;
                } else {
                    datum = harness.data;
                }
                harness.home.datum = datum;

                if (harness.route === undefined) {
                    harness.home.disableRouteLink = true;
                    harness.home.missingData = true;
                }

                if (harness.view === undefined) {
                    harness.home.view = "N/A";
                    harness.home.disableRouteLink = true;
                } else {
                    harness.home.view = harness.view;
                }
            });
        }
        // express
        app.get('/', function (req, res) {
            if (req.query && req.query.msg) {
                _recipe.msg = req.query.msg;
            }
            res.send(getHomeHtml(_recipe));
        });
    }
    function setStaticRoute(staticRule) {
        var listDirectory = require('serve-index'),
            staticPath;
        staticPath = path.join(appRoot.path, staticRule.directory);

        app.use('/' + staticRule.route, express.static(staticPath)); // view document
        app.use('/' + staticRule.route, listDirectory(staticPath, {'icons': true})); // serve directory listing
    }
    function formatHarnesses(harnesses) {
        return harnesses.map(function (harness) {
            var out = {};
            if (harness.route === undefined) {
                return;
            }
            out.stem = harness.route.split(/[\?\#]/)[0]; // left of hash or query string
            out.route = "/" + out.stem;
            out.link = "/" + harness.route;
            out.data = harness.data;
            out.datumType = typeof harness.data;
            out.view = harness.view && harness.view.path;

            out.json = {
                "data": harness.data || {"Route is missing data": "N/A"}
            };
            out.json.datumType = typeof out.json.data;
            out.json.route = out.route + "/json";

            return out;
        });
    }
    function setCatchAllRoute(_recipe) {
        // express
        app.use("/tuxharness-debug-recipe", function(req, res) {
            res.send(_recipe);
        });

        app.use("/*", function(req, res) {
            var msg = "Route not defined: " + req.baseUrl;
            res.redirect(302, "/?msg=" + encodeURIComponent(msg));
        });
    }
    function setExpressRoutes(harnesses) {
        harnesses.forEach(function (harness) {
            // page route
            app.get(harness.route, function (req, res) {
                if (harness.data === undefined) {
                    res.render(harness.view);
                } else if (harness.datumType === "string") {
                    getJsonViaString(harness.data, function (err, result) {
                        if (err) {
                            res.status(500).send({"error": err});
                        } else {
                            res.render(harness.view, result);
                        }
                    });
                } else if (harness.datumType === "function") {
                    harness.data(function (result) {
                        res.render(harness.view, result);
                    });
                } else if (harness.datumType === "object") {
                    res.render(harness.view, harness.data);
                } else {
                    res.status(500).send({"error": "View template data is an odd format"});
                }
            });

            // json route
            app.get(harness.json.route, function (req, res) {
                if (harness.json.datumType === "string") {
                    getJsonViaString(harness.json.data, function (err, result) {
                        if (err) {
                            res.status(500).json({"error": err});
                        } else {
                            res.json(result);
                        }
                    });
                } else if (harness.json.datumType === "function") {
                    harness.json.data(function (result) {
                        res.json(result);
                    });
                } else {
                    res.json(harness.json.data);
                }
            });
        });
    }

    init();
})();
