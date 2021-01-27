sap.ui.define([
		"sap/ui/core/mvc/Controller"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller) {
		"use strict";

		return Controller.extend("com.knpl.pragati.Training.controller.App", {
			onInit: function () {
                console.log("Controller Loaded")
            }
		});
	});
