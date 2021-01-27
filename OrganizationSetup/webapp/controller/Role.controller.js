sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    'sap/m/MessageToast'
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast) {
        "use strict";

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.Role", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditRole").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").roleId),
                    model: "data"
                });



            },
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteHome", {}, true);
                }
            },
            handleEmptyFields: function (oEvent) {
                var msg = 'Mandatory Fields Empty!';
                MessageToast.show(msg);
            },
            add: function () {
                var role = this.getView().byId("role").getValue();
                var description = this.getView().byId("description").getValue();

                var requiredInputs = this.returnIdListOfRequiredFields();
                var passedValidation = this.validateEventFeedbackForm(requiredInputs);
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }


                var oModel = this.getView().getModel("data");

                var oData = {
                    Role: role,
                    Description: description


                }

                oModel.create("/MasterAdminRoleSet", oData, { success: MessageToast.show("Successfully added!") });


            },
            update: function () {

                var role = this.getView().byId("role").getValue();
                var description = this.getView().byId("description").getValue();

                var oModel = this.getView().getModel("data");

                var requiredInputs = this.returnIdListOfRequiredFields();
                var passedValidation = this.validateEventFeedbackForm(requiredInputs);
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }


                var oData = {
                    Role: role,
                    Description: description

                }

                var editSet = this.getView().getBindingContext("data").getPath();

                oModel.update(editSet, oData, { success: MessageToast.show("Successfully updated!") });
            },
            returnIdListOfRequiredFields: function () {
                let requiredInputs;
                return requiredInputs = ['role', 'description'];
            },

            validateEventFeedbackForm: function (requiredInputs) {
                var _self = this;
                var valid = true;
                requiredInputs.forEach(function (input) {
                    var sInput = _self.getView().byId(input);
                    if (sInput.getValue() == "" || sInput.getValue() == undefined) {
                        valid = false;
                        sInput.setValueState("Error");
                    }
                    else {
                        sInput.setValueState("None");
                    }
                });
                return valid;
            },
        });
    });
