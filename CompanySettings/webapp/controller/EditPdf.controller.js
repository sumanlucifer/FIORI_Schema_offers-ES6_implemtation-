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
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, library, ValueState, Validator, Dialog, DialogType, Button, ButtonType, Text,
        JSONModel,MessageBox) {
        "use strict";

        var DisclaimerVersion;

        return Controller.extend("com.knpl.pragati.CompanySettings.controller.EditPdf", {
            onInit: function () {
                // var oModel = this.getOwnerComponent().getModel("data");
                // this.getView().setModel(oModel);

                // this.getView().bindElement("/MasterCompanySettingsSet(1)");

                this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;
                this.oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");

                var oLocaModel = new JSONModel({
                    bEdit: false,
                    Catalogue: [],
                    Mediclaim:[],
                    bBusy:false,
                    t1Visible:false,
                    t2Visible:false
                });
                this.getView().setModel(oLocaModel, "local");

                this._property = "MasterCompanySettingsSet(1)";

                this.getOwnerComponent().getRouter().getRoute("EditPdf").attachPatternMatched(this._onObjectMatched, this);


            },
            _onObjectMatched: function (oEvent) {
                var sTableId = oEvent.getParameter("arguments").tableId;
                var oLocalModel=this.getView().getModel("local");
                oLocalModel.setProperty("/t1Visible", false);
                oLocalModel.setProperty("/t2Visible", false);
               if(sTableId == "Table1"){
                   oLocalModel.setProperty("/t1Visible", true);
                oLocalModel.setProperty("/t2Visible", true);
                    this.showPdfList();
               }
               else if(sTableId == "Table2"){
                oLocalModel.setProperty("/t1Visible", false);
                oLocalModel.setProperty("/t2Visible", true);
                        console.log("Table 2");
                        this.showPdfList();
               }
                
            },


            showPdfList: function () {
                var oLocalModel=this.getView().getModel("local");
                //oLocalModel.setProperty("/t1Visible", true);
                var that = this;
                this.getView().getModel().read("/MasterCompanySettingsSet(1)", {
                    urlParameters: {
                        "$expand": "MediaList"
                    },
                    success: function (data, response) {
                        var Catalogue = data.MediaList.results.filter(function (ele) {
                            return !ele.ContentType.includes("image");

                        });

                        oLocalModel.setProperty("/Catalogue", Catalogue);
                        oLocalModel.setProperty("/bBusy", false);
                        oLocalModel.refresh(true);


                    },
                    error: function (oError) {
                    }
                });


            },
            handleCancelPress: function () {

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");

            },
            onFileSizeExceed: function (){
                    MessageToast.show("Maximum File Size Exceded.")
            },

            // openPdf: function (oEvent) {
            //     var oContext = oEvent.getSource().getBindingContext("local");
            //     var sSource = this.sServiceURI + this._property + "/$value?doc_type=pdf&file_name=" + oContext.getProperty("MediaName") + "&language_code=" + oContext.getProperty("LanguageCode");
            //     sap.m.URLHelper.redirect(sSource, true);
            // },
            openPdf: function (oEvent) {
                var oContext = oEvent.getSource().getBindingContext("local");
                var sSource = this.sServiceURI + this._property + "/$value?doc_type=pdf&file_name=" + oContext.getProperty("MediaName") + "&language_code=" + oContext.getProperty("LanguageCode");
                sSource = "https://" + location.host + "/" + sSource
                sap.m.URLHelper.redirect(sSource, true);
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
            // onPressSave: function (){
            //      var oLocalModel = this.getView().getModel("local");
            //     var c1, c2;
            //         var othat = this;
            //         c1 = othat._updatePdf();
            //         c1.then(function () {
            //             setTimeout(() => {
            //             c2 = othat.showPdfList();
            //             c2.then(function () {
            //                 var sMessage = "Saved Successfully!";
            //                 MessageToast.show(sMessage);
            //                 othat.handleCancelPress();
            //                 });
            //             }, 7000);
                       
            //         });
            //         oLocalModel.refresh(true);

            // },
            _updatePdf: function () {
                var oModel = this.getView().getModel("local");
                var dataModel = this.getOwnerComponent().getModel();
                var catalogue = oModel.getProperty("/Catalogue");
                var fileUploader;
                var sServiceUri = this.sServiceURI;
                var propertySet = this._property;
                var http = "https://" + location.host + "/";
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var success = false;
                oModel.setProperty("/bBusy", true);
                catalogue.forEach(function (ele) {
                    if (ele.bNew) {
                        var that = this;
                        jQuery.ajax({
                            method: "PUT",
                            url: http + sServiceUri + propertySet + "/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode,
                            cache: false,
                            contentType: false,
                            processData: false,
                            data: ele.file,
                            success: function (data) {
                                 //oModel.setProperty("/bBusy", false);
                                 var sMessage = "Saved Successfully!";
                                MessageToast.show(sMessage);
                                oRouter.navTo("RouteHome");
                                // setTimeout(() => {
                                //     oRouter.navTo("RouteHome");
                                // }, 1000);

                            },
                            error: function () { },
                        })
                     }
                    });
                },
            onAddCatalogue: function () {
                var oModel = this.getView().getModel("local");
                var oObject = oModel.getProperty("/Catalogue");

                oObject.push({
                    LanguageCode: "",
                    file: null,
                    fileName: ""
                });
                oModel.refresh(true);
            },
            onAddMediclaim: function (){
                var oModel = this.getView().getModel("local");
                var oObject = oModel.getProperty("/Catalogue");

                oObject.push({
                    LanguageCode: "",
                    file: null,
                    fileName: ""
                });
                oModel.refresh(true);

            },
            onDeleteFile: function (oEvent) {
                
                var oView = this.getView();
                var oModel = oView.getModel("local");
                oModel.setProperty("bNew", true);
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("local")
                    .getPath()
                    .split("/");
                var aCatalogue = oModel.getProperty("/Catalogue");
                var othat = this;
                    MessageBox.confirm(
                        "Kindly confirm to delete the file.",
                        {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    othat.onPressRemoveCatalogue(sPath,aCatalogue);
                                }
                            },
                        }
                    );
                },

                onDeleteFile2: function (oEvent) {
                
                var oView = this.getView();
                var oModel = oView.getModel("local");
                oModel.setProperty("bNew", true);
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("local")
                    .getPath()
                    .split("/");
                var aMediclaim = oModel.getProperty("/Mediclaim");
                var othat = this;
                    MessageBox.confirm(
                        "Kindly confirm to delete the file.",
                        {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    othat.onPressRemoveMediclaim(sPath,aMediclaim);
                                }
                            },
                        }
                    );
                },

            onPressRemoveCatalogue: function (sPath,aCatalogue) {
                // this.getView().getModel("local").setProperty("bNew", true);
                // var oView = this.getView();
                // var oModel = oView.getModel("local");
                // var sPath = oEvent
                //     .getSource()
                //     .getBindingContext("local")
                //     .getPath()
                //     .split("/");
                // var aCatalogue = oModel.getProperty("/Catalogue");

                var index = parseInt(sPath[sPath.length - 1]);
                var delItems = [];
                var property = this._property;
                var sServiceUri = this.sServiceURI;
                var http = "https://" + location.host + "/";
                var oModel = this.getView().getModel("local");
                var oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // aCatalogue.splice(parseInt(sPath[sPath.length - 1]), 1);
                //To DO promises for sync
                for (var i = 0; i <= aCatalogue.length; i++) {

                    if (i == index) {
                        delItems = aCatalogue[i];
                        if (delItems.file !== null) {

                            oModel.setProperty("/bBusy", true);

                            jQuery.ajax({
                                method: "DELETE",
                                url: http + sServiceUri + property + "/$value?doc_type=pdf&file_name=" + delItems.MediaName + "&language_code=" + delItems.LanguageCode,
                                cache: false,
                                contentType: false,
                                processData: false,
                                // data: delItems,
                                success: function (data) {
                                    // aCatalogue.splice(aCatalogue[i-1], 1);
                                    oModel.setProperty("/bBusy", false);
                                    oModel.refresh(true);
                                    var sMessage = "PDF Deleted!";
                                    MessageToast.show(sMessage);
                                    
                                    //oRouter.navTo("RouteHome");
                                    this.showPdfList();
                                }.bind(this),
                                error: function () { },
                            });
                        }
                        else {
                            aCatalogue.splice(i);
                        }
                        aCatalogue.splice(i);

                    }

                }
            },
            onPressRemoveMediclaim: function (sPath,aCatalogue) {

                var index = parseInt(sPath[sPath.length - 1]);
                var delItems = [];
                var property = this._property;
                var sServiceUri = this.sServiceURI;
                var http = "https://" + location.host + "/";
                var oModel = this.getView().getModel("local");
                var oFileUploaderPdf = this.getView().byId("idFormToolPdfUploader");
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // aCatalogue.splice(parseInt(sPath[sPath.length - 1]), 1);
                //To DO promises for sync
                for (var i = 0; i <= aCatalogue.length; i++) {

                    if (i == index) {
                        delItems = aCatalogue[i];
                        if (delItems.file !== null) {

                            oModel.setProperty("/bBusy", true);

                            jQuery.ajax({
                                method: "DELETE",
                                url: http + sServiceUri + property + "/$value?doc_type=pdf&file_name=" + delItems.MediaName + "&language_code=" + delItems.LanguageCode,
                                cache: false,
                                contentType: false,
                                processData: false,
                                // data: delItems,
                                success: function (data) {
                                    // aCatalogue.splice(aCatalogue[i-1], 1);
                                    oModel.setProperty("/bBusy", false);
                                    oModel.refresh(true);
                                    var sMessage = "PDF Deleted!";
                                    MessageToast.show(sMessage);
                                    
                                    //oRouter.navTo("RouteHome");
                                    this.showPdfList();
                                }.bind(this),
                                error: function () { },
                            });
                        }
                        else {
                            aCatalogue.splice(i);
                        }
                        aCatalogue.splice(i);

                    }

                }
            },



        });
    });
