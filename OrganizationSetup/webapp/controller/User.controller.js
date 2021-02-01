sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    'sap/m/MessageToast',
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Fragment"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast, BindingMode, Message, library, Fragment) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.User", {
            onInit: function () {



                var oMessageManager, oView;

                oView = this.getView();
                // set message model
                oMessageManager = sap.ui.getCore().getMessageManager();
                oView.setModel(oMessageManager.getMessageModel(), "message");

                oMessageManager.registerObject(oView, true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditUser").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").userId),
                    model: "data"
                });


            },

            _getMessagePopover: function () {
                var oView = this.getView();

                // create popover lazily (singleton)
                if (!this._pMessagePopover) {
                    this._pMessagePopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.OrganizationSetup.view.MessagePopover"
                    }).then(function (oMessagePopover) {
                        oView.addDependent(oMessagePopover);
                        return oMessagePopover;
                    });
                }
                return this._pMessagePopover;
            },
            onMessagePopoverPress: function (oEvent) {
                var oSourceControl = oEvent.getSource();
                this._getMessagePopover().then(function (oMessagePopover) {
                    oMessagePopover.openBy(oSourceControl);
                });
            },

            onSuccessPress: function (msg) {
                var oMessage = new Message({
                    message: msg,
                    type: MessageType.Success,
                    target: "/Dummy",
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            },
            onErrorPress: function () {
                var oMessage = new Message({
                    message: "Mandatory Fields Empty!",
                    type: MessageType.Error,
                    target: "/Dummy",
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
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
                var oModel = this.getView().getModel("data");
                oModel.refresh();

                // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                // oRouter.navTo("RouteHome");
            },
            handleEmptyFields: function (oEvent) {

                this.onErrorPress();
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


                oModel.create("/AdminSet", oData, { success: this.onSuccessPress("Successfully created!") });


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

                oModel.update(editSet, oData, { success: this.onSuccessPress("Successfully Updated!")});


            },
            returnIdListOfRequiredFields: function () {
                let requiredInputs;
                return requiredInputs = ['name', 'email', 'mobile', 'countrycode', 'role'];
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

            onClearPress: function () {
                // does not remove the manually set ValueStateText we set in onValueStatePress():
                sap.ui.getCore().getMessageManager().removeAllMessages();

            },
            onCancelPress: function () {
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("RouteHome");

            }



        });
    });
