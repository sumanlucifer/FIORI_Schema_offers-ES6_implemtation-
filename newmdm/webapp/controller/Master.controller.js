// @ts-ignore
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/Sorter',
    'sap/m/MessageBox'
], function (JSONModel, BaseController, Filter, FilterOperator, Sorter, MessageBox) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.MDM.controller.Master", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this._bDescendingSort = false;
        },
        onListItemPress: function (oEvent) {
            var productPath = oEvent.getSource().getBindingContext("tabData").getPath(),
                tab = productPath.split("/").slice(-1).pop(),

                oNextUIState;
            if (tab != 13) {
                this.getOwnerComponent().getHelper().then(function (oHelper) {
                    oNextUIState = oHelper.getNextUIState(1);
                    this.oRouter.navTo("detail", {
                        layout: oNextUIState.layout,
                        tab: tab
                    });
                }.bind(this));
            }else if (tab==13){
                 this.getOwnerComponent().getHelper().then(function (oHelper) {
                    oNextUIState = oHelper.getNextUIState(1);
                    this.oRouter.navTo("bannerList", {
                        layout: oNextUIState.layout,
                        tab: tab
                    });
                }.bind(this));
            }


        },
        onSearch: function (oEvent) {
            var oTableSearchState = [],
                sQuery = oEvent.getParameter("query");

            if (sQuery && sQuery.length > 0) {
                oTableSearchState = [new Filter("tabName", FilterOperator.Contains, sQuery)];
            }

            this.getView().byId("tabDataList").getBinding("items").filter(oTableSearchState, "Application");
        },

        onSort: function (oEvent) {
            this._bDescendingSort = !this._bDescendingSort;
            var oView = this.getView(),
                oTable = oView.byId("tabDataList"),
                oBinding = oTable.getBinding("items"),
                oSorter = new Sorter("tabName", this._bDescendingSort);

            oBinding.sort(oSorter);
        }
    });
});