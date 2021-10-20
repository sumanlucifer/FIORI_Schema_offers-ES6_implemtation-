// @ts-nocheck
// @ts-ignore
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, UIComponent, mobileLibrary, MessageToast, MessageBox) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.pragati.MDM.controller.BaseController", {
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
        navPressBackBanner: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            var oNextUIState;
            this.getOwnerComponent().getHelper().then(function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                oRouter.navTo("bannerList", {
                    tab: "13",
                    layout: oNextUIState.layout
                });
            }.bind(this));
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        onStartDateChange: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            var oStartDate = oEvent.getSource().getDateValue();
            var oEndDate = oModelView.getProperty("/EndTime");
            if (oEndDate) {
                if (oStartDate > oEndDate) {
                    MessageToast.show("Kindly select a date less than or equal to end date.");
                    oModelControl.setProperty("/StartTime", "");
                    oModelView.setProperty("/StartTime", null);
                    return;
                }
            }

        },
        onEndDateChange: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            var oEndDate = oEvent.getSource().getDateValue();
            var oStartDate = oModelView.getProperty("/StartTime");
            if (oStartDate) {
                if (oStartDate > oEndDate) {
                    MessageToast.show("Kindly select a date more than or equal to start date.");
                    oModelControl.setProperty("/EndTime", "");
                    oModelView.setProperty("/EndTime", null);
                    return;
                }
            }

        },
        _BannerEndDateCheck: function (oPayLoad) {
            var oPromise = jQuery.Deferred();
            if (oPayLoad.hasOwnProperty("EndTime")) {
                oPayLoad["EndTime"] = new Date(
                    oPayLoad["EndTime"].setHours(23, 59, 59, 999)
                    //oPayLoad["EndDate"].setHours(17, 51, 59, 999)
                );
            }
            oPromise.resolve(oPayLoad);
            console.log(oPayLoad)
            return oPromise;
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

        showWarning: function (sMsgTxt, _fnYes) {
            var that = this;
            MessageBox.warning(this.getResourceBundle().getText(sMsgTxt), {
                actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        _fnYes && _fnYes.apply(that);
                    }
                }
            });
        },

        showError: function (sMsg) {
            var that = this;
            MessageBox.error(sMsg, {
                title: that.getResourceBundle().getText("TtlError")
            });

        },

        /*
         * Common function for showing toast messages
         * @param sMsgTxt: i18n Key string
         */
        showToast: function (sMsgTxt) {
            MessageToast.show(this.getResourceBundle().getText(sMsgTxt));
        }

    });

});