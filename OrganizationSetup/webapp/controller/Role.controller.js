sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/BindingMode",
    'sap/m/MessageToast',
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Fragment"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent,BindingMode, MessageToast,Message,library,Fragment) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.Role", {
            onInit: function () {


                var oMessageManager, oView;

                oView = this.getView();
                // set message model
                oMessageManager = sap.ui.getCore().getMessageManager();
                oView.setModel(oMessageManager.getMessageModel(), "message");

                oMessageManager.registerObject(oView, true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditRole").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").roleId),
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
                    message: "Mandatory Fields Are Empty!",
                    type: MessageType.Error,
                    target: "/Dummy",
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            },
             handleEmptyFields: function (oEvent) {
                this.onErrorPress();
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
            add: function () {
                var role = this.getView().byId("role").getValue();
                var description = this.getView().byId("description").getValue();
                // var dialcode= this.getView().byId("dialcode").getValue();
                // var mobile= this.getView().byId("mobile").getValue();
                // var countrycode= this.getView().byId("countrycode").getValue();

                var oModel = this.getView().getModel("data");
                var description = this.getView().byId("description").getValue();

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

                oModel.create("/MasterAdminRoleSet", oData,  { success: this.onSuccessPress("Successfully created!") });


            },
            update: function () {

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

                var editSet = this.getView().getBindingContext("data").getPath();

                oModel.update(editSet, oData, { success: this.onSuccessPress("Successfully Updated!") });
            },
            //validation
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
            onClearPress : function () {
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();
        },
        onCancelPress : function () {
             
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("RouteHome");

        }
        });
    });
