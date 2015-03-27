module.exports = {
	"register": {
		"static": {
			"route": "static",
			"directory": "public"
		},
		"view": {
			"dust": {
				"path": "views"
			}
		}
	},
	"harnesses": [
		{
			"route": "hello",
			"data": {
				"message": "Hello Fruits",
				"fruits": ["Apple", "Banana", "Cherry", "Durrian"]
			}
		},
		{
			"route": "facebook",
			"data": "http://graph.facebook.com/github"
		}
	]
};