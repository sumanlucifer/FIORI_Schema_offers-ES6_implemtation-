sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, JSONModel, History, formatter) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Manage_FAQ.controller.Object", {

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
            this.getModel("objectView").setProperty("/sMode", "E");
            this.getModel("objectView").setProperty("/busy", true);
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel().metadataLoaded().then(function () {
                var sObjectPath = this.getModel().createKey("/MasterFAQSet", {
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

            var oViewModel = this.getModel("objectView");
            oViewModel.setProperty("/busy", false);
            this._pendingDelOps = [];
            if (data) {
                oViewModel.setProperty("/oDetails", data);
                return;
            }
            oViewModel.setProperty("/oDetails", {
                FAQCategoryId: null,
                Question: "",
                Answer: ""
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

		/* 
		 * @function
		 * Save edit or create FAQ details 
		 */
        onSave: function () {
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
            this.CUOperation(oPayload);
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
                aCtrlMessage = [];

            if (!data.FAQCategoryId) {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_VALDTN_ERR_FAQCATEGORYID");
                aCtrlMessage.push({
                    message: "MSG_VALDTN_ERR_FAQCATEGORYID",
                    target: "/oDetails/FAQCategoryId"
                });
            } else
                if (!data.Question) {
                    oReturn.IsNotValid = true;
                    oReturn.sMsg.push("MSG_VALDTN_ERR_QUESTION");
                    aCtrlMessage.push({
                        message: "MSG_VALDTN_ERR_QUESTION",
                        target: "/oDetails/Question"
                    });
                } else
                    if (!data.Answer) {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_VALDTN_ERR_ANSWER");
                        aCtrlMessage.push({
                            message: "MSG_VALDTN_ERR_ANSWER",
                            target: "/oDetails/Answer"
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

        CUOperation: function (oPayload) {
            var oViewModel = this.getModel("objectView");
            oPayload.FAQCategoryId = parseInt(oPayload.FAQCategoryId);
            var oClonePayload = $.extend(true, {}, oPayload),
                that = this;
            debugger;
            return new Promise(function (res, rej) {
                if (oViewModel.getProperty("/sMode") === "E") {
                    var sKey = that.getModel().createKey("/MasterFAQSet", {
                        Id: oClonePayload.Id
                    });
                    that.getModel().update(sKey, oClonePayload, {
                        success: function () {
                            oViewModel.setProperty("/busy", false);
                            that.getRouter().navTo("worklist", true);
                            that.showToast.call(that, "MSG_SUCCESS_UPDATE");
                            res(oClonePayload);
                            // that.onCancel();
                        },
                        error: function () {
                            oViewModel.setProperty("/busy", false);
                            rej();
                        }
                    });
                } else {
                    // delete oClonePayload.IsArchived;
                    // oClonePayload.Id = +oClonePayload.Id;
                    that.getModel().create("/MasterFAQSet", oClonePayload, {
                        success: function (data) {
                            oViewModel.setProperty("/busy", false);
                            that.getRouter().navTo("worklist", true);
                            that.showToast.call(that, "MSG_SUCCESS_CREATE");
                            res(data);
                            // that.onCancel();
                        },
                        error: function () {
                            oViewModel.setProperty("/busy", false);
                            rej();
                        }
                    });
                }

            });
        }

        // /**
        //  * Binds the view to the object path.
        //  * @function
        //  * @param {string} sObjectPath path to the object to be bound
        //  * @private
        //  */
        // _bindView : function (sObjectPath) {
        // 	var oViewModel = this.getModel("objectView"),
        // 		oDataModel = this.getModel();

        // 	this.getView().bindElement({
        // 		path: sObjectPath,
        // 		events: {
        // 			change: this._onBindingChange.bind(this),
        // 			dataRequested: function () {
        // 				oDataModel.metadataLoaded().then(function () {
        // 					// Busy indicator on view should only be set if metadata is loaded,
        // 					// otherwise there may be two busy indications next to each other on the
        // 					// screen. This happens because route matched handler already calls '_bindView'
        // 					// while metadata is loaded.
        // 					oViewModel.setProperty("/busy", true);
        // 				});
        // 			},
        // 			dataReceived: function () {
        // 				oViewModel.setProperty("/busy", false);
        // 			}
        // 		}
        // 	});
        // },

        // _onBindingChange : function () {
        // 	var oView = this.getView(),
        // 		oViewModel = this.getModel("objectView"),
        // 		oElementBinding = oView.getElementBinding();

        // 	// No data for the binding
        // 	if (!oElementBinding.getBoundContext()) {
        // 		this.getRouter().getTargets().display("objectNotFound");
        // 		return;
        // 	}

        // 	var oResourceBundle = this.getResourceBundle(),
        // 		oObject = oView.getBindingContext().getObject(),
        // 		sObjectId = oObject.Id,
        // 		sObjectName = oObject.Id;

        // 	oViewModel.setProperty("/busy", false);

        // 	oViewModel.setProperty("/shareSendEmailSubject",
        // 	oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
        // 	oViewModel.setProperty("/shareSendEmailMessage",
        // 	oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        // }

    });

});