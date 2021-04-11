sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/PDFViewer"




], function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageToast,
    MessageBox, PDFViewer) {
    "use strict";
    return BaseController.extend("com.knpl.pragati.Catelogue.controller.ActionPage", {

        onInit: function () {
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.oPreviewImage = this.getView().byId("idPreviewImage");
            this.oPreviewPdf = this.getView().byId("idPreviewPdf");
            this.oFileUploader = this.getView().byId("idFormToolImgUploader");
            this.oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");
            this.pdfBtn = this.getView().byId("pdfBtn");
            this.imageName = "";
            this.pdfName = "";
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("ActionPage").attachPatternMatched(this._onObjectMatched, this);

            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

        },

        _onObjectMatched: function (oEvent) {
            this._action = oEvent.getParameter("arguments").action;
            this._property = oEvent.getParameter("arguments").property;
            this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_DS.uri;
            var oData = {
                busy: false,
                action: this._action,
                Title: "",
                Category: "",
                Classification: "",
                Range: "",
                Competitor: []


            };
            if (this._action === "edit") {
                var oComponentModel = this.getComponentModel();
                var html = new sap.ui.core.HTML();
                //var oItem = oComponentModel.getProperty("/" + this._property);
                // this.oItem;
                var that = this;
                this.getView().getModel().read("/" + this._property, {
                    urlParameters: {
                        "$expand": "ProductCompetitors"
                    },
                    success: function (data, response) {

                        oData.Title = data.Title;
                        oData.Category = data.ProductCategoryId
                        oData.Classification = data.ProductClassificationId
                        oData.Range = data.ProductRangeId
                        oData.Competitor = data.ProductCompetitors.results
                        var oViewModel = new JSONModel(oData);
                        that.getView().setModel(oViewModel, "ActionViewModel");

                    },
                    error: function (oError) {
                    }
                });
                // console.log(this.oItem);
                // oData.Title = oItem.Title;
                // oData.Category = oItem.ProductCategoryId
                // oData.Classification = oItem.ProductClassificationId
                // oData.Range = oItem.ProductRangeId
                // oData.Competitors = oItem.ProductCompetitors.results
                //oData.CompetitorCompany=oItem.CompetitorCompanyId
                //oData.CompetitorProductName=oItem.CompetitorProductName

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
                this.imageName = this.oFileUploader.getValue();
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
        openPdf: function (oEvent) {
            // sap.m.URLHelper.redirect(this.sServiceURI + this._property + "/$value?doc_type=pdf", true)
            var sSource = this.sServiceURI + this._property + "/$value?doc_type=pdf";
            this._pdfViewer.setSource(sSource);
            this._pdfViewer.setTitle("Catalogue");
            this._pdfViewer.open();

        },
        onChangePdf: function (oEvent) {
            if (oEvent.getSource().oFileUpload.files.length > 0) {
                this.pdfName = this.oFileUploaderPdf.getValue();

            }
        },

        _uploadToolImage: function (oData) {
            var oModel = this.getComponentModel();
            if (this._action === "add") {
                this.oFileUploader.setUploadUrl(this.sServiceURI + "ProductCatalogueSet(" + oData.Id + ")/$value?doc_type=image&file_name=" + this.imageName);
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
                this.oFileUploaderPdf.setUploadUrl(this.sServiceURI + "ProductCatalogueSet(" + oData.Id + ")/$value?doc_type=pdf&file_name=" + this.pdfName+"&language_code=EN");
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

            this.oFileUploader.setUploadUrl(this.sServiceURI + propertySet + "/$value?doc_type=image&file_name=" + this.imageName);
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
            this.oFileUploaderPdf.setUploadUrl(this.sServiceURI + propertySet + "/$value?doc_type=pdf&file_name=" + this.pdfName+"&language_code=EN");
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
            this.idPreviewImage
            this._showSuccessMsg();
        },
        handleUploadCompletePdf: function () {
            this._showSuccessMsg();
        },

        onPressSaveOrUpdate: function () {
            //var oModel = this.getView().getModel("ActionViewModel");



            if (this._validateRequiredFields()) {
                var oDataModel = this.getComponentModel();
                var oViewModel = this.getView().getModel("ActionViewModel");
                var Competitors = JSON.parse(
                    JSON.stringify(oViewModel.getProperty("/Competitor"))
                ).map((item) => {
                    var id = parseInt(item.CompetitorCompanyId);
                    var name = item.CompetitorProductName;

                    var list = { CompetitorCompanyId: id, CompetitorProductName: name }
                    return list;
                });


                var oPayload = {
                    Title: oViewModel.getProperty("/Title"),
                    Description: oViewModel.getProperty("/Title"),
                    ProductCategoryId: parseInt(oViewModel.getProperty("/Category")),
                    ProductClassificationId: parseInt(oViewModel.getProperty("/Classification")),
                    ProductRangeId: parseInt(oViewModel.getProperty("/Range")),
                    ProductCompetitors: Competitors
                };

                var cFiles = [];
                cFiles.push(this.oFileUploader.getValue());
                cFiles.push(this.oFileUploaderPdf.getValue());

                if (cFiles) {




                    //oViewModel.setProperty("/busy", true);
                    if (this._action === "add") {
                        if (!this.oFileUploader.getValue() || !this.oFileUploaderPdf.getValue()) {
                            MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));

                        } else {
                            var that = this
                            oDataModel.create("/ProductCatalogueSet", oPayload, {
                                success: function (oData, response) {
                                    var id = oData.Id;
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

                        console.log(oPayload);
                        oDataModel.update("/" + _property, oPayload, {
                            success: function () {

                                that._showSuccessMsg();
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
            // oViewModel.refresh(true);
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
            var oTitleControl = this.getView().byId("idTitle");
            //var oCategoryControl = this.getView().byId("idCategory");

            this._setControlValueState([oTitleControl]);
            if (oTitleControl.getValue()) {
                return true;
            } else {
                return false;
            }
        },

        _setDefaultValueState: function () {
            var oTitleControl = this.getView().byId("idTitle");
            // var oCategoryControl = this.getView().byId("idCategory");
            oTitleControl.setValueState("None");
            oTitleControl.setValueStateText("");
            // oCategoryControl.setValueState("None");
            // oCategoryControl.setValueStateText("");
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

        onAddCompetitor: function () {
            var oModel = this.getView().getModel("ActionViewModel");
            var oCompetitorMdl = oModel.getProperty("/Competitor");
            var bFlag = true;

            oCompetitorMdl.push({
                CompetitorCompanyId: "",
                CompetitorProductName: ""
            });
            oModel.refresh(true);
        },
        onPressRemoveCompetitor: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("ActionViewModel");
            var sPath = oEvent
                .getSource()
                .getBindingContext("ActionViewModel")
                .getPath()
                .split("/");
            var aCompetitor = oModel.getProperty("/Competitor");
            aCompetitor.splice(parseInt(sPath[sPath.length - 1]), 1);
            //this._setFDLTbleFlag();
            oModel.refresh();
        },














    });

});