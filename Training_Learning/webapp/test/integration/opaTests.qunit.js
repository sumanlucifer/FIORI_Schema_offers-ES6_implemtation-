/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"com/knpl/pragati/Training_Learning/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});