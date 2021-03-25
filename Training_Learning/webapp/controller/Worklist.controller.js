sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Training_Learning.controller.Worklist", {

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
                oTable = this.byId("table"),
                oTable1 = this.byId("table1");

            // Put down worklist table's original value for busy indicator delay,
            // so it can be restored later on. Busy handling on the table is
            // taken care of by the table itself.
            iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataTextTraining: this.getResourceBundle().getText("tableNoDataTextTraining"),
                tableNoDataTextVideo: this.getResourceBundle().getText("tableNoDataTextVideo"),
                tableBusyDelay: 0,
                filterBar: {
                    StartDate: null,
                    Status: "",
                    Title: ""
                }
            });
            this.setModel(oViewModel, "worklistView");

            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
            oTable1.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
            // this._ResetFilterBar();
            this._addSearchFieldAssociationToFB();
        },

        _addSearchFieldAssociationToFB: function () {
            let oFilterBar = this.getView().byId("filterbar");
            let oSearchField = oFilterBar.getBasicSearch();
            var oBasicSearch;
            var othat = this;
            if (!oSearchField) {
                // @ts-ignore
                oBasicSearch = new sap.m.SearchField({
                    value: "{worklistView>/filterBar/Title}",
                    showSearchButton: true,
                    search: othat.onSearch.bind(othat),
                });
            } else {
                oSearchField = null;
            }

            oFilterBar.setBasicSearch(oBasicSearch);
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
        onUpdateFinished: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("onlineTrainingCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("onlineTraining");
            }
            this.getModel("worklistView").setProperty("/onlineTraining", sTitle);
        },

        onUpdateFinished1: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("videoCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("video");
            }
            this.getModel("worklistView").setProperty("/video", sTitle);
        },

        onUpdateFinished2: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("offlineTrainingCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("offlineTraining");
            }
            this.getModel("worklistView").setProperty("/offlineTraining", sTitle);
        },

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
        onPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        onReset: function () {
            this._ResetFilterBar();
        },
        _ResetFilterBar: function () {
            var aCurrentFilterValues = [];
            var aResetProp = {
                Status: "",
                StartDate: null,
                searchBar: ""
            };
            var oViewModel = this.getView().getModel("worklistView");
            oViewModel.setProperty("/filterBar", aResetProp);
            var oTable = this.byId("table");
            var oTable1 = this.byId("table1");
            var oTable2 = this.byId("table2");
            var oBinding = oTable.getBinding("items");
            var oBinding1 = oTable1.getBinding("items");
            var oBinding2 = oTable2.getBinding("items");
            oBinding.filter([]);
            oBinding1.filter([]);
            oBinding2.filter([]);
        },

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
        onNavBack: function () {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        onSearch: function (oEvent) {
            console.log("On FIlter");
            var aCurrentFilterValues = [];
            var oViewFilter = this.getView().getModel("worklistView").getProperty("/filterBar");
            var aFlaEmpty = true;
            debugger;
            for (let prop in oViewFilter) {
                if (oViewFilter[prop]) {
                    console.log(oViewFilter[prop]);

                    if (prop === "StartDate") {

                        // var dateValue = oViewFilter[prop].toDateString();
                        var dateValue = oViewFilter[prop];
                        var pattern = "dd/MM/yyyy";
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                            pattern: pattern
                        });

                        var oNow = new Date(dateValue);
                        var newDate = oDateFormat.format(oNow);

                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(prop, FilterOperator.GE, oNow)
                            //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                        );
                    } else if (prop === "Status") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "Title") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(
                                [
                                    new Filter(
                                        "tolower(Title)",
                                        FilterOperator.Contains,
                                        "'" +
                                        oViewFilter[prop]
                                            .trim()
                                            .toLowerCase()
                                            .replace("'", "''") +
                                        "'"
                                    )
                                ],
                                false
                            )
                        );
                    } else {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(
                                prop,
                                FilterOperator.Contains,
                                oViewFilter[prop].trim()
                            )
                        );
                    }
                }
            }

            var endFilter = new Filter({
                filters: aCurrentFilterValues,
                and: true,
            });

            var oTable = this.getView().byId("table");
            var oBinding = oTable.getBinding("items");

            var oTable1 = this.getView().byId("table1");
            var oBinding1 = oTable1.getBinding("items");

            var oTable2 = this.getView().byId("table2");
            var oBinding2 = oTable2.getBinding("items");

            if (!aFlaEmpty) {
                oBinding.filter(endFilter);
                oBinding2.filter(endFilter);
                debugger;
                if (endFilter.aFilters !== null && endFilter.aFilters.length > 0) {
                    for (var i = 0; i < endFilter.aFilters.length; i++) {
                        if (endFilter.aFilters[i].sPath === "StartDate") {
                            delete endFilter.aFilters[i];
                        }
                    }
                }

                oBinding1.filter(endFilter);
            } else {
                oBinding.filter([]);
                oBinding2.filter([]);
                oBinding1.filter([]);
            }
        },

        /**
         * When Click on Add button
         */
        onAddOnlineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAddT", {
                mode: "add",
                id: "null",
            });
        },

        onAddOfflineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "OFFLINE");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAddT", {
                mode: "add",
                id: "null",
            });
        },

        onListItemPressOnlineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            console.log(sPath);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onListItemPressOfflineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "OFFLINE");
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            console.log(sPath);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onEditOnlineTraining: function (oEvent) {
            // this.getModel("appView").setProperty("/trainingType", "ONLINE");
            // var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            // console.log(sPath);

            // var oRouter = this.getOwnerComponent().getRouter();
            // oRouter.navTo("RouteTrainingTab", {
            //     mode: "view",
            //     id: window.encodeURIComponent(sPath),
            // });
            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onEditOfflineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "OFFLINE");
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onDeleteTraining: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();

            function onYes() {
                var data = sPath + "/IsArchived";
                this.getModel().update(data, {
                    IsArchived: true
                }, {
                    success: this.showToast.bind(this, "MSG_SUCCESS_TRAINING_REMOVE")
                });
            }
            this.showWarning("MSG_CONFIRM_TRAINING_DELETE", onYes);
        },

        onRefreshView: function () {
            var oModel = this.getModel();
            oModel.refresh(true);
        },

        onAddVideo: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            this.getRouter().navTo("createObject");
        },

        onEditVideo: function (oEvent) {
            // this.getModel("appView").setProperty("/trainingType", "VIDEO");
            // this._showObject(oEvent.getSource());
            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            console.log(sPath);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onListItemPressVideo: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            console.log(sPath);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onDeleteVideo: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();

            function onYes() {
                var data = sPath + "/IsArchived";
                this.getModel().update(data, {
                    IsArchived: true
                }, {
                    success: this.showToast.bind(this, "MSG_SUCCESS_VIDEO_REMOVE")
                });
            }
            this.showWarning("MSG_CONFIRM_VIDEO_DELETE", onYes);
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getProperty("Id")
            });
        }

    });
});