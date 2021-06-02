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

                // var oModel = new JSONModel({
                //     TotalCount: 0,
                //     busy: true,
                //     filterBar: {
                //         search: "",
                //         createdAt: ""
                //     }
                // });
                // this.getView().setModel(oModel, "ViewModel");

                 var oDataControl = {
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

                //  var oTableRedemption = this.getView().byId("idRedemptionRequestTable");
                // oTableRedemption.getBinding("items").filter(new Filter({
                //     filters: [
                //         new Filter({
                //             filters: [
                //                 new Filter("PointTransactionType", sap.ui.model.FilterOperator.NE, "ACCRUED")
                //             ], and: false
                //         })
                //     ]
                // }));
            },

            // onSearch: function (oEvent) {
            //     var aFilterControls = oEvent.getParameter("selectionSet");
            //     var aFilters = [], sValue;
            //     for (var i = 0; i < aFilterControls.length; i++) {
            //         var oControl = aFilterControls[i];
            //         console.log(oControl);
            //         var sControlName = oControl.getCustomData("filterName")[0].getValue();
            //         switch (sControlName) {
            //             case "Search":
            //                 sValue = oControl.getValue();
            //                 if (sValue && sValue !== "") {
            //                     aFilters.push(new Filter([
            //                         new Filter({ path: "Painter/Name", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }),
            //                         new Filter({ path: "Painter/Mobile", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }),
            //                         new Filter({ path: "PointTransactionType", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false })
            //                     ], false));
            //                 }
            //                 break;
            //             case "Creation Date":
            //                 sValue = oControl.getValue();
            //                 if (sValue && sValue !== "") {
                                
            //                     aFilters.push(new Filter({
            //                         path: "CreatedAt",
            //                         operator: FilterOperator.BT,
            //                         value1: sValue + "T00:00:00",
            //                         value2: sValue + "T23:59:59"
            //                     }));
            //                 }
            //                 break;
            //             // case "Request Type":
            //             //     sValue = oControl.getSelectedKey();
            //             //     if (sValue && sValue !== "") {
            //             //         aFilters.push(new Filter({ path: "PointTransactionType", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }));
            //             //     }
            //             //     break;
            //             // case "Created By":
            //             //     sValue = oControl.getValue();
            //             //     if (sValue && sValue !== "") {
            //             //         aFilters.push(new Filter({ path: "CreatedByDetails/Name", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }));
            //             //     }
            //             //     break;
            //         }
            //     }

            //     var oTable = this.getView().byId("idAllRequestTable");
            //     var oBinding = oTable.getBinding("items");
            //     if (aFilters.length > 0) {
            //         var oFilter = new Filter({
            //             filters: aFilters,
            //             and: true,
            //         });
            //         oBinding.filter(oFilter);
            //     } else {
            //         oBinding.filter([]);
            //     }
            // },
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
                            } else if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
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






        });
    });
