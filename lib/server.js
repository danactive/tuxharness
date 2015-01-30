/*global process, require*/
(function () {
    var app,
        dust = require('express-dustjs'),
        express = require('express'),
        path = require("path"),
        recipeFilename = process && process.argv && process.argv.length >=3 && process.argv[2],
        recipe,
        server,
        serverPort = 3000;
    app = express();
    recipe = (recipeFilename === undefined) ? {} : require(path.join("../../../", recipeFilename));

    app.engine('dust', dust.engine({
        useHelpers: true
    }));
    app.set('view engine', 'dust');
    app.set('views', recipe.register.view[recipe.hello.view.engine].path);

    app.get('/', function (req, res) {
        res.send(JSON.stringify(recipe));
    });

    app.get('/dust', function (req, res) {
        res.render(recipe.hello.view.path, recipe.hello.data);
    });

    server = app.listen(serverPort, function () {
        var host = server.address().address,
            port = server.address().port;

        console.log('tuxharness app running at http://%s:%s', host, port);
    });
})();
