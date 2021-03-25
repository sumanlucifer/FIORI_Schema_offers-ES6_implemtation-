// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/SchemeOffers/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Avatar"
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageBox, MessageToast, Avatar) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.SchemeOffers.controller.DetailPage", {
        onInit: function () {
            //Router Object
            var oViewModel = new JSONModel({
                busy: false,
                editable: false
            });
            this.getView().setModel(oViewModel, "DetailViewModel");
            this.oViewModel = this.getView().getModel("DetailViewModel");
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this._property = oEvent.getParameter("arguments").property;
        },

        onPressEdit: function () {
            this.oViewModel.setProperty("/editable", true);
        },

        onPressSave: function () {
            this.oViewModel.setProperty("/editable", false);
        },

        onPressCancel: function () {
            this.oViewModel.setProperty("/editable", false);
        }
    });
});
