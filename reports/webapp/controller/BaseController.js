sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, UIComponent, mobileLibrary, History, Fragment,MessageToast) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.pragati.downloadreports.controller.BaseController", {
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
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },
        _showFormFragment: function (sFragmentName) {
            var objSection = this.getView().byId("oVbxSmtTbl");
            var oView = this.getView();
            objSection.destroyItems();
            var othat = this;
            this._getFormFragment(sFragmentName).then(function (oVBox) {
                oView.addDependent(oVBox);
                objSection.addItem(oVBox);
                //othat._setDataValue.call(othat);
                //othat._setUploadCollectionMethod.call(othat);
            });
        },

        _getFormFragment: function (sFragmentName) {
            var oView = this.getView();
            var othat = this;
            // if (!this._formFragments) {
            this._formFragments = Fragment.load({
                id: oView.getId(),
                name: "com.knpl.pragati.downloadreports.view.subview." + sFragmentName,
                controller: othat,
            }).then(function (oFragament) {
                return oFragament;
            });
            // }

            return this._formFragments;

        },
        _showToast: function (sMsgTxt) {
            MessageToast.show(this.getResourceBundle().getText(sMsgTxt));
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
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
        }
    });

});