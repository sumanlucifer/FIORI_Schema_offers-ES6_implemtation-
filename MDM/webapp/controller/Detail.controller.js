// @ts-ignore
sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "./BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
], function (JSONModel, BaseController, MessageBox, MessageToast, Filter, FilterOperator, Fragment) {
	"use strict";

	return BaseController.extend("com.knpl.pragati.MDM.controller.Detail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel("layout");
            var oViewModel = new JSONModel({
                busy: false
            });
            this.getView().setModel(oViewModel, "viewModel");

			this.oRouter.getRoute("master").attachPatternMatched(this._onTabMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onTabMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onTabMatched, this);

			/* [oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this); */
		},
		/* handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, tab: this._tab});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, tab: this._tab});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		}, */
		_onTabMatched: function (oEvent) {
			this._tab = oEvent.getParameter("arguments").tab || this._tab || "0";
			this.getView().bindElement({
				path: "/tabs/" + this._tab,
				model: "tabData"
            });
            this._destroyAndAddSmartTableContainer();
        },
        _destroyAndAddSmartTableContainer: function () {
            var oView = this.getView(),
                oVBox = oView.byId("idSmartTableContainer");
            
            var oFragment = Fragment.load({
                id: oView.getId(),
                name:
                "com.knpl.pragati.MDM.view.fragment.SmartTable",
                controller: this,
            }).then(function (oControl) {
                oVBox.destroyItems();
                oVBox.addItem(oControl);
            });
        },
        onBeforeRebindTable: function (oEvent) {
          var mBindingParams = oEvent.getParameter("bindingParams");
          
          // to apply the sort
          mBindingParams.sorter = [
            // @ts-ignore
            new sap.ui.model.Sorter({
              path: "CreatedAt",
              descending: true,
            }),
          ];
           mBindingParams.filters = [
             new Filter("IsArchived",FilterOperator.NE,"true")
           ]
          // to short the sorted column in P13N dialog
          // to prevent applying the initial sort all times
        },
        onPressEdit: function (oEvent) {
            var oSource = oEvent.getSource(),
                sPath = oSource.getBindingContext().getPath().substr(1),
                oTabDataModel = this.getOwnerComponent().getModel("tabData"),
                oTab = oTabDataModel.getProperty("/tabs/" + this._tab),
                oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            this.oRouter.navTo("detailDetail", {
                name: window.encodeURIComponent(oTab.tabName),
                prop: window.encodeURIComponent(sPath),
                fields: window.encodeURIComponent(oTab.smartTblFields),
                mode: "edit",
                tab: oTab.tabId,
                layout: oNextUIState.layout
            });
        },
        onPressAddBtn: function (oEvent) {
            var oTabDataModel = this.getOwnerComponent().getModel("tabData"),
                oTab = oTabDataModel.getProperty("/tabs/" + this._tab),
                oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            this.oRouter.navTo("detailDetail", {
                name: window.encodeURIComponent(oTab.tabName),
                prop: window.encodeURIComponent(oTab.smartTblEntity),
                fields: window.encodeURIComponent(oTab.smartTblFields),
                mode: "add",
                tab: oTab.tabId,
                layout: oNextUIState.layout
            });
        },
        onPressRemove: function (oEvent) {
            var that = this;
            var oView = this.getView();
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("viewModel");
            var oTabDataModel = this.getOwnerComponent().getModel("tabData");
            var oTab = oTabDataModel.getProperty("/tabs/" + this._tab);
            var oPayload = {
            IsArchived: true,
            };
            MessageBox.confirm("Are you sure you want to delete this " + oTab.tabName + "?", {
                actions: ["Delete", MessageBox.Action.CANCEL],
                emphasizedAction: "Delete",
                onClose: function (sAction) {
                    if (sAction == "Delete") {
                        oViewModel.setProperty("/busy", true);
                        oModel.update(sPath, oPayload, {
                            success: function () {
                                MessageToast.show(oTab.tabName + " Sucessfully Deleted.");
                                oViewModel.setProperty("/busy", false);
                                that._destroyAndAddSmartTableContainer();
                            },
                            error: function () {
                                oViewModel.setProperty("/busy", false);
                                MessageBox.error("Unable to delete the data.");
                                that._destroyAndAddSmartTableContainer();
                            }
                        });
                    }
                }
            });
        }
    });
});