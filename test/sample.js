module.exports = {
    "register": {
        "port": 4000,
        "static": {
            "route": "static",
            "directory": "test"
        },
        "view": {
            "dust": {
                "path": "test/views/dust"
            },
            "jade": {
                "path": "test/views/jade"
            }
        }
    },
    "harnesses": [
        {
            "route": "html",
            "view": {
                "path": "html.dust"
            }
        },
        {
            "route": "helloDust",
            "data": {
                "address": {
                    "street": "123 Main St",
                    "city": "Vancouver"
                }
            },
            "view": {
                "path": "hello.dust"
            }
        },
        {
            "route": "helloJade",
            "data": {
                "title": "Jade title",
                "message": "Jade view engine"
            },
            "view": {
                "path": "hello.jade"
            }
        },
        {
            "route": "facebookFunction",
            "data": function (cb) {
                var request = require('request');
                request('http://graph.facebook.com/github', {"json": true}, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        cb(body); // return JSON to view after async call via callback
                    } else {
                        throw new ReferenceError("Cannot connect to Facebook due to error: " + error);
                    }
                });
            },
            "view": {
                "path": "api.dust"
            }
        },
        {
            "route": "facebookString",
            "data": 'http://graph.facebook.com/github',
            "view": {
                "path": "api.dust"
            }
        }
    ]
};