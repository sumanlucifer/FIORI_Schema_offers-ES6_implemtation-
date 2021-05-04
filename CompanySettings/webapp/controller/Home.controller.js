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
                var oModel = this.getOwnerComponent().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/MasterCompanySettingsSet(1)");


                  this.getOwnerComponent().getRouter().getRoute("RouteHome").attachPatternMatched(this._onObjectMatched, this);


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

                this.showPdfList();


                // this.oRouter.getRoute("RouteHome").attachPatternMatched(this.onRoteMatched, this);
            },
            _onObjectMatched: function () {
                this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;
                this.oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");


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
            onEditCatalogue: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EditPdf");

            },

            showPdfList: function () {


                var that = this;
                this.getView().getModel().read("/MasterCompanySettingsSet(1)", {
                    urlParameters: {
                        "$expand": "MediaList"
                    },
                    success: function (data, response) {
                        var Catalogue = data.MediaList.results.filter(function (ele) {
                            return !ele.ContentType.includes("image");

                        });


                        that.getView().getModel("local").setProperty("/Catalogue", Catalogue);



                    },
                    error: function (oError) {
                    }
                });


            },

            handleCancelPress: function () {

                this.getView().getModel("local").setProperty("/bEdit", false);

                //Restore the data
                var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/MasterCompanySettingsSet(1)");


                this._toggleButtonsAndView(false);
                var localModel = this.getView().getModel("local");
                localModel.refresh(true);

            },
            handleEmptyFields: function (oEvent) {
                console.log("empty");
                this.onDialogPress();
            },

            handleSavePress: function () {

                // console.log(DisclaimerVersion);

                var oDataModel = this.getView().getModel();
                var oView = this.getView();
                // var oModelView = oView.getModel("oModelView");
                // oModelView.setProperty("/busy", true);
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
                    DisclaimerVersion: oDataValue["DisclaimerVersion"] + 1,
                }


                //console.log(oData);
                var that = this;
                var editSet = "/MasterCompanySettingsSet(1)";
                var oModel = this.getView().getModel("data");
                oModel.update(editSet, oData, {
                    success: function () {
                        that._updatePdf(that._property);
                        that.onSuccessPress();
                    }
                });


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
                //this._showFormFragment(bEdit ? "Change" : "Display");
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
            openPdf: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("local");
                var sSource = this.sServiceURI + this._property + "/$value?doc_type=pdf&file_name=" + oContext.getProperty("MediaName") + "&language_code=" + oContext.getProperty("LanguageCode");

                sap.m.URLHelper.redirect(sSource, true);
                // window.open(sSource);
            },
            onChangePdf: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("local");
                if (oEvent.getParameter("files").length > 0) {
                    //this.pdfName = this.oFileUploaderPdf.getValue();
                    this.getView().getModel("local").setProperty("file", oEvent.getParameter("files")[0], oContext);
                    this.getView().getModel("local").setProperty("fileName", oEvent.getParameter("newValue"), oContext);
                    this.getView().getModel("local").setProperty("bNew", true, oContext);
                }
            },
            _updatePdf: function (propertySet) {
                var oModel = this.getView().getModel("local");
                var catalogue = oModel.getProperty("/Catalogue");
                var fileUploader;
                var sServiceUri = this.sServiceURI;

                catalogue.forEach(function (ele) {
                    if (ele.bNew) {
                        var that = this;
                        jQuery.ajax({
                            method: "PUT",
                            url: sServiceUri + propertySet + "/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode,
                            cache: false,
                            contentType: false,
                            processData: false,
                            data: ele.file,

                            success: function (data) {
                                // that.getView().getModel("local").refresh(true);
                                var oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");
                                oFileUploaderPdf.clear();
                            },
                            error: function () { },
                        })
                    }
                });
            },
            onAddCatalogue: function () {
                var oModel = this.getView().getModel("local");
                var oObject = this.getView().getModel("local").getProperty("/Catalogue");

                oObject.push({
                    LanguageCode: "",
                    file: null,
                    fileName: ""
                });
                oModel.refresh(true);
            },
            onPressRemoveCatalogue: function (oEvent) {
                this.getView().getModel("local").setProperty("bNew", true);
                var oView = this.getView();
                var oModel = oView.getModel("local");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("local")
                    .getPath()
                    .split("/");
                var aCatalogue = oModel.getProperty("/Catalogue");

                var index = parseInt(sPath[sPath.length - 1]);
                var delItems = [];
                var property = this._property;
                var sServiceUri = this.sServiceURI;
                var oModel = this.getView().getModel("local");
                var oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");

                // aCatalogue.splice(parseInt(sPath[sPath.length - 1]), 1);
                //To DO promises for sync
                for (var i = 0; i <= aCatalogue.length; i++) {

                    if (i == index) {
                        delItems = aCatalogue[i];
                        if (delItems.file !== null) {
                            jQuery.ajax({
                                method: "DELETE",
                                url: sServiceUri + property + "/$value?doc_type=pdf&file_name=" + delItems.MediaName + "&language_code=" + delItems.LanguageCode,
                                cache: false,
                                contentType: false,
                                processData: false,
                                // data: delItems,
                                success: function (data) {
                                    // aCatalogue.splice(aCatalogue[i-1], 1);

                                    oModel.refresh(true);
                                    var sMessage = "PDF Deleted!";
                                    MessageToast.show(sMessage);
                                },
                                error: function () { },
                            });
                        }
                        else {
                            aCatalogue.splice(i);
                        }
                        aCatalogue.splice(i);

                    }

                };



                oModel.refresh(true);
            },



        });
    });
