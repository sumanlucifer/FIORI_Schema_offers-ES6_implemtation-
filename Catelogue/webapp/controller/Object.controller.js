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
    FileSizeFormat, Device, Fragment
) {
    "use strict";

    var ListMode = MobileLibrary.ListMode,
        ListSeparators = MobileLibrary.ListSeparators;

    return BaseController.extend("com.knpl.pragati.Catelogue.controller.Object", {

        formatter: formatter,

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
                    delay: 0
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
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel().metadataLoaded().then(function () {
                var sObjectPath = this.getModel().createKey("MasterProductCatalogueSet", {
                    Id: sObjectId
                });
                this._bindView("/" + sObjectPath);
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
            this.oRouter.navTo("");
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

        // onChange: function (oEvent) {

            
        //     var oUploadCollection = oEvent.getSource();
        //     // Header Token
        //     var oCustomerHeaderToken = new UploadCollectionParameter({
        //         name: "x-csrf-token",
        //         value: this.getModel().getSecurityToken()
        //     });
        //     oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        // },
        // onSave : function () {
        //     var collection=this.getView().byId('UploadCollection');

        //     collection.upload();
        // },
        	onSelectionChangeImage: function() {
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
        	onDownloadImage: function() {
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

		onVersion: function() {
			var oUploadCollection = this.byId("UploadCollection");
			this.bIsUploadVersion = true;
			this.oItemToUpdate = oUploadCollection.getSelectedItem();
			oUploadCollection.openFileDialog(this.oItemToUpdate);
		},
        

       

       
        

      

       
       

        

        
        


    });

});