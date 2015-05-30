var streetAddress = {
		"address": {
			"street": "123 Main St",
			"city": "Vancouver",
			"province": "BC"
		}
	};
module.exports = {
	"register": {
		"port": 3000,
		"static": {
			"route": "static",
			"directory": "test/static"
		},
		"view": {
			"engines": ["dust", "jade"],
			"path": "test/views"
		}
	},
	"harnesses": [
		{
			"route": "html",
			"view": "html.dust"
		},
		{
			"route": "helloDust",
			"data": streetAddress,
			"view": "hello.dust"
		},
		{
			"route": "helloJade",
			"data": {
				"title": "Jade title",
				"message": "Jade view engine"
			},
			"view": "hello.jade"
		},
		{
			"route": "facebookFunction",
			"data": function (cb) {
				try {
					var request = require('request');
					request('http://graph.facebook.com/github', {"json": true}, function (error, response, body) {
						if (!error && response.statusCode === 200) {
							cb(body); // return JSON to view after async call via callback
						} else {
							throw new ReferenceError("Cannot connect to Facebook due to error: " + error);
						}
					});
				} catch (e) {
					cb(e);
				}
			},
			"view": "api.dust"
		},
		{
			"route": "facebookString",
			"data": 'http://graph.facebook.com/github',
			"view": "api.dust"
		},
		{
			"route": "facebookStringSSL",
			"data": 'https://graph.facebook.com/github',
			"view": "api.dust"
		},
		{
			"route": "largeJson",
			"data": require(__dirname + "/data/canadian-sales-tax.json"),
			"view": "salesTax.jade"
		},
		{
			"route": "rawLargeJson",
			"data": require(__dirname + "/data/canadian-sales-tax.json")
		},
		{
			"route": "routeQuery?city=Vancouver",
			"view": "html.dust",
			"data": streetAddress
		},
		{
			"route": "routeHash#anchor",
			"view": "html.dust",
			"data": streetAddress
		},
		{
			"route": "utilGetJsonRoute",
			"data": function (cb, util) {
				cb(util.getJsonRoute("largeJson"));
			}
		},
		{
			"route": "ipsum",
			"view": "ipsum.dust",
			"data": function (cb, util) {
				cb({"ipsum": util.getIpsumText()});
			}
		}
	]
};
