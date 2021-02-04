/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/knpl/pragati/Manage_Notifications/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});