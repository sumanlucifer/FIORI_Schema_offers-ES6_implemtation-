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

        return BaseController.extend("com.knpl.pragati.DealerManagement.controller.LandingPage", {
            onInit: function () {

                // var oModel = new sap.ui.model.odata.ODataModel("/KNPL_PAINTER_API/api/v2/odata.svc/", { useBatch: true });
                // // console.log(oModel)
                // var oJsonModel = new JSONModel(oModel);
                // // console.log(oJsonModel);
                // this.getView().setModel(oJsonModel, "Json");



                //Initializations
                var oViewModel,
                    iOriginalBusyDelay,
                    oTable = this.byId("idDealerTable");

                //adding searchfield association to filterbar                        
                this._addSearchFieldAssociationToFB();

                //Router Object
                this.oRouter = this.getRouter();
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
                    worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                    tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
                    tableBusyDelay: 0
                });
                this.setModel(oViewModel, "worklistViewModel");

                // Make sure, busy indication is showing immediately so there is no
                // break after the busy indication for loading the view's meta data is
                // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
                oTable.attachEventOnce("updateFinished", function () {
                    // Restore original busy indicator delay for worklist's table
                    oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                });
            },

            _onObjectMatched: function (oEvent) { },

            _addSearchFieldAssociationToFB: function () {
                let oFilterBar = this.getView().byId("filterbar");
                let oSearchField = oFilterBar.getBasicSearch();
                var oBasicSearch;
                if (!oSearchField) {
                    // @ts-ignore
                    oBasicSearch = new sap.m.SearchField({
                        id: "idSearch",
                        showSearchButton: false
                    });
                } else {
                    oSearchField = null;
                }

                oFilterBar.setBasicSearch(oBasicSearch);

                oBasicSearch.attachBrowserEvent("keyup", function (e) {
                    if (e.which === 13) {
                        this.onSearch();
                    }
                }.bind(this)
                );
            },

            onUpdateFinished: function (oEvent) {
                // update the worklist's object counter after the table update
                var sTitle,
                    oTable = oEvent.getSource(),
                    iTotalItems = oEvent.getParameter("total");
                // only update the counter if the length is final and
                // the table is not empty
                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                    sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
                } else {
                    sTitle = this.getResourceBundle().getText("worklistTableTitle");
                }
                this.getViewModel("worklistViewModel").setProperty("/worklistTableTitle", sTitle);
            },

            onSearch: function (oEvent) {
                //console.log(oEvent.getSource().getBasicSearchValue());
                var aCurrentFilterValues = [];

                var genericSearch = oEvent.getSource().getBasicSearchValue();
                var plantCode = this.getInputText("idPlantCode");
                var depot = this.getInputText("idDepot");
                var salesGroupName = this.getInputText("idSalesGroupName");
                var fiscalYear = this.getInputText("idFiscalYear");
                if (genericSearch == "" && plantCode == "" && depot == "" && salesGroupName == "" && fiscalYear == "") {
                    console.log("empty");
                }
                else {

                    aCurrentFilterValues.push(genericSearch);
                    aCurrentFilterValues.push(plantCode);
                    aCurrentFilterValues.push(depot);
                    aCurrentFilterValues.push(salesGroupName);
                    aCurrentFilterValues.push(fiscalYear);
                    

                     this.filterTable(aCurrentFilterValues);

                }

                //this.filterTable(aCurrentFilterValues);

            },

            getInputText: function (controlId) {
                return this.getView().byId(controlId).getValue();
            },

            filterTable: function (aCurrentFilterValues) {
                this.getTableItems().filter(this.getFilters(aCurrentFilterValues));
                var results = this.getTableItems().filter(this.getFilters(aCurrentFilterValues));
                console.log(results);
            },

            getTableItems: function () {
                return this.getView().byId("idDealerTable").getBinding("items");
            },


            getFilters: function (aCurrentFilterValues) {
                var aFilters = [];
                var aFinFilter = new Filter({ "filters": aFilters, and: false })
                var aKeys = [
                    "search", "PlantCode", "DealerSalesDetails/Depot", "DealerSalesDetails/SalesGroup/Description", "FiscalYear"
                ];

                for (let i = 0; i < aKeys.length; i++) {
                    if (aCurrentFilterValues[i].length > 0 && aKeys[i] !== "search")
                        // aFilters.push(new Filter(aKeys[i], sap.ui.model.FilterOperator.Contains,  "'" + aCurrentFilterValues[i].trim().toLowerCase().replace("'", "''") + "'"))
                        aFilters.push(new Filter({ path: aKeys[i], operator: sap.ui.model.FilterOperator.Contains, value1: aCurrentFilterValues[i].trim(), caseSensitive: false }))
                    else if (aCurrentFilterValues[i].length > 0 && aKeys[i] == "search")
                        this.SearchInAllFields(aKeys, aFilters, aCurrentFilterValues[i]);
                }

                return aFinFilter;
            },
            SearchInAllFields: function (aKeys, aFilters, searchValue) {

                aFilters.push(new Filter({ path: "DealerName", operator: sap.ui.model.FilterOperator.Contains, value1: searchValue.trim(), caseSensitive: false }));
                aFilters.push(new Filter({ path: "Id", operator: sap.ui.model.FilterOperator.Contains, value1: searchValue.trim(), caseSensitive: false }))
                for (let i = 1; i < aKeys.length; i++) {


                    // aFilters.push(new Filter(aKeys[i], sap.ui.model.FilterOperator.Contains,  "'" + searchValue.trim().toLowerCase().replace("'", "''") + "'"))
                    aFilters.push(new Filter({ path: aKeys[i], operator: sap.ui.model.FilterOperator.Contains, value1: searchValue.trim(), caseSensitive: false }))

                }


            },



            handleSortButtonPressed: function () {
                this.getViewSettingsDialog("com.knpl.pragati.DealerManagement.view.fragments.worklistFragments.SortDialog")
                    .then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
            },

            handleFilterButtonPressed: function () {
                this.getViewSettingsDialog("com.knpl.pragati.DealerManagement.view.fragments.worklistFragments.FilterDialog")
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
                var oBindingContext = oItem.getBindingContext();
                var oModel = this.getComponentModel();
                this.oRouter.navTo("RouteDetailsPage", {
                    dealerID: oEvent.getSource().getBindingContext().getObject().Id
                });
                this.presentBusyDialog();
            },
            onReset: function () {

                this._ResetFilterBar();


            },
            _ResetFilterBar: function () {
                var aCurrentFilterValues = [];

                var aResetProp = {
                    PlantCode: "",
                    Depot: "",
                    SalesGroupName: "",
                    FiscalYear: ""
                };
                var oViewModel = this.getView().getModel();
                oViewModel.setProperty("/filterBar", aResetProp);

                var oTable = this.byId("idDealerTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter([]);
                this.clearSearchFields();

            },

            clearSearchFields: function () {
                var plantCode = this.getView().byId("idPlantCode");
                plantCode.setValue("");
                var depot = this.getView().byId("idDepot");
                depot.setValue("");
                var salesGroupName = this.getView().byId("idSalesGroupName");
                salesGroupName.setValue("");
                var year = this.getView().byId("idFiscalYear");
                year.setValue("");

            }

            // handleSuggest: function (oEvent) {
            //     var aFilters = [];
            //     var sTerm = oEvent.getParameter("suggestValue");
            //     if (sTerm) {
            //         aFilters.push(new sap.ui.model.Filter("FiscalYear", sap.ui.model.FilterOperator.Contains, sTerm));
            //     }
            //     oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
            //     //do not filter the provided suggestions before showing them to the user - important
            //     oEvent.getSource().setFilterSuggests(false);
            // }

            /*onDetailPress: function (oEvent) {
                var oButton = oEvent.getSource();
                this.byId("actionSheet").openBy(oButton);
            }*/

        });
    });
