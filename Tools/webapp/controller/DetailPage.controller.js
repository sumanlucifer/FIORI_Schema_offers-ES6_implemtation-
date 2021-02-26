// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/Tools/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageBox"
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageBox) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Tools.controller.DetailPage", {
        onInit: function () {
            //Router Object
            var oViewModel = new JSONModel({
                busy: false
            });
            this.getView().setModel(oViewModel, "DetailViewModel");
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this._property = oEvent.getParameter("arguments").property;
            var oDataModel = this.getComponentModel();
            this.getView().getModel("DetailViewModel").setProperty("/busy", true);
            oDataModel.read("/" + this._property, {
                success: this._onLoadSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },

        _onLoadSuccess: function (oData) {
            var oViewModel = this.getView().getModel("DetailViewModel");
            oViewModel.setData(oData);
            oViewModel.setProperty("/busy", false);
        },

        _onLoadError: function (error) {
            var oViewModel = this.getView().getModel("DetailViewModel");
            oViewModel.setProperty("/busy", false);
            var oRespText = JSON.parse(error.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
        }
    });
});
