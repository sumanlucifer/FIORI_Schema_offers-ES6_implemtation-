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
            "com.knpl.pragati.ContactPainter.controller.PainterList",
            {
                formatter: formatter,
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();

                    oRouter
                        .getRoute("RoutePList")
                        .attachMatched(this._onRouteMatched, this);
                    var oDataControl = {
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
                            BankDetailsStatus:"",/*Aditya changes*/
                            KycStatus:""/*Aditya changes*/
                        },
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");
                },
                _onRouteMatched: function (oEvent) {
                    this.getView().getModel().resetChanges();
                    this._initData();
                    this._addSearchFieldAssociationToFB();
                },
                _initData: function () {
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
                            }
                            else if (prop === "BankDetailsStatus") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        "PainterBankDetails/Status",
                                        FilterOperator.EQ,
                                        oViewFilter[prop]
                                    )
                                );
                            }/*Aditya changes end*/
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
                                var oDate = new Date(oViewFilter[prop]);
                                oDate.setDate(oDate.getDate() + 1);
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
                            } 
                            
                                else if (prop === "SourceRegistration") {
                                aFlaEmpty = false;
                                if (oViewFilter[prop] == "MOBILE") {
                                    aCurrentFilterValues.push(
                                        new Filter("CreatedBy", FilterOperator.EQ, 0)
                                    );
                                } else if (oViewFilter[prop] == "PORTAL") {
                                    aCurrentFilterValues.push(
                                        new Filter("CreatedBy", FilterOperator.GT, 0)
                                    );
                                }
                                 else if (oViewFilter[prop] == "MIGRATED") {
                                    aCurrentFilterValues.push(
                                        new Filter("IsMigrated", FilterOperator.EQ, true)
                                    );
                                }
                               
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter(
                                                {
                                                    path: "Name",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "MembershipCard",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "Mobile",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
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
                        BankDetailsStatus:"",/*Aditya changes*/
                        KycStatus:""/*Aditya changes*/
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);
                    var oTable = this.byId("idPainterTable");
                    var oBinding = oTable.getBinding("items");
                    oBinding.filter([]);
                    oBinding.sort(new Sorter({ path: "CreatedAt", descending: true }));
                    this._fiterBarSort();
                },
                onPressAddPainter: function (oEvent) {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteAddEditP", {});
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
                    this._dealerReset();
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
                        endFilter = new Filter({ filters: aFilters, and: false });
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
                        console.log(sPath);
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
                    console.log(sPath);
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
                    console.log(sPath);

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
                    console.log(sPath, oBject);
                    MessageBox.confirm(
                        "Kindly confirm to deactivated the painter- " + oBject["Name"],
                        {
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
                            MessageToast.show(oBject["Name"] + " Sucessfully Deactivated.");
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
