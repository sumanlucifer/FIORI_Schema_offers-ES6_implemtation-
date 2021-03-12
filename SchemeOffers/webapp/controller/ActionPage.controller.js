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

    return BaseController.extend("com.knpl.pragati.SchemeOffers.controller.ActionPage", {
        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("ActionPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this._action = oEvent.getParameter("arguments").action;
            this._property = oEvent.getParameter("arguments").property;
            var oData = {
                busy: false,
                action: this._action,
                Title: "",
                Description: "",
                Url: "",
            };
            if (this._action === "edit") {
                var oComponentModel = this.getComponentModel();
                var oItem = oComponentModel.getProperty("/" + this._property);
                if (!oItem) {
                    return this._navToHome();
                }
                oData.Title = oItem.Title;
                oData.Description = oItem.Description;
                oData.Url = oItem.Url;
            }
            var oViewModel = new JSONModel(oData);
            this.getView().setModel(oViewModel, "ActionViewModel");
            this._setDefaultValueState();
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
        },

        onChangeValue: function (oEvent) {
            var oControl = oEvent.getSource();
            this._setControlValueState([oControl]);
        },

        _validateRequiredFields: function () {
            var oTitleControl = this.getView().byId("idTitleInput"),
                oUrlControl = this.getView().byId("idUrlInput");
            this._setControlValueState([oTitleControl, oUrlControl]);
            if (oTitleControl.getValue() && oUrlControl.getValue()) {
                return true;
            } else {
                return false;
            }
        },

        _setDefaultValueState: function () {
            var oTitleControl = this.getView().byId("idTitleInput"),
                oUrlControl = this.getView().byId("idUrlInput");
            oTitleControl.setValueState("None");
            oTitleControl.setValueStateText("");
            oUrlControl.setValueState("None");
            oUrlControl.setValueStateText("");
        },

        _setControlValueState: function (aControl) {
            for (var i = 0; i < aControl.length; i++) {
                var oControl = aControl[i],
                    sValue = oControl.getValue();
                if (sValue) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                } else {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(this.oResourceBundle.getText("requiredValueText"));
                }
            }
        }
    });
});
