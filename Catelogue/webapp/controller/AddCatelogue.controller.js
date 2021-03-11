sap.ui.define([
    "./BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",


], function (BaseController, UploadCollectionParameter, JSONModel, MessageBox, MessageToast) {
    "use strict";

    var token;
    var catalogueId;

    return BaseController.extend("com.knpl.pragati.Catelogue.controller.AddCatelogue", {

        onInit: function () {

            this.oUploadCollection = this.getView().byId("UploadCollectionImage");

        },
        _onObjectMatched: function (oEvent) {
            this._action = oEvent.getParameter("arguments").action;
            this._property = oEvent.getParameter("arguments").property;
            this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_DS.uri;
            var oData = {
                busy: false,
                action: this._action,
                Title: "",
                Description: "",
                Url: "",
            };
            // if (this._action === "edit") {
            //     var oComponentModel = this.getComponentModel();
            //     var oItem = oComponentModel.getProperty("/" + this._property);
            //     if (!oItem) {
            //         return this._navToHome();
            //     }
            //     oData.Title = oItem.Title;
            //     oData.Description = oItem.Description;
            //     oData.Url = oItem.Url;
            //     this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value");
            //     this.oUploadCollection.setUploadUrl(this.sServiceURI + this._property + "/$value");
            // } else {
            this.oPreviewImage.setVisible(false);
            // }
            this.oUploadCollection.clear();
            var oViewModel = new JSONModel(oData);
            this.getView().setModel(oViewModel, "ActionViewModel");
            this._setDefaultValueState();
        },

        onChange: function (oEvent) {
            // var oUploadCollection = oEvent.getSource();
            // // Header Token
            // var oCustomerHeaderToken = new UploadCollectionParameter({
            //     name: "x-csrf-token",
            //     value: "securityTokenFromModel"
            // });
            // oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
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

                        that.oUploadCollection.setProperty("uploadUrl", uri + "MasterProductCatalogueSet(" + id + ")/$value?doc_type=image");
  
                        that.oUploadCollection._oFileUploader.setHttpRequestMethod("PUT");


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

        // uploadImage: function (Id) {
        //     console.log(Id);

        //     this.oUploadCollection.setUploadUrl(this.sServiceURI + "MasterProductCatalogueSet(" + Id + ")/$value?doc_type=image");
        //     //    this.oUploadCollection.checkFileReadable().then(function() {
        //     // @ts-ignore
        //     this.oUploadCollection.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({ name: "slug", value: this.oUploadCollection.getItems() }));
        //     this.oUploadCollection.setHttpRequestMethod("POST");
        //     //this.getView().getModel("ActionViewModel").setProperty("/busy", true);
        //     this.oUploadCollection.upload();
        //     // }.bind(this), function(error) {
        //     // 	MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
        //     // }.bind(this)).then(function() {
        //     // 	this.oFileUploader.clear();
        //     // }.bind(this));


        // }







    });

});