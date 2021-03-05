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
    "sap/ui/core/Fragment"


], function (BaseController, JSONModel, History, formatter, jQuery, deepExtend, syncStyleClass, Controller,
    ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary,
    FileSizeFormat, Device, Fragment,) {
    "use strict";



    return BaseController.extend("com.knpl.pragati.Catelogue.controller.AddCatelogue", {

        onInit: function () {
            // var oUploadCollection = this.getView().byId('UploadCollectionImage');
            // oUploadCollection.setUploadUrl("odataUrl");


        },
        // onBeforeUploadStarts: function (oEvent) {

        //     var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
        //         name: "slug",
        //         value: oEvent.getParameter("fileName")
        //     });
        //     oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

        //     var oModel = this.getView().getModel();

        //     oModel.refreshSecurityToken();

        //     var oHeaders = oModel.oHeaders;

        //     var sToken = oHeaders['x-csrf-token'];

        //     var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({

        //         name: "x-csrf-token",

        //         value: sToken

        //     });

        //     console.log(oCustomerHeaderToken);
        //     oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);

        // },
        onSelectionChangeImage: function () {
            var oUploadCollection = this.byId("UploadCollectionImage");
            // If there's any item selected, sets download button enabled
            if (oUploadCollection.getSelectedItems().length > 0) {
                this.byId("downloadButton").setEnabled(true);
                if (oUploadCollection.getSelectedItems().length === 1) {
                    this.byId("versionButton").setEnabled(true);
                } else {
                    this.byId("versionButton").setEnabled(false);
                }
            } else {
                this.byId("downloadButton").setEnabled(false);
                this.byId("versionButton").setEnabled(false);
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
                if (oUploadCollection.getSelectedItems().length === 1) {
                    this.byId("versionButton1").setEnabled(true);
                } else {
                    this.byId("versionButton1").setEnabled(false);
                }
            } else {
                this.byId("downloadButton1").setEnabled(false);
                this.byId("versionButton1").setEnabled(false);
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
         onCancelPress: function () {
            
                this.getRouter().navTo("");
               
              
                // var oModel = this.getView().getModel("data");
                // oModel.refresh();

            },
            onSave: function () {
                console.log("ONSAVE!");
            }





    });

});