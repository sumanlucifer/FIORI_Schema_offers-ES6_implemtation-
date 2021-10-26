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
        onFileSizeExceed: function () {
            MessageToast.show("Kindly Select A file size less than 2 Mb.")
        },
        onStartDateChange: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oModelView = oView.getModel("oModelView");
            var oStartDate = oEvent.getSource().getDateValue();
            var oEndDate = oModelView.getProperty("/EndTime");
            var oCurrentDate = new Date();
            if (oStartDate) {
                oCurrentDate.setHours(0, 0, 0, 0);
                if (oStartDate < oCurrentDate) {
                    MessageToast.show("Kindly select a date greater than or equal to current date.");
                    oModelControl.setProperty("/StartTime", "");
                    oModelView.setProperty("/StartTime", null);
                    return;
                }
            } else if (oStartDate) {

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
            var oCurrentDate = new Date();
            if (oEndDate) {
                if (oEndDate) {
                    oCurrentDate.setHours(0, 0, 0, 0);
                    if (oEndDate < oCurrentDate) {
                        MessageToast.show("Kindly select a date greater than or equal to current date.");
                        oModelControl.setProperty("/EndTime", "");
                        oModelView.setProperty("/EndTime", null);
                        return;
                    }
                } else if (oStartDate > oEndDate) {
                    MessageToast.show("Kindly select a date more than or equal to start date.");
                    oModelControl.setProperty("/EndTime", "");
                    oModelView.setProperty("/EndTime", null);
                    return;

                }
            }

        },
        onBannerImageFileChange: function (oEvent) {
            //console.log(oEvent);
            var oFileUploder = oEvent.getSource();
            if (oEvent.getParameter("newValue")) {
                this._verifyImages(oEvent.mParameters.files[0], oFileUploder);
            }
        },
        _verifyImages: function (files, oFileUploder) {
            var file = files; //I'm doing just for one element (Iterato over it and do for many)
            var obj = this; // to get access of the methods inside the other functions
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    var info = {
                        image: this,
                        height: this.height,
                        width: this.width
                    };
                    //console.log("Imagem", info); //Just to see the info of the image
                    obj._removeImageOrNot(info, oFileUploder); //Here you will validate if 
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file); //Iterate here if you need
        },
        _removeImageOrNot: function (imgInfo, oFileUploder) {
            //get the UploadColection files and remove if is needed
            //console.log(imgInfo)
            if (imgInfo["height"] < 1400 || imgInfo["width"] < 2800) {
                oFileUploder.setValue("");
                MessageToast.show("Kindly Upload a file greater than dimension 2800 X 1400.");
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