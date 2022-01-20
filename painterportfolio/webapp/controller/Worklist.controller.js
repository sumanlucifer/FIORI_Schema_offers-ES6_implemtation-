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
        "com/knpl/pragati/painterportfolio/model/customInt",
        "./Validator",
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
        Device,
        customInt,
        Validator
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.painterportfolio.controller.Worklist", {
                formatter: formatter,
                customInt: customInt,

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
                            EndDate: null,
                            DownloadAppl: "",
                            ZoneId: "",
                            DivisionId: "",
                            DepotId: ""
                        },
                        PageBusy: true,
                        resourcePath: "com.knpl.pragati.painterportfolio",
                        Dialog: {
                            Remarks: "",
                            ReasonKey: ""
                        },
                        CarouselVisible: true
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
                            } else if (prop === "DownloadAppl") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DownloadApplicable", FilterOperator.EQ, JSON.parse(oViewFilter[prop])));
                            } else if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop]));
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop]));
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
                        EndDate: null,
                        DownloadAppl: "",
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: ""
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
                onZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");

                    var oDivision = oView.byId("idDivision");
                    var oDivItems = oDivision.getBinding("items");
                    var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
                    oDivision.clearSelection();
                    oDivision.setValue("");
                    oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                    //setting the data for depot;
                    var oDepot = oView.byId("idDepot");
                    oDepot.clearSelection();
                    oDepot.setValue("");
                    // clearning data for dealer

                },
                onDivisionChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oDepot = oView.byId("idDepot");
                    var oDepBindItems = oDepot.getBinding("items");
                    oDepot.clearSelection();
                    oDepot.setValue("");
                    oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
                },
                onDeleteSiteImage: function (oEvent) {
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    var that = this;

                    function onYes() {
                        that.getView().getModel().remove(sPath, {
                            success: function () {
                                MessageToast.show(that.geti18nText("Message3"));
                                that.getView().byId("idWorkListTable1").rebindTable()
                            }
                        });
                    }
                    that.showWarning("MSG_CONFIRM_DELETE", onYes);
                },
                onQucikApproveOpen: function (oEvent) {
                    var oView = this.getView();
                    var sPainterId = oEvent.getSource().getBindingContext().getObject().Painter["__ref"].match(/\d{1,}/)[0];
                    if (!this._QuickApproveDialog) {
                        Fragment.load({
                            id: oView.getId(),
                            controller: this,
                            name: "com.knpl.pragati.painterportfolio.view.fragments.QuickApproveDialog"
                        }).then(function (oDialog) {
                            this._QuickApproveDialog = oDialog;
                            oView.addDependent(this._QuickApproveDialog);
                            this._BeforeQuickViewOpen(sPainterId);
                        }.bind(this))
                    } else {
                        this._BeforeQuickViewOpen(sPainterId);
                    }

                },

                _BeforeQuickViewOpen: function (sPainterId) {
                    var oView = this.getView();
                    var oList = oView.byId("carousel");
                    var oFilter = new Filter({
                        filters: [new Filter("PainterId", FilterOperator.EQ, sPainterId), new Filter("ApprovalStatus", FilterOperator.EQ, "PENDING")],
                        and: true
                    })
                    oList.getBinding("pages").filter(oFilter);
                    //oList.getBinding("pages").sorter(new Sorter("PortfolioCategory/category"));
                    this._QuickApproveDialog.open();
                },
                onDataReceived: function (oEvent) {
                    var oData = oEvent.getParameter("data");
                    if (oData["__count"]) {
                        if (parseInt(oData["__count"]) > 0) {
                            this.getView().getModel("oModelControl").setProperty("/CarouselVisible", true)
                        } else {
                            this.getView().getModel("oModelControl").setProperty("/CarouselVisible", false)
                        }
                    }

                },
                onApproveImage: function (oEvent) {
                    var oView = this.getView();
                    var oSource = oEvent.getSource();
                    var oModelControl = oView.getModel("oModelControl");
                    var othat = this;
                    var oBj = oSource.getBindingContext().getObject();
                    var oPayload = {};
                    oPayload["ApprovalStatus"] = "APPROVED";
                    oPayload["Remark"] = "Approved";

                    MessageBox.information(this.geti18nText("Message13"), {
                        actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                        onClose: function (sAction) {
                            if (sAction === "YES") {
                                this._ChangePortImageStatusApproved(oPayload, oBj["Id"]);

                            }
                        }.bind(this)
                    });


                },
                _ChangePortImageStatusApproved: function (oPayload, sId) {
                    var c1, c2, c3;
                    var oView = this.getView();
                    var othat = this;
                    var oModelControl = oView.getModel("oModelControl");
                    oModelControl.setProperty("/PageBusy", true);
                    c1 = othat._SendReqForImageStatus(oPayload, sId);
                    c1.then(function () {
                        c3 = othat._UpdateBindingsCarousel();
                        c3.then(function () {
                            if (othat._RemarksDialog) {
                                oModelControl.setProperty("/Dialog/Remarks", "");
                                oModelControl.setProperty("/Dialog/ReasonKey", "");
                                othat._RemarksDialog.close();
                                othat._RemarksDialog.destroy();
                                delete othat._RemarksDialog;
                            }
                            oModelControl.setProperty("/PageBusy", false);
                        })


                    })

                },
                _UpdateBindingsCarousel: function () {
                    var promise = jQuery.Deferred();

                    this.byId("carousel").getBinding("pages").refresh();
                    promise.resolve()
                    return promise;
                },
                onReasonForReamarkChange: function (oEvent) {
                    var oSource = oEvent.getSource();
                    var sKey = oSource.getSelectedKey();

                    var oView = this.getView();
                    if (sKey) {
                        var oBject = oSource.getSelectedItem().getBindingContext().getObject();
                        if (oBject["Description"].trim().toLowerCase() === "other") {
                            oView.getModel("oModelControl").setProperty("/Dialog/Remarks", "");
                        } else {
                            oView.getModel("oModelControl").setProperty("/Dialog/Remarks", oBject["Description"]);
                        }

                    }
                },
                onRejectDialogOpen: function (oEvent) {
                    var oView = this.getView();
                    var oSource = oEvent.getSource();
                    var oModelControl = oView.getModel("oModelControl");
                    var othat = this;
                    var oBj = oSource.getBindingContext().getObject();
                    var sStatus = oEvent.getSource().data("status");

                    if (!this._RemarksDialog) {
                        Fragment.load({
                            id: oView.getId(),
                            controller: this,
                            name: oModelControl.getProperty("/resourcePath") + ".view.fragments.RemarksDialog"
                        }).then(function (oDialog) {
                            this._RemarksDialog = oDialog;
                            oView.addDependent(this._RemarksDialog);
                            this._RemarksDialog.data("Id", oBj["Id"]);

                            this._RemarksDialog.open();

                        }.bind(this))
                    } else {
                        this._RemarksDialog.data("Id", oBj["Id"]);

                        this._RemarksDialog.open();
                    }
                },
                onApproveReject: function () {
                    /*
                     * Author: manik saluja
                     * Date: 02-Dec-2021
                     * Language:  JS
                     * Purpose: This method trigerres when the user clicks on the save in the remarks dialog that pops up when we want to reject a portfolio. 
                     */
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl")
                    var oValidator = new Validator();
                    var oForm = oView.byId("RemarkForm");
                    var bValidate = oValidator.validate(oForm)
                    if (!bValidate) {
                        this._showMessageToast("Message16");
                        return;
                    } else {
                        var oData = this._RemarksDialog.data();
                        var oPayLoad = {
                            ApprovalStatus: "REJECTED",
                            Remark: oModelControl.getProperty("/Dialog/Remarks")
                        };

                        this._ChangePortImageStatusApproved(oPayLoad, oData["Id"]);
                    }



                },
                _SendReqForImageStatus: function (oPayload, sId) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oDataModel = oView.getModel();
                    var sPath = "/PainterPortfolioImageSet(" + sId + ")/ApprovalStatus";
                    return new Promise((resolve, reject) => {
                        oDataModel.update(sPath, oPayload, {
                            success: function () {
                                resolve()
                            },
                            error: function () {
                                reject();
                            }
                        })
                    })

                },
                onQucikApprovalClose: function () {
                    
                    if (this.byId("carousel").getBinding("pages").getLength() > 0) {
                        var sMessage = this.geti18nText("Message22");
                        MessageBox.information(sMessage, {
                            actions: [sap.m.MessageBox.Action.CANCEL, sap.m.MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction === "CANCEL") {
                                    this._QuickApproveDialog.close();
                                    this.getView().byId("idWorkListTable1").rebindTable();
                                } 
                            }.bind(this)
                        });
                    } else {
                        this._QuickApproveDialog.close();
                        this.getView().byId("idWorkListTable1").rebindTable();
                    }
                    


                },


            },
        );
    }
);