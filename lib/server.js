/*global process, require*/
(function () {
    'use strict';
    var app,
        express = require('express'),
        path = require("path"),
        recipe,
        recipeFilename = process && process.argv && process.argv.length >=3 && process.argv[2],
        server,
        serverPort = 3000,
        listDirectory = require('serve-index'),
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
    app.use(express.static(path.join(__dirname, '../', recipe.register.static.directory))); // read file content /tux_static/js/sample.js
    app.use('/' + recipe.register.static.route, listDirectory(recipe.register.static.directory + '/' + recipe.register.static.route, {'icons': true})); // serve directory listing

    // home route
    app.get('/', function (req, res) {
        res.render(path.join(__dirname, "../test/views/dust/home.dust"), recipe);
    });

    // define routes based on recipe
    recipe.harnesses.forEach(function (harness) {
        app.get('/' + harness.route, function (req, res) {
            res.render(harness.view.path, harness.data);
        });
    });
    
    // start server
    server = app.listen(serverPort, function () {
        var host = server.address().address,
            port = server.address().port;

        console.log('tuxharness app running at http://%s:%s', host, port);
    });
})();
