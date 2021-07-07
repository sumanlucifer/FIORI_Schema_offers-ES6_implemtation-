// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/LoyaltyManagement/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "../model/formatter"
],
    function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, formatter) {
        "use strict";

        return BaseController.extend("com.knpl.pragati.LoyaltyManagement.controller.LandingPage", {
            formatter: formatter,
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);


                 var oDataControl = {
                     allRequestIconTabarTitle:"",
                     accrualRequestIconTabarTitle:"",
                     redemptionRequestIconTabarTitle:"",
                        filterBar: {
                            AgeGroupId: "",
                            StartDate: null,
                            EndDate:null,
                            Point:"",
                            Type:"",
                            Name: "",
                            MembershipId: "",
                            ZoneId: "",
                            DepotId: "",
                            DivisionId: ""
                        },
                    };
                    var oMdlCtrl = new JSONModel(oDataControl);
                    this.getView().setModel(oMdlCtrl, "oModelControl");



            },

            _onObjectMatched: function (oEvent) {
                this.primaryFilter();

            },

            onPressAddPointBtn: function () {
                this.oRouter.navTo("AddLoyaltyPoint");
            },
            onListItemPress: function (oEvent) {
                var oItem = oEvent.getSource();
                oItem.setNavigated(true);
                var oBindingContext = oItem.getBindingContext();
                var oModel = this.getComponentModel();
                this.oRouter.navTo("DetailPage", {
                    Id: oEvent.getSource().getBindingContext().getObject().Id
                });
                // this.presentBusyDialog();
            },

            primaryFilter: function () {
                var oTableAccural = this.getView().byId("idAccrualRequestTable");
                oTableAccural.getBinding("items").filter(new Filter({
                    filters: [
                        new Filter({
                            filters: [
                                new Filter("PointTransactionType", sap.ui.model.FilterOperator.EQ, "ACCRUED")
                            ], and: false
                        })
                    ]
                }));

                 var oTableRedemption = this.getView().byId("idRedemptionRequestTable");
                oTableRedemption.getBinding("items").filter(new Filter({
                    filters: [
                        new Filter({
                            filters: [
                                new Filter("PointTransactionType", sap.ui.model.FilterOperator.NE, "ACCRUED")
                            ], and: false
                        })
                    ]
                }));
            },
            onUpdateFinished: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = this.getView().byId("idAllRequestTable"),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("allRequestIconTabarTitle", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("allRequestIconTabarTitle",[0]);
            }
            this.getView().getModel("oModelControl").setProperty("/allRequestIconTabarTitle", sTitle);
        },
        onUpdateFinished1: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = this.getView().byId("idAccrualRequestTable"),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("accrualRequestIconTabarTitle", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("accrualRequestIconTabarTitle",[0]);
            }
            this.getView().getModel("oModelControl").setProperty("/accrualRequestIconTabarTitle", sTitle);
        },
        onUpdateFinished2: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = this.getView().byId("idRedemptionRequestTable"),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("redemptionRequestIconTabarTitle", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("redemptionRequestIconTabarTitle",[0]);
            }
            this.getView().getModel("oModelControl").setProperty("/redemptionRequestIconTabarTitle", sTitle);
        },

            onReset: function (oEvent) {

                this.oFilter = null;
                var oBindingParams = oEvent.getParameter("bindingParams");
                if (this.oFilter) {
                    oBindingParams.filters.push(this.oFilter);
                }

                var oTable = this.getView().byId("idAllRequestTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter([]);
                var oModel = this.getViewModel("ViewModel");
                oModel.setProperty("/filterBar", {
                    search: "",
                    createdAt: ""

                });
                this.getView().byId("idRequestTypeInput").setValue("");
                this.getView().byId("idStatusInput").setValue("");
                // var oTable = this.byId("idCatlogueTable");
                // var oBinding = oTable.getBinding("items");
                // oBinding.filter([]);
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
                                    new Filter("Painter/AgeGroupId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "MembershipId") {
                                aFlaEmpty = false;

                                    aCurrentFilterValues.push(
                                        new Filter("Painter/MembershipCard", FilterOperator.EQ, oViewFilter[prop])
                                    );
                        
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } 
                            else if (prop === "Point") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("RewardPoints", FilterOperator.EQ, oViewFilter[prop])
                                );
                            }
                            else if (prop === "Type") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                   new Filter(
                                                {
                                                    path: "PointType",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                );
                            }else if (prop === "StartDate") {
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
                            } 
                                  else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter(
                                        [
                                            new Filter(
                                                {
                                                    path: "Painter/Name",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "Painter/MembershipCard",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "Painter/Mobile",
                                                    operator: "Contains",
                                                    value1: oViewFilter[prop].trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "PointType",
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
                    var oTable = this.getView().byId("idAllRequestTable");
                    var oTable1 = this.getView().byId("idAccrualRequestTable");
                    var oTable2 = this.getView().byId("idRedemptionRequestTable");
                    var oBinding = oTable.getBinding("items");
                    var oBinding1 = oTable1.getBinding("items");
                    var oBinding2 = oTable2.getBinding("items");
                    if (!aFlaEmpty) {
                        oBinding.filter(endFilter);
                        oBinding1.filter(endFilter);
                        oBinding2.filter(endFilter);
                    } else {
                        oBinding.filter([]);
                        oBinding1.filter([]);
                        oBinding2.filter([]);
                    }
                },
                _ResetFilterBar: function () {
                    var aCurrentFilterValues = [];
                    var aResetProp = {
                        StartDate: null,
                        EndDate:null,
                        Point:"",
                        Type:"",
                        MembershipId: "",
                        Name: "",
                        ZoneId: "",
                        DepotId: "",
                        DivisionId: "",
                        PreferredLanguage: "",
                        PainterType: "",
                    };
                    var oViewModel = this.getView().getModel("oModelControl");
                    oViewModel.setProperty("/filterBar", aResetProp);
                    var oTable = this.byId("idAllRequestTable");
                    var oTable1 = this.byId("idAccrualRequestTable");
                    var oTable2 = this.byId("idRedemptionRequestTable");
                    var oBinding = oTable.getBinding("items");
                    var oBinding1 = oTable1.getBinding("items");
                    var oBinding2 = oTable2.getBinding("items");
                    oBinding.filter([]);
                    oBinding1.filter([]);
                    oBinding2.filter([]);
                    oBinding.sort(new Sorter({ path: "CreatedAt", descending: true }));
                    oBinding1.sort(new Sorter({ path: "CreatedAt", descending: true }));
                    oBinding2.sort(new Sorter({ path: "CreatedAt", descending: true }));
                    //this._fiterBarSort();
                },
                 onZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    // var oModelView = oView.getModel("oModelView");
                    // var oPainterDetail = oModelView.getProperty("/PainterDetails");
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







        });
    });
