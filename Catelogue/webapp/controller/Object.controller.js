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

], function (BaseController, JSONModel, History, formatter, DateFormat, jQuery, deepExtend, syncStyleClass, Controller,
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
                var sObjectPath = this.getModel().createKey("PainterSet", {
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
                sObjectId = oObject.ProductID,
                sObjectName = oObject.ProductName;

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

        onChange: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            // Header Token
            var oCustomerHeaderToken = new UploadCollectionParameter({
                name: "x-csrf-token",
                value: "securityTokenFromModel"
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onFileDeleted: function (oEvent) {
            this.deleteItemById(oEvent.getParameter("documentId"));
            MessageToast.show("FileDeleted event triggered.");
        },

        deleteItemById: function (sItemToDeleteId) {
            var oData = this.byId("UploadCollection").getModel().getData();
            var aItems = deepExtend({}, oData).items;
            jQuery.each(aItems, function (index) {
                if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
                    aItems.splice(index, 1);
                }
            });
            this.byId("UploadCollection").getModel().setData({
                "items": aItems
            });
            this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
        },

        deleteMultipleItems: function (aItemsToDelete) {
            var oData = this.byId("UploadCollection").getModel().getData();
            var nItemsToDelete = aItemsToDelete.length;
            var aItems = deepExtend({}, oData).items;
            var i = 0;
            jQuery.each(aItems, function (index) {
                if (aItems[index]) {
                    for (i = 0; i < nItemsToDelete; i++) {
                        if (aItems[index].documentId === aItemsToDelete[i].getDocumentId()) {
                            aItems.splice(index, 1);
                        }
                    }
                }
            });
            this.byId("UploadCollection").getModel().setData({
                "items": aItems
            });
            this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
        },

        onFilenameLengthExceed: function () {
            MessageToast.show("FilenameLengthExceed event triggered.");
        },

        onFileRenamed: function (oEvent) {
            var oData = this.byId("UploadCollection").getModel().getData();
            var aItems = deepExtend({}, oData).items;
            var sDocumentId = oEvent.getParameter("documentId");
            jQuery.each(aItems, function (index) {
                if (aItems[index] && aItems[index].documentId === sDocumentId) {
                    aItems[index].fileName = oEvent.getParameter("item").getFileName();
                }
            });
            this.byId("UploadCollection").getModel().setData({
                "items": aItems
            });
            MessageToast.show("FileRenamed event triggered.");
        },

        onFileSizeExceed: function () {
            MessageToast.show("FileSizeExceed event triggered.");
        },

        onTypeMissmatch: function () {
            MessageToast.show("TypeMissmatch event triggered.");
        },

        onUploadComplete: function (oEvent) {
            var oUploadCollection = this.byId("UploadCollection");
            var oData = oUploadCollection.getModel().getData();

            oData.items.unshift({
                "documentId": Date.now().toString(), // generate Id,
                "fileName": oEvent.getParameter("files")[0].fileName,
                "mimeType": "",
                "thumbnailUrl": "",
                "url": "",
                "attributes": [
                    {
                        "title": "Uploaded By",
                        "text": "You",
                        "active": false
                    },
                    {
                        "title": "Uploaded On",
                        "text": new Date().toLocaleDateString(),
                        "active": false
                    },
                    {
                        "title": "File Size",
                        "text": "505000",
                        "active": false
                    }
                ],
                "statuses": [
                    {
                        "title": "",
                        "text": "",
                        "state": "None"
                    }
                ],
                "markers": [
                    {
                    }
                ],
                "selected": false
            });
            this.getView().getModel().refresh();

            // Sets the text to the label
            this.byId("attachmentTitle").setText(this.getAttachmentTitleText());

            // delay the success message for to notice onChange message
            setTimeout(function () {
                MessageToast.show("UploadComplete event triggered.");
            }, 4000);
        },

        onBeforeUploadStarts: function (oEvent) {
            // Header Slug
            var oCustomerHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            MessageToast.show("BeforeUploadStarts event triggered.");
        },

        onUploadTerminated: function () {
			/*
			// get parameter file name
			var sFileName = oEvent.getParameter("fileName");
			// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
			var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
			*/
        },

        onFileTypeChange: function (oEvent) {
            this.byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
        },

        onSelectAllPress: function (oEvent) {
            var oUploadCollection = this.byId("UploadCollection");
            if (!oEvent.getSource().getPressed()) {
                this.deselectAllItems(oUploadCollection);
                oEvent.getSource().setPressed(false);
                oEvent.getSource().setText("Select all");
            } else {
                this.deselectAllItems(oUploadCollection);
                oUploadCollection.selectAll();
                oEvent.getSource().setPressed(true);
                oEvent.getSource().setText("Deselect all");
            }
            this.onSelectionChange(oEvent);
        },

        deselectAllItems: function (oUploadCollection) {
            var aItems = oUploadCollection.getItems();
            for (var i = 0; i < aItems.length; i++) {
                oUploadCollection.setSelectedItem(aItems[i], false);
            }
        },

        getAttachmentTitleText: function () {
            var aItems = this.byId("UploadCollection").getItems();
            return "Uploaded (" + aItems.length + ")";
        },

        onModeChange: function (oEvent) {
            var oSettingsModel = this.getView().getModel("settings");
            if (oEvent.getParameters().selectedItem.getProperty("key") === ListMode.MultiSelect) {
                oSettingsModel.setProperty("/visibleEdit", false);
                oSettingsModel.setProperty("/visibleDelete", false);
                this.enableToolbarItems(true);
            } else {
                oSettingsModel.setProperty("/visibleEdit", true);
                oSettingsModel.setProperty("/visibleDelete", true);
                this.enableToolbarItems(false);
            }
        },

        enableToolbarItems: function (status) {
            this.byId("selectAllButton").setVisible(status);
            this.byId("deleteSelectedButton").setVisible(status);
            this.byId("selectAllButton").setEnabled(status);
            // This is only enabled if there is a selected item in multi-selection mode
            if (this.byId("UploadCollection").getSelectedItems().length > 0) {
                this.byId("deleteSelectedButton").setEnabled(true);
            }
        },

        onDeleteSelectedItems: function () {
            var aSelectedItems = this.byId("UploadCollection").getSelectedItems();
            this.deleteMultipleItems(aSelectedItems);
            if (this.byId("UploadCollection").getSelectedItems().length < 1) {
                this.byId("selectAllButton").setPressed(false);
                this.byId("selectAllButton").setText("Select all");
            }
            MessageToast.show("Delete selected items button press.");
        },

        onSearch: function () {
            MessageToast.show("Search feature isn't available in this sample");
        },

        onSelectionChange: function () {
            var oUploadCollection = this.byId("UploadCollection");
            // Only it is enabled if there is a selected item in multi-selection mode
            if (oUploadCollection.getMode() === ListMode.MultiSelect) {
                if (oUploadCollection.getSelectedItems().length > 0) {
                    this.byId("deleteSelectedButton").setEnabled(true);
                } else {
                    this.byId("deleteSelectedButton").setEnabled(false);
                }
            }
        },

        onAttributePress: function (oEvent) {
            MessageToast.show("Attribute press event - " + oEvent.getSource().getTitle() + ": " + oEvent.getSource().getText());
        },

        onMarkerPress: function (oEvent) {
            MessageToast.show("Marker press event - " + oEvent.getSource().getType());
        },

        onOpenAppSettings: function (oEvent) {
            var oView = this.getView();

            if (!this._pSettingsDialog) {
                this._pSettingsDialog = Fragment.load({
                    id: oView.getId(),
                    name: "sap.m.sample.UploadCollection.AppSettings",
                    controller: this
                }).then(function (oSettingsDialog) {
                    oView.addDependent(oSettingsDialog);
                    return oSettingsDialog;
                });
            }

            this._pSettingsDialog.then(function (oSettingsDialog) {
                syncStyleClass("sapUiSizeCompact", oView, oSettingsDialog);
                oSettingsDialog.setContentWidth("42rem");
                oSettingsDialog.open();
            });
        },

        onDialogCloseButton: function () {
            this._pSettingsDialog.then(function (oSettingsDialog) {
                oSettingsDialog.close();
            });
        }

    });

});