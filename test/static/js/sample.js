/*global $, window */
var city,
	getParameterByName,
	loc = window.document.location,
	printMsg = function (msg) {
		window.alert(msg);
	};
getParameterByName = function (name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(loc.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};
city = getParameterByName('city');

$("h1").click(function () {
	printMsg("Ouch");
});
if (city) {
	printMsg("City query string is " + city + ".");
}
if (loc.hash) {
	printMsg(loc.hash);
}