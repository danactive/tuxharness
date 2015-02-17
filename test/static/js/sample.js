/*global $, window */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$("h1").click(function () {
	window.alert("Ouch");
});
var city = getParameterByName('city');
if (city) {
	window.alert("City query string is " + city + ".");
}
if (location.hash) {
	window.alert(location.hash);
}