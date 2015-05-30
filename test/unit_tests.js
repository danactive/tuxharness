var expect = require("expect.js"),
	Harness = require("../index.js"),
	sample = require("./sample.js");

describe('Harness', function () {
	function testHarness(args) {
		var harness = new Harness(sample.harnesses.filter(function (harness) {
			return harness.route === args.route;
		})[0]);
		expect(harness.isHomeRouteLinkable()).to.be(args.isHomeRouteLinkable);
		expect(harness.getHomeRoute()).to.be("/"+args.route);
		expect(harness.getHomeView()).to.be(args.getHomeView);
		if (args.getHomeDatum) {
			expect(harness.getHomeDatum()).to.be(args.getHomeDatum);
		}
		expect(harness.getRoute()).to.be("/"+args.getRoute);
		expect(harness.getJsonRoute()).to.be("/"+args.getJsonRoute+"/json");
		if (args.getJsonDatum) {
			expect(harness.getJsonDatum()).to.eql(args.getJsonDatum);
		}
		args.done();
	}
	it('should define a new object', function () {
		var harness = new Harness();
		expect(harness).to.have.keys("route", "data", "view");
		expect(harness.route).to.be(null);
		expect(harness.data).to.be(null);
		expect(harness.view).to.be(null);
		expect(harness.isHomeRouteLinkable()).to.be(false);
		expect(harness.getHomeRoute()).to.be("N/A");
		expect(harness.getHomeView()).to.be("N/A");
		expect(harness.isHomeDatumLinkable()).to.be(false);
		expect(harness.getHomeDatum()).to.be("N/A");
		expect(harness.getRoute()).to.be(null);
		expect(harness.getJsonRoute()).to.be(null);
		expect(harness.getJsonDatum()).to.eql({"Route is missing data": "N/A"});
	});
	it('route: html', function (done) {
		var route = "html";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "html.dust",
			"isHomeDatumLinkable": false,
			"getHomeDatum": "N/A",
			"getRoute": route,
			"getJsonRoute": route,
			"getJsonDatum": {"Route is missing data": "N/A"}
		});
	});
	it('route: helloDust', function (done) {
		var route = "helloDust";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "hello.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": '{"address":{"street":"123 Main St","city":"Vancouver","province":"BC"}}',
			"getRoute": route,
			"getJsonRoute": route,
			"getJsonDatum": {"address":{"street":"123 Main St","city":"Vancouver","province":"BC"}}
		});
	});
	it('route: helloJade', function (done) {
		var route = "helloJade";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "hello.jade",
			"isHomeDatumLinkable": true,
			"getHomeDatum": '{"title":"Jade title","message":"Jade view engine"}',
			"getRoute": route,
			"getJsonRoute": route,
			"getJsonDatum": {"title":"Jade title","message":"Jade view engine"}
		});
	});
	it('route: facebookFunction', function (done) {
		var route = "facebookFunction";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "api.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": "Service call function",
			"getRoute": route,
			"getJsonRoute": route
		});
	});
	it('route: facebookString', function (done) {
		var route = "facebookString";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "api.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": "http://graph.facebook.com/github",
			"getRoute": route,
			"getJsonRoute": route
		});
	});
	it('route: facebookStringSSL', function (done) {
		var route = "facebookStringSSL";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "api.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": "https://graph.facebook.com/github",
			"getRoute": route,
			"getJsonRoute": route
		});
	});
	it('route: largeJson', function (done) {
		var route = "largeJson";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "salesTax.jade",
			"isHomeDatumLinkable": true,
			"getRoute": route,
			"getJsonRoute": route
		});
	});
	it('route: rawLargeJson', function (done) {
		var route = "rawLargeJson";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": false,
			"getHomeView": "N/A",
			"isHomeDatumLinkable": true,
			"getRoute": route,
			"getJsonRoute": route
		});
	});
	it('route: routeQuery', function (done) {
		var route = "routeQuery";
		testHarness({
			"done": done,
			"route": route+"?city=Vancouver",
			"isHomeRouteLinkable": true,
			"getHomeView": "html.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": '{"address":{"street":"123 Main St","city":"Vancouver","province":"BC"}}',
			"getRoute": route,
			"getJsonRoute": route,
			"getJsonDatum": {"address":{"street":"123 Main St","city":"Vancouver","province":"BC"}}
		});
	});
	it('route: routeHash', function (done) {
		var route = "routeHash";
		testHarness({
			"done": done,
			"route": route+"#anchor",
			"isHomeRouteLinkable": true,
			"getHomeView": "html.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": '{"address":{"street":"123 Main St","city":"Vancouver","province":"BC"}}',
			"getRoute": route,
			"getJsonRoute": route,
			"getJsonDatum": {"address":{"street":"123 Main St","city":"Vancouver","province":"BC"}}
		});
	});
	it('route: utilGetJsonRoute', function (done) {
		var route = "utilGetJsonRoute";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": false,
			"getHomeView": "N/A",
			"isHomeDatumLinkable": true,
			"getHomeDatum": "Service call function",
			"getRoute": route,
			"getJsonRoute": route
		});
	});
	it('route: utilGetIpsum', function (done) {
		var route = "ipsum";
		testHarness({
			"done": done,
			"route": route,
			"isHomeRouteLinkable": true,
			"getHomeView": "ipsum.dust",
			"isHomeDatumLinkable": true,
			"getHomeDatum": "Service call function",
			"getRoute": route,
			"getJsonRoute": route
		});
	});
});