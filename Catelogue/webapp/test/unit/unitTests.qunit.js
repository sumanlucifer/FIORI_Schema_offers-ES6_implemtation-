/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/knpl/pragati/Catelogue/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});