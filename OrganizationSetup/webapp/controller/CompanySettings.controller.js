sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/richtexteditor/RichTextEditor",
    'sap/m/MessageToast',
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "../utils/Validator",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, RichTextEditor, MessageToast, Message, library, Fragment,
        ValueState, Validator, JSONModel, Dialog, DialogType, Button, ButtonType, Text) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.CompanySettings", {
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
                    about: null,
                    disclaimer: null,
                    callcenter: null,

                };

                var oModel = new JSONModel();
                oModel.setData(oData);

                this.getView().setModel(oModel);

                // var oMessageManager, oView;

                // oView = this.getView();
                // // set message model
                // oMessageManager = sap.ui.getCore().getMessageManager();
                // oView.setModel(oMessageManager.getMessageModel(), "message");

                // oMessageManager.registerObject(oView, true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditCompanySettings").attachPatternMatched(this._onObjectMatched, this);




            },
            onAfterRendering: function () {
                this.onClearPress();

            },


            _onObjectMatched: function (oEvent) {

                sap.ui.getCore().getMessageManager().removeAllMessages();

                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").settingsId),
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

                // var oMessage = new Message({
                //     message: msg,
                //     type: MessageType.Success,
                //     target: "/Dummy",
                //     processor: this.getView().getModel()
                // });
                // sap.ui.getCore().getMessageManager().addMessages(oMessage);
                // var oModel = this.getView().getModel("data");
                // oModel.refresh();
                var msg = 'Saved Successfully!';
                MessageToast.show(msg);



                setTimeout(function () {
                    this.onCancelPress();
                }.bind(this), 1000);
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
                this.onDialogPress();
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
                var disclaimer = this.getView().byId("disclaimer").getValue();
                var aboutUs = this.getView().byId("about").getValue();
                var callCenterNo = this.getView().byId("callcenter").getValue();

                var passedValidation = this.onValidateAdd();

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }

                var oData = {

                    AboutUs: aboutUs,
                    Disclaimer: disclaimer,
                    CallCenterHelpline: callCenterNo


                }
                var oModel = this.getView().getModel("data");
                //console.log(oData);
                oModel.create("/CompanySettingsSet", oData, { success: this.onSuccessPress("Successfully created!") });


            },
            update: function () {

                var disclaimer = this.getView().byId("disclaimer").getValue();
                var aboutUs = this.getView().byId("about").getValue();
                var callCenterNo = this.getView().byId("callcenter").getValue();

                var passedValidation = this.onValidateEdit();

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }



                var oModel = this.getView().getModel("data");


                var oData = {

                    AboutUs: aboutUs,
                    Disclaimer: disclaimer,
                    CallCenterHelpline: callCenterNo

                }
                //console.log(oData);

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

                var oModel = this.getView().getModel("data");
                oModel.refresh();

            },
            onValidateEdit: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("editCompanySettings"));
            },
            onValidateAdd: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("addCompanySettings"));
            },
            onDialogPress: function () {
                if (!this.oEscapePreventDialog) {
                    this.oEscapePreventDialog = new Dialog({
                        title: "Error",
                        content: new Text({ text: "Mandatory Fields Are Empty!" }),
                        type: DialogType.Message,
                        buttons: [
                            new Button({
                                text: "Close",
                                press: function () {
                                    this.oEscapePreventDialog.close();
                                }.bind(this)
                            })
                        ]

                    });
                }

                this.oEscapePreventDialog.open();
            },


        });
    });
