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
            "com.knpl.pragati.painterportfolio.controller.Worklist", {
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
                            Status: "",
                            Search: "",
                            StartDate: null,
                            EndDate: null
                        },
                        PageBusy: true
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");
                    oRouter
                        .getRoute("worklist")
                        .attachMatched(this._onRouteMatched, this);


                },
                _onRouteMatched: function () {
                    this._InitData();
                },
                onPressAddObject: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: Navigation to add object view and controller
                     */
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Add");

                },
                _InitData: function () {

                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: once the view elements load we have to 
                     * 1. get the logged in users informaion. 2.rebind the table to load data and apply filters 3. perform other operations that are required at the time 
                     * of loading the application
                     */

                    var othat = this;
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var c1, c2, c3, c4;
                    oModelControl.setProperty("/PageBusy", true)
                    c1 = othat._addSearchFieldAssociationToFB();
                    c1.then(function () {
                        c2 = othat._getLoggedInInfo();
                        c2.then(function () {
                            c3 = othat._initTableData();
                            c3.then(function () {
                                oModelControl.setProperty("/PageBusy", false)
                            })
                        })
                    })

                },
                _dummyFunction: function () {
                    var promise = jQuery.Deferred();
                    promise.resolve()
                    return promise;
                },
                _addSearchFieldAssociationToFB: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: add the search field in the filter bar in the view.
                     */
                    var promise = jQuery.Deferred();
                    let oFilterBar = this.getView().byId("filterbar");
                    let oSearchField = oFilterBar.getBasicSearch();
                    var oBasicSearch;
                    var othat = this;
                    if (!oSearchField) {
                        // @ts-ignore
                        oBasicSearch = new sap.m.SearchField({
                            value: "{oModelControl>/filterBar/Search}",
                            showSearchButton: true,
                            search: othat.onFilterBarGo.bind(othat)
                        });
                        oFilterBar.setBasicSearch(oBasicSearch);
                    }
                    promise.resolve();
                    return promise;

                },
                _getLoggedInInfo: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: getting the logged in details of the user
                     */
                    var promise = jQuery.Deferred();
                    var oView = this.getView()
                    var oData = oView.getModel();
                    var oLoginModel = oView.getModel("LoginInfo");
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
                onAfterRendering: function () {
                    //this._initTableData();
                },
                _initTableData: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: Used to load the table data and trigger the on before binding method.
                     */
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    oView.byId("idWorkListTable1").rebindTable();
                    promise.resolve();
                    return promise;
                },
                onBindTblComplainList: function (oEvent) {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: init binding method for the table.
                     */
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "Painter";
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                    // Apply Filters
                    var oFilter = this._CreateFilter();
                    if (oFilter) {
                        oBindingParams.filters.push(oFilter);
                    }

                },
                onFilterBarGo: function () {
                    var oView = this.getView();
                    oView.byId("idWorkListTable1").rebindTable();
                },
                _CreateFilter: function () {
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/filterBar");

                    var aFlaEmpty = false;
                    // init filters - is archived
                    aCurrentFilterValues.push(
                        new Filter("IsArchived", FilterOperator.EQ, false));
                    // init filters - ComplainType Id ne 1
                    // aCurrentFilterValues.push(
                    //     new Filter("ComplaintTypeId", FilterOperator.NE, 1));


                    // filter bar filters
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            // if (prop === "StartDate") {
                            //     aFlaEmpty = false;
                            //     aCurrentFilterValues.push(
                            //         new Filter(
                            //             "CreatedAt",
                            //             FilterOperator.GE,
                            //             new Date(oViewFilter[prop])
                            //         )
                            //     );
                            // } else
                            if (prop === "StartDate") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter[prop])));
                            } else if (prop === "EndDate") {
                                aFlaEmpty = false;
                                var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                                aCurrentFilterValues.push(
                                    new Filter("CreatedAt", FilterOperator.LT, oDate));
                            } else if (prop === "Status") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("ApprovalStatus", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "Search") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter({
                                                path: "Painter/Name",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "PortfolioCode",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "Painter/MembershipCard",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "Painter/Mobile",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            })
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
                    if (!aFlaEmpty) {
                        return endFilter;
                    } else {
                        return false;
                    }
                },

                onResetFilterBar: function () {
                    this._ResetFilterBar();
                },

                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        Status: "",
                        Search: "",
                        StartDate: null,
                        EndDate: null
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);
                    var oTable = this.getView().byId("idWorkListTable1");
                    oTable.rebindTable();

                },
                onListItemPress: function (oEvent) {
                    var oBj = oEvent.getSource().getBindingContext().getObject();
                    var oRouter = this.getOwnerComponent().getRouter();

                    if (oBj.Painter["__ref"]) {
                        var sPainterId = oBj.Painter["__ref"].match(/\d{1,}/)[0];
                        oRouter.navTo("Detail", {
                            Id: sPainterId
                        });
                    }


                },
                onEditListItemPress: function (oEvent) {
                    var oBj = oEvent.getSource().getBindingContext().getObject();
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Detail", {
                        Id: oBj["Id"],
                        Mode: "Edit"
                    });

                },
                onDownloadMainTable: function (oEvent) {
                    var oObject = oEvent.getSource().getBindingContext().getObject();
                    var sPath = "/KNPL_PAINTER_API/api/v2/odata.svc/PainterPortfolioSet(" + oObject["Id"] + ")/$value?portfolioTokenCode=" + oObject["PortfolioTokenCode"];
                    sap.m.URLHelper.redirect(sPath, true);
                },
                onDeleteSiteImage: function (oEvent) {
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    var that = this;

                    function onYes() {
                        that.getView().getModel().remove(sPath, {
                            success: function(){
                                MessageToast.show(that.geti18nText("Message3"));
                                that.getView().byId("idWorkListTable1").rebindTable()
                            }
                        });
                    }
                    that.showWarning("MSG_CONFIRM_DELETE", onYes);
                }
            }
        );
    }
);