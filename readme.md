# Test User eXperience Harness

## Config structure as JavaScript
### Register
* `static` serve static assets (img, js, css, fonts...)
	* `route` is a virtual web path
	* `directory` is the physical path where the static assets are hosted
* `view`
	* template view engine name as defined in npm
		* `path` is the physical path to the views folder - relative from your project root

### Harness (*array*)
* `route` is a virtual web path
* `view` (*object*)
	* `path` is the physical path where the view is hosted - relative to your view folder
* `data` (*object*) - passed into the view for transformation
* `data` (*function*) - callback argument will async call to gather data passed into the view for transformation

## Template View Engines
1. dust.js (sample in test folder) 
1. Jade (sample in test folder) 
1. Many others supported by [Consolidate.js](https://github.com/tj/consolidate.js)
	1. install in additional engines in your project
	1. register your view engine in your project's JSON file

## Roadmap
1. Lint