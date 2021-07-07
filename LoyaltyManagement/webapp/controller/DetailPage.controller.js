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

        return BaseController.extend("com.knpl.pragati.LoyaltyManagement.controller.DetailPage", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);

                this.KNPLModel = this.getComponentModel();

            },

            _onObjectMatched: function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").Id;

                var sObjectPath = this.KNPLModel.createKey("PainterPointsHistorySet", {
                    Id: sObjectId
                });

                this._bindView("/" + sObjectPath);
            },
            _bindView: function (sObjectPath) {
                this.getView().bindElement({
                    path: sObjectPath,
                     parameters: {
                            expand: "Painter,PainterTokenScanHistory,PainterTrainingPointHistory,PainterLearningPointHistory,PainterReferralHistory,ProductDetails"
                            },



                });
            },
            onPressBreadcrumbLink: function () {
               this.oRouter.navTo("RouteLandingPage");
            },



        });
    });
