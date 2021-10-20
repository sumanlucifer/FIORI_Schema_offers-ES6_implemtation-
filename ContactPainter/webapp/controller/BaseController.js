sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/BusyIndicator',
    "sap/m/MessageToast",
    "sap/m/MessageBox"

], function (Controller, BusyIndicator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.knpl.pragati.ContactPainter.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        sActivationStatus: function (sStatus) {

            switch (sStatus) {

                case "ACTIVATED":
                    return "Activated";
                case "DEACTIVATED":
                    return "Deactivated";
                case "NOT_CONTACTABLE":
                    return "Not Contactable";

            }

        },

        addContentDensityClass: function () {
            return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },
        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getViewModel: function (sName) {
            return this.getView().getModel(sName);
        },

        getComponentModel: function (sName) {
            return this.getOwnerComponent().getModel();
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        //for controlling global busy indicator        
        presentBusyDialog: function () {
            BusyIndicator.show();
        },

        dismissBusyDialog: function () {
            BusyIndicator.hide();
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

        _showMessageToast:function(mTexts){
            MessageToast.show(this.getResourceBundle.getText(mTexts));

        },

        fnCheckProfileCompleted: function (oData) {
            console.log("Function Called");
            //check if aleady completed

            if (oData.ProfileCompleted) return;

            if (!oData.PainterFamily || oData.PainterFamily.length == 0) {
                return;
            }

            if (!oData.Vehicles || oData.Vehicles.length == 0) {
                return;
            }

            if (!oData.PainterSegmentation) {
                return;
            }

            if (!oData.PainterKycDetails || oData.PainterKycDetails.Status !== "APPROVED") {
                return;
            }

            if (!oData.PainterBankDetails || oData.PainterBankDetails.Status !== "APPROVED") {
                return;
            }

            if (!oData.PainterBankDetails || oData.PainterBankDetails.Status !== "APPROVED") {
                return;
            }

            if (!oData.PainterAddress) {
                return;
            }

            this.getViewModel().callFunction("/MarkProfileCompletedByAdmin", {
                urlParameters: {
                    PainterId: oData.Id
                }
            });



        },
        // assets change
        onAssetChange: function (oEvent) {
             var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            var oObject = oEvent
                .getSource()
                .getBindingContext("oModelView")
                .getObject();
            
            if (oObject["VehicleTypeId"] === 5) {
                oObject["VehicleName"] = "None";
            }
            if(oObject["VehicleTypeId"] !== 5 && oObject["VehicleName"] == "None" ){
                oObject["VehicleName"] = "";
            }


        },

        /**
         * Adds a history entry in the FLP page history
         * @public
         * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
         * @param {boolean} bReset If true resets the history before the new entry is added
         */
        addHistoryEntry: (function () {
            var aHistoryEntries = [];

            return function (oEntry, bReset) {
                if (bReset) {
                    aHistoryEntries = [];
                }

                var bInHistory = aHistoryEntries.some(function (entry) {
                    return entry.intent === oEntry.intent;
                });

                if (!bInHistory) {
                    aHistoryEntries.push(oEntry);
                    this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
                        oService.setHierarchy(aHistoryEntries);
                    });
                }
            };
        })()
    });

});