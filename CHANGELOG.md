#Changelog
## v2.0.5 2016-Dec-15
* Lint
	* Lint and tests pass
	* Convert peerDependency to devDependency

## v2.0.4 2016-Nov-05
* Engine
	* Support all Node.js platform engines 
	
## v2.0.3 2016-Nov-01
* Dependencies
	* Add greenkeeper for dependency management

## v2.0.2 2015-Jun-19
* Dependencies
	* Update *gulp-expect-file* to v0.0.7
	* Update *gulp-istanbul-file* to v0.10

## v2.0.1 2015-Jun-02
* Dependencies
	* Update *gulp* to v3.9

## v2.0.0 2015-May-30
* Breaking change
	* `tuxfile.js`
		* Register view engine structure changed. For example `"view":{"engines":["dust","jade"],"path":"test/views"}`
		* Set harness route view changed to `"view": "hello.dust"`
	* Removed tuxharness property from `package.json`
* Bug
	* Killed [bug #2](issues/2)
* Data
	* Add Lorem Ipsum generator as util.getIpsumText
* Dependencies
	* Update *consolidate* to v0.13
	* Update *gulp-istanbul* to v0.9
	* Update *jshint-stylish* to v2.0

## v1.7.1 2015-Apr-18
* Installation
	* Easy tuxfile copy command

## v1.7.0 2015-Apr-11
* Refactor
	* Use prototype rather than formatted JSON
	* Add 50% unit test coverage
* Dependencies
	* Update *consolidate*
	* Update *gulp-jshint*
	* Update *gulp-load-plugins*

## v1.6.3 2015-Mar-28
* Data
	* Add util.getJsonRoute when data is a function

## v1.6.2 2015-Mar-28
* Bug
	* Fix when viewing a route without a view defined

## v1.6.1 2015-Mar-27
* Setup
	* tuxfile.js is default recipe filename
* Dependencies
	* Update *gulp-load-plugins* to v0.9
	* Update *request* to v2.54

## v1.5.2 2015-Mar-17
* Dependency
	* Update *serve-index* to v1.6.3 to avoid XSS security advisory

## v1.5.1 2015-Mar-08
* Dependencies
	* Update *dustjs-linkedin* to v2.6
	* Update *gulp-develop-server* to v0.4
* Bug
	* [Bug #2](issues/2) added

## v1.5.0 2015-Feb-27
* Support SSL for HTTPS requests
* Using npm ignore to hide dev files

## v1.4.2 2015-Feb-24
* Engine
	* Verified on iojs v1.3.0

## v1.4.1 2015-Feb-24
* Dependencies
	* Update *express* to v4.12
	* Update *gulp-develop-server* to v0.3

## v1.4.0 2015-Feb-22
* Dependency
	* Drop *request* as dependency, use built-in http module
		* Reason: request footprint is 2.6Mb and currently fails on node.js v0.12
* Home
	* Drop dust view engine dependency for home page
	* Redirect missing routes to home with error message
* Debug
	* Add new route for debugging recipe `tuxharness-debug-recipe`

## v1.3.1 2015-Feb-17
* Dependency
	* Update *consolidate.js* to v0.11

## v1.3.0 2015-Feb-17
* Data
	* JSON route changed from json?route=route to route/json

## v1.2.0 2015-Feb-17
* Static
	* Route and directory allow more flexibility

## v1.1.1 2015-Feb-15
* Home
	* Use route stem
* Route supports query string and hash

## v1.1.0 2015-Feb-10
* Home
	* Examine JSON
		* via data functions
		* via data string
		* via data require
		* via data embedding
	* Truncate long JSON
* Add changelog	

## v1.0.1 2015-Feb-06
* Readme improved
* Port default is `3000`

## v1.0.0 2015-Feb-05
* Initial release
