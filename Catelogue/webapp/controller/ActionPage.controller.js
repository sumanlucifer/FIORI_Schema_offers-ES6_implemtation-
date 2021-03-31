sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageToast",
    "sap/m/MessageBox"




], function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageToast, MessageBox) {
    "use strict";
    return BaseController.extend("com.knpl.pragati.Catelogue.controller.ActionPage", {

        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.oPreviewImage = this.getView().byId("idPreviewImage");
            this.oPreviewPdf = this.getView().byId("idPreviewPdf");
            this.oFileUploader = this.getView().byId("idFormToolImgUploader");
            this.oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");
             this.pdfBtn = this.getView().byId("pdfBtn");
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("ActionPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this._action = oEvent.getParameter("arguments").action;
            this._property = oEvent.getParameter("arguments").property;
            this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_DS.uri;
            var oData = {
                busy: false,
                action: this._action,
                Title: "",

            };
            if (this._action === "edit") {
                var oComponentModel = this.getComponentModel();
                var html = new sap.ui.core.HTML();
                var oItem = oComponentModel.getProperty("/" + this._property);
                if (!oItem) {
                    return this._navToHome();
                }
                oData.Title = oItem.Title;

                this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value?doc_type=image");
                this.oFileUploader.setUploadUrl(this.sServiceURI + this._property + "/$value?doc_type=image");
                this.oPreviewImage.setVisible(true);

                var pdfURL = this.sServiceURI + this._property + "/$value?doc_type=pdf";

                
                
                    this.pdfBtn.setVisible(true);



            } else {

                this.oPreviewImage.setVisible(false);
                 this.pdfBtn.setVisible(false);
            }
            this.oFileUploader.clear();
            var oViewModel = new JSONModel(oData);
            this.getView().setModel(oViewModel, "ActionViewModel");
            this._setDefaultValueState();
        },

        onPressBreadcrumbLink: function () {
            //this._navToHome();
            // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //   oRouter.navTo("");
        },

        onPressCancel: function () {
            this._navToHome();
        },

        onChangeFile: function (oEvent) {
            if (oEvent.getSource().oFileUpload.files.length > 0) {
                var file = oEvent.getSource().oFileUpload.files[0];
                var path = URL.createObjectURL(file);
                this.oPreviewImage.setSrc(path);
                this.oPreviewImage.setVisible(true);
            } else {
                if (this._action === "add") {
                    this.oPreviewImage.setSrc(path);
                    this.oPreviewImage.setVisible(false);
                } else {
                    this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value");
                }
            }
        },
        openPdf: function (){
             sap.m.URLHelper.redirect(this.sServiceURI + this._property + "/$value?doc_type=pdf", true)

        },
        onChangePdf: function (oEvent) {
            if (oEvent.getSource().oFileUpload.files.length > 0) {
                var file = oEvent.getSource().oFileUpload.files[0];
                var path = URL.createObjectURL(file);
                this.oPreviewPdf.setSrc(path);
                this.oPreviewPdf.setVisible(true);
            } else {
                if (this._action === "add") {
                    this.oPreviewPdf.setSrc(path);
                    this.oPreviewPdf.setVisible(false);
                } else {
                    this.oPreviewPdf.setSrc(this.sServiceURI + this._property + "/$value");
                }
            }
        },

        _uploadToolImage: function (oData) {
            var oModel = this.getComponentModel();
            if (this._action === "add") {
                this.oFileUploader.setUploadUrl(this.sServiceURI + "MasterProductCatalogueSet(" + oData.Id + ")/$value?doc_type=image");
            }
            if (!this.oFileUploader.getValue()) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));
                return;
            }
            this.oFileUploader.checkFileReadable().then(function () {
                // @ts-ignore
                //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploader.setHttpRequestMethod("PUT");
                this.getView().getModel("ActionViewModel").setProperty("/busy", true);
                this.oFileUploader.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {
                this.oFileUploader.clear();
            }.bind(this));
        },
        _uploadPdf: function (oData) {
            var oModel = this.getComponentModel();
            if (this._action === "add") {
                this.oFileUploaderPdf.setUploadUrl(this.sServiceURI + "MasterProductCatalogueSet(" + oData.Id + ")/$value?doc_type=pdf");
            }
            if (!this.oFileUploaderPdf.getValue()) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));
                return;
            }
            this.oFileUploaderPdf.checkFileReadable().then(function () {
                // @ts-ignore
                //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploaderPdf.setHttpRequestMethod("PUT");
                this.getView().getModel("ActionViewModel").setProperty("/busy", true);
                this.oFileUploaderPdf.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {
                this.oFileUploader.clear();
            }.bind(this));
        },

        //Update methods for pdf and Image
        _updateImage: function (propertySet) {
            var oModel = this.getComponentModel();

            this.oFileUploader.setUploadUrl(this.sServiceURI + propertySet + "/$value?doc_type=image");
            this.oFileUploader.checkFileReadable().then(function () {
                // @ts-ignore
                //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploader.setHttpRequestMethod("PUT");
                // this.getView().getModel("ActionViewModel").setProperty("/busy", true);
                this.oFileUploader.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {

                this.oFileUploader.clear();
            }.bind(this));
        },
        _updatePdf: function (propertySet) {
            var oModel = this.getComponentModel();
            this.oFileUploaderPdf.setUploadUrl(this.sServiceURI + propertySet + "/$value?doc_type=pdf");
            this.oFileUploaderPdf.checkFileReadable().then(function () {
                // @ts-ignore
                //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploaderPdf.setHttpRequestMethod("PUT");
                // this.getView().getModel("ActionViewModel").setProperty("/busy", true);
                this.oFileUploaderPdf.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {

                this.oFileUploaderPdf.clear();
            }.bind(this));
        },

        handleUploadComplete: function () {
            this._showSuccessMsg();
        },
        handleUploadCompleteImage: function () {
            this._showSuccessMsg();
        },
        handleUploadCompletePdf: function () {
            this._showSuccessMsg();
        },

        onPressSaveOrUpdate: function () {
            if (this._validateRequiredFields()) {
                var oDataModel = this.getComponentModel();
                var oViewModel = this.getView().getModel("ActionViewModel");
                var oPayload = {
                    Title: oViewModel.getProperty("/Title"),
                    Description: oViewModel.getProperty("/Title"),
                    // Url: oViewModel.getProperty("/Url")
                };
                var cFiles = [];
                cFiles.push(this.oFileUploader.getValue());
                cFiles.push(this.oFileUploaderPdf.getValue());
                //  console.log(cFiles);
                if (cFiles) {
                    

            

                    //oViewModel.setProperty("/busy", true);
                    if (this._action === "add") {
                        if (!this.oFileUploader.getValue()||!this.oFileUploaderPdf.getValue()) {
                MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));
                
            }else{
                        var that = this
                        oDataModel.create("/MasterProductCatalogueSet", oPayload, {
                            success: function (oData, response) {
                                var id = oData.Id;
                                console.log(id);
                                that._uploadToolImage(oData);
                                that._uploadPdf(oData);
                            },
                            error: function (oError) {
                                console.log("Error!");
                            }
                        });
                    }
                    } else {
                        var that = this;
                        var _property = this._property;
                        //console.log("Inside edit");
                        //console.log(oPayload);
                        oDataModel.update("/" + _property, oPayload, {
                            success: function () {

                                that._updateImage(_property);
                                that._updatePdf(_property);
                            },
                            error: function (oError) {
                                console.log("Error!");
                            }
                        });
                    }
            
                }
            }
        },

        _onLoadSuccess: function (oData) {
            if (this.oFileUploader.getValue()) {
                this._uploadToolImage(oData);
            } else {
                this._showSuccessMsg();
            }
        },

        _onLoadError: function (error) {
            var oViewModel = this.getView().getModel("ActionViewModel");
            oViewModel.setProperty("/busy", false);
            var oRespText = JSON.parse(error.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
        },

        _showSuccessMsg: function () {
            var oViewModel = this.getView().getModel("ActionViewModel");
            // oViewModel.setProperty("/busy", false);

            var sMessage = (this._action === "add") ? this.oResourceBundle.getText("messageToastCreateMsg") : this.oResourceBundle.getText("messageToastUpdateMsg");
            MessageToast.show(sMessage);
            this._navToHome();
        },

        onChangeValue: function (oEvent) {
            var oControl = oEvent.getSource();
            this._setControlValueState([oControl]);
        },

        _validateRequiredFields: function () {
            var oTitleControl = this.getView().byId("idTitle")

            this._setControlValueState([oTitleControl]);
            if (oTitleControl.getValue()) {
                return true;
            } else {
                return false;
            }
        },

        _setDefaultValueState: function () {
            var oTitleControl = this.getView().byId("idTitle");
            //oUrlControl = this.getView().byId("idUrlInput");
            oTitleControl.setValueState("None");
            oTitleControl.setValueStateText("");
            // oUrlControl.setValueState("None");
            // oUrlControl.setValueStateText("");
        },

        _setControlValueState: function (aControl) {
            for (var i = 0; i < aControl.length; i++) {
                var oControl = aControl[i],
                    sValue = oControl.getValue();
                if (sValue) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                } else {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(this.oResourceBundle.getText("requiredValueText"));
                }
            }
        },









    });

});