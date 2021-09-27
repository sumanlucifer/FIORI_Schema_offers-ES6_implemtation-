sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, UIComponent, mobileLibrary, MessageToast, MessageBox, Fragment) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.pragati.Training_Learning.controller.BaseController", {
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
        },

        /*
         * Common function for showing warning dialogs
         * @param sMsgTxt : i18n Key string
         * @param _fnYes : Optional: function to be called for Yes response
         */
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
        onModelPropertyChange: function (oEvent, sModel) {
            this.getModel(sModel).setProperty("/bChange", true);
        },

        navToHome: function () {
            this.getRouter().navTo("worklist", true);
        },

        showError: function (sMsg) {
            var that = this;
            MessageBox.error(sMsg, {
                title: that.getResourceBundle().getText("TtlError")
            });

        },
        // upload painter Data by @manik 
        onFileUploadPainter: function (oEvent) {
            //console.log(oEvent);
            var oFileUploder = oEvent.getSource();
            if (oEvent.getParameter("newValue")) {
                this._uploadPainterFile(oEvent.mParameters.files[0]);
            }
        },
        _uploadPainterFile: function (mParam1) {
            //console.log(mParam1);
            console.log(mParam1)
            var oModelView = this.getView().getModel("oModelView");
            var sUrl = "/KNPL_PAINTER_API/api/v2/odata.svc/UploadPainterSet(1)/$value";
            jQuery.ajax({
                method: "PUT",
                url: sUrl,
                cache: false,
                contentType: "text/csv",
                processData: false,
                data: mParam1,
                success: function (result) {
                    console.log(result);
                    if (result.ValidPainter.length > 0) {
                        var selectedItems = result.ValidPainter;
                        var itemModel = selectedItems.map(function (item) {
                            return {
                                Name: item.PainterName,
                                PainterId: item.Id,
                                Id: item.Id,
                                PainterMobile: item.PainterMobile
                            };
                        });
                        MessageToast.show("Painter Data succesfully uploaded");

                        this._onpressfrag(itemModel);
                    }

                }.bind(this),
                error: function (data) {
                    console.log(data)
                },
            });


        },
        _onpressfrag: function (itemModel) {
            this._PainterMultiDialoge = this.getView().byId("Painters1");
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            if (!this._CsvDialoge) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.pragati.Training_Learning.view.fragments.UploadPainterData",
                    controller: this,
                }).then(
                    function (oDialog) {
                        this._CsvDialoge = oDialog;
                        oView.addDependent(this._CsvDialoge);
                        
                        oModelView.setProperty("/TrainingDetails/TrainingPainters", itemModel);
                        oView.byId("idUploadedPainterTbl").selectAll();
                        this._CsvDialoge.open();

                    }.bind(this)
                );
            } else {
                this._CsvDialoge.open();
                oModelView.setProperty("/TrainingDetails/TrainingPainters", itemModel);
                oView.byId("idUploadedPainterTbl").selectAll();

            }


        },
        onSaveUploadPainter: function () {
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            var oTable = oView.byId("idUploadedPainterTbl");
            var aSelections = oTable.getSelectedIndices();
            var oRows = oTable.getRows();
            var aSetPainter = [];
            var oBindingContext, obj;
            for (var x of aSelections) {
                oBindingContext = oRows[x].getBindingContext("oModelView");
                if (oBindingContext) {
                    obj = oBindingContext.getObject();
                    aSetPainter.push(obj)

                }
            }
            oModelView.setProperty("/TrainingDetails/TrainingPainters", aSetPainter);
           
            this._CsvDialoge.close();
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