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
    "sap/ui/core/util/ExportTypeCSV",




], /**
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
 * @param {typeof sap.ui.core.routing.History} History 
 * @param {typeof sap.ui.model.Filter} Filter 
 * @param {typeof sap.ui.model.FilterOperator} FilterOperator 
 */
    function (BaseController, JSONModel, History, formatter,Filter,FilterOperator,MessageBox,MessageToast,Export,ExportTypeCSV) {
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

              //  var binding = this.getView().byId("idPaintersTable").getBinding("items");

                var aFilters =  [(new sap.ui.model.Filter("ProductCatalogueId", sap.ui.model.FilterOperator.EQ, sObjectId)),
                (new sap.ui.model.Filter("IsViewed", sap.ui.model.FilterOperator.EQ, true))];

                 this.oFilter = new Filter({
                    filters: aFilters,
                    and: true,
                });
                var smartTable = this.getView().byId("idPainterTable");

                if(smartTable.isInitialised())
                         smartTable.rebindTable();
                else    
                        smartTable.attachInitialise(function(){
                                smartTable.rebindTable()
                        }, this);

            },
            // onSearch: function (oEvent) {
            // var aFilterControls = oEvent.getParameter("selectionSet");
            // var aFilters = [], sValue;
            // for (var i = 0; i < aFilterControls.length; i++) {
            //     var oControl = aFilterControls[i];
            //     var sControlName = oControl.getCustomData("filterName")[0].getValue();
            //     switch (sControlName) {
            //         case "Search":
            //             sValue = oControl.getValue();
            //             if (sValue && sValue !== "") {
            //                 aFilters.push(new Filter([
            //                     //new Filter({ path: "ProductCatalogueId", operator: FilterOperator.Contains, value1: this.sObjectId,caseSensitive: false }),
            //                    // new Filter({ path: "IsViewed", operator: FilterOperator.Contains, value1: true, caseSensitive: false }),
            //                     new Filter({ path: "Painter/Name", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false })
            //                     //new Filter({ path: "Painter/Membershipcard", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false }),
            //                     //new Filter({ path: "ProductCompetitors/CompetitorProductName", operator: FilterOperator.Contains, value1: sValue.trim(), caseSensitive: false })
            //                 ], false));
            //                 }
            //             }
            //          }
            //            if (aFilters.length > 0) {
            //                     this.oFilter = new Filter({
            //                         filters: aFilters,
            //                         and: true,
            //                     });
            //              } else {
            //                     this.oFilter = null;
            //                     }

            //                 var binding = this.getView().byId("idPaintersTable").getBinding("items");
            //                 binding.filter(this.oFilter);
            //     },
            onPressBreadcrumbLink: function () {
                 this._navToHome();
            },

            fnrebindTable: function (oEvent) {

            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.sorter.push(new sap.ui.model.Sorter('Id', true));
            oBindingParams.parameters["expand"] = "Painter,Painter/Division,Painter/Depot";
            if(this.oFilter)
                oBindingParams.filters.push(this.oFilter);            
        },

        onExportCSV: function () {
               
                    
                    var that = this;
                    // var trainingId = this.getModel("oModelView").getProperty("/TrainingDetails/Id");
                    var aFilters = new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter('ProductCatalogueId', sap.ui.model.FilterOperator.EQ, this.sObjectId),
                            new sap.ui.model.Filter('IsViewed', sap.ui.model.FilterOperator.EQ, true)
                        ],
                        and: true
                    });
                    that.getModel().read("/ProductCatalogueViewerSet", {
                        urlParameters: {
                            "$expand": "Painter,Painter/Division,Painter/Depot"
                        },
                        filters: [aFilters],
                        success: function (data) {
                             that.getModel("ViewModel").setProperty("/PainterList", data.results);

                            var oExport = new Export({
                                // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                                exportType: new ExportTypeCSV({
                                    separatorChar: ";"
                                }),
                                // Pass in the model created above
                                models: that.getView().getModel("ViewModel"),

                                // binding information for the rows aggregation
                                rows: {
                                    path: "/PainterList"
                                },

                                // column definitions with column name and binding info for the content

                                columns: [{
                                    name: "Name",
                                    template: {
                                        content: "{Painter/Name}"
                                    }
                                }, {
                                    name: "Membership Id",
                                    template: {
                                        content: "{Painter/MembershipCard}"
                                    }
                                }, {
                                    name: "Mobile Number",
                                    template: {
                                        content: "{Painter/Mobile}"
                                    }
                                }, {
                                    name: "Zone",
                                    template: {
                                        content: "{Painter/Division/Zone}"
                                    }
                                }, {
                                    name: "Division",
                                    template: {
                                        content: "{Painter/Depot/Division}"
                                    }
                                }, {
                                    name: "Depot",
                                    template: {
                                        content: "{Painter/Depot/Depot}"
                                    }
                                }
                                ]
                            });

                            // download exported file
                            oExport.saveFile().catch(function (oError) {
                                MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                            }).then(function () {
                                oExport.destroy();
                            });
                        }
                    });
                }


        });

    });
