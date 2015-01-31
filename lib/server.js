/*global process, require*/
(function () {
    'use strict';
    var app,
        express = require('express'),
        path = require("path"),
        recipeFilename = process && process.argv && process.argv.length >=3 && process.argv[2],
        recipe,
        server,
        serverPort = 3000,
        template = require('consolidate'),
        viewPaths = [];
    app = express();
    recipe = (recipeFilename === undefined) ? {} : require(recipeFilename);

    Object.keys(recipe.register.view).forEach(function (key) {
        app.engine(key, template[key]);
        app.set('view engine', key);
        viewPaths.push(recipe.register.view[key].path);
    });
    app.set('views', viewPaths);


    // Home
    app.get('/', function (req, res) {
        res.render("home.jade", recipe);
    });

    recipe.harnesses.forEach(function (harness) {
        app.get('/' + harness.route, function (req, res) {
            res.render(harness.view.path, harness.data);
        });
    });

    server = app.listen(serverPort, function () {
        var host = server.address().address,
            port = server.address().port;

        console.log('tuxharness app running at http://%s:%s', host, port);
    });
})();
