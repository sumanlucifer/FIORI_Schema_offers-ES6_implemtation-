sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "jquery.sap.global",
    "sap/base/util/deepExtend",
    "sap/ui/core/syncStyleClass",
    "sap/ui/core/mvc/Controller",
    "sap/m/ObjectMarker",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter",
    "sap/m/library",
    "sap/ui/core/format/FileSizeFormat",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "sap/m/PDFViewer"

], function (BaseController, JSONModel, History, formatter, jQuery, deepExtend, syncStyleClass, Controller,
    ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary,
    FileSizeFormat, Device, Fragment, PDFViewer
) {
    "use strict";

    var ListMode = MobileLibrary.ListMode,
        ListSeparators = MobileLibrary.ListSeparators;

    return BaseController.extend("com.knpl.pragati.Catelogue.controller.Object", {

        formatter: formatter,
        _oDialog: null,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
        onInit: function () {

            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var iOriginalBusyDelay,
                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0,
                });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            // Store original busy indicator delay, so it can be restored later on
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
            this.setModel(oViewModel, "objectView");
            this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                // Restore original busy indicator delay for the object view
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            }
            );

            this._pdfViewer = new PDFViewer();
            // this._pdfViewer.setShowDownloadButton(this.getOwnerComponent().getModel("appView").getProperty("/loggedUserRoleId")!=2)
            this.getView().addDependent(this._pdfViewer);




        },
        onAfterRendering: function () {
                this._pdfViewer.setShowDownloadButton(this.getModel("appView").getProperty("/loggedUserRoleId")!=2);
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
        _onObjectMatched: function (oEvent) {

            var oData = {

                Catalogue: []

            };
            

            var sObjectId = oEvent.getParameter("arguments").objectId;
            this._property = oEvent.getParameter("arguments").property;

            this.getModel().metadataLoaded().then(function () {
                var sObjectPath = this.getModel().createKey("ProductCatalogueSet", {
                    Id: sObjectId
                });
                this._bindView("/" + sObjectPath);

                this.property = sObjectPath;
                this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_DS.uri;
                this.pdfURI = this.sServiceURI + sObjectPath + "/$value?doc_type=pdf";
                this.imgURI = this.sServiceURI + sObjectPath + "/$value?doc_type=image";

               

                var oModel = new JSONModel();
                oModel.setData({Image: this.imgURI});
                this.getView().setModel(oModel,"ImageModel");
                this.getView().getModel("ImageModel").refresh(true);
            }.bind(this));



        },



		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
        _bindView: function (sObjectPath) {
            var oViewModel = this.getModel("objectView"),
                oDataModel = this.getModel();

            this.getView().bindElement({
                path: sObjectPath,
                parameters: {
                    expand: "CreatedByDetails,ProductCategory,ProductClassification,ProductRange,ProductCompetitors,MediaList",
                    // select: "Title,CreatedAt,Status,CreatedByDetails/Name"
                },
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oDataModel.metadataLoaded().then(function () {
                            // Busy indicator on view should only be set if metadata is loaded,
                            // otherwise there may be two busy indications next to each other on the
                            // screen. This happens because route matched handler already calls '_bindView'
                            // while metadata is loaded.
                            oViewModel.setProperty("/busy", true);
                        });
                    },
                    dataReceived: function (oEvent) {
                        oViewModel.setProperty("/busy", false);

                        var data = oEvent.getParameter('data');

                        var imgSize = data.MediaList[0].MediaSize;
                        var pdfSize = data.MediaList[1].MediaSize;
                        var imgName = data.MediaList[0].MediaName;
                        var pdfName = data.MediaList[1].MediaName;
                        var productCompetitors= data.ProductCompetitors;
                        var media=data.MediaList.filter(function(ele){
                            return !ele.ContentType.includes("image");
                            
                        });

                        oViewModel.setProperty("/ImageSize", imgSize + " KB");
                        oViewModel.setProperty("/PdfSize", pdfSize + " KB");
                        oViewModel.setProperty("/ImageName", imgName);
                        oViewModel.setProperty("/PdfName", pdfName);

                        oViewModel.setProperty("/Competitor", productCompetitors);
                        oViewModel.setProperty("/Catalogue", media);



                    }
                }

            });

        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Id,
                sObjectName = oObject.Title;
            oViewModel.setProperty("/busy", false);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },
        handleAllCatelogueLinkPress: function () {

            this._navToHome();
        },
        createObjectMarker: function (sId, oContext) {
            var mSettings = null;

            if (oContext.getProperty("type")) {
                mSettings = {
                    type: "{type}",
                    press: this.onMarkerPress
                };
            }
            return new ObjectMarker(sId, mSettings);
        },

        formatAttribute: function (sValue) {
            if (jQuery.isNumeric(sValue)) {
                return FileSizeFormat.getInstance({
                    binaryFilesize: false,
                    maxFractionDigits: 1,
                    maxIntegerDigits: 3
                }).format(sValue);
            } else {
                return sValue;
            }
        },
        onSelectionChangeImage: function () {
            var oUploadCollection = this.byId("UploadCollectionImage");
            // If there's any item selected, sets download button enabled
            if (oUploadCollection.getSelectedItems().length > 0) {
                this.byId("downloadButton").setEnabled(true);
                // if (oUploadCollection.getSelectedItems().length === 1) {
                //     this.byId("versionButton").setEnabled(true);
                // } else {
                //     this.byId("versionButton").setEnabled(false);
                // }
            } else {
                this.byId("downloadButton").setEnabled(false);
                //this.byId("versionButton").setEnabled(false);
            }
        },
        onDownloadImage: function () {
            var oUploadCollection = this.byId("UploadCollectionImage");
            var aSelectedItems = oUploadCollection.getSelectedItems();
            if (aSelectedItems) {
                for (var i = 0; i < aSelectedItems.length; i++) {
                    oUploadCollection.downloadItem(aSelectedItems[i], true);
                }
            } else {
                MessageToast.show("Select an item to download");
            }
        },

        onVersionImage: function () {
            var oUploadCollection = this.byId("UploadCollection");
            this.bIsUploadVersion = true;
            this.oItemToUpdate = oUploadCollection.getSelectedItem();
            oUploadCollection.openFileDialog(this.oItemToUpdate);
        },
        onSelectionChangePdf: function () {
            var oUploadCollection = this.byId("UploadCollectionPdf");
            // If there's any item selected, sets download button enabled
            if (oUploadCollection.getSelectedItems().length > 0) {
                this.byId("downloadButton1").setEnabled(true);
                // if (oUploadCollection.getSelectedItems().length === 1) {
                //     this.byId("versionButton1").setEnabled(true);
                // } else {
                //     this.byId("versionButton1").setEnabled(false);
                // }
            } else {
                this.byId("downloadButton1").setEnabled(false);
                //this.byId("versionButton1").setEnabled(false);
            }
        },
        onDownloadPdf: function () {
            var oUploadCollection = this.byId("UploadCollectionPdf");
            var aSelectedItems = oUploadCollection.getSelectedItems();
            if (aSelectedItems) {
                for (var i = 0; i < aSelectedItems.length; i++) {
                    oUploadCollection.downloadItem(aSelectedItems[i], true);
                }
            } else {
                MessageToast.show("Select an item to download");
            }
        },
        onVersionPdf: function () {
            var oUploadCollection = this.byId("UploadCollectionPdf");
            this.bIsUploadVersion = true;
            this.oItemToUpdate = oUploadCollection.getSelectedItem();
            oUploadCollection.openFileDialog(this.oItemToUpdate);
        },
        // onPressPdf: function (oEvent) {
        //     var sSource = sServiceUri + "ProductCatalogueSet(" + oData.Id + ")/$value?doc_type=pdf&file_name=" + ele.fileName + "&language_code=" + ele.LanguageCode;
        //     this._pdfViewer.setSource(sSource);
        //     this._pdfViewer.setTitle("Catalogue");
        //     this._pdfViewer.open();
        // },
        openPdf: function (oEvent) {
            var oContext=oEvent.getSource().getBindingContext("objectView"); 
            var sSource =  this.sServiceURI + this.property+"/$value?doc_type=pdf&file_name=" + oContext.getProperty("MediaName") + "&language_code=" + oContext.getProperty("LanguageCode");
            // this._pdfViewer.setSource(sSource);
            //         this._pdfViewer.setTitle("Catalogue");
            //         this._pdfViewer.open();
            sap.m.URLHelper.redirect(sSource, true);



        },
        // onPressImage: function (oEvent) {
        //     var oItem = oEvent.getSource().getParent();
        //     var oContext = oItem.getBindingContext();
        //     //console.log(oContext);
        //     if (!this._oDialog) {
        //         this._oDialog = sap.ui.xmlfragment("com.knpl.pragati.Catelogue.view.fragments.ImagePopup", this);
        //          this._oDialog.setModel(this.getView().getModel("ImageModel"));


        //     }
        //     this._oDialog.setBindingContext(oContext);
        //     this._oDialog.open();
        // },
        // onDialogOK: function () {
        //     this._oDialog.close();
        // }


















    });

});