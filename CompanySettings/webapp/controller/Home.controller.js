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
    "sap/m/Text",
    "sap/ui/model/json/JSONModel"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, library, ValueState, Validator, Dialog, DialogType, Button, ButtonType, Text,
        JSONModel) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        var DisclaimerVersion;

        return Controller.extend("com.knpl.pragati.CompanySettings.controller.Home", {
            onInit: function () {
                var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/MasterCompanySettingsSet(1)");

                

                // this._formFragments = {};

                // Set the initial form to be the display one
                // this._showFormFragment("Display");

                // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });

                var oViewModel = new JSONModel({
                    about: "",
                    disclaimer: "",
                    callcenter: "",
                });
                this.getView().setModel(oViewModel, "oModelView");


                var oLocaModel = new JSONModel({
                    bEdit: false
                });
                this.getView().setModel(oLocaModel, "local");




            },
            handleEditPress: function () {
                this.getView().getModel("local").setProperty("/bEdit", true);

                //Clone the data
                this._oSupplier = Object.assign({}, this.getView().bindElement("/MasterCompanySettingsSet(1)"));
                this._toggleButtonsAndView(true);


            },

            handleCancelPress: function () {

                this.getView().getModel("local").setProperty("/bEdit", false);

                //Restore the data
                var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/MasterCompanySettingsSet(1)");


                this._toggleButtonsAndView(false);

            },
            handleEmptyFields: function (oEvent) {
                console.log("empty");
                this.onDialogPress();
            },

            handleSavePress: function () {

                console.log(DisclaimerVersion);

                var oDataModel = this.getView().getModel();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                oModelView.setProperty("/busy", true);
                var sEntityPath = oView.getElementBinding().getPath();
                var oDataValue = oDataModel.getObject(sEntityPath);
                //var oPrpReq = oModelView.getProperty("/prop2");




                var passedValidation = this.onValidate();

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }
              

               

                var oData = {
                    AboutUs: oDataValue["AboutUs"],
                    Disclaimer: oDataValue["Disclaimer"],
                    CallCenterHelpline: oDataValue["CallCenterHelpline"],
                    DisclaimerVersion:oDataValue["DisclaimerVersion"]+1,
                }


                console.log(oData);
                var that=this;
                var editSet = "/MasterCompanySettingsSet(1)";
                var oModel = this.getView().getModel("data");
                oModel.update(editSet, oData, { success:function() {
                    that.onSuccessPress()
                } });
                 

            },
            onSuccessPress: function (msg) {

                var msg = 'Saved Successfully!';
                MessageToast.show(msg);

                setTimeout(function () {
                    this.getView().getModel("local").setProperty("/bEdit", false);
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
            }



        });
    });
