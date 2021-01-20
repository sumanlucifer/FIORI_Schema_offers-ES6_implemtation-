sap.ui.define([
		"sap/ui/core/mvc/Controller"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller) {
		"use strict";

		return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.Home", {
			onInit: function () {

            },
            onPressAdd: function () {
                 var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // var selectedProductId = oEvent.getSource().getBindingContext().getProperty("ProductID");
                // oRouter.navTo("detail", {
                //     productId: selectedProductId
                // });
                oRouter.navTo("AddUser");
                
            }
		});
	});
