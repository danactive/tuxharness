# Test User eXperience Harness
Build a test harness with dynamic data to quickly prototype and isolate your HTML/CSS.

[![npm version](https://badge.fury.io/js/tuxharness.svg)](http://badge.fury.io/js/tuxharness)
[![Dependencies Status](https://david-dm.org/danactive/tuxharness.svg)](https://david-dm.org/danactive/tuxharness)
[![DevDependencies Status](https://david-dm.org/danactive/tuxharness/dev-status.svg)](https://david-dm.org/danactive/tuxharness#info=devDependencies)
[![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Config structure as JavaScript
Every project needs a tuxharness JavaScript config like this [sample.js](test/sample.js)

### package.json
* Your project's package.json is required to define the tuxharness' config like `"tuxharness": "./test/sample.js"` as documentent [package.json](package.json)

### Register
* `port` localhost server port number (default is *4000*)
* `static` serve static assets (img, js, css, fonts...)
	* `route` is a virtual web path - served by express.js
	* `directory` is the physical path where the static assets are hosted
* `view`
	* template view engine name as defined in *npm*
		* `path` is the physical path to the views folder - relative from your project root

### Harness (*array*)
* `route` is a virtual web path - served by express.js
* `view` (*object*)
	* `path` is the physical path where the view is hosted - relative to your view folder
* `data` (*object*) - passed into the view for transformation
* `data` (*string*) - service call to request JSON data
* `data` (*function*) - callback argument will async call to gather data passed into the view for transformation

## Template View Engines
1. dust.js (sample in test folder) 
1. Jade (sample in test folder) 
1. Many others supported by [Consolidate.js](https://github.com/tj/consolidate.js)
	1. install any additional engines in your project
	1. register your view engine in your project's JS file

## Commands
* `npm run harness` Single run server to serve the test harness environment
* `npm run dev` Respawn-on-save server to serve the test harness environment
* `npm run lint` Lint JS files