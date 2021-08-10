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

        return Controller.extend("com.knpl.pragati.CompanySettings.controller.EditTextContent", {
            onInit: function () {


                this.richtexteditor;


                var ctrls = {
                    bEditText: false,
                    bToggle:false
                }

                var oData = {
                    AboutUs: null,
                    Disclaimer: null,
                    CallCenterHelpline: "",
                    DisclaimerVersion: null,
                    IsOfferEnabled:false,
                    IsRedemptionEnabled:false,
                    bBusy: true
                }
                var oViewModel = new JSONModel(oData);
                this.getView().setModel(oViewModel, "ActionEditModel");

                var oCtrlModel = new JSONModel(ctrls);
                this.getView().setModel(oCtrlModel, "oCtrlModel");

                this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;
                this.rteAbout = this.getView().byId("rteAbout");
                this.rteDisclaimer = this.getView().byId("rteDisclaimer");


                // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });



                var oLocaModel = new JSONModel({
                    bEdit: false,
                    Catalogue: []
                });
                this.getView().setModel(oLocaModel, "local");

                this._property = "MasterCompanySettingsSet(1)";
                this.entitySet;

                this.getOwnerComponent().getRouter().getRoute("EditTextContent").attachPatternMatched(this._onObjectMatched, this);
                // this.initData();



            },
            _onObjectMatched: function () {
                this.rtePromise.then(this.initData.bind(this));
                //this.initData();

            },

            initData: function () {

                //var that = this;
                var oActionModel=this.getView().getModel("ActionEditModel");
                this.getOwnerComponent().getModel().read("/MasterCompanySettingsSet(1)", {
                    success: function (data, response) {
                        // that.entitySet = data;
                        // oData.AboutUs = data.AboutUs
                        // oData.Disclaimer = data.Disclaimer
                        // oData.CallCenterHelpline = data.CallCenterHelpline
                        // oData.DisclaimerVersion = data.DisclaimerVersion
                        //  var oViewModel = new JSONModel(oData);
                        // that.getView().setModel(oViewModel, "ActionEditModel");
                        //that.getView().getModel("ActionEditModel").setData(data);
                        setTimeout(() => {
                            oActionModel.setProperty("/AboutUs", data.AboutUs);
                            oActionModel.setProperty("/Disclaimer", data.Disclaimer);
                            oActionModel.setProperty("/CallCenterHelpline", data.CallCenterHelpline);
                            oActionModel.setProperty("/DisclaimerVersion", data.DisclaimerVersion);
                            oActionModel.setProperty("/IsOfferEnabled", data.IsOfferEnabled);
                            oActionModel.setProperty("/IsRedemptionEnabled", data.IsRedemptionEnabled);
                            oActionModel.setProperty("/bBusy", false);
                        }, 1000);

                    },
                    error: function (oError) {
                    }
                });



            },
            onAfterRendering: function () {
                this._addRTE(["AboutUs", "Disclaimer"]);
            },

            _addRTE: function (aPaths) {
                var that = this;
                this.rtePromise = new Promise(function (res, rej) {
                    sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library", "sap/m/Title"],
                        function (RTE, EditorType, Title) {
                            aPaths.forEach((element, index) => {
                                if (element == "AboutUs") {
                                    var title = "About Us"
                                }
                                else if (element == "Disclaimer") {
                                    title = "Privacy Policy"
                                }

                                that.getView().byId("idVerticalLayout").addContent(
                                    new Title({
                                        text: title

                                    }));
                                that.getView().byId("idVerticalLayout").addContent(
                                    new RTE({
                                        width: "100%",
                                        value: "{ActionEditModel>/" + element + "}"

                                    }));
                                if (index == 1) {
                                    res();
                                }

                            });



                        });
                })

            },
            handleEditPress: function () {
                this.getView().getModel("local").setProperty("/bEdit", true);


                //Clone the data
                this._oSupplier = Object.assign({}, this.getView().bindElement("/MasterCompanySettingsSet(1)"));
                this._toggleButtonsAndView(true);


            },
            onEditTextContent: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EditTextContent");

            },

            handleCancelPress: function () {

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");

            },
            handleEmptyFields: function (oEvent) {
                console.log("empty");
                this.onDialogPress();
            },
            onReadyDisclaimer: function (oEvent) {
                // var oe= oEvent.getSource().getProperty("value");
                var Disclaimer = this.getView().getModel("ActionEditModel").getProperty("/Disclaimer");
                this.rteDisclaimer.setValue(Disclaimer);

            },
            onReadyAbout: function (oEvent) {
                // var oe= oEvent.getSource().getProperty("value");
                var About = this.getView().getModel("ActionEditModel").getProperty("/AboutUs");
                this.rteAbout.setValue(About);

            },

            handleSavePress: function () {

                var oActionModel = this.getView().getModel("ActionEditModel");
                var oDataValue = {
                    AboutUs: oActionModel.getProperty("/AboutUs"),
                    Disclaimer: oActionModel.getProperty("/Disclaimer"),
                    CallCenterHelpline: oActionModel.getProperty("/CallCenterHelpline"),
                    DisclaimerVersion: oActionModel.getProperty("/DisclaimerVersion"),
                    IsOfferEnabled:oActionModel.getProperty("/IsOfferEnabled"),
                    IsRedemptionEnabled:oActionModel.getProperty("/IsRedemptionEnabled")
                }



                var passedValidation = this.onValidate(oDataValue);

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }
                var oData = {
                    AboutUs: oDataValue.AboutUs,
                    Disclaimer: oDataValue.Disclaimer,
                    CallCenterHelpline: oDataValue.CallCenterHelpline,
                    DisclaimerVersion: oDataValue.DisclaimerVersion + 1,
                    IsOfferEnabled:oDataValue.IsOfferEnabled,
                    IsRedemptionEnabled:oDataValue.IsRedemptionEnabled
                }

                // var oData = {
                //     AboutUs: this.getView().getModel("ActionEditModel").getProperty("/AboutUs"),
                //     Disclaimer: this.getView().getModel("ActionEditModel").getProperty("/Disclaimer"),
                //     CallCenterHelpline: this.getView().getModel("ActionEditModel").getProperty("/CallCenterHelpline"),
                //     DisclaimerVersion: this.getView().getModel("ActionEditModel").getProperty("/DisclaimerVersion") + 1,
                // }
                var that = this;
                var editSet = "/MasterCompanySettingsSet(1)";
                var oModel = this.getView().getModel();
                oModel.update(editSet, oData, {
                    success: function () {
                        that.onSuccessPress();
                    }
                });


            },
            onSuccessPress: function (msg) {

                var msg = 'Saved Successfully!';
                MessageToast.show(msg);
                this.getOwnerComponent().getModel().refresh(true);
                setTimeout(function () {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteHome");
                }.bind(this), 1000);



            },

            _toggleButtonsAndView: function (bEdit) {

                var oView = this.getView();

                // Show the appropriate action buttons
                oView.byId("edit").setVisible(!bEdit);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);

                // Set the right form type
                //this._showFormFragment(bEdit ? "Change" : "Display");
            },



            onValidate: function (oDataValue) {
                if (oDataValue.AboutUs == "" || oDataValue.Disclaimer == "" || oDataValue.CallCenterHelpline == "") {
                    return false;
                }
                return true;
                // // Create new validator instance
                // var validator = new Validator();

                // // Validate input fields against root page with id 'somePage'
                // return validator.validate(this.byId("EditFragment"));

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
            onToggleChange: function () {
                var oCtrlModel = this.getView().getModel("oCtrlModel");
                oCtrlModel.setProperty("/bToggle", true);

            }



        });
    });
