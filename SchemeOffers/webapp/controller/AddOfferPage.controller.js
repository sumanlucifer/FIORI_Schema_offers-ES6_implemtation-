// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/SchemeOffers/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.SchemeOffers.controller.AddOfferPage", {
        onInit: function () {
            var oViewModel = new JSONModel({});
            this.getView().setModel(oViewModel, "AddOfferViewModel");
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("AddOfferPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            
        },

        onPressBreadcrumbLink: function () {
            this._navToHome();
        },

        onPressCancel: function () {
            this._navToHome();
        },

        onPressSaveOrUpdate: function () {
            if (this._validateRequiredFields()) {
                var oDataModel = this.getComponentModel();
                var oViewModel = this.getView().getModel("ActionViewModel");
                var oPayload = {
                    Title: oViewModel.getProperty("/Title"),
                    Description: oViewModel.getProperty("/Description"),
                    Url: oViewModel.getProperty("/Url")
                };
                oViewModel.setProperty("/busy", true);
                if (this._action === "add") {
                    oDataModel.create("/MasterExternalLinksSet", oPayload, {
                        success: this._onLoadSuccess.bind(this),
                        error: this._onLoadError.bind(this)
                    });
                } else {
                    oDataModel.update("/" + this._property, oPayload, {
                        success: this._onLoadSuccess.bind(this),
                        error: this._onLoadError.bind(this)
                    });
                }
            }
        },

        _onLoadSuccess: function (data) {
            var oViewModel = this.getView().getModel("ActionViewModel");
            oViewModel.setProperty("/busy", false);
            var sMessage = (this._action === "add") ? this.oResourceBundle.getText("messageToastCreateMsg") : this.oResourceBundle.getText("messageToastUpdateMsg");
            MessageToast.show(sMessage);
            this._navToHome();
        },

        _onLoadError: function (error) {
            var oViewModel = this.getView().getModel("ActionViewModel");
            oViewModel.setProperty("/busy", false);
            var oRespText = JSON.parse(error.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
        }
    });
});
