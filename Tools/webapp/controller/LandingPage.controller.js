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

    return BaseController.extend("com.knpl.pragati.Tools.controller.LandingPage", {
        onInit: function () {
            this._bDescendingSort = false;
            var oModel = new JSONModel({
                TotalCount: 0,
                busy: true
            });
            this.getView().setModel(oModel, "ViewModel");
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) { },

        onUpdateFinished: function (oEvent) {
            var oModel = this.getViewModel("ViewModel");
            var tableCount = oEvent.getParameters().actual;
            oModel.setProperty("/TotalCount", tableCount);
            oModel.setProperty("/busy", false);
        },

        onPressListItem: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            this.oRouter.navTo("DetailPage", {
                property: sPath.substr(1)
            });
        },

        onPressAdd: function (oEvent) {
            this.oRouter.navTo("ActionPage", {
                action: "add",
                property: ""
            });
        },

        onPressEdit: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            this.oRouter.navTo("ActionPage", {
                action: "edit",
                property: sPath.substr(1)
            });
        },

        onPressDelete: function (oEvent) {
            var oView = this.getView();
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getComponentModel();
            var oViewModel = this.getView().getModel("ViewModel");
            var oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            var oPayload = {
                IsArchived: true,
            };
            MessageBox.confirm(oResourceBundle.getText("deleteConfirmationMessage"), {
                actions: [oResourceBundle.getText("messageBoxDeleteBtnText"), MessageBox.Action.CANCEL],
				emphasizedAction: oResourceBundle.getText("messageBoxDeleteBtnText"),
                onClose: function (sAction) {
                    if (sAction == oResourceBundle.getText("messageBoxDeleteBtnText")) {
                        oViewModel.setProperty("/busy", true);
                        oModel.update(sPath, oPayload, {
                            success: function () {
                                MessageToast.show(oResourceBundle.getText("messageBoxDeleteSuccessMsg"));
                                oViewModel.setProperty("/busy", false);
                                oView.byId("idToolTable").getModel().refresh();
                            },
                            error: function () {
                                oViewModel.setProperty("/busy", false);
                                MessageBox.error(oResourceBundle.getText("messageBoxDeleteErrorMsg-"));
                            }
                        });
                    }
                }
            });
        },

        onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("idToolTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("Title", this._bDescendingSort);

			oBinding.sort(oSorter);
		}
    });
});
