module.exports = {
    "register": {
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
            "route": "facebook",
            "data": function (cb) {
                var request = require('request');
                request('http://graph.facebook.com/github', function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    cb({"body": body}); // Show the HTML for the Google homepage. 
                  }
                });
            },
            "view": {
                "path": "api.dust"
            }
        }
    ]
};