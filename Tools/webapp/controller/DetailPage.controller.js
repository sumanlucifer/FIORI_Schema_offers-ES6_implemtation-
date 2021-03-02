// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/Tools/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Tools.controller.DetailPage", {
        onInit: function () {
            //Router Object
            var oViewModel = new JSONModel({
                busy: false
            });
            this.getView().setModel(oViewModel, "DetailViewModel");
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this._property = oEvent.getParameter("arguments").property;
            var oDataModel = this.getComponentModel();
            this.getView().getModel("DetailViewModel").setProperty("/busy", true);
            oDataModel.read("/" + this._property, {
                urlParameters: {
                    $expand: "CreatedByDetails"
                },
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
        },

        onChangeStatus: function (oEvent) {
            var oSource = oEvent.getSource();
            var sSelectedKey = oSource.getSelectedKey();
            if (sSelectedKey === "active") {
                this._updateStatus(true);
            } else {
                MessageBox.confirm(this.oResourceBundle.getText("changeStatusConfirmationMsg"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._updateStatus(false);
                        } else {
                            oSource.setSelectedKey("active");
                        }
                    }.bind(this)
                });
            }
        },

        _updateStatus: function (bStatus) {
            var oModel = this.getComponentModel();
            var oViewModel = this.getView().getModel("DetailViewModel");
            var oPayload = {
                Status: bStatus
            };
            oViewModel.setProperty("/busy", true);
            oModel.update("/" + this._property, oPayload, {
                success: this._onLoadStatusSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },

        _onLoadStatusSuccess: function (oData) {
            MessageToast.show(this.oResourceBundle.getText("statusChangeSuccessMsg"));
            var oViewModel = this.getView().getModel("DetailViewModel");
            oViewModel.setProperty("/busy", false);
        }
    });
});
