sap.ui.define([
    "com/knpl/pragati/DealerManagement/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    'sap/ui/model/type/String',
    'sap/m/ColumnListItem',
    'sap/m/Label',
    'sap/m/SearchField',
    'sap/m/Token',
    "../model/formatter",
],
    function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device,
        MessageToast, MessageBox, typeString, ColumnListItem, Label, SearchField, Token, formatter) {
        "use strict";
        var dealerID;
        return BaseController.extend("com.knpl.pragati.DealerManagement.controller.DealerDetails", {

            formatter: formatter,

            onInit: function () {




                //Initializations
                var oViewModel,
                    iOriginalBusyDelay,
                    oTable = this.byId("idPainterTable");
                this.KNPLModel = this.getComponentModel();

                this.oColModel = new JSONModel(sap.ui.require.toUrl("com/knpl/pragati/DealerManagement/model") + "/columnsModel.json");
                this.oProductsModel = this.getView().getModel();

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
                dealerID = sObjectId;
                this.KNPLModel.metadataLoaded().then(function () {
                    var sObjectPath = this.KNPLModel.createKey("DealerSet", {
                        Id: sObjectId
                    });
                    //console.log(sObjectPath);
                    this._bindView("/" + sObjectPath);
                    this._bindPainterTable("/" + sObjectPath + "/Painter");
                }.bind(this));
                this.dismissBusyDialog();
            },

            _bindView: function (sObjectPath) {
                this.getView().bindElement({
                    path: sObjectPath
                });
            },
            _bindPainterTable: function (spath) {
                this.oPainterTableTemplate = this.oPainterTableTemplate ? this.oPainterTableTemplate : this.getView().byId("idColumnListItem");

                var tableId = this.getView().byId("idPainterTable");
                tableId.bindItems({ path: spath, template: this.oPainterTableTemplate.clone() });

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
                        // aTableSearchState = [new Filter("tolower(Name)", FilterOperator.Contains,  "'" +sQuery.trim().toLowerCase().replace("'", "''") + "'"),
                        //  new Filter("tolower(MembershipCard)", FilterOperator.Contains,  "'" +sQuery.trim().toLowerCase().replace("'", "''") + "'"),
                        //     new Filter("tolower(Mobile)", FilterOperator.Contains,  "'" +sQuery.trim().toLowerCase().replace("'", "''") + "'")  ];
                        var oFilter = new Filter({

                            filters: [

                                new Filter(
                                    "tolower(Name)",
                                    FilterOperator.Contains,
                                    "'" + sQuery.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                                new Filter(
                                    "tolower(MembershipCard)",
                                    FilterOperator.Contains,
                                    "'" + sQuery.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                                new Filter(
                                    "tolower(Mobile)",
                                    FilterOperator.Contains,
                                    "'" + sQuery.trim().toLowerCase().replace("'", "''") + "'"
                                )

                            ]

                        });
                    }
                    // this._applySearch(aTableSearchState);
                    var oList = this.getView().byId("idPainterTable");
                    var oBinding = oList.getBinding("items");

                    oBinding.filter(oFilter);
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

            handleAllDealerLinkPress: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },

            changeLinkStatus: function (oEvent) {
                var oItem = oEvent.getSource();
                var removeSet = oItem.getBindingContext().getPath();
                var oTable = this.getView().byId("idPainterTable");

                var oSelectedItem = oEvent.getSource().getBindingContext().getObject();

                var oContext = this;
                var painterId = oSelectedItem.Id;


                //console.log(oParam);
                //console.log(removeSet);
                function onYes() {
                    var oModel = this.getView().getModel();
                    oModel.callFunction(
                        "/ChangePainterLinkStatus", {
                        method: "GET",
                        urlParameters: {
                            PainterId: painterId,
                            DealerId: dealerID,

                        },
                        success:
                            this.onRemoveSuccess("idPainterTable")
                        ,
                        error: function (oError) {

                        }
                    });


                }

                this.showWarning("MSG_CONFIRM_UNLINK_USER", onYes);

            },
            onRemoveSuccess: function (oTable) {


                var model = this.getView().getModel();
                model.refresh();
                var msg = 'Unlinked Successfully!';
                MessageToast.show(msg);


            },
            linkPainters: function () {

                var aCols = this.oColModel.getData().cols;
                this._oBasicSearchField = new SearchField({
                    showSearchButton: false
                });

                this._oValueHelpDialog = sap.ui.xmlfragment("com.knpl.pragati.DealerManagement.view.fragments.LinkPainterDialogFilterbar", this);
                this.getView().addDependent(this._oValueHelpDialog);

                this._oValueHelpDialog.setRangeKeyFields([{
                    label: "Painter",
                    key: "Id",
                    type: "string",
                    typeInstance: new typeString({}, {
                        maxLength: 7
                    })
                }]);

                this._oValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);

                this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.oProductsModel);
                    oTable.setModel(this.oColModel, "columns");

                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", "/PainterSet");
                    }

                    if (oTable.bindItems) {
                        oTable.bindAggregation("items", "/PainterSet", function () {
                            return new ColumnListItem({
                                cells: aCols.map(function (column) {
                                    return new Label({ text: "{" + column.template + "}" });
                                })
                            });
                        });
                    }

                    this._oValueHelpDialog.update();
                }.bind(this));

                // this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                this._oValueHelpDialog.open();


            },
            onValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");

                if (aTokens.length > 1) {
                    var dataToSend = [];
                    for (var i = 0; i < aTokens.length; i++) {
                        dataToSend.push(aTokens[i].getKey());


                    }
                } else {
                    dataToSend = aTokens[0].getKey();

                }
                console.log(dataToSend);
            },

            onValueHelpCancelPress: function () {
                this._oValueHelpDialog.close();
            },

            onValueHelpAfterClose: function () {
                this._oValueHelpDialog.destroy();
            },

            onFilterBarSearch: function (oEvent) {
                var sSearchQuery = this._oBasicSearchField.getValue(),
                    aSelectionSet = oEvent.getParameter("selectionSet");
                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: FilterOperator.Contains,
                            value1: oControl.getValue()
                        }));
                    }

                    return aResult;
                }, []);

                aFilters.push(new Filter({
                    filters: [
                        // new Filter({ path: "Id", operator: FilterOperator.Contains, value1: sSearchQuery }),
                        new Filter({ path: "Name", operator: FilterOperator.Contains, value1: sSearchQuery }),
                        new Filter({ path: "Mobile", operator: FilterOperator.Contains, value1: sSearchQuery })
                    ],
                    and: false
                }));

                this._filterTable(new Filter({
                    filters: aFilters,
                    and: true
                }));
            },

            _filterTable: function (oFilter) {
                var oValueHelpDialog = this._oValueHelpDialog;

                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }

                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }

                    oValueHelpDialog.update();
                });
            },
            showWarning: function (sMsgTxt, _fnYes) {
                var that = this;
                MessageBox.warning(this.getResourceBundle().getText(sMsgTxt), {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            _fnYes && _fnYes.apply(that);
                        }
                    }
                });
            },
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

        });
    });
