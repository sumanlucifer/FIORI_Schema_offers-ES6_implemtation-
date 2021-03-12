sap.ui.define([
    "./BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "../model/formatter",
   


], function (BaseController, UploadCollectionParameter, JSONModel, MessageBox, MessageToast,History,formatter) {
    "use strict";

    var token;
    var catalogueId;

    return BaseController.extend("com.knpl.pragati.Catelogue.controller.EditCatelogue", {

        onInit: function () {
             var iOriginalBusyDelay,
                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });

            this.getRouter().getRoute("Edit").attachPatternMatched(this._onObjectMatched, this);

            // Store original busy indicator delay, so it can be restored later on
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
            this.setModel(oViewModel, "editView");
            this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                // Restore original busy indicator delay for the object view
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            }
            );

            this.oUploadCollection = this.getView().byId("UploadCollectionImage");

        },
         _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel().metadataLoaded().then(function () {
                var sObjectPath = this.getModel().createKey("MasterProductCatalogueSet", {
                    Id: sObjectId
                });
                console.log(sObjectPath);
                this._bindView("/" + sObjectPath);
            }.bind(this));
        },
        _bindView: function (sObjectPath) {
            var oViewModel = this.getModel("editView"),
                oDataModel = this.getModel();

            this.getView().bindElement({
                path: sObjectPath,
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
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },
        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getModel("editView"),
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
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        onChange: function (oEvent) {
           
            MessageToast.show("Event change triggered");
        },
       

        onStartUpload: function (oEvent) {

            //var oUploadCollection =this.getView().byId("")
            var title = this.getView().byId("idTitle").getValue();

            var cFiles = this.oUploadCollection.getItems().length;
            var uploadInfo = cFiles + " file(s)";

            var oModel = this.getView().getModel();

            var oData = {
                Title: title,
                Description: title
            }

            var that = this;
            oModel.create("/MasterProductCatalogueSet", oData, {
                success: function (oData, response) {
                    //console.log(oData.Id);

                    // that.catalogueId = oData.Id;

                    if (cFiles > 0) {

                        // if (that.catalogueId != null) {
                        var id = oData.Id;
                        console.log(id);
                        var uri = that.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_DS.uri;
                        console.log(uri);

                       // that.oUploadCollection.setProperty("uploadUrl", uri + "MasterProductCatalogueSet(" + id + ")/$value?doc_type=image");
                        that.oUploadCollection._oFileUploader.setUploadUrl(uri + "MasterProductCatalogueSet(" + id + ")/$value?doc_type=image");
                        
                        that.oUploadCollection._oFileUploader.setHttpRequestMethod("PUT");

                        var url = that.oUploadCollection._oFileUploader.getUploadUrl();
                        console.log(url);
                        

                        that.oUploadCollection._oFileUploader.upload();
                        // }

                    }

                    //oData -  contains the data of the newly created entry
                    //response -  parameter contains information about the response of the request (this may be your message)
                },

                error: function (oError) {
                    //oError - contains additional error information.
                }
            });



        },

       







    });

});