/*global module, require*/
var server,
	getServerAddress = function () {
		var host = server.address().address,
			port = server.address().port;
		return "http://" + ((host === "0.0.0.0" || host === "::") ? "localhost" : host) + ":" + port;
	},
	Harness = function Harness(definition) {
		definition = definition || {};
		this.route = definition.route || null;
		this.data = definition.data || null;
		this.view = definition.view || null;
	};
Harness.prototype.isHomeRouteLinkable = function () {
	return !(this.route === null || this.view === null);
};
Harness.prototype.getHomeRoute = function () {
	return (this.route === null) ? "N/A" : "/"+this.route;
};
Harness.prototype.getHomeView = function () {
	return (this.view === null) ? "N/A" : this.view; 
};
Harness.prototype.isHomeDatumLinkable = function () {
	return !(this.route === null || this.data === null);
};
Harness.prototype.getHomeDatum = function () {
	var datum = null,
		dataLength = 300;
	switch (typeof this.data) {
		case "string":
			return this.data;
		case "function":
			return "Service call function";
		default:
			if (this.data === null) {
				return "N/A";
			}
			datum = JSON.stringify(this.data);
			return (datum.length > dataLength) ? datum.substring(0,dataLength) + "..." : datum;
	}
};
Harness.prototype.getRoute = function () {
	return (typeof this.route === "string") ? "/"+this.route.split(/[\?\#]/)[0] : null; // left of hash or query string
};
Harness.prototype.getJsonRoute = function () {
	return (this.getRoute() === null) ? null : this.getRoute() + "/json";
};
Harness.prototype.getJsonDatum = function () {
	return this.data || {"Route is missing data": "N/A"};
};

(function () {
	'use strict';
	var app,
		appRoot = require('app-root-path'),
		express = require('express'),
		harnesses = [],
		path = require("path");

	function init() {
		var recipe,
			serverPort;
		app = express();

		// load files
		try {
			recipe = require(path.join(appRoot.path, "tuxfile.js"));
		} catch (e) {
			throw new ReferenceError("Missing tuxfile.js recipe.");
		}

		serverPort = recipe.register && recipe.register.port || 4000;
		if (recipe.harnesses) {
			harnesses = recipe.harnesses.map(function (harness) {
				return new Harness(harness);
			});

			setExpressRoutes(harnesses);
		}
		if (recipe.register && recipe.register.view) {
			setViewEngine(recipe.register.view);
		}
		if (recipe.register && recipe.register.static) {
			setStaticRoute(recipe.register.static);
		}
		setHomeRoute(recipe);
		setCatchAllRoute(recipe);

		// start server
		server = app.listen(serverPort, function () {
			console.log('tuxharness app running at %s', getServerAddress());
		});
	}
	function getHomeHtml(model) {
		var html = [];

		html.push("<html><head><title>tuxharness - harness routes</title><style>.error{color: red;}</style></head><body>");

		if (model.msg) {
			html.push('<p class="error">', model.msg, '</p>');
		}

		if (harnesses.length > 0) {
			html.push("<h2>Your Routes</h2>");
			Array.prototype.push.apply(html, harnesses.map(function (harness) {
				var datum = harness.getHomeDatum(),
					datumHtml = datum+" "+ ((harness.isHomeDatumLinkable()) ? '<a href="'+harness.getJsonRoute()+'">Examine JSON</a>' : ""),
					route = harness.getHomeRoute(),
					routeHtml = (harness.isHomeRouteLinkable()) ? '<a href="'+route+'">'+route+'</a>' : route;
				return "<ul><li>Route "+routeHtml+"</li><li>View "+harness.getHomeView()+"</li><li>Data "+datumHtml+"</li></ul>";
			}));
		} else {
			html.push('<p class="error">Missing your harness routes.</p>');
		}

		if (model.register && model.register.static) {
			html.push("<h2>Static Route</h2>");
			html.push("<ul>");
			html.push('<li><a href="', model.register.static.route, '">', model.register.static.route, '</a> route points to ', model.register.static.directory, ' file folder.</li>');
			html.push("</ul>");
		}
		html.push("<h2>Recipe</h2>");
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
		var template = require('consolidate');
		// register view engines based on recipe to express
		viewRule.engines.forEach(function (key) {
			app.engine(key, template[key]);
			app.set('view engine', key);
		});
		app.set('views', viewRule.path);
	}
	function setHomeRoute(_recipe) {
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
		var util = {
				"getIpsumText": function (options) {
					var defaultOptions = {
							count: 5,                        // Number of words, sentences, or paragraphs to generate.
							units: 'paragraphs',            // Generate words, sentences, or paragraphs.
							sentenceLowerBound: 5,         // Minimum words per sentence.
							sentenceUpperBound: 15,        // Maximum words per sentence.
							paragraphLowerBound: 3,        // Minimum sentences per paragraph.
							paragraphUpperBound: 7,        // Maximum sentences per paragraph.
							format: 'html',
							random: Math.random           // A PRNG function. Uses Math.random by default
						},
						extend = require("xtend"),
						ipsum = require('lorem-ipsum'),
						output;

					options = extend(defaultOptions, options);
					output = ipsum(options);
					return output;
				},
				"getJsonRoute": function (route) {
					if (route === undefined) {
						throw ReferenceError("Missing route parameter");
					}
					return getServerAddress() + "/" + route + "/json";
				}
			};
		harnesses.forEach(function (harness) {
			// HTML route
			app.get(harness.getRoute(), function (req, res) {
				if (harness.data === null && harness.view === null) {
					res.status(404).send({"error": "The tuxharness recipe for " + harness.route + " needs either a view or data defined."});
				} else if (harness.view === null) {
					res.redirect(harness.json.route);
				} else if (harness.data === null) {
					res.render(harness.view);
				} else {
					switch (typeof harness.data) {
						case "string":
							getJsonViaString(harness.data, function (err, result) {
								if (err) {
									res.status(500).send({"error": err});
								} else {
									res.render(harness.view, result);
								}
							});
							break;
						case "function":
							harness.data(function (result) {
								res.render(harness.view, result);
							}, util);
							break;
						case "object":
							res.render(harness.view, harness.data);
							break;
						default:
							res.status(500).send({"error": "View template data is an odd format"});
							break;
					}
				}
			});
			// json route
			app.get(harness.getJsonRoute(), function (req, res) {
				switch (typeof harness.getJsonDatum()) {
					case "string":
						getJsonViaString(harness.getJsonDatum(), function (err, result) {
							if (err) {
								res.status(500).json({"error": err});
							} else {
								res.json(result);
							}
						});
						break;
					case "function":
						harness.getJsonDatum()(function (result) {
							res.json(result);
						}, util);
						break;
					default:
						res.json(harness.getJsonDatum());
						break;
				}
			});
		});
	}

	init();
})();

module.exports = Harness;
