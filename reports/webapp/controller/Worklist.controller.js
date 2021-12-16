sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "../model/formatter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
    ],
    function (
        BaseController,
        JSONModel,
        formatter,
        Filter,
        FilterOperator,
        MessageBox,
        MessageToast,
        Fragment,
        Sorter,
        Device
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.downloadreports.controller.Worklist", {
                formatter: formatter,

                /* =========================================================== */
                /* lifecycle methods                                           */
                /* =========================================================== */

                /**
                 * Called when the worklist controller is instantiated.
                 * @public
                 */
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var oDataControl = {
                        filterBar: {
                            ComplaintTypeId: "",
                            ComplaintSubTypeId: "",
                            StartDate: null,
                            EndDate: null,
                            Status: "",
                            Name: "",
                            ZoneId: "",
                            DivisionId: "",
                            DepotId: ""
                        },
                        IsRedemption: false
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");
                    oRouter
                        .getRoute("worklist")
                        .attachMatched(this._onRouteMatched, this);
                    var startupParams = null;






                },
                _onRouteMatched: function (mParam1) {

                    var a1, a2;
                    var othat = this;
                    var oLoginModel = this.getView().getModel("LoginInfo");
                    a1 = this._CheckLoginData();
                    a1.then(function (data) {
                        a2 = othat._validateLoggedInUser();
                        a2.then(function () {
                            othat._InitData();
                        })
                    })


                },
                _onNavToAdd: function (mParam) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Add", {
                        Id: mParam
                    });
                    //this.onCrossNavigate("CP")

                },
                _validateLoggedInUser: function (mParam) {
                    var promise = jQuery.Deferred();
                    var othat = this;
                    var oLoginModel = this.getView().getModel("LoginInfo");
                    var data = oLoginModel.getData();
                    //console.log(data);
                    if (data["UserType"]["UserType"].toUpperCase() === "AGENT") {
                        var sMessageText = othat.getOwnerComponent().getModel("i18n").getResourceBundle().getText("ValidationMessage1");
                        MessageBox.information(sMessageText, {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                window.history.go(-1);
                            }
                        });
                    }
                    promise.resolve();
                    return promise;
                },
                _InitData: function () {

                    var oViewModel,
                        iOriginalBusyDelay,
                        oTable = this.byId("table");

                    // Put down worklist table's original value for busy indicator delay,
                    // so it can be restored later on. Busy handling on the table is
                    // taken care of by the table itself.
                    iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
                    // keeps the search state
                    this._aTableSearchState = [];

                    // Model used to manipulate control states
                    oViewModel = new JSONModel({
                        worklistTableTitle: this.getResourceBundle().getText(
                            "worklistTableTitle1"
                        ),
                        shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
                        shareSendEmailSubject: this.getResourceBundle().getText(
                            "shareSendEmailWorklistSubject"
                        ),
                        shareSendEmailMessage: this.getResourceBundle().getText(
                            "shareSendEmailWorklistMessage",
                            [location.href]
                        ),
                        tableNoDataText: this.getResourceBundle().getText(
                            "tableNoDataText"
                        ),
                        tableBusyDelay: 0,
                    });
                    this.setModel(oViewModel, "worklistView");

                    // Make sure, busy indication is showing immediately so there is no
                    // break after the busy indication for loading the view's meta data is
                    // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
                    oTable.attachEventOnce("updateFinished", function () {
                        // Restore original busy indicator delay for worklist's table
                        oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                    });
                    this.getView().getModel().refresh();
                    //this._fiterBarSort();
                    // this._addSearchFieldAssociationToFB();

                    // this._getLoggedInInfo();
                    // this._getIfRedemptionAllowed();


                },
                _getLoggedInInfo: function () {
                    var oData = this.getView().getModel();
                    var oLoginData = this.getView().getModel("LoginInfo");
                    oData.callFunction("/GetLoggedInAdmin", {
                        method: "GET",
                        urlParameters: {
                            $expand: "UserType",
                        },
                        success: function (data) {
                            if (data.hasOwnProperty("results")) {
                                if (data["results"].length > 0) {
                                    oLoginData.setData(data["results"][0]);
                                    // console.log(oLoginData)
                                }
                            }
                        },
                    });
                },
                _CheckLoginData: function () {
                    var promise = jQuery.Deferred();
                    var oData = this.getModel();
                    var oLoginModel = this.getView().getModel("LoginInfo");
                    var oLoginData = oLoginModel.getData()
                    if (Object.keys(oLoginData).length === 0) {
                        return new Promise((resolve, reject) => {
                            oData.callFunction("/GetLoggedInAdmin", {
                                method: "GET",
                                urlParameters: {
                                    $expand: "UserType",
                                },
                                success: function (data) {
                                    if (data.hasOwnProperty("results")) {
                                        if (data["results"].length > 0) {
                                            oLoginModel.setData(data["results"][0]);
                                        }
                                    }
                                    resolve();
                                },
                            });
                        })
                    } else {
                        promise.resolve();
                        return promise;
                    }
                },



                _fiterBarSort: function () {
                    if (this._ViewSortDialog) {
                        var oDialog = this.getView().byId("viewSetting");
                        oDialog.setSortDescending(true);
                        oDialog.setSelectedSortItem("CreatedAt");
                    }
                },
                onFilter: function () {
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/filterBar");

                    var aFlaEmpty = true;
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "StartDate") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "CreatedAt",
                                        FilterOperator.GE,
                                        new Date(oViewFilter[prop])
                                    )
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "EndDate") {
                                aFlaEmpty = false;
                                var oDate = new Date(oViewFilter[prop]);
                                oDate.setDate(oDate.getDate() + 1);
                                aCurrentFilterValues.push(
                                    new Filter("CreatedAt", FilterOperator.LT, oDate)
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("PainterDetails/ZoneId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("PainterDetails/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("PainterDetails/DepotId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "Status") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("ReportStatus", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter({
                                                path: "PainterDetails/Name",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "PainterDetails/MembershipCard",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "RedemptionCode",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter(
                                                "PainterDetails/Mobile",
                                                FilterOperator.Contains,
                                                oViewFilter[prop].trim()
                                            )
                                        ],
                                        false
                                    )
                                );
                            }
                        }
                    }

                    var endFilter = new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    });
                    var oTable = this.getView().byId("table");
                    var oBinding = oTable.getBinding("items");
                    if (!aFlaEmpty) {
                        oBinding.filter(endFilter);
                    } else {
                        oBinding.filter([]);
                    }
                },

                onResetFilterBar: function () {
                    this._ResetFilterBar();
                },

                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        ComplaintTypeId: "",
                        ComplaintSubTypeId: "",
                        StartDate: null,
                        EndDate: null,
                        ComplaintStatus: "",
                        Name: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: ""
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);

                    var oTable = this.byId("table");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter([]);
                    oBinding.sort(new Sorter({
                        path: "CreatedAt",
                        descending: true
                    }));
                    //reset the sort order of the dialog box
                    this._fiterBarSort()
                },
                _addSearchFieldAssociationToFB: function () {
                    let oFilterBar = this.getView().byId("filterbar");
                    let oSearchField = oFilterBar.getBasicSearch();
                    var oBasicSearch;
                    var othat = this;
                    if (!oSearchField) {
                        // @ts-ignore
                        oBasicSearch = new sap.m.SearchField({
                            value: "{oModelControl>/filterBar/Name}",
                            showSearchButton: true,
                            search: othat.onFilter.bind(othat)
                        });
                    } else {
                        oSearchField = null;
                    }

                    oFilterBar.setBasicSearch(oBasicSearch);

                    //   oBasicSearch.attachBrowserEvent(
                    //     "keyup",
                    //     function (e) {
                    //       if (e.which === 13) {
                    //         this.onSearch();
                    //       }
                    //     }.bind(this)
                    //   );
                },

                handleSortButtonPressed: function () {
                    this.getViewSettingsDialog(
                        "com.knpl.pragati.downloadreports.view.subview.SortDialog"
                    ).then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
                },
                getViewSettingsDialog: function (sDialogFragmentName) {
                    if (!this._ViewSortDialog) {
                        var othat = this;
                        this._ViewSortDialog = Fragment.load({
                            id: this.getView().getId(),
                            name: sDialogFragmentName,
                            controller: this,
                        }).then(function (oDialog) {
                            if (Device.system.desktop) {
                                othat.getView().addDependent(oDialog);
                                oDialog.addStyleClass("sapUiSizeCompact");
                            }
                            return oDialog;
                        });
                    }
                    return this._ViewSortDialog;
                },

                handleSortDialogConfirm: function (oEvent) {
                    var oTable = this.byId("table"),
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

                /* =========================================================== */
                /* event handlers                                              */
                /* =========================================================== */

                /**
                 * Triggered by the table's 'updateFinished' event: after new table
                 * data is available, this handler method updates the table counter.
                 * This should only happen if the update was successful, which is
                 * why this handler is attached to 'updateFinished' and not to the
                 * table's list binding's 'dataReceived' method.
                 * @param {sap.ui.base.Event} oEvent the update finished event
                 * @public
                 */
                onUpdateFinished: function (oEvent) {
                    // update the worklist's object counter after the table update
                    var sTitle,
                        oTable = oEvent.getSource(),
                        iTotalItems = oEvent.getParameter("total");
                    // only update the counter if the length is final and
                    // the table is not empty
                    if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                        sTitle = this.getResourceBundle().getText(
                            "worklistTableTitleCount",
                            [iTotalItems]
                        );
                    } else {
                        sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [0]);
                    }
                    this.getModel("worklistView").setProperty(
                        "/worklistTableTitle",
                        sTitle
                    );
                },

                /**
                 * Event handler when a table item gets pressed
                 * @param {sap.ui.base.Event} oEvent the table selectionChange event
                 * @public
                 */
                onPress: function (oEvent) {
                    // The source is the list item that got pressed
                    this._showObject(oEvent.getSource());
                },

                /**
                 * Event handler for navigating back.
                 * We navigate back in the browser history
                 * @public
                 */
                onNavBack: function () {
                    // eslint-disable-next-line sap-no-history-manipulation
                    history.go(-1);
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
                            aTableSearchState = [
                                new Filter("ComplaintCode", FilterOperator.Contains, sQuery),
                            ];
                        }
                        this._applySearch(aTableSearchState);
                    }
                },
                onRefreshButton: function () {
                    var oView = this.getView();;
                    var oTable = oView.byId("table")
                    oTable.getBinding("items").refresh();


                },
                onMenuAction: function (oEvent) {
                    var obj = oEvent.getParameter("item").getBindingContext().getObject();
                    var oView = this.getView();
                    var othat = this;
                    var oDataModel = oView.getModel();
                    var oPayload = {
                        ReportType: obj["Key"]
                    }
                    var oDate = new Date();
                    var nHours = oDate.getHours();
                   
                    if (nHours < 9 || nHours >= 20) {
                        this._generateReport(oPayload)
                    } else {
                        var sMessageText = this.getResourceBundle().getText("Message2");
                        MessageBox.information(sMessageText)
                    }


                },
                _generateReport: function (oPayload) {
                    var othat = this;
                    var oView = this.getView();
                    var oDataModel = oView.getModel();
                    oDataModel.create("/PragatiReportSet", oPayload, {
                        success: function () {
                            othat._showToast("MSG_1");
                            othat.getView().getModel().refresh();
                            othat._setTimeInterval();
                        },
                        error: function () {

                        }
                    })
                },
                _setTimeInterval: function () {
                    if (this._Timer) {
                        clearInterval(this._Timer);
                        delete this._Timer;
                    }
                    var othat = this;
                    this._Timer = setInterval(myTimer.bind(this), 60000);

                    function myTimer(mParam1, mParam2) {
                        this.onRefreshButton();
                    }
                },
                onDowloadFile: function (oEvent) {
                    var oView = this.getView();
                    var obj = oEvent.getSource().getBindingContext().getObject();
                    var uuid = obj["UUID"];
                    var sPath = "/KNPL_PAINTER_API/api/v2/odata.svc/PragatiReportSet('" + uuid + "')/$value";
                    sap.m.URLHelper.redirect(sPath, true);
                },
                onCrossNavigate: function (sAction) {
                    // console.log("Cross Navigate Trigerred");

                    this.Navigate({
                        target: {
                            semanticObject: "Manage",
                            action: sAction,
                            params: {
                                PainterId: "Id1"
                            }
                        }
                    });
                },

                Navigate: function (oSemAct) {
                    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                        var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                        oCrossAppNav.toExternal({
                            target: {
                                semanticObject: oSemAct.target.semanticObject,
                                action: oSemAct.target.action
                            },
                            params: oSemAct.target.params
                        })
                    }

                },


                /**
                 * Event handler for refresh event. Keeps filter, sort
                 * and group settings and refreshes the list binding.
                 * @public
                 */
                onRefresh: function () {
                    var oTable = this.byId("table");
                    oTable.getBinding("items").refresh();
                },
                fmtPoints: function (mParam1) {
                    //   console.log(mParam1);
                    if (mParam1) {
                        var sPath = "/" + mParam1[0];
                        var oData = this.getView().getModel().getProperty(sPath);
                        if (oData) {
                            return oData["Points"] * oData["ProductQuantity"];
                        } else {
                            return "NA";
                        }

                    }
                    return "NA"

                },

                /* =========================================================== */
                /* internal methods                                            */
                /* =========================================================== */

                /**
                 * Shows the selected item on the object page
                 * On phones a additional history entry is created
                 * @param {sap.m.ObjectListItem} oItem selected Item
                 * @private
                 */
                _showObject: function (oItem) {
                    this.getRouter().navTo("object", {
                        objectId: oItem.getBindingContext().getProperty("Id"),
                    });
                },

                /**
                 * Internal helper method to apply both filter and search state together on the list binding
                 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
                 * @private
                 */
                _applySearch: function (aTableSearchState) {
                    var oTable = this.byId("table"),
                        oViewModel = this.getModel("worklistView");
                    oTable.getBinding("items").filter(aTableSearchState, "Application");
                    // changes the noDataText of the list in case there are no filter results
                    if (aTableSearchState.length !== 0) {
                        oViewModel.setProperty(
                            "/tableNoDataText",
                            this.getResourceBundle().getText("worklistNoDataWithSearchText")
                        );
                    }
                },
                onExit: function () {
                    //console.log("on exit trigerred for the view");
                    if (this._Timer) {
                        clearInterval(this._Timer);
                        delete this._Timer;
                    }
                }
            }
        );
    }
);