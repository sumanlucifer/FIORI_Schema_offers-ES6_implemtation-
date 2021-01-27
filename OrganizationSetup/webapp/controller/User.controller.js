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

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.User", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditUser").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").userId),
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
            handleSuccess: function (oEvent) {
                var msg = 'Updated Successfully!';
                MessageToast.show(msg);
            },
             handleEmptyFields: function (oEvent) {
                var msg = 'Mandatory Fields Empty!';
                MessageToast.show(msg);
            },
            add: function () {
                var name = this.getView().byId("name").getValue();
                var email = this.getView().byId("email").getValue();
               
                var mobile = this.getView().byId("mobile").getValue();
                var countrycode = this.getView().byId("countrycode").getValue();
                var role = this.getView().byId("role").getSelectedKey();


                 var requiredInputs = this.returnIdListOfRequiredFields();
                var passedValidation = this.validateEventFeedbackForm(requiredInputs);
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }
                var oModel = this.getView().getModel("data");

                var oData = {
                    Name: name,
                    Email: email,
                    Mobile: mobile,
                    
                    CountryCode: countrycode,
                    RoleId: role
                }


                oModel.create("/AdminSet", oData, { success: MessageToast.show("Successfully added!") });


            },
            update: function () {
                var name = this.getView().byId("name").getValue();
                var email = this.getView().byId("email").getValue();
               
                var mobile = this.getView().byId("mobile").getValue();
                var countrycode = this.getView().byId("countrycode").getValue();
                var role = this.getView().byId("role").getSelectedKey();

                var requiredInputs = this.returnIdListOfRequiredFields();
                var passedValidation = this.validateEventFeedbackForm(requiredInputs);
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }

                var oModel = this.getView().getModel("data");

                var oData = {
                    Name: name,
                    Email: email,
                    Mobile: mobile,
                    
                    CountryCode: countrycode,
                    RoleId: role
                }
                console.log(oData);

                var editSet = this.getView().getBindingContext("data").getPath();

                oModel.update(editSet, oData, { success: MessageToast.show("Successfully updated!") });


            },
            //validation
             returnIdListOfRequiredFields: function () {
                let requiredInputs;
                return requiredInputs = ['name', 'email', 'mobile', 'countrycode'];
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
