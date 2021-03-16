// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/LoyaltyManagement/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device'
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.LoyaltyManagement.controller.LandingPage", {
        onInit: function () {
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) { },

        onPressAddPointBtn: function () {
            this.oRouter.navTo("AddLoyaltyPoint");
        }
    });
});
