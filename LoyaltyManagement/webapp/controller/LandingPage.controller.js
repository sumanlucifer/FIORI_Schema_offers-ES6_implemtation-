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

                var oModel = new JSONModel({
                    TotalCount: 0,
                    busy: true,
                    filterBar: {
                        search: "",
                        createdAt: ""
                    }
                });
                this.getView().setModel(oModel, "ViewModel");



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
                //                 new Filter("PointTransactionType", sap.ui.model.FilterOperator.EQ, "Redemption")
                //             ], and: false
                //         })
                //     ]
                // }));
            },

            onSearch: function (oEvent) {
                var aFilterControls = oEvent.getParameter("selectionSet");
                var aFilters = [], sValue;
                for (var i = 0; i < aFilterControls.length; i++) {
                    var oControl = aFilterControls[i];
                    console.log(oControl);
                    var sControlName = oControl.getCustomData("filterName")[0].getValue();
                    switch (sControlName) {
                        case "Search":
                            sValue = oControl.getValue();
                            if (sValue && sValue !== "") {
                                aFilters.push(new Filter([
                                    new Filter({ path: "Painter/Name", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }),
                                    new Filter({ path: "Painter/Mobile", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }),
                                    new Filter({ path: "PointTransactionType", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false })
                                ], false));
                            }
                            break;
                        case "Creation Date":
                            sValue = oControl.getValue();
                            if (sValue && sValue !== "") {
                                aFilters.push(new Filter({
                                    path: "CreatedAt",
                                    operator: FilterOperator.BT,
                                    value1: sValue + "T00:00:00",
                                    value2: sValue + "T23:59:59"
                                }));
                            }
                            break;
                        // case "Request Type":
                        //     sValue = oControl.getSelectedKey();
                        //     if (sValue && sValue !== "") {
                        //         aFilters.push(new Filter({ path: "PointTransactionType", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }));
                        //     }
                        //     break;
                        // case "Created By":
                        //     sValue = oControl.getValue();
                        //     if (sValue && sValue !== "") {
                        //         aFilters.push(new Filter({ path: "CreatedByDetails/Name", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }));
                        //     }
                        //     break;
                    }
                }

                var oTable = this.getView().byId("idAllRequestTable");
                var oBinding = oTable.getBinding("items");
                if (aFilters.length > 0) {
                    var oFilter = new Filter({
                        filters: aFilters,
                        and: true,
                    });
                    oBinding.filter(oFilter);
                } else {
                    oBinding.filter([]);
                }
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




        });
    });
