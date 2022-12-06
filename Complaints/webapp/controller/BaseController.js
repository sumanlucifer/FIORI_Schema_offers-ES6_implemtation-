sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, mobileLibrary, MessageToast, JSONModel) {
    "use strict";
    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;
    return Controller.extend("com.knpl.pragati.Complaints.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },
        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },
        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },
        fmtStatus: function (sStatus) {
            var newStatus = "";
            if (sStatus === "REGISTERED") {
                newStatus = "Registered";
            } else if (sStatus === "INREVIEW") {
                newStatus = "In Review";
            } else if (sStatus === "RESOLVED") {
                newStatus = "Resolved";
            } else if (sStatus === "WITHDRAWN") {
                newStatus = "Withdrawn";
            } ///// aaded by Deepanjali for REOPEN////
            else if (sStatus === "REOPEN") {
                newStatus = "Reopen";
            }
            return newStatus;
        },
        fmtStatusHeader: function (sStatus, sId) {
            var newStatus = "";
            if (sStatus === "REGISTERED") {
                newStatus = "Registered";
            } else if (sStatus === "INREVIEW") {
                if (sId > 0) {
                    newStatus = "In Review (Reopen)";
                } else {
                    newStatus = "In Review"
                }
            } else if (sStatus === "RESOLVED") {
                newStatus = "Resolved";
            } else if (sStatus === "WITHDRAWN") {
                newStatus = "Withdrawn";
            } else if (sStatus === "REOPEN") {
                newStatus = "Reopen";
            }
            return newStatus;
        },
        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        _getRoleLevel: function (sRole) {
            switch (sRole) {
                case "AGENT":
                    return 1;
                case "TL":
                    return 2;
                case "CC_PROJECT_MANAGER":
                    return 3;
                case "HO_MARKETING":
                    return 4;
                default:
                    return 1;
            }
        },
        showMessageToast: function (reopenText) {
            MessageToast.show(this.getResourceBundle().getText(reopenText));
        },
        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress: function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },
        /**
         * Getting Complaint Type data
         * @private
         * @return 
         */
        _getMasterComplaintType: function () {
            var that = this;
            var oView = this.getView();
            var oData = oView.getModel();
            var oModel = oView.getModel('oModelView');
            var sLanguageCode = oModel.getProperty("/addComplaint/LanguageCode");
            var sPath = "/MasterComplaintTypeSet"

            oData.read(sPath, {
                urlParameters: {
                    LanguageCode: sLanguageCode
                },
                success: function (obj) {
                    var oMasterComplaintType = new JSONModel(obj);
                    that.getView().setModel(oMasterComplaintType, "MasterComplaintType");
                },
                error: function () { }
            })
        },
        /**
                 * Getting Complaint Sub type data
                 * @private
                 * @return 
                 */
         _getMasterComplaintSubType: function () {
            var that = this;
            var oView = this.getView();
            var oData = oView.getModel();
            var oModel = oView.getModel('oModelView');
            var sLanguageCode = oModel.getProperty("/addComplaint/LanguageCode");
            var sComplaintTypeCode = oModel.getProperty("/addComplaint/ComplaintTypeCode");
            var sPath = "/MasterComplaintSubtypeSet";

            // IsArchived:false

            oData.read(sPath, {
                urlParameters: {
                    LanguageCode: sLanguageCode,
                    ComplaintTypeCode: sComplaintTypeCode
                },
                success: function (obj) {
                    var oMasterComplaintSubType = new JSONModel(obj);
                    that.getView().setModel(oMasterComplaintSubType, "MasterComplaintSubType");
                },
                error: function () { }
            })
        },
    });
});