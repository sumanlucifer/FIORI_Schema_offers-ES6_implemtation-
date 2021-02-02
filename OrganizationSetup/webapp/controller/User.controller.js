sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    'sap/m/MessageToast',
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "../utils/Validator",
    "sap/ui/model/json/JSONModel",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast, BindingMode, Message, library, Fragment,
        ValueState, Validator, JSONModel) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.User", {
            onInit: function () {
               

                // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });
                // JSON dummy data
                var oData = {
                    name: null,
                    email: null,
                    mobile: null,
                    countrycode: null,
                    role: null
                };

                var oModel = new JSONModel();
                oModel.setData(oData);

                this.getView().setModel(oModel);



                var oMessageManager, oView;

                oView = this.getView();
                // set message model
                oMessageManager = sap.ui.getCore().getMessageManager();
                oView.setModel(oMessageManager.getMessageModel(), "message");

                oMessageManager.registerObject(oView, true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditUser").attachPatternMatched(this._onObjectMatched, this);

            },
            onAfterRendering: function () {
                 this.onClearPress();

            },
            _onObjectMatched: function (oEvent) {

                sap.ui.getCore().getMessageManager().removeAllMessages();

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

                this.onClearPress();

                var oMessage = new Message({
                    message: msg,
                    type: MessageType.Success,
                    target: "/Dummy",
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);

                var oModel = this.getView().getModel("data");
                oModel.refresh();
                
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

                var passedValidation = this.onValidateAdd();

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

                var passedValidation = this.onValidateEdit();

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
                // console.log(oData);

                var editSet = this.getView().getBindingContext("data").getPath();

                oModel.update(editSet, oData, { success: this.onSuccessPress("Successfully Updated!") });


            },

            onClearPress: function () {
                // does not remove the manually set ValueStateText we set in onValueStatePress():
                sap.ui.getCore().getMessageManager().removeAllMessages();

            },
            onCancelPress: function () {


                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("RouteHome");

            },
            onValidateEdit: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("editUser"));
            },
            onValidateAdd: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("addUser"));
            }



        });
    });
