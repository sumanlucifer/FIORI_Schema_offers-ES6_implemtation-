sap.ui.define([
    "com/knpl/pragati/DealerManagement/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device'
],
    function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device) {
        "use strict";

        return BaseController.extend("com.knpl.pragati.DealerManagement.controller.DealerDetails", {
            onInit: function () {
                
                //Initializations
                var oViewModel,
                    iOriginalBusyDelay,
                    oTable = this.byId("idPainterTable");
                this.KNPLModel = this.getComponentModel();

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteDetailsPage").attachPatternMatched(this._onObjectMatched, this);
                

                // Put down table's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the table is
                // taken care of by the table itself.
                iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
                // keeps the search state
                this._aTableSearchState = [];

                // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
                this._mViewSettingsDialogs = {};

                // Model used to manipulate control states
                oViewModel = new JSONModel({
                    worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                    tableBusyDelay: 0
                });
                this.setModel(oViewModel, "oViewModel");

                // Make sure, busy indication is showing immediately so there is no
                // break after the busy indication for loading the view's meta data is
                // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
                oTable.attachEventOnce("updateFinished", function () {
                    // Restore original busy indicator delay for worklist's table
                    oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                });
            },

            _onObjectMatched: function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").dealerID;
                this.KNPLModel.metadataLoaded().then(function () {
                    var sObjectPath = this.KNPLModel.createKey("DealerSet", {
                        Id: sObjectId
                    });
                     //console.log(sObjectPath);
                    this._bindView("/" + sObjectPath);
                }.bind(this));
                this.dismissBusyDialog();
            },

            _bindView: function (sObjectPath) {
                this.getView().bindElement({
                    path: sObjectPath
                });
            },

            onUpdateFinished: function (oEvent) {
                // update the worklist's object counter after the table update
                var sTitle,
                    oTable = oEvent.getSource(),
                    iTotalItems = oEvent.getParameter("total");
                // only update the counter if the length is final and
                // the table is not empty
                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                    sTitle = this.getResourceBundle().getText("detailPageWorklistTableTitleCount", [iTotalItems]);
                } else {
                    sTitle = this.getResourceBundle().getText("detailPageWorklistTableTitle");
                }
                this.getViewModel("oViewModel").setProperty("/detailPageWorklistTableTitle", sTitle);
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
                var oTable = this.byId("idPainterTable");
                oTable.getBinding("items").refresh();
            },

            _applySearch: function (aTableSearchState) {
                var oTable = this.byId("idPainterTable"),
                    oViewModel = this.getViewModel("worklistViewModel");
                oTable.getBinding("items").filter(aTableSearchState, "Application");
                // changes the noDataText of the list in case there are no filter results
                if (aTableSearchState.length !== 0) {
                    oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
                }
            },

            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("com.knpl.pragati.DealerManagement.view.fragments.detailPageFragments.SortDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },

            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("com.knpl.pragati.DealerManagement.view.fragments.detailPageFragments.FilterDialog")
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
                var oTable = this.byId("idPainterTable"),
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
                var oTable = this.byId("idPainterTable"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    aFilters = [];

                var sPath = Object.keys(mParams.filterCompoundKeys)[0],
                    sOperator = "EQ",
                    sValue1 = mParams.filterKeys.false ? false : true,
                    oFilter = new Filter(sPath, sOperator, sValue1);

                aFilters.push(oFilter);

                // apply filter settings
                oBinding.filter(aFilters);
            },

            onListItemPress: function (oEvent) {
                var oButton = oEvent.getSource();
                this.byId("actionSheet").openBy(oButton);
            },

            handleAllDealerLinkPress: function(oEvent){
                this.oRouter.navTo("RouteLandingPage");
            }

        });
    });
