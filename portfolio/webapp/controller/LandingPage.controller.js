sap.ui.define(
    [
        "../controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "../controller/Validator",
        "sap/ui/core/ValueState",
        "../model/formatter",
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
        Validator,
        ValueState,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.portfolio.controller.LandingPage", {
                formatter: formatter,

                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    //oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
                    sap.ui.getCore().attachValidationError(function (oEvent) {
                        if (oEvent.getParameter("element").getRequired()) {
                            oEvent.getParameter("element").setValueState(ValueState.Error);
                        } else {
                            oEvent.getParameter("element").setValueState(ValueState.None);
                        }
                    });
                    sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                        oEvent.getParameter("element").setValueState(ValueState.None);
                    });

                },
                _onRouteMatched: function (oEvent) {
                    // var sId = window.decodeURIComponent(
                    //     oEvent.getParameter("arguments").Id
                    // );
                    // var sMode = window.decodeURIComponent(
                    //     oEvent.getParameter("arguments").Mode
                    // );
                    //this._SetDisplayData(sId, sMode);

                },
                onComplaintTypeChange: function(oEvent) {
                    var complaintTypeId=oEvent.getParameter("selectedItem").getKey();
                    console.log(complaintTypeId);
                    var binding = this.getView().byId("IdComplaintSubtype").getBinding("items");
                         //binding.aFilters = null;
                    var filters = [new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, complaintTypeId) ]; 
                    var oFilter1 = new sap.ui.model.Filter({aFilters:filters}); 
                    binding.filter(oFilter1);
                    this.getView().byId("IdComplaintSubtype").getModel().updateBindings(true);
        

                }

              
               
                
                

                
                


            }

        );
    }
);