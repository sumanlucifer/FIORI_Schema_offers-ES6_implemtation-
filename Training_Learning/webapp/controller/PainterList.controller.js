sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"



], /**
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
 * @param {typeof sap.ui.core.routing.History} History 
 * @param {typeof sap.ui.model.Filter} Filter 
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
 */
    function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageBox, MessageToast, Export, ExportTypeCSV) {
        "use strict";


        return BaseController.extend("com.knpl.pragati.Training_Learning.controller.PainterList", {

            formatter: formatter,
            /* =========================================================== */
            /* lifecycle methods                                           */
            /* =========================================================== */

            /**
             * Called when the worklist controller is instantiated.
             * @public
             */
            onInit: function () {

                this.getRouter().getRoute("PainterList").attachPatternMatched(this._onObjectMatched, this);

                var oModelCtrl = new JSONModel({
                    busy: true,
                    t1Visible: false,
                    t2Visible: false,
                });
                this.getView().setModel(oModelCtrl, "oModelControl");

            },

            /* =========================================================== */
            /* event handlers                                              */
            /* =========================================================== */

            /* =========================================================== */
            /* internal methods                                            */
            /* =========================================================== */

            /**
             * Binds the view to the object path.
             * @function
             * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
             * @private
             */
            _onObjectMatched: function (oEvent) {
                 var oCtrlModel=this.getView().getModel("oModelControl");
                 oCtrlModel.setProperty("/t1Visible",false);
                 oCtrlModel.setProperty("/t2Visible",false);
                this.sObjectId = oEvent.getParameter("arguments").trainingId;
                this.sObjectType = oEvent.getParameter("arguments").trtype;
                this._bindView(this.sObjectId, this.sObjectType);


            },
            _bindView: function (sObjectId) {
                var oCtrlModel=this.getView().getModel("oModelControl");
                if (this.sObjectType == 3) {
                    oCtrlModel.setProperty("/t1Visible",true);
                    var aFilters = [(new sap.ui.model.Filter("LearningId", sap.ui.model.FilterOperator.EQ, sObjectId)),
                    (new sap.ui.model.Filter("IsQuestionnaireSubmitted ", sap.ui.model.FilterOperator.EQ, true))];

                    this.oFilter = new Filter({
                        filters: aFilters,
                        and: true,
                    });
                    var smartTable = this.getView().byId("idPainterTable");

                    if (smartTable.isInitialised())
                        smartTable.rebindTable();
                    else
                        smartTable.attachInitialise(function () {
                            smartTable.rebindTable()
                        }, this);
                }
                else {
                    oCtrlModel.setProperty("/t2Visible",true);
                    var aFilters = [(new sap.ui.model.Filter("TrainingId", sap.ui.model.FilterOperator.EQ, sObjectId)),
                    (new sap.ui.model.Filter("IsQuestionnaireSubmitted ", sap.ui.model.FilterOperator.EQ, true))];

                    this.oFilter = new Filter({
                        filters: aFilters,
                        and: true,
                    });
                    var smartTable = this.getView().byId("idPainterTable2");

                    if (smartTable.isInitialised())
                        smartTable.rebindTable();
                    else
                        smartTable.attachInitialise(function () {
                            smartTable.rebindTable()
                        }, this);
                }




            },

            fnrebindTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.sorter.push(new sap.ui.model.Sorter('Id', true));
                oBindingParams.parameters["expand"] = "PainterDetails,PainterDetails/Division,PainterDetails/Depot";
                if (this.oFilter)
                    oBindingParams.filters.push(this.oFilter);
            },


            onPressBreadcrumbLink: function () {
                this.getRouter().navTo("worklist");
            },

        });

    });
