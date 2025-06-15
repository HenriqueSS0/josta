	var updateData = {"visitorLoginState":"No","visitorId":"eel04jccu5ofm99fl3r1o53vtu","visitorSessionID":"eel04jccu5ofm99fl3r1o53vtu","visitorType":"new customer","visitorLifetimeValue":0};

window.onload = function() {
	var eventObj = {
	"event": "tray.updateGTM"
	};
	updateData = jQuery.extend(updateData, {
		"siteSearchFrom": document.referrer
	});
	dataLayer.push(jQuery.extend(eventObj, updateData));

	console.info('[DataLayer] UpdateGTM executed.')
};
