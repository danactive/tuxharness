# Test User eXperience Harness
Build a stand-alone test harness with dynamic data to quickly prototype and isolate your HTML/CSS or examine your JSON document.

[![npm version](https://badge.fury.io/js/tuxharness.svg)](http://badge.fury.io/js/tuxharness)
[![Dependencies Status](https://david-dm.org/danactive/tuxharness.svg)](https://david-dm.org/danactive/tuxharness)
[![DevDependencies Status](https://david-dm.org/danactive/tuxharness/dev-status.svg)](https://david-dm.org/danactive/tuxharness#info=devDependencies)
[![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Installation steps to setup and configure
1. `npm install tuxharness --save-dev`
1. Create a **recipe** config JavaScript file (similar to *Gruntfile.js* or *gulpfile.js*)
	* Any path or filename is allowed as defined in your project's *package.json*
	* The object structure must match the [recipe config structure](#recipe-config-structure) defined below
	* [Sample tuxharness recipe](test/sample.js)
1. Link your **package.json** to the **recipe** JavaScript file
	* Add a key to your project's *package.json* named `tuxharness` with a relative path value to your recipe
	* Sample syntax `"tuxharness": "./test/sample.js"` as documented in [package.json](package.json)
1. Run the harness
	* `node ./node_modules/tuxharness/index.js`
	* or add a *script* reference to your package.json like `"harness": "node ./node_modules/tuxharness/index.js"` then execute with `npm run harness`

## Recipe config structure
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
1. [dust.js](https://github.com/linkedin/dustjs) (sample in test folder) 
1. [Jade](https://github.com/jadejs/jade) (sample in test folder) 
1. Many others supported by [Consolidate.js](https://github.com/tj/consolidate.js)
	1. install any additional engines in your project
	1. register your view engine in your project's JS file

## Commands
* `npm run harness` Single run server to serve the test harness environment
* `npm run dev` Respawn-on-save server to serve the test harness environment
* `npm run lint` Lint JS files

## JSON browser extentions
* Firefox [JSONView](https://addons.mozilla.org/en-US/firefox/addon/jsonview/)
* Chrome [JSONView](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc)

## Roadmap
1. Allow remote recipes
	* Views and data too
1. Host demo
1. Unit tests