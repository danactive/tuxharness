module.exports = {
	"register": {
		"static": {
			"route": "static",
			"directory": "public"
		}
	},
	"harnesses": [
		{
			"route": "sample-route",
			"data": {
				"fruits": ["Apple", "Banana", "Cherry", "Durrian"]
			}
		}
	]
};