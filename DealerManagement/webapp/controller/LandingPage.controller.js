sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device'
],
    function (Controller, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device) {
        "use strict";

        return Controller.extend("com.knpl.pragati.DealerManagement.controller.LandingPage", {
            onInit: function () {
                // apply content density mode to root view
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

                //Initializations
                var oViewModel,
                    iOriginalBusyDelay,
                    oTable = this.byId("idDealerTable");

                //Router Object
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);    

                // Put down worklist table's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the table is
                // taken care of by the table itself.
                iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
                // keeps the search state
                this._aTableSearchState = [];

                // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
                this._mViewSettingsDialogs = {};

                // Model used to manipulate control states
                oViewModel = new JSONModel({
                    worklistTableTitle: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("worklistTableTitle"),
                    tableNoDataText: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("tableNoDataText"),
                    tableBusyDelay: 0
                });
                this.getView().setModel(oViewModel, "worklistViewModel");

                // Make sure, busy indication is showing immediately so there is no
                // break after the busy indication for loading the view's meta data is
                // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
                oTable.attachEventOnce("updateFinished", function () {
                    // Restore original busy indicator delay for worklist's table
                    oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                });
            },

            _onObjectMatched: function (oEvent) {},

            onUpdateFinished: function (oEvent) {
                // update the worklist's object counter after the table update
                var sTitle,
                    oTable = oEvent.getSource(),
                    iTotalItems = oEvent.getParameter("total");
                // only update the counter if the length is final and
                // the table is not empty
                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                    sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
                } else {
                    sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("worklistTableTitle");
                }
                this.getView().getModel("worklistViewModel").setProperty("/worklistTableTitle", sTitle);
            },

            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    // Search field's 'refresh' button has been pressed.
                    // This is visible if you select any master list item.
                    // In this case no new search is triggered, we only
                    // refresh the list binding.
                    this.onRefresh();
                } else {
                    var aTableSearchState = [];
                    var sQuery = oEvent.getParameter("query");

                    if (sQuery && sQuery.length > 0) {
                        aTableSearchState = [new Filter("Name", FilterOperator.Contains, sQuery)];
                    }
                    this._applySearch(aTableSearchState);
                }
            },

            /**
             * Event handler for refresh event. Keeps filter, sort
             * and group settings and refreshes the list binding.
             * @public
             */
            onRefresh: function () {
                var oTable = this.byId("idDealerTable");
                oTable.getBinding("items").refresh();
            },

            _applySearch: function (aTableSearchState) {
                var oTable = this.byId("idDealerTable"),
                    oViewModel = this.getView().getModel("worklistViewModel");
                oTable.getBinding("items").filter(aTableSearchState, "Application");
                // changes the noDataText of the list in case there are no filter results
                if (aTableSearchState.length !== 0) {
                    oViewModel.setProperty("/tableNoDataText", this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("worklistNoDataWithSearchText"));
                }
            },

            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("com.knpl.pragati.DealerManagement.view.fragments.SortDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },

            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("com.knpl.pragati.DealerManagement.view.fragments.FilterDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },


            getViewSettingsDialog: function (sDialogFragmentName) {
                var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sDialogFragmentName,
                        controller: this
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        return oDialog;
                    });
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },

            handleSortDialogConfirm: function (oEvent) {
                var oTable = this.byId("idDealerTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },

            handleFilterDialogConfirm: function (oEvent) {
                var oTable = this.byId("idDealerTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    aFilters = [];
                debugger;
                var sPath = Object.keys(mParams.filterCompoundKeys)[0],
                    sOperator = "EQ",
                    sValue1 = mParams.filterKeys.false ? false : true,
                    oFilter = new Filter(sPath, sOperator, sValue1);

                aFilters.push(oFilter);

                // apply filter settings
                oBinding.filter(aFilters);
            },

            onListItemPress: function (oEvent) {
                var oItem = oEvent.getSource();
                oItem.setNavigated(true);
                var oBindingContext = oItem.getBindingContext("KNPLModel");
                var oModel = this.getView().getModel("KNPLModel");
                this.oRouter.navTo("RouteDetailsPage", {
                    dealerID: oEvent.getSource().getBindingContext("KNPLModel").getObject().Id
                });
                //this.presentBusyDialog();
            },



        });
    });
