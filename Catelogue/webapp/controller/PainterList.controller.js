sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"


], /**
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
 * @param {typeof sap.ui.core.routing.History} History 
 * @param {typeof sap.ui.model.Filter} Filter 
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
 */
    function (BaseController, JSONModel, History, formatter,Filter,FilterOperator) {
        "use strict";


        return BaseController.extend("com.knpl.pragati.Catelogue.controller.PainterList", {

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

                var oModel = new JSONModel({
                busy: true,
                filterBar: {
                    search: ""
                }
            });
            this.getView().setModel(oModel, "ViewModel");

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

                this.sObjectId = oEvent.getParameter("arguments").catalogueId;
                this._bindView(this.sObjectId);


            },
            _bindView: function (sObjectId) {

                var binding = this.getView().byId("idPaintersTable").getBinding("items");

                var filters = [(new sap.ui.model.Filter("ProductCatalogueId", sap.ui.model.FilterOperator.EQ, sObjectId)),
                (new sap.ui.model.Filter("IsViewed", sap.ui.model.FilterOperator.EQ, true))];

                binding.filter(filters);

            },
            onSearch: function (oEvent) {
            var aFilterControls = oEvent.getParameter("selectionSet");
            var aFilters = [], sValue;
            for (var i = 0; i < aFilterControls.length; i++) {
                var oControl = aFilterControls[i];
                var sControlName = oControl.getCustomData("filterName")[0].getValue();
                switch (sControlName) {
                    case "Search":
                        sValue = oControl.getValue();
                        if (sValue && sValue !== "") {
                            aFilters.push(new Filter([
                                //new Filter({ path: "ProductCatalogueId", operator: FilterOperator.Contains, value1: this.sObjectId,caseSensitive: false }),
                               // new Filter({ path: "IsViewed", operator: FilterOperator.Contains, value1: true, caseSensitive: false }),
                                new Filter({ path: "Painter/Name", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false })
                                //new Filter({ path: "Painter/Membershipcard", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }),
                                //new Filter({ path: "ProductCompetitors/CompetitorProductName", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false })
                            ], false));
                            }
                        }
                     }
                       if (aFilters.length > 0) {
                                this.oFilter = new Filter({
                                    filters: aFilters,
                                    and: true,
                                });
                         } else {
                                this.oFilter = null;
                                }

                            var binding = this.getView().byId("idPaintersTable").getBinding("items");
                            binding.filter(this.oFilter);
                },
            onPressBreadcrumbLink: function () {
                 this._navToHome();
            }


        });

    });