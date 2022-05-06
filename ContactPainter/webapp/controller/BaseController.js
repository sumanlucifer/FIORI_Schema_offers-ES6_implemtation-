sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/BusyIndicator',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

], function (Controller, BusyIndicator, MessageToast, MessageBox,Filter,FilterOperator) {
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
        _dummyPromise:function(oParam1){
            var promise = $.Deferred();
            promise.resolve(oParam1);
            return promise;
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
        _geti18nText: function (mParam, mParam2) {
            var oModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            return oModel.getText(mParam, mParam2);
        },

        _showMessageBox1: function (pType, pMessage, pMessageParam, pfn1, pfn2) {
            // 
            /*pType(string) > type of message box ex: information or alert etc.
              pMessage (string)> i18n property name for the message
              pMessageParam(array/null)> i18n property has params specify in array or else pass as null
              pfn1(function1/null) > this is a function to be called after user presses yes 
              pfn2(function2/null) > this is a function to be called after user presses no

              you can call this below method like this
              this._showMessageBox1("information", "i18nProper", ["i18nParamerter1if any"],
              this._sample1.bind(this, "first paramters", "secondParameter"));
              In this code all the message type will have 2 buttons yes and no
            */
            var sMessage = this._geti18nText(pMessage, pMessageParam);
            var sPtye = pType.trim().toLowerCase();
            var othat = this;
            var aMessageType = ["success", "information", "alert", "error", "warning", "confirm"];

            if (aMessageType.indexOf(sPtye) >= 0) {
                MessageBox[sPtye](sMessage, {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            if (pfn1) {
                                pfn1();
                            }
                        } else {
                            if (pfn2) {
                                pfn2();
                            };
                        }
                    }
                });
                return
            } else {
                this._showMessageToast("Message6");
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
        _SetBlankPromise: function (mParam1) {
            var promise = jQuery.Deferred();
            promise.resolve(mParam1);
            return promise;
        },
        _showMessageToast: function (mParam, mParam2) {
            var oModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var sText = oModel.getText(mParam, mParam2);
            MessageToast.show(sText, {
                duration: 6000
            })
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

        showMessageToast: function (remarkText) {

            MessageToast.show(this.getResourceBundle().getText(remarkText));

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
            if (oObject["VehicleTypeId"] !== 5 && oObject["VehicleName"] == "None") {
                oObject["VehicleName"] = "";
            }


        },
        onCheckboxAddr: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            var sParam = oEvent.getParameter("selected");
            oModel.setProperty("/PainterAddress/IsSamePrAddress", sParam);
            if (sParam === false) {
                oModel.setProperty("/PainterAddress/PrPinCode", "");
                oModel.setProperty("/PainterAddress/PrStateId", "");
                oModel.setProperty("/PainterAddress/PrCityId", "");
                oModel.setProperty("/PainterAddress/PrAddressLine1", "");
                oModel.setProperty("/PainterAddress/PrTown", "");
            }else if (sParam===true){
                oModel.setProperty("/PainterAddress/PrPinCode",oModel.getProperty("/PainterAddress/PinCode"));
                oModel.setProperty("/PainterAddress/PrStateId", oModel.getProperty("/PainterAddress/StateId"));
                var oCity = oView.byId("cmbCity2");
                oCity.clearSelection();
                var oBindingCity = oCity.getBinding("items");
                var aFilter = [(new Filter("StateId", FilterOperator.EQ,  oModel.getProperty("/PainterAddress/StateId")))];
                if(oModel.getProperty("/PainterAddress/StateId")){
                    oBindingCity.filter(aFilter);
                }
                oModel.setProperty("/PainterAddress/PrCityId", oModel.getProperty("/PainterAddress/CityId"));
                oModel.setProperty("/PainterAddress/PrAddressLine1", oModel.getProperty("/PainterAddress/AddressLine1"));
                oModel.setProperty("/PainterAddress/PrTown", oModel.getProperty("/PainterAddress/Town"));
            }


        },
        geti18nText: function (mParam, mParam2) {
            var oModel = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            return oModel.getText(mParam, mParam2);
        },
        onDialogCloseNew: function () {
            var oView = this.getView(),
                oModelContrl = oView.getModel("oModelControl2");
      
            console.log("Dialog Close");
            if (this._RemarksDialog1) {
              
                this._RemarksDialog1.close();
                this._RemarksDialog1.destroy();
                delete this._RemarksDialog1;
                return;
            }

            if (this._NameChangeHistoryDialog) {
                this._NameChangeHistoryDialog.close();
                this._NameChangeHistoryDialog.destroy();
                delete this._NameChangeHistoryDialog;
                return;
            }
            if (this._MobileChangeHistoryDialog) {
                this._MobileChangeHistoryDialog.close();
                this._MobileChangeHistoryDialog.destroy();
                delete this._MobileChangeHistoryDialog;
                return;
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