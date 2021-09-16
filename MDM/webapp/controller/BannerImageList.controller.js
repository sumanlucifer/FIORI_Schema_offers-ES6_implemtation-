sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.MDM.controller.BannerImageList", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
        onInit: function () {
            var oViewModel,
                iOriginalBusyDelay,
                oTable = this.byId("bannerImagetable");

            // Put down worklist table's original value for busy indicator delay,
            // so it can be restored later on. Busy handling on the table is
            // taken care of by the table itself.
            iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                tableBusyDelay: 0,
                busy: false
            });
            this.setModel(oViewModel, "banerImageListView");

            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            // var dat = this;
            // oTable.attachEventOnce("updateFinished", function () {
            //     // Restore original busy indicator delay for worklist's table
            // });
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
        // onUpdateFinished: function (oEvent) {
        //     // // update the worklist's object counter after the table update
        //     var sTitle,
        //         // oTable = oEvent.getSource(),
        //         oTable = this.getView().byId("bannerImagetable"),
        //         iTotalItems = oEvent.getParameter("total");
        //     // only update the counter if the length is final and
        //     // the table is not empty
        //     if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
        //         sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
        //     } else {
        //         sTitle = this.getResourceBundle().getText("worklistTableTitle");
        //     }
        //     this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        // },

        /**
         * When Click on Add button
         */
        onAdd: function (oEvent) {
            this.getRouter().navTo("createObject");
        },

        onEdit: function (oEvent) {
            this._showObject(oEvent.getSource());
        },

        onDelete: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();

            function onYes() {
                var data = sPath + "/IsArchived";
                this.getModel().update(data, {
                    IsArchived: true
                }, {
                    success: this.showToast.bind(this, "MSG_SUCCESS_BANNERIMAGE_REMOVE")
                });
            }
            this.showWarning("MSG_CONFIRM_DELETE", onYes);
        }

    });
});
