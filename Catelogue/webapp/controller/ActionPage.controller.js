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
            this.imgBtn = this.getView().byId("imageBtn");
            this.oCategory = this.getView().byId("idCategory");
            this.oTitle = this.getView().byId("idTitle");
            this.oForm = this.getView().byId("idCatalogueDetailsForm");
            this.imageName = "";
            this.pdfName = "";
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("ActionPage").attachPatternMatched(this._onObjectMatched, this);
            this.entityObject;
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
                ImageUrl: "",
                Competitor: [],
                Catalogue: []


            };
            if (this._action === "edit") {
                var oComponentModel = this.getComponentModel();
                var html = new sap.ui.core.HTML();
                //var oItem = oComponentModel.getProperty("/" + this._property);
                // this.oItem;

                var that = this;
                this.getView().getModel().read("/" + this._property, {
                    urlParameters: {
                        "$expand": "ProductCompetitors,MediaList"
                    },
                    success: function (data, response) {
                        that.entityObject = data;
                        oData.Title = data.Title;
                        oData.Category = data.ProductCategoryId
                        oData.Classification = data.ProductClassificationId
                        oData.Range = data.ProductRangeId
                        oData.Competitor = data.ProductCompetitors.results
                        oData.Catalogue = data.MediaList.results.filter(function (ele) {
                            return !ele.ContentType.includes("image");

                        });
                        oData.ImageUrl = that.sServiceURI + that._property + "/$value?doc_type=image&time=" + new Date().getTime();
                        var oViewModel = new JSONModel(oData);
                        that.getView().setModel(oViewModel, "ActionViewModel");

                        that.oPreviewImage.setSrc(that.sServiceURI + that._property + "/$value?doc_type=image");
                        that.oFileUploader.setUploadUrl(that.sServiceURI + that._property + "/$value?doc_type=image");
                        that.oPreviewImage.setVisible(false);
                        //that.getView().getModel("ActionViewModel").setProperty("/Image",that.sServiceURI + that._property + "/$value?doc_type=image");



                    },
                    error: function (oError) {
                    }
                });
                this.oCategory.setEditable(false);
                this.oTitle.setEditable(false);
                // this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value?doc_type=image");
                // this.oFileUploader.setUploadUrl(this.sServiceURI + this._property + "/$value?doc_type=image");
                // this.oPreviewImage.setVisible(true);

                var pdfURL = this.sServiceURI + this._property + "/$value?doc_type=pdf";
                this.pdfBtn.setVisible(true);
                this.imgBtn.setVisible(true);



            } else {
                this.oCategory.setEditable(true);
                this.oTitle.setEditable(true);
                this.oPreviewImage.setVisible(false);
                this.pdfBtn.setVisible(false);
                this.imgBtn.setVisible(false);
            }
            this.oFileUploader.clear();
            var oViewModel = new JSONModel(oData);
            this.getView().setModel(oViewModel, "ActionViewModel");
            this._setDefaultValueState();


        },
        onAfterRendering: function () {

        },


        onPressBreadcrumbLink: function () {
            this._navToHome();

        },

        onPressCancel: function () {
            this._navToHome();
        },

        onChangeFile: function (oEvent) {
            if (oEvent.getSource().oFileUpload.files.length > 0) {
                this.getModel("ActionViewModel").setProperty("/bNewImage", true);
                this.imageName = this.oFileUploader.getValue();
                var file = oEvent.getSource().oFileUpload.files[0];
                var path = URL.createObjectURL(file);
                this.oPreviewImage.setSrc(path);
                this.oPreviewImage.setVisible(true);
            } else {
                this.getModel("ActionViewModel").setProperty("/bNewImage", false);
                if (this._action === "add") {
                    this.oPreviewImage.setSrc(path);
                    this.oPreviewImage.setVisible(false);
                } else {
                    this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value");
                }
            }
        },
        openPdf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ActionViewModel");
            var sSource = this.sServiceURI + this._property + "/$value?doc_type=pdf&file_name=" + oContext.getProperty("MediaName") + "&language_code=" + oContext.getProperty("LanguageCode");
            // this._pdfViewer.setSource(sSource);
            // this._pdfViewer.setTitle("Catalogue");
            // this._pdfViewer.open();
            sap.m.URLHelper.redirect(sSource, true)
        },
        onChangePdf: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ActionViewModel");
            if (oEvent.getParameter("files").length > 0) {
                //this.pdfName = this.oFileUploaderPdf.getValue();
                this.getModel("ActionViewModel").setProperty("file", oEvent.getParameter("files")[0], oContext);
                this.getModel("ActionViewModel").setProperty("fileName", oEvent.getParameter("newValue"), oContext);
                this.getModel("ActionViewModel").setProperty("bNew", true, oContext);
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

                var oModel = this.getModel("ActionViewModel");
                var catalogue = oModel.getProperty("/Catalogue");
                var fileUploader;
                var sServiceUri = this.sServiceURI;
                //To DO promises for sync
                catalogue.forEach(function (ele) {
                    jQuery.ajax({
                        method: "PUT",
                        url: sServiceUri + "ProductCatalogueSet(" + oData.Id + ")/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: ele.file,
                        success: function (data) {

                        },
                        error: function () { },
                    })
                });

            }

        },

        //Update methods for pdf and Image
        _updateImage: function (propertySet) {
            if (this.getModel("ActionViewModel").getProperty("/bNewImage") == false) {
                return;
            }
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
            var oModel = this.getModel("ActionViewModel");
            var catalogue = oModel.getProperty("/Catalogue");
            var fileUploader;
            var sServiceUri = this.sServiceURI;

            catalogue.forEach(function (ele) {
                if (ele.bNew) {
                    jQuery.ajax({
                        method: "PUT",
                        url: sServiceUri + propertySet + "/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: ele.file,
                        success: function (data) {

                        },
                        error: function () { },
                    })
                }
            })
            // this.getView().byId("idPdf").getItems().forEach(function (ele, i) {
            //     fileUploader = ele.getContent()[0].getItems()[1];
            //     fileUploader.setUploadUrl(sServiceUri + propertySet + "/$value?doc_type=pdf&file_name=" + catalogue[i].fileName + "&language_code=" + catalogue[i].LanguageCode);
            //     fileUploader.checkFileReadable().then(function () {
            //         // @ts-ignore
            //         //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
            //         fileUploader.setHttpRequestMethod("PUT");
            //         // this.getView().getModel("ActionViewModel").setProperty("/busy", true);
            //         fileUploader.upload();
            //     }.bind(this), function (error) {
            //         MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            //     }.bind(this)).then(function () {

            //     }.bind(this));
            // });

            // for (var i = 0; i <= catalogue.length; i++) {
            //     var LanguageCode = catalogue[i].LanguageCode;
            //     console.log(LanguageCode);
            //     this.oFileUploaderPdf.setUploadUrl(this.sServiceURI + propertySet + "/$value?doc_type=pdf&file_name=" + this.pdfName + "&language_code=" + LanguageCode);
            //     this.oFileUploaderPdf.checkFileReadable().then(function () {
            //         // @ts-ignore
            //         //this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: this.oFileUploader.getValue() }));
            //         this.oFileUploaderPdf.setHttpRequestMethod("PUT");
            //         // this.getView().getModel("ActionViewModel").setProperty("/busy", true);
            //         this.oFileUploaderPdf.upload();
            //     }.bind(this), function (error) {
            //         MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
            //     }.bind(this)).then(function () {

            //         this.oFileUploaderPdf.clear();
            //     }.bind(this));
            // }


        },

        handleUploadComplete: function () {
            this._showSuccessMsg();
        },
        handleUploadCompleteImage: function () {
            this.idPreviewImage;
            this._showSuccessMsg();
        },
        handleUploadCompletePdf: function () {
            this._showSuccessMsg();
        },

        onPressSaveOrUpdate: function () {
            


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

                
                var oParam = {};
                $.extend(true, oParam, this.entityObject);
                //delete oParam.__metadata;
                delete oParam.MediaList;
                var Title=this.getView().byId("idTitle").getSelectedItem().getText();    

                oParam.Title = Title,
                    oParam.Description = Title,
                    oParam.ProductId = oViewModel.getProperty("/Title"),
                    oParam.ProductCategoryId = oViewModel.getProperty("/Category"),
                    oParam.ProductClassificationId = oViewModel.getProperty("/Classification"),
                    oParam.ProductRangeId = parseInt(oViewModel.getProperty("/Range")),
                    oParam.ProductCompetitors = Competitors

                var oPayload = {

                    Title: Title,
                    Description: Title,
                    ProductId : oViewModel.getProperty("/Title"),
                    ProductCategoryId: oViewModel.getProperty("/Category"),
                    ProductClassificationId:oViewModel.getProperty("/Classification"),
                    ProductRangeId: parseInt(oViewModel.getProperty("/Range")),
                    ProductCompetitors: Competitors
                };

                var cFiles = [];
                cFiles.push(this.oFileUploader.getValue());
                cFiles.push(this.oFileUploaderPdf.getValue());

                if (cFiles) {




                    //oViewModel.setProperty("/busy", true);
                    if (this._action === "add") {
                        if (!this.oFileUploader.getValue()) {
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

                        // console.log(oPayload);
                        oDataModel.update("/" + _property, oParam, {
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
            oViewModel.refresh(true);
            // oViewModel.setProperty("/busy", false);

            var sMessage = (this._action === "add") ? this.oResourceBundle.getText("messageToastCreateMsg") : this.oResourceBundle.getText("messageToastUpdateMsg");
            MessageToast.show(sMessage);
            this._navToHome();
        },

        onChangeValue: function (oEvent) {
            var oControl = oEvent.getSource();
            this._setControlValueState([oControl]);
        },
        onFileSizeExceed: function () {
            var sMessage = "Maximum file size exceeded!";
            MessageToast.show(sMessage);
        },

        _validateRequiredFields: function () {
            var oTitleControl = this.getView().byId("idTitle");
            var oCategoryControl = this.getView().byId("idCategory");
            var oClassificationControl = this.getView().byId("idClassification");
            var oRangeControl = this.getView().byId("idRange");
            var oObjectCatalogue = this.getModel("ActionViewModel").getProperty("/Catalogue");
            var oObjectCompetitors = this.getModel("ActionViewModel").getProperty("/Competitor");



            var oSet = new Set();
            var bCataloguePDF = oObjectCatalogue.every(function (ele) {
                if (oSet.has(ele.LanguageCode) !== true) {
                    oSet.add(ele.LanguageCode);
                    return true
                }
                return false;
            });
            var bCompetitors = oObjectCompetitors.every(function (ele) {
                if (ele.CompetitorProductName == "" || ele.CompetitorProductName == null) {
                    return false;
                }
                return true;
            });

           // this._setControlValueState([oTitleControl]);
            this._setSelectControlValueState([oTitleControl,oCategoryControl, oClassificationControl, oRangeControl]);
            if (oTitleControl.getSelectedKey() && oCategoryControl.getSelectedKey() &&
                oClassificationControl.getSelectedKey() && oRangeControl.getSelectedKey()) {
                if (!bCataloguePDF) {
                    var sMessage = "Multiple PDF of same Language";
                    MessageToast.show(sMessage);
                    return false;
                }
                if (oObjectCatalogue.length > 0) {
                    if (oObjectCompetitors.length > 0) {
                        if (!bCompetitors) {
                            var sMessage = "Add Competitor Product Name!";
                            MessageToast.show(sMessage);
                            return false;
                        }
                        return true;

                    } else {
                        return true;
                    }

                }
                else {
                    var sMessage = "Upload English Catalogue";
                    MessageToast.show(sMessage);
                }


            } else {
                return false;
            }
        },

        _setDefaultValueState: function () {
            var oTitleControl = this.getView().byId("idTitle");
            var oCategoryControl = this.getView().byId("idCategory");
            var oClassificationControl = this.getView().byId("idClassification");
            var oRangeControl = this.getView().byId("idRange");

            oTitleControl.setValueState("None");
            oTitleControl.setValueStateText("");
            oCategoryControl.setValueState("None");
            oCategoryControl.setValueStateText("");
            oClassificationControl.setValueState("None");
            oClassificationControl.setValueStateText("");
            oRangeControl.setValueState("None");
            oRangeControl.setValueStateText("");
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
        _setSelectControlValueState: function (aControl) {
            for (var i = 0; i < aControl.length; i++) {
                var oControl = aControl[i],
                    sValue = oControl.getSelectedKey();
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
            oModel.refresh(true);
        },
        onAddCatalogue: function () {
            var oModel = this.getView().getModel("ActionViewModel");
            var oObject = this.getModel("ActionViewModel").getProperty("/Catalogue");

            oObject.push({
                LanguageCode: "",
                file: null,
                fileName: ""
            });
            oModel.refresh(true);

            // var pdfContainer = this.byId("idPdf");
            //  pdfContainer.getBinding("items").refresh(true);

            //oModel.setProperty("/Catalogue", oObject);






        },
        onPressRemoveCatalogue: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("ActionViewModel");
            var sPath = oEvent
                .getSource()
                .getBindingContext("ActionViewModel")
                .getPath()
                .split("/");
            var aCatalogue = oModel.getProperty("/Catalogue");
            var index = parseInt(sPath[sPath.length - 1]);
            var delItems = [];
            var property = this._property;
            var sServiceUri = this.sServiceURI;
            var oModel = this.getModel("ActionViewModel");
            // aCatalogue.splice(parseInt(sPath[sPath.length - 1]), 1);
            //To DO promises for sync
            for (var i = 0; i <= aCatalogue.length; i++) {

                if (i == index) {
                    delItems = aCatalogue[i];
                    if(delItems.MediaName!=null)
                    {
                    jQuery.ajax({
                        method: "DELETE",
                        url: sServiceUri + property + "/$value?doc_type=pdf&file_name=" + delItems.MediaName + "&language_code=" + delItems.LanguageCode,
                        cache: false,
                        contentType: false,
                        processData: false,
                        // data: delItems,
                        success: function (data) {
                            aCatalogue.splice(aCatalogue[i] - 1, 1);

                            oModel.refresh(true);
                            var sMessage = "Catalogue Deleted!";
                            MessageToast.show(sMessage);
                        },
                        error: function () { },
                    })
                    aCatalogue.splice(i);
                }
                else{
                        aCatalogue.splice(i);
                }
                }
                

            };
            

            oModel.refresh(true);
        },
        onImageView: function (oEvent) {
            var oButton = oEvent.getSource();
            var oView = this.getView();
            if (!this._imageDialog) {
                Fragment.load({
                    name: "com.knpl.pragati.Catelogue.view.fragments.ImagePopup",
                    controller: this,
                }).then(
                    function (oDialog) {
                        this._imageDialog = oDialog;
                        oView.addDependent(this._imageDialog);
                        this._imageDialog.open();
                    }.bind(this)
                );
            } else {
                oView.addDependent(this._imageDialog);
                this._imageDialog.open();
            }
        },
        onPressCloseDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        },
        onDialogClose: function (oEvent) {
            this._imageDialog.destroy();
            delete this._imageDialog;
        },

















    });

});