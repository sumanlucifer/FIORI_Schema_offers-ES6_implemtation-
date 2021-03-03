// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/Tools/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Avatar"
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageBox, MessageToast, Avatar) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Tools.controller.DetailPage", {
        onInit: function () {
            //Router Object
            var oViewModel = new JSONModel({
                busy: false
            });
            this.getView().setModel(oViewModel, "DetailViewModel");
            this.oViewModel = this.getView().getModel("DetailViewModel");
            this.oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            this._property = oEvent.getParameter("arguments").property;
            var oDataModel = this.getComponentModel();
            this.getView().getModel("DetailViewModel").setProperty("/busy", true);
            oDataModel.read("/" + this._property, {
                urlParameters: {
                    $expand: "CreatedByDetails"
                },
                success: this._onLoadSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
            this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.KNPL_TLS.uri;
            this._setToolImageSrc(true);
        },

        _onLoadSuccess: function (oData) {
            this.oViewModel.setData(oData);
            this.oViewModel.setProperty("/busy", false);
        },

        _onLoadError: function (error) {
            this.oViewModel.setProperty("/busy", false);
            var oRespText = JSON.parse(error.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
        },

        onChangeStatus: function (oEvent) {
            var oSource = oEvent.getSource();
            var sSelectedKey = oSource.getSelectedKey();
            if (sSelectedKey === "active") {
                this._updateStatus(true);
            } else {
                MessageBox.confirm(this.oResourceBundle.getText("changeStatusConfirmationMsg"), {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._updateStatus(false);
                        } else {
                            oSource.setSelectedKey("active");
                        }
                    }.bind(this)
                });
            }
        },

        _updateStatus: function (bStatus) {
            var oModel = this.getComponentModel();
            var oPayload = {
                Status: bStatus
            };
            this.oViewModel.setProperty("/busy", true);
            oModel.update("/" + this._property, oPayload, {
                success: this._onLoadStatusSuccess.bind(this),
                error: this._onLoadError.bind(this)
            });
        },

        _onLoadStatusSuccess: function (oData) {
            MessageToast.show(this.oResourceBundle.getText("statusChangeSuccessMsg"));
            this.oViewModel.setProperty("/busy", false);
        },

        onPressEditImage: function () {
            if (!this._oDialog) {
                // @ts-ignore
                this._oDialog = sap.ui.xmlfragment("com.knpl.pragati.Tools.view.fragment.UploadImageDialog", this);
                this.getView().addDependent(this._oDialog);
            }
            // @ts-ignore
            sap.ui.getCore().byId("idToolImgUploader").setUploadUrl(this.sServiceURI + this._property + "/$value");
            this._oDialog.open();
        },

        onPressClose: function () {
            this._oDialog.close();
        },

        onPressUpload: function () {
            // @ts-ignore
            var oFileUploader = sap.ui.getCore().byId("idToolImgUploader");
            var oModel = this.getComponentModel();
            if (!oFileUploader.getValue()) {
				MessageToast.show(this.oResourceBundle.getText("fileUploaderChooseFirstValidationTxt"));
				return;
			}
			oFileUploader.checkFileReadable().then(function() {
				// @ts-ignore
				oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({name: "slug", value: oFileUploader.getValue() }));
                oFileUploader.setHttpRequestMethod("PUT");
                oFileUploader.setSendXHR(true);
                this.oViewModel.setProperty("/busy", true);
                oFileUploader.upload();
                this._oDialog.close();
			}.bind(this), function(error) {
				MessageToast.show(this.oResourceBundle.getText("fileUploaderNotReadableTxt"));
			}.bind(this)).then(function() {
				oFileUploader.clear();
			});
        },

        handleTypeMissmatch: function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			// @ts-ignore
			jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value;});
			var sSupportedFileTypes = aFileTypes.join(", ");
			MessageToast.show(this.oResourceBundle.getText("fileUploaderformatNotSupportedTxt1") + oEvent.getParameter("fileType") + " " +
                                this.oResourceBundle.getText("fileUploaderformatNotSupportedTxt2") + " " +
                                sSupportedFileTypes);
		},

        handleUploadComplete: function (oEvent) {
            var iStatus = oEvent.getParameter("status");
            var sFileName = oEvent.getParameter("fileName");
            var sMsg = "";
			if (iStatus === 200) {
                sMsg = this.oResourceBundle.getText("fileUploaderReturnCodeMsgTxt") + " " + iStatus + "\n" + sFileName + " " + this.oResourceBundle.getText("fileUploaderSuccessMsgTxt");
                oEvent.getSource().setValue("");
            } else {
                sMsg = this.oResourceBundle.getText("fileUploaderReturnCodeMsgTxt") + " " + iStatus + "\n" + sFileName + " " + this.oResourceBundle.getText("fileUploaderErrorMsgTxt");
            }
            this.oViewModel.setProperty("/busy", false);
            MessageToast.show(sMsg);
            this._setToolImageSrc(false);
        },

        _setToolImageSrc: function (bInitialLoad) {
            if (bInitialLoad) {
                var oToolImage = this.getView().byId("idToolImg");
                oToolImage.setSrc(this.sServiceURI + this._property + "/$value");
            } else {
                var oToolImageContainer = this.getView().byId("idToolImgContainer");
                oToolImageContainer.removeItem(0);
                var oNewToolImage = new Avatar({
                    displaySize: "L",
                    displayShape: "Circle",
                    src: this.sServiceURI + this._property + "/$value"
                });
                oToolImageContainer.insertItem(oNewToolImage);   
            }      
        }
    });
});
