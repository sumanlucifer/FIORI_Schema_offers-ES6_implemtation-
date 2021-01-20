sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device'
],
    function (Controller, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device) {
        "use strict";

        return Controller.extend("com.knpl.pragati.DealerManagement.controller.DealerDetails", {
            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getRoute("RouteDetailsPage").attachPatternMatched(this._onObjectMatched, this);
                this.KNPLModel = this.getOwnerComponent().getModel("KNPLModel");
            },

            _onObjectMatched: function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").dealerID;
                this.KNPLModel.metadataLoaded().then(function () {
                    var sObjectPath = this.KNPLModel.createKey("PainterSet", {
                        Id: sObjectId
                    });
                    this._bindView("/" + sObjectPath);
                }.bind(this));
            },

            _bindView: function (sObjectPath) {
                this.getView().bindElement({
                    path: sObjectPath,
                    model: "KNPLModel"
                });
            }
        });
    });
