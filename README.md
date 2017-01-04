# Test User eXperience Harness
Build a stand-alone test harness with dynamic data to quickly prototype and isolate your HTML/CSS or examine your JSON document.

[![npm version](https://badge.fury.io/js/tuxharness.svg)](http://badge.fury.io/js/tuxharness)
[![Dependencies Status](https://david-dm.org/danactive/tuxharness.svg)](https://david-dm.org/danactive/tuxharness)
[![DevDependencies Status](https://david-dm.org/danactive/tuxharness/dev-status.svg)](https://david-dm.org/danactive/tuxharness#info=devDependencies)
[![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Table of contents
1. [Installation steps to setup and configure](#installation-steps-to-setup-and-configure)
1. [Recipe details](#recipe-details)
2. [Register](#register)
2. [Harness (*array*)](#harness)
1. [Template View Engines](#template-view-engines)
1. [Commands](#commands)
1. [JSON browser extentions](#json-browser-extentions)
1. [Roadmap](#roadmap)

## <a name="installation-steps-to-setup-and-configure"></a> Installation steps to setup and configure
1. Install with [npm](https://www.npmjs.com/):`npm install tuxharness --save-dev`
1. Define a **recipe** file -- similar to *Gruntfile.js* or *gulpfile.js*
	* Mac/Unix copy file `cp -nv "node_modules/tuxharness/tuxfile.js" "tuxfile.js"`
	* Windows copy file `copy "node_modules/tuxharness/tuxfile.js" "tuxfile.js"`
	* More example recipes [starter sample tuxharness recipe](test/starter.js) or [full sample](test/sample.js)
1. Run the harness server
	* `node ./node_modules/tuxharness/index.js`
	* or add a *script* reference to your package.json like `"harness": "node ./node_modules/tuxharness/index.js"` then execute with `npm run harness`

## <a name="recipe-details"></a> Recipe details
### <a name="register"></a> Register
* `port` localhost server port number (default is *4000*)
* `static` serve static assets (img, js, css, fonts...)
	* `route` is a virtual web path - served by express.js
	* `directory` is the physical path where the static assets are hosted
* `view`
	* `engines` array of template view engine name as defined in *npm*
	* `path` is the physical path to the views folder - relative from your project root

### <a name="harness"></a> Harness (*array*)
* `route` is a virtual web path - served by express.js
* `view` is the physical path where the view is hosted - relative to your view folder
* `data` (*object*) - passed into the view for transformation
* `data` (*string*) - service call to request JSON data
* `data` (*function(**callback**, **util**)*) - callback argument will async call to gather data passed into the view for transformation
	* *callback* type string/JSON: print to browser
	* *util* type object
		* *getIpsumText* Lorum Ipsum generator
		* *getJsonRoute* type function(string route): wraps route name with localhost IP address with port and JSON path

## <a name="template-view-engines"></a> Template View Engines
1. [dust.js](https://github.com/linkedin/dustjs) (sample in test folder) 
	* `npm install dustjs-linkedin --save`
1. [Jade](https://github.com/jadejs/jade) (sample in test folder) 
	* `npm install jade --save`
1. Many others supported by [Consolidate.js](https://github.com/tj/consolidate.js)
	1. install any additional engines in your project
	1. register your view engine in your project's JS file

## <a name="commands"></a> Commands
* `npm run harness` Single run server to serve the test harness environment
* `npm run dev` Respawn-on-save server to serve the test harness environment
* `npm run lint` Lint JS files
* `npm test` Unit test and coverage

## <a name="json-browser-extentions"></a> JSON browser extentions
* Firefox [JSONView](https://addons.mozilla.org/en-US/firefox/addon/jsonview/)
* Chrome [JSONView](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc)
* Safari [safari-json-formatter](https://github.com/rfletcher/safari-json-formatter)

## <a name="roadmap"></a> Roadmap
1. Allow remote recipes
	* Views and data too
1. Host demo
