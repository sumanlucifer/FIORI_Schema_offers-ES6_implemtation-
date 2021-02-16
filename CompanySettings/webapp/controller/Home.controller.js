sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    "sap/ui/core/library",
    "sap/ui/core/ValueState",
    "../utils/Validator",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, library, ValueState, Validator, Dialog, DialogType, Button, ButtonType, Text) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.CompanySettings.controller.Home", {
            onInit: function () {
                var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/CompanySettingsSet(1)");

                this._formFragments = {};

                // Set the initial form to be the display one
                this._showFormFragment("Display");

                 // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });
                


            },
            handleEditPress: function () {

                //Clone the data
                this._oSupplier = Object.assign({}, this.getView().bindElement("/CompanySettingsSet(1)"));
                this._toggleButtonsAndView(true);


            },

            handleCancelPress: function () {

                //Restore the data
                var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/CompanySettingsSet(1)");


                this._toggleButtonsAndView(false);

            },
            handleEmptyFields: function (oEvent) {
                this.onDialogPress();
            },

            handleSavePress: function () {
                var about = this.getView().byId("aboutChange").getValue();
                var disclaimer = this.getView().byId("disclaimerChange").getValue();
                var callCenterHelpline = this.getView().byId("callCenterChange").getValue();

                var passedValidation = this.onValidate();

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }

                var oData = {
                    AboutUs: about,
                    Disclaimer: disclaimer,
                    CallCenterHelpline: callCenterHelpline
                }

                //this._toggleButtonsAndView(false);
                console.log(oData)
                var editSet = "/CompanySettingsSet(1)";
                var oModel = this.getView().getModel("data");
                oModel.update(editSet, oData, { success: this.onSuccessPress() });

            },
            onSuccessPress: function (msg) {

                var msg = 'Saved Successfully!';
                MessageToast.show(msg);

                setTimeout(function () {
                    this._toggleButtonsAndView(false);
                }.bind(this), 1000);



            },

            _toggleButtonsAndView: function (bEdit) {
                var oView = this.getView();

                // Show the appropriate action buttons
                oView.byId("edit").setVisible(!bEdit);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);

                // Set the right form type
                this._showFormFragment(bEdit ? "Change" : "Display");
            },

            _getFormFragment: function (sFragmentName) {
                var pFormFragment = this._formFragments[sFragmentName],
                    oView = this.getView();

                if (!pFormFragment) {
                    pFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.CompanySettings.view.fragment." + sFragmentName
                    });
                    this._formFragments[sFragmentName] = pFormFragment;
                }

                return pFormFragment;
            },

            _showFormFragment: function (sFragmentName) {
                var oPage = this.byId("CompanySettings");

                oPage.removeAllContent();
                this._getFormFragment(sFragmentName).then(function (oVBox) {
                    oPage.insertContent(oVBox);
                });
            },

            onValidate: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("EditFragment"));
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
