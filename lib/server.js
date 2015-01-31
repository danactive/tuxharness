/*global process, require*/
(function () {
    'use strict';
    var app,
        dust = require('express-dustjs'),
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
        switch(key) {
            case "dust":
                app.engine('dust', dust.engine({
                    useHelpers: true
                }));
                app.set('view engine', template.dust);
                break;
            case "jade":
                app.engine('jade', template.jade);
                app.set('view engine', 'jade');
                break;
        };
        viewPaths.push(recipe.register.view[key].path);
    });
    app.set('views', viewPaths);

    app.get('/', function (req, res) {
        res.send(recipe);
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
