// @ts-ignore
sap.ui.define(
    [
        "com/knpl/pragati/SchemeOffers/controller/BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Sorter",
        "sap/ui/core/Fragment",
        "sap/ui/Device",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/m/ColumnListItem",
        "sap/m/Label",
        "sap/m/Token",
        "sap/ui/core/format/DateFormat",
        "com/knpl/pragati/SchemeOffers/model/formatter"
    ],
    function (
        BaseController,
        Filter,
        FilterOperator,
        JSONModel,
        Sorter,
        Fragment,
        Device,
        MessageBox,
        MessageToast,
        ColumnListItem,
        Label,
        Token,
        DateFormat,
        Formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.SchemeOffers.controller.LandingPage", {
                formatter: Formatter,
                onInit: function () {
                    // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
                    this._mViewSettingsDialogs = {};

                    //Router Object
                    this.oRouter = this.getRouter();
                    this.oRouter
                        .getRoute("RouteLandingPage")
                        .attachPatternMatched(this._onObjectMatched, this);
                    this._SetFilterData();
                },
                _SetFilterData: function () {
                    var oDataControl = {
                        filterBar: {
                            StartDate: null,
                            EndDate: null,
                            Name: "",
                            OfferType: "",
                            Status: "",
                            Zone: "",
                            Division: "",
                            Depot: "",
                            Active: "",
                            ProdCode: ""
                        },
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");
                },
                _onObjectMatched: function (oEvent) {
                    var oViewModel,
                        iOriginalBusyDelay,
                        oTable = this.byId("idOffersTable");

                    iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
                    oViewModel = new JSONModel({
                        TableTitle: this.getResourceBundle().getText("TableTitle"),
                        tableNoDataText: this.getResourceBundle().getText(
                            "tableNoDataText"
                        ),
                        tableBusyDelay: 0,
                    });

                    this.setModel(oViewModel, "worklistView");

                    oTable.attachEventOnce("updateFinished", function () {
                        // Restore original busy indicator delay for worklist's table
                        oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                    });
                    this.getView().getModel().refresh();
                    var c1, c2, c3;
                    var othat = this;
                    c1 = othat._getLoggedInInfo();
                    c1.then(function () {
                        c2 = othat._initLoginFilterTable1()
                    })
                },
                _getLoggedInInfo: function () {
                    var oData = this.getView().getModel();
                    var oLoginData = this.getView().getModel("LoginInfo");
                    return new Promise((resolve, reject) => {
                        oData.callFunction("/GetLoggedInAdmin", {
                            method: "GET",
                            urlParameters: {
                                $expand: "UserType,AdminZone,AdminDivision",
                            },
                            success: function (data) {
                                if (data.hasOwnProperty("results")) {
                                    if (data["results"].length > 0) {
                                        oLoginData.setData(data["results"][0]);
                                        //console.log(oLoginData)
                                    }
                                }
                                resolve();
                            },
                        });
                    })
                },
                _initLoginFilterTable1: function () {
                    var promise = $.Deferred();
                    var oView = this.getView();
                    var oLoginData = this.getView().getModel("LoginInfo").getData();
                    var aFilter = [];
                    var aLeadsFilter = this._CreateLeadsFilter()
                    if (aLeadsFilter) {
                        oView.byId("idOffersTable").getBinding("items").filter(new Filter({
                            filters: aLeadsFilter,
                            and: true
                        }), "Application")
                    }


                    promise.resolve();
                    return promise;
                },
                _CreateLeadsFilter: function (mParam1) {
                    var oView = this.getView();
                    var oLoginData = oView.getModel("LoginInfo").getData();
                    var aFilter = [];
                    //if (oLoginData["UserTypeId"] === 3) {
                    if (oLoginData["AdminDivision"]["results"].length > 0) {
                        for (var x of oLoginData["AdminDivision"]["results"]) {
                            aFilter.push(new Filter("OfferDivision/DivisionId", FilterOperator.EQ, x["DivisionId"]))
                        }
                    } else if (oLoginData["AdminZone"]["results"].length > 0) {
                        for (var x of oLoginData["AdminZone"]["results"]) {
                            aFilter.push(new Filter("OfferZone/ZoneId", FilterOperator.EQ, x["ZoneId"]))
                        }
                    }
                    if (aFilter.length > 0) {
                        var aEndFilter = [new Filter("IsArchived", FilterOperator.EQ, false)];
                        aEndFilter.push(new Filter({
                            filters: aFilter,
                            and: false
                        }))
                        return aEndFilter;

                    }
                    //}
                    return false;
                },


                onUpdateFinished: function (oEvent) {
                    var sTitle,
                        oTable = oEvent.getSource(),
                        iTotalItems = oEvent.getParameter("total");
                    if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                        sTitle = this.getResourceBundle().getText("TableDataCount", [
                            iTotalItems,
                        ]);
                    } else {
                        sTitle = this.getResourceBundle().getText("TableDataCount", [0]);
                    }
                    this.getView()
                        .getModel("worklistView")
                        .setProperty("/TableTitle", sTitle);
                },

                onPressListItem: function (oEvent) {
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext()
                        .getPath()
                        .substr(1);
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    this.oRouter.navTo("DetailPage", {
                        prop: oBject["Id"],
                        mode: "display",
                    });
                },
                onEditOffer: function (oEvent) {
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext()
                        .getPath()
                        .substr(1);
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    this.oRouter.navTo("DetailPage", {
                        prop: oBject["Id"],
                        mode: "edit",
                    });
                },
                onPressEdit: function (oEvent) {
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    this.oRouter.navTo("ActionPage", {
                        action: "edit",
                        property: sPath.substr(1),
                    });
                },
                onPressAdd: function () {
                    //var sPath = oEvent.getSource().getBindingContext().getPath();
                    this.oRouter.navTo("AddOfferPage");
                },

                onPressDelete: function (oEvent) {
                    var oView = this.getView();
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    var oModel = this.getComponentModel();

                    var oViewModel = this.getView().getModel("ViewModel");
                    var oResourceBundle = this.getOwnerComponent()
                        .getModel("i18n")
                        .getResourceBundle();
                    var oPayload = {
                        IsArchived: true,
                    };
                    MessageBox.confirm(
                        oResourceBundle.getText("deleteConfirmationMessage"), {
                            actions: [
                                oResourceBundle.getText("messageBoxDeleteBtnText"),
                                MessageBox.Action.CANCEL,
                            ],
                            emphasizedAction: oResourceBundle.getText(
                                "messageBoxDeleteBtnText"
                            ),
                            onClose: function (sAction) {
                                if (
                                    sAction == oResourceBundle.getText("messageBoxDeleteBtnText")
                                ) {
                                    oViewModel.setProperty("/busy", true);
                                    oModel.update(sPath, oPayload, {
                                        success: function () {
                                            MessageToast.show(
                                                oResourceBundle.getText("messageBoxDeleteSuccessMsg")
                                            );
                                            oViewModel.setProperty("/busy", false);
                                            oView.byId("idToolTable").getModel().refresh();
                                        },
                                        error: function () {
                                            oViewModel.setProperty("/busy", false);
                                            MessageBox.error(
                                                oResourceBundle.getText("messageBoxDeleteErrorMsg-")
                                            );
                                        },
                                    });
                                }
                            },
                        }
                    );
                },

                onSearch: function (oEvent) {
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/filterBar");
                    var aFlaEmpty = true;
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "OfferType") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "OfferTypeId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "StartDate") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "StartDate",
                                        FilterOperator.GE,
                                        oViewFilter[prop]
                                    )

                                );
                            } else if (prop === "EndDate") {
                                aFlaEmpty = false;
                                var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                                aCurrentFilterValues.push(
                                    new Filter("EndDate", FilterOperator.LT, oDate)

                                );
                            } else if (prop === "Active") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("IsActive", FilterOperator.EQ, JSON.parse(oViewFilter[prop]))
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "Status") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("OfferStatus", FilterOperator.EQ, oViewFilter[prop])
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "ProdCode") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("OfferApplicableProduct/ProductCode", FilterOperator.EQ, oViewFilter[prop])
                                    //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                                );
                            } else if (prop === "Zone") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "OfferZone/ZoneId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "Division") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "OfferDivision/DivisionId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "Depot") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "OfferDepot/DepotId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter({
                                                path: "Title",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "OfferStatus",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "OfferCode",
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
                    var oTable = this.getView().byId("idOffersTable");
                    var oBinding = oTable.getBinding("items");
                    if (!aFlaEmpty) {
                        oBinding.filter(endFilter);
                    } else {
                        oBinding.filter([]);
                    }
                },
                fmtDate: function (mDate) {
                    var date = new Date(mDate);
                    var oDateFormat = DateFormat.getDateTimeInstance({
                        pattern: "dd/MM/yyyy",
                        UTC: true,
                        strictParsing: true,
                    });
                    return oDateFormat.format(date);
                },

                fmtLowerCase: function (mParam) {
                    var sLetter = "";
                    if (mParam) {
                        sLetter = mParam
                            .toLowerCase()
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
                    }

                    return sLetter;
                },

                onValueHelpRequested: function () {
                    var oColModel = new JSONModel({
                        cols: [{
                            label: "Name",
                            template: "Name",
                        }, ],
                    });
                    // @ts-ignore
                    this._oValueHelpDialog = sap.ui.xmlfragment(
                        "com.knpl.pragati.SchemeOffers.view.fragment.CreatedByValueHelpDialog",
                        this
                    );
                    this.getView().addDependent(this._oValueHelpDialog);

                    this._oValueHelpDialog.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.getComponentModel());
                            oTable.setModel(oColModel, "columns");
                            oTable.setWidth("25rem");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/AdminSet",
                                    filters: [new Filter("IsArchived", FilterOperator.EQ, false)],
                                });
                            }

                            if (oTable.bindItems) {
                                var aCols = oColModel.getData().cols;
                                oTable.bindAggregation("items", {
                                    path: "/AdminSet",
                                    filters: [new Filter("IsArchived", FilterOperator.EQ, false)],
                                    template: function () {
                                        return new ColumnListItem({
                                            cells: aCols.map(function (column) {
                                                return new Label({
                                                    text: "{" + column.template + "}"
                                                });
                                            }),
                                        });
                                    },
                                    templateShareable: false,
                                });
                            }

                            this._oValueHelpDialog.update();
                        }.bind(this)
                    );

                    var oToken = new Token();
                    var oControl = this.getView().byId("idCreatedByInput");
                    oToken.setKey(oControl.getSelectedKey());
                    oToken.setText(oControl.getValue());
                    this._oValueHelpDialog.setTokens([oToken]);
                    this._oValueHelpDialog.open();
                },

                onValueHelpOkPress: function (oEvent) {
                    var aTokens = oEvent.getParameter("tokens");
                    var oControl = this.getView().byId("idCreatedByInput");
                    oControl.setSelectedKey(aTokens[0].getKey());
                    this._oValueHelpDialog.close();
                },

                onValueHelpCancelPress: function () {
                    this._oValueHelpDialog.close();
                },

                onValueHelpAfterClose: function () {
                    this._oValueHelpDialog.destroy();
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

                handleSortButtonPressed: function () {
                    this.getViewSettingsDialog(
                        "com.knpl.pragati.SchemeOffers.view.fragment.SortDialog"
                    ).then(function (oViewSettingsDialog) {
                        oViewSettingsDialog.open();
                    });
                },

                handleSortDialogConfirm: function (oEvent) {
                    var oTable = this.byId("idOffersTable"),
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
                onReset: function () {
                    this._ResetFilterBar();
                },
                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        StartDate: null,
                        EndDate: null,
                        Name: "",
                        OfferType: "",
                        Status: "",
                        Zone: "",
                        Division: "",
                        Depot: "",
                        Active: "",
                        ProdCode: ""
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);
                    var oTable = this.byId("idOffersTable");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter([]);
                    oBinding.sort(new Sorter({
                        path: "CreatedAt",
                        descending: true
                    }));
                    this._fiterBarSort();
                },
                _fiterBarSort: function () {
                    if (this._ViewSortDialog) {
                        var oDialog = this.getView().byId("viewSetting");
                        oDialog.setSortDescending(true);
                        oDialog.setSelectedSortItem("CreatedAt");
                    }
                },
                oProdValueHelpRequest: function () {
                    var oView = this.getView()
                    var othat = this;
                    if (!this._oDialog) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.ListViewProducts",
                            controller: othat
                        }).then(function (oDialog) {
                            this._oDialog = oDialog;
                            oView.addDependent(this._oDialog);
                            this._oDialog.open();
                        }.bind(this))
                    }
                },
                _onDialogClose: function () {
                    if (this._oDialog) {
                        this._oDialog.destroy();
                        delete this._oDialog;
                    }
                },
                _handleListProdSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value").trim();
                    if (sValue.length > 0) {
                        var aFilter = new Filter({
                            path: "ProductName",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false,
                        });
                        this._oDialog
                            .getBinding("items")
                            .filter(aFilter, "Application");
                    }
                },
                _handleListProdConfirm: function (oEvent) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl")
                    var object = oEvent.getParameter("selectedItem").getBindingContext().getObject();
                    oModelControl.setProperty("/filterBar/ProdCode", object["Id"]);
                    this._onDialogClose();

                },
                onZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();

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
                onDeactivate: function (oEvent) {
                    var oView = this.getView();
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    var oData = oView.getModel();
                    var othat = this;
                    console.log(sPath, oBject);
                    MessageBox.warning(
                        "Are you sure you want to remove the offer- " + oBject["Title"], {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    othat._Deactivate(oData, sPath, oBject);
                                }
                            },
                        }
                    );
                },
                _Deactivate: function (oData, sPath, oBject) {
                    var oPayload = {
                        IsArchived: true,
                    };
                    oData.update(sPath + "/IsArchived", oPayload, {
                        success: function (mData) {
                            MessageToast.show(oBject["Title"] + " Sucessfully Deactivated.");
                            oData.refresh();
                        },
                        error: function (data) {
                            var oRespText = JSON.parse(data.responseText);
                            MessageBox.error(oRespText["error"]["message"]["value"]);
                        },
                    });
                },
            }
        );
    }
);