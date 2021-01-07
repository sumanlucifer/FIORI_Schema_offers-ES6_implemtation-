sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("com.knpl.pragati.MasterDataManagement.controller.Home", {
            onInit: function () {
                //this.getOwnerComponent().getModel("tableData").setDefaultBindingMode("OneWay");

            },

        });
    });
