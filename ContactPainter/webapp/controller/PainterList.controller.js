sap.ui.define(
    [
        "com/knpl/pragati/ContactPainter/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/ui/core/format/DateFormat",
        "com/knpl/pragati/ContactPainter/model/customInt",
        "../model/formatter"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        MessageBox,
        MessageToast,
        Fragment,
        Filter,
        FilterOperator,
        Sorter,
        Device,
        DateFormat,
        customInt,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.ContactPainter.controller.PainterList", {
                formatter: formatter,
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();

                    oRouter
                        .getRoute("RoutePList")
                        .attachMatched(this._onRouteMatched, this);
                    var oDataControl = {
                        IcnTabKey: "allpainters",
                        filterBar: {
                            AgeGroupId: "",
                            StartDate: null,
                            EndDate: null,
                            RegistrationStatus: "",
                            ActivationStatus: "",
                            Name: "",
                            MembershipId: "",
                            ZoneId: "",
                            DepotId: "",
                            DivisionId: "",
                            PreferredLanguage: "",
                            SourceRegistration: "",
                            BankDetailsStatus: "",
                            /*Aditya changes*/
                            KycStatus: "" /*Aditya changes*/
                        },

                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");

                    var startupParams = null;
                    if (this.getOwnerComponent().getComponentData()) {
                        // console.log("Inside If Condition")
                        startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                    }
                    // console.log(startupParams);
                    if (startupParams) {
                        if (startupParams.hasOwnProperty("PainterId")) {
                            if (startupParams["PainterId"].length > 0) {
                                this._onNavToPainterDetails(startupParams["PainterId"][0]);
                            }
                        }
                    }
                },

                _onNavToPainterDetails: function (param1) {
                    console.log(param1);
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteProfile", {
                        mode: "edit",
                        prop: param1,
                    });
                },
                _CheckLoginData: function () {
                    var promise = jQuery.Deferred();
                    var oData = this.getView().getModel();
                    var oLoginModel = this.getView().getModel("LoginInfo");
                    var oLoginData = oLoginModel.getData()
                    if (Object.keys(oLoginData).length === 0) {
                        return new Promise((resolve, reject) => {
                            oData.callFunction("/GetLoggedInAdmin", {
                                method: "GET",
                                urlParameters: {
                                    $expand: "UserType,AdminZone,AdminDivision",
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
                _onRouteMatched: function (oEvent) {
                    this.getView().getModel().resetChanges();
                    // this._initData();
                    // this._addSearchFieldAssociationToFB();
                    // this._CheckLoginData();
                    var othat = this;
                    var c1, c2, c3, c4, c5;
                    c1 = othat._initData();
                    c1.then(function () {
                        c2 = othat._addSearchFieldAssociationToFB();
                        c2.then(function () {
                            c3 = othat._CheckLoginData();
                            c3.then(function () {
                                c4 = othat._initLoginFilterTable1();
                            })
                        })
                    })
                },
                _CreateLeadsFilter: function (mParam1) {
                    var oView = this.getView();
                    var oLoginData = oView.getModel("LoginInfo").getData();
                    var aFilter = [];
                    //if (oLoginData["UserTypeId"] === 3) {
                    if (oLoginData["AdminDivision"]["results"].length > 0) {
                        for (var x of oLoginData["AdminDivision"]["results"]) {
                            aFilter.push(new Filter("DivisionId", FilterOperator.EQ, x["DivisionId"]))
                        }
                    } else if (oLoginData["AdminZone"]["results"].length > 0) {
                        for (var x of oLoginData["AdminZone"]["results"]) {
                            aFilter.push(new Filter("ZoneId", FilterOperator.EQ, x["ZoneId"]))
                        }
                    }
                    if (aFilter.length > 0) {
                        var aEndFilter = [new Filter("IsArchived", FilterOperator.EQ, mParam1 === "table2" ? true : false)];
                        aEndFilter.push(new Filter({
                            filters: aFilter,
                            and: false
                        }))
                        return aEndFilter;

                    }
                    //}
                    return false;
                },
                _initLoginFilterTable1: function (mParam1, mParam2) {

                    var promise = $.Deferred();
                    var oView = this.getView();
                    var oLoginData = this.getView().getModel("LoginInfo").getData();
                    var aFilter = [];
                    var aLeadsFilter = this._CreateLeadsFilter()
                    if (aLeadsFilter) {
                        oView.byId("idPainterTable").getBinding("items").filter(new Filter({
                            filters: aLeadsFilter,
                            and: true
                        }), "Application")
                    }


                    promise.resolve();
                    return promise;
                },

                _initData: function () {
                    var promise = $.Deferred();
                    var oViewModel = new JSONModel({
                        pageTitle: "Painters (0)",
                        tableNoDataText: this.getResourceBundle().getText(
                            "tableNoDataText"
                        ),
                        tableBusyDelay: 0,
                        prop1: "",
                        busy: false,
                        SortSettings: true,
                    });
                    this.setModel(oViewModel, "oModelView");
                    this.getView().getModel().refresh();
                    promise.resolve();
                    return promise;
                    //this._fiterBarSort();
                    //this._FilterInit();
                },
                _fiterBarSort: function () {
                    if (this._ViewSortDialog) {
                        var oDialog = this.getView().byId("viewSetting");
                        oDialog.setSortDescending(true);
                        oDialog.setSelectedSortItem("CreatedAt");
                        // var otable = this.getView().byId("idPainterTable");
                        // var oSorter = new Sorter({ path: "CreatedAt", descending: true });
                        // otable.getBinding("items").sort(oSorter);
                    }
                },

                _FilterInit: function () {
                    this._ResetFilterBar();
                },
                fmtStatus: function (mParam) {
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
                onFilter: function (oEvent) {
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/filterBar");
                    var aFlaEmpty = true;
                    // check if there is a lead and it has zones;
                    // if yes add the filter Zone in the array;
                    // if the method is trigerred initially we have to add some filters else on the filers that are there in the system

                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "AgeGroupId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("AgeGroupId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "MembershipId") {
                                aFlaEmpty = false;
                                if (oViewFilter[prop] == "Generated") {
                                    aCurrentFilterValues.push(
                                        new Filter("MembershipCard", FilterOperator.NE, null)
                                    );
                                } else {
                                    aCurrentFilterValues.push(
                                        new Filter("MembershipCard", FilterOperator.EQ, null)
                                    );
                                }
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DepotId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "PreferredLanguage") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "Preference/LanguageId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } /*Aditya changes start*/
                            else if (prop === "KycStatus") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "PainterKycDetails/Status",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "BankDetailsStatus") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "PainterBankDetails/Status",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } /*Aditya changes end*/
                            else if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "StartDate") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "CreatedAt",
                                        FilterOperator.GE,
                                        new Date(oViewFilter[prop])
                                    )
                                );
                            } else if (prop === "EndDate") {
                                aFlaEmpty = false;
                                var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                                aCurrentFilterValues.push(
                                    new Filter("CreatedAt", FilterOperator.LT, oDate)
                                );
                            } else if (prop === "PainterType") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "PainterTypeId",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "ActivationStatus") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "ActivationStatus",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            } else if (prop === "SourceRegistration") {
                                aFlaEmpty = false;
                                if (oViewFilter[prop] == "MOBILE") {
                                    aCurrentFilterValues.push(
                                        new Filter("CreatedBy", FilterOperator.EQ, 0)
                                    );
                                } else if (oViewFilter[prop] == "PORTAL") {
                                    aCurrentFilterValues.push(
                                        new Filter("CreatedBy", FilterOperator.GT, 0)
                                    );
                                } else if (oViewFilter[prop] == "MIGRATED") {
                                    aCurrentFilterValues.push(
                                        new Filter("IsMigrated", FilterOperator.EQ, true)
                                    );
                                }

                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter({
                                                path: "Name",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "MembershipCard",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                            new Filter({
                                                path: "Mobile",
                                                operator: "Contains",
                                                value1: oViewFilter[prop].trim(),
                                                caseSensitive: false
                                            }),
                                        ],
                                        false
                                    )
                                );
                            } else {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        prop,
                                        FilterOperator.Contains,
                                        oViewFilter[prop].trim()
                                    )
                                );
                            }
                        }
                    }

                    var endFilter = new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    });
                    var oTable = this.getView().byId("idPainterTable");
                    var oBinding = oTable.getBinding("items");
                    if (!aFlaEmpty) {
                        oBinding.filter(endFilter);
                    } else {
                        oBinding.filter([]);
                    }
                    //deleted table filter
                    var oTable = this.getView().byId("idDelPainterTable");
                    var oBinding = oTable.getBinding("items");
                    if (!aFlaEmpty && oBinding) {
                        oBinding.filter(endFilter);
                    } else if (aFlaEmpty && oBinding) {
                        oBinding.filter([]);
                    }
                },
                onResetFilterBar: function () {
                    this._ResetFilterBar();
                },

                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        AgeGroupId: "",
                        StartDate: null,
                        EndDate: null,
                        RegistrationStatus: "",
                        MembershipId: "",
                        Name: "",
                        ZoneId: "",
                        DepotId: "",
                        DivisionId: "",
                        PreferredLanguage: "",
                        PainterType: "",
                        BankDetailsStatus: "",
                        /*Aditya changes*/
                        KycStatus: "" /*Aditya changes*/
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);
                    var oTable = this.byId("idPainterTable");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter([]);
                    oBinding.sort(new Sorter({
                        path: "CreatedAt",
                        descending: true
                    }));

                    //deleted table
                    var oTable = this.byId("idDelPainterTable");
                    var oBinding = oTable.getBinding("items");
                    if (oBinding) {
                        oBinding.filter([]);
                        oBinding.sort(new Sorter({
                            path: "CreatedAt",
                            descending: true
                        }));
                    }


                    this._fiterBarSort();
                },
                onPressAddPainter: function (oEvent) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteAddEditP", {});
                },
                onIcnTbarChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    if (sKey === "delpainters") {
                        var oView = this.getView();
                        var oTable = oView.byId("idDelPainterTable");
                        var aFilters = this._CreateLeadsFilter("table2");
                        if (!oTable.getBinding("items")) {
                            if (!aFilters) {
                                aFilters = [new Filter("IsArchived", FilterOperator.EQ, true)]
                            }
                            oTable.bindItems({
                                path: "/PainterSet",
                                template: oView.byId("idDelPainterTableTemplate"),
                                templateShareable: true,
                                parameters: {
                                    expand: 'AgeGroup,Preference/Language,PainterBankDetails,PrimaryDealerDetails,PainterKycDetails,PainterType',
                                    select: "Id,RegistrationStatus,Name,MembershipCard,CreatedAt,Mobile,PrimaryDealerDetails/DealerName,Preference/Language/Language,PainterKycDetails/Status,PainterBankDetails/Status,ProfileCompleted,CallBackReqOrComplainFlag"
                                },
                                filters: aFilters,
                                sorter: new Sorter("CreatedAt", true)
                            })
                            this.onFilter();
                        }

                    }
                },
                onZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oPainterDetail = oModelView.getProperty("/PainterDetails");
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
                    // this._dealerReset();
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

                onSuggest: function (event) {
                    var oSearchField = this.getView().byId("searchField");
                    var sValue = event.getParameter("suggestValue"),
                        aFilters = [];
                    if (sValue) {
                        aFilters = [
                            new Filter(
                                [
                                    new Filter("Name", function (sText) {
                                        return (
                                            (sText || "")
                                            .toUpperCase()
                                            .indexOf(sValue.toUpperCase()) > -1
                                        );
                                    }),
                                ],
                                false
                            ),
                        ];
                    }

                    oSearchField.getBinding("suggestionItems").filter(aFilters);
                    oSearchField.suggest();
                },
                _addSearchFieldAssociationToFB: function () {
                    var promise = $.Deferred();
                    let oFilterBar = this.getView().byId("filterbar");
                    let oSearchField = oFilterBar.getBasicSearch();
                    var oBasicSearch;
                    var othat = this;
                    if (!oSearchField) {
                        // @ts-ignore
                        oBasicSearch = new sap.m.SearchField({
                            value: "{oModelControl>/filterBar/Name}",
                            showSearchButton: true,
                            search: othat.onFilter.bind(othat),
                        });
                    } else {
                        oSearchField = null;
                    }

                    oFilterBar.setBasicSearch(oBasicSearch);
                    promise.resolve();
                    return promise;
                    //   oBasicSearch.attachBrowserEvent(
                    //     "keyup",
                    //     function (e) {
                    //       if (e.which === 13) {
                    //         this.onSearch();
                    //       }
                    //     }.bind(this)
                    //   );
                },

                onSearch: function (oEvent) {
                    var aFilters = [];
                    var endFilter;
                    var sQuery = oEvent.getSource().getValue();
                    if (sQuery && sQuery.length > 0) {
                        var filter1 = new Filter("Name", FilterOperator.Contains, sQuery);
                        //var filter2 = new Filter("Email", FilterOperator.Contains, sQuery);
                        //var filtes3 = new Filter("Mobile", FilterOperator.Contains, sQuery);
                        aFilters.push(filter1);
                        //aFilters.push(filter2);
                        //aFilters.push(filtes3);
                        endFilter = new Filter({
                            filters: aFilters,
                            and: false
                        });
                    }

                    // update list binding
                    var oTable = this.getView().byId("idPainterTable");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter(endFilter);
                },
                handleSortButtonPressed: function () {
                    this.getViewSettingsDialog(
                        "com.knpl.pragati.ContactPainter.view.fragments.SortDialog"
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

                    //deleted painter sort
                    var oTable = this.byId("idDelPainterTable"),
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

                onUpdateFinished: function (oEvent) {
                    // update the worklist's object counter after the table update
                    var sTitle,
                        oTable = this.getView().byId("idPainterTable"),
                        iTotalItems = oEvent.getParameter("total");
                    // only update the counter if the length is final and
                    // the table is not empty
                    if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                        sTitle = this.getResourceBundle().getText("PainterList", [
                            iTotalItems,
                        ]);
                    } else {
                        sTitle = this.getResourceBundle().getText("PainterList", [0]);
                    }
                    this.getViewModel("oModelView").setProperty("/pageTitle", sTitle);
                },
                onUpdateFinishedDel: function (oEvent) {
                    // update the worklist's object counter after the table update
                    var sTitle,
                        oTable = this.getView().byId("idDelPainterTable"),
                        iTotalItems = oEvent.getParameter("total");
                    // only update the counter if the length is final and
                    // the table is not empty
                    if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                        sTitle = this.getResourceBundle().getText("PainterList", [
                            iTotalItems,
                        ]);
                    } else {
                        sTitle = this.getResourceBundle().getText("PainterList", [0]);
                    }
                    this.getViewModel("oModelView").setProperty("/pageTitleDel", sTitle);
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
                onDealersPress: function (oEvent) {
                    var oSource = oEvent.getSource();
                    var sPath = oSource.getBindingContext().getPath();
                    var oView = this.getView();
                    if (!this._pPopover) {
                        this._pPopover = Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.ContactPainter.view.fragments.Popover",
                            controller: this,
                        }).then(function (oPopover) {
                            oView.addDependent(oPopover);
                            return oPopover;
                        });
                    }
                    this._pPopover.then(function (oPopover) {
                        oPopover.openBy(oSource);
                        //console.log(sPath);
                        oPopover.bindElement({
                            path: sPath,
                            parameters: {
                                expand: "Dealers",
                            },
                        });
                    });
                },
                onListItemPress: function (oEvent) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext()
                        .getPath()
                        .substr(1);
                    //console.log(sPath);
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteProfile", {
                        mode: "edit",
                        prop: oBject["Id"],
                    });
                },

                onPressEditPainter: function (oEvent) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext()
                        .getPath()
                        .substr(1);
                    //console.log(sPath);

                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteProfile", {
                        mode: "edit",
                        prop: window.encodeURIComponent(sPath),
                    });
                },
                onGenMemId: function (oEvent) {
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    var oView = this.getView();
                    var oDataModel = oView.getModel();
                    MessageBox.information(
                        "Kindly enter the Zone, Depot and Division in the edit painter screen to generate the Membership ID."
                    );
                },
                onDeactivate: function (oEvent) {
                    var oView = this.getView();
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    var oData = oView.getModel();
                    var othat = this;
                    //console.log(sPath, oBject);
                    MessageBox.confirm(
                        "Kindly confirm to delete the painter- " + oBject["Name"], {
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
                            MessageToast.show(oBject["Name"] + " Successfully Deleted.");
                            oData.refresh();
                        },
                        error: function (data) {
                            var oRespText = JSON.parse(data.responseText);
                            MessageBox.error(oRespText["error"]["message"]["value"]);
                        },
                    });
                },
                onDeactivate2: function (oEvent) {
                    var oView = this.getView();
                    var oBject = oEvent.getSource().getBindingContext().getObject();
                    var sPath = oEvent.getSource().getBindingContext().getPath();
                    var oData = oView.getModel();
                    var othat = this;
                    //console.log(sPath, oBject);
                    MessageBox.confirm(
                        "Kindly confirm to activate the painter- " + oBject["Name"], {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    othat._Deactivate2(oData, sPath, oBject);
                                }
                            },
                        }
                    );
                },

                _Deactivate2: function (oData, sPath, oBject) {
                    var oPayload = {
                        IsArchived: false,
                    };
                    oData.update(sPath + "/IsArchived", oPayload, {
                        success: function (mData) {
                            MessageToast.show(oBject["Name"] + " Successfully Activated.");
                            oData.refresh();
                        },
                        error: function (data) {
                            var oRespText = JSON.parse(data.responseText);
                            MessageBox.error(oRespText["error"]["message"]["value"]);
                        },
                    });
                },
                onMenuAction: function (oEvent) {
                    var oModelView = this.getView().getModel("oModelView");
                    var oMenuItem = oEvent.getParameter("item");
                    var sSource = "/KNPL_PAINTER_API/api/v2/odata.svc"
                    if (oMenuItem instanceof sap.m.MenuItem) {
                        var sText = oMenuItem.getText();
                        if (sText === "Dealer Painter Registration Mapping") {
                            sSource += "/PainterMappedWithDealerSet(0)/$value";
                        } else if (sText === "Painter Dump") {
                            sSource += "/PainterAnalyticsSet(0)/$value";
                        } else if (sText === "Product Purchase History") {
                            sSource += "/PainterProductPurchaseHistorySet(0)/$value";
                        }
                        oModelView.setProperty("/busy", true)
                        this._CallServiceForDownloadReport(sSource, oModelView);
                    }


                },
                _CallServiceForDownloadReport: function (sSourceUrl, oModelView) {
                    var postData = new FormData();
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', sSourceUrl, true);
                    xhr.responseType = 'blob';
                    xhr.onerror = function () { // only triggers if the request couldn't be made at all
                        oModelView.setProperty("/busy", false);
                        MessageBox.error("Unable to Connect to the Server.");
                    };


                    xhr.onload = function (e) {

                        var blob = xhr.response;
                        var contentDispo = e.currentTarget.getResponseHeader('Content-Disposition');
                        var fileName = "";
                        if (contentDispo) {
                            fileName = contentDispo.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1];
                        }
                        oModelView.setProperty("/busy", false);
                        this.saveOrOpenBlob(blob, fileName);
                    }.bind(this)
                    xhr.send(postData);
                },
                saveOrOpenBlob: function (blob, fileName) {
                    var a = document.createElement('a');
                    a.href = window.URL.createObjectURL(blob);
                    a.download = fileName;
                    a.dispatchEvent(new MouseEvent('click'));

                },
            }
        );
    }
);