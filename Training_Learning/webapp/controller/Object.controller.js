sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Training_Learning.controller.Object", {

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

            debugger;
            this.oPreviewImage = this.getView().byId("idPreviewImage");
            this.oFileUploader = this.getView().byId("idFormVideoImgUploader");

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);

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

        onAfterRendering: function () {
            //Init Validation framework
            this._initMessage();
        },

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
        _onObjectMatched: function (oEvent) {
            debugger;
            var sObjectId = oEvent.getParameter("arguments").objectId;
            // this._property = "LearningSet" + "(" + sObjectId + ")";
            // // property;
            // this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;

            // this.oPreviewImage.setSrc("/" + this.sServiceURI + this._property + "/$value");
            // this.oFileUploader.setUploadUrl("/" + this.sServiceURI + this._property + "/$value");
            // var ProfilePic = "/KNPL_PAINTER_API/api/v2/odata.svc/" + this._property + "/$value";
            // this.getModel("objectView").setProperty("/ProfilePic", ProfilePic);
            // this.oFileUploader.clear();

            var EditVideo = this.getView().getModel("i18n").getResourceBundle().getText("TtlEditVideo");
            this.getModel("objectView").setProperty("/AddEditVideo", EditVideo);

            this.getModel("objectView").setProperty("/sMode", "E");
            this.getModel("objectView").setProperty("/busy", true);
            var Id = oEvent.getParameter("arguments").Id;
            this.getModel().metadataLoaded().then(function () {
                var sObjectPath = this.getModel().createKey("/LearningSet", {
                    Id: sObjectId
                });
                // this._bindView("/" + sObjectPath);
                this.getModel().read(sObjectPath, {
                    success: this._setView.bind(this)
                });
            }.bind(this));
        },

        /** 
		 * Match for create route trigger
		 * @function 
		 */
        _onCreateObjectMatched: function () {
            // this.oPreviewImage.setVisible(false);
            // this.oFileUploader.clear();

            var AddVideo = this.getView().getModel("i18n").getResourceBundle().getText("TtlAddVideo");
            this.getModel("objectView").setProperty("/AddEditVideo", AddVideo);

            this.getModel("objectView").setProperty("/sMode", "C");
            this.getModel("objectView").setProperty("/busy", true);
            this._setView();
        },

		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit Event scenerios
		 * @returns to terminate further execution
		 */
        _setView: function (data) {

            this._oMessageManager.removeAllMessages();
            debugger;
            var oViewModel = this.getModel("objectView");
            oViewModel.setProperty("/busy", false);
            this._pendingDelOps = [];
            if (data) {
                oViewModel.setProperty("/oDetails", data);
                return;
            }
            oViewModel.setProperty("/oDetails", {
                TrainingTypeId: 3,
                Title: "",
                Url: ""
            });
        },

        _initMessage: function () {
            //MessageProcessor could be of two type, Model binding based and Control based
            //we are using Model-binding based here
            var oMessageProcessor = this.getModel("objectView");
            this._oMessageManager = sap.ui.getCore().getMessageManager();
            this._oMessageManager.registerMessageProcessor(oMessageProcessor);
        },

		/*
		 * @function
		 * Cancel current object action
		 */
        onCancel: function () {
            this.getRouter().navTo("worklist", true);
        },

        onUpload: function (oEvent) {
            var oFile = oEvent.getSource().FUEl.files[0];
            this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
            // if (oEvent.getSource().oFileUpload.files.length > 0) {
            //     var file = oEvent.getSource().oFileUpload.files[0];
            //     var path = URL.createObjectURL(file);
            //     this.oPreviewImage.setSrc(path);
            //     this.oPreviewImage.setVisible(true);
            // } else {
            //     if (this._action === "add") {
            //         this.oPreviewImage.setSrc(path);
            //         this.oPreviewImage.setVisible(false);
            //     } else {
            //         this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value");
            //     }
            // }
        },

        getImageBinary: function (oFile) {
            var oFileReader = new FileReader();
            var sFileName = oFile.name;
            return new Promise(function (res, rej) {

                if (!(oFile instanceof File)) {
                    res(oFile);
                    return;
                }

                oFileReader.onload = function () {
                    res({
                        Image: oFileReader.result,
                        name: sFileName
                    });
                };
                res({
                    Image: oFile,
                    name: sFileName
                });
            });
        },

        _fnAddFile: function (oItem) {
            this.getModel("objectView").setProperty("/oImage", {
                Image: oItem.Image, //.slice(iIndex),
                FileName: oItem.name,
                IsArchived: false
            });

            this.getModel("objectView").refresh();
        },

        _UploadImage: function (sPath, oImage) {
            var that = this;

            return new Promise(function (res, rej) {
                if (!oImage) {
                    res();
                    return;
                }

                var settings = {
                    url: "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value",
                    //	data : fd,
                    data: oImage.Image,
                    method: "PUT",
                    headers: that.getModel().getHeaders(),
                    contentType: "multipart/form-data",
                    processData: false,
                    success: function () {
                        res.apply(that);
                    },
                    error: function () {
                        rej.apply(that);
                    }
                };

                $.ajax(settings);
            });
        },

        _uploadVideo: function (oData) {
            // var oModel = this.getComponentModel();
            var oViewModel = this.getView().getModel("objectView");
            if (oViewModel.getProperty("/sMode") === "C") {
                this.oFileUploader.setUploadUrl(this.sServiceURI + "LearningSet(" + oData.Id + ")/$value");
            }
            if (!this.oFileUploader.getValue()) {
                MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("fileUploaderChooseFirstValidationTxt"));
                return;
            }
            this.oFileUploader.checkFileReadable().then(function () {
                // @ts-ignore
                this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({ name: "slug", value: this.oFileUploader.getValue() }));
                this.oFileUploader.setHttpRequestMethod("PUT");
                this.getView().getModel("objectView").setProperty("/busy", true);
                this.oFileUploader.upload();
            }.bind(this), function (error) {
                MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("fileUploaderNotReadableTxt"));
            }.bind(this)).then(function () {
                this.oFileUploader.clear();
            }.bind(this));
        },

        handleUploadComplete: function () {
            this._showSuccessMsg();
        },

        _onLoadSuccess: function (oData) {
            if (this.oFileUploader.getValue()) {
                this._uploadVideoImage(oData);
            } else {
                this._showSuccessMsg();
            }
        },

        _onLoadError: function (error) {
            var oViewModel = this.getView().getModel("objectView");
            oViewModel.setProperty("/busy", false);
            var oRespText = JSON.parse(error.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
        },

        _showSuccessMsg: function () {
            var oViewModel = this.getView().getModel("objectView");
            oViewModel.setProperty("/busy", false);
            var sMessage = (oViewModel.getProperty("/sMode") === "C") ? this.getView().getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_CREATE") : this.getView().getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_UPDATE");
            MessageToast.show(sMessage);
            // this._navToHome();
            this.getRouter().navTo("worklist", true);
        },

		/* 
		 * @function
		 * Save edit or create FAQ details 
		 */
        onSaveVideo: function (oEvent) {
            debugger;
            this._oMessageManager.removeAllMessages();

            var oViewModel = this.getModel("objectView");
            var oPayload = oViewModel.getProperty("/oDetails"),
                oValid = this._fnValidation(oPayload);

            if (oValid.IsNotValid) {
                this.showError(this._fnMsgConcatinator(oValid.sMsg));
                return;
            }
            oViewModel.setProperty("/busy", true);
            this.CUOperation(oPayload, oEvent);
        },

		/*
		 * To validate values of payload
		 * @constructor  
		 * @param data : data to be tested upon
		 * @returns Object
		 * @param IsNotValid : true for failed validation cases
		 * @param sMsg : Warning message to be shown for validation error
		 * 
		 * 
		 */
        _fnValidation: function (data) {
            var oReturn = {
                IsNotValid: false,
                sMsg: []
            },
                url = data.Url,
                aCtrlMessage = [];
            var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

            if (data.Title === "") {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTL");
                aCtrlMessage.push({
                    message: "MSG_PLS_ENTER_ERR_TTL",
                    target: "/oDetails/Title"
                });
            } else
                if (data.Url === "") {
                    oReturn.IsNotValid = true;
                    oReturn.sMsg.push("MSG_PLS_ENTER_ERR_URL");
                    aCtrlMessage.push({
                        message: "MSG_PLS_ENTER_ERR_URL",
                        target: "/oDetails/Url"
                    });
                } else
                    if (data.Url !== "" && !url.match(regex)) {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
                        aCtrlMessage.push({
                            message: "MSG_VALDTN_ERR_URL",
                            target: "/oDetails/Url"
                        });
                    }

            if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
            return oReturn;
        },

        _genCtrlMessages: function (aCtrlMsgs) {
            var that = this,
                oViewModel = that.getModel("objectView");
            aCtrlMsgs.forEach(function (ele) {
                that._oMessageManager.addMessages(
                    new sap.ui.core.message.Message({
                        message: that.getResourceBundle().getText(ele.message),
                        type: sap.ui.core.MessageType.Error,
                        target: ele.target,
                        processor: oViewModel,
                        persistent: true
                    }));
            });
        },

        _fnMsgConcatinator: function (aMsgs) {
            var that = this;
            return aMsgs.map(function (x) {
                return that.getResourceBundle().getText(x);
            }).join("");
        },

        CUOperation: function (oPayload, oEvent) {
            debugger;
            var oViewModel = this.getModel("objectView");
            var oClonePayload = $.extend(true, {}, oPayload),
                that = this,
                sPath = "/LearningSet";
            // return new Promise(function (res, rej) {
            if (oViewModel.getProperty("/sMode") === "E") {
                var sKey = that.getModel().createKey("/LearningSet", {
                    Id: oClonePayload.Id
                });
                that.getModel().update(sKey, oClonePayload, {

                    // success: that._onLoadSuccess.bind(that),
                    // error: that._onLoadError.bind(that)
                    success: that._UploadImage(sKey, oViewModel.getProperty("/oImage")).then(that._Success.bind(that, oEvent), that._Error.bind(
                        that)),
                    error: that._Error.bind(that)
                });
            } else {
                debugger;
                that.getModel().create("/LearningSet", oClonePayload, {
                    // success: that._onLoadSuccess.bind(that),
                    // error: that._onLoadError.bind(that)
                    success: function (createddata) {
                        var newSpath = sPath + "(" + createddata.Id + ")";
                        that._UploadImage(newSpath, oViewModel.getProperty("/oImage")).then(that._SuccessAdd.bind(that, oEvent), that._Error
                            .bind(
                                that))
                    },
                    error: this._Error.bind(this)
                });
            }
        },

        _Error: function (error) {
			MessageToast.show(error.toString());
		},

        _Success: function () {
            this.getRouter().navTo("worklist", true);
            MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_UPDATE"));
            var oModel = this.getModel();
            oModel.refresh(true);
        },

        _SuccessAdd: function () {
            this.getRouter().navTo("worklist", true);
            MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_CREATE"));
        }
    });

});