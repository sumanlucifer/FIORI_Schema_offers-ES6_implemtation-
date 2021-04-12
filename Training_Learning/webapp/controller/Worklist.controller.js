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
                currDate: new Date(),
                filterBar: {
                    StartDate: null,
                    // Status: "",
                    TrainingSubTypeId: null,
                    Search: "",
                    RewardPoints: null
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
                    value: "{worklistView>/filterBar/Search}",
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
                // Status: "",
                TrainingSubTypeId: null,
                StartDate: null,
                RewardPoints: null,
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
            var aCurrentFilterValues = [];
            var oViewFilter = this.getView().getModel("worklistView").getProperty("/filterBar");
            var aFlaEmpty = true;
            debugger;
            for (let prop in oViewFilter) {
                if (oViewFilter[prop]) {
                    console.log(oViewFilter[prop]);

                    if (prop === "StartDate") {

                        var dateValue = oViewFilter[prop];
                        var pattern = "dd/MM/yyyy";
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                            pattern: pattern
                        });

                        var oNow = new Date(dateValue);
                        var newDate = oDateFormat.format(oNow);

                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(prop, FilterOperator.GE, new Date(oViewFilter[prop]))
                        );
                        // } else if (prop === "Status") {
                        //     aFlaEmpty = false;
                        //     aCurrentFilterValues.push(
                        //         new Filter(prop, FilterOperator.EQ, oViewFilter[prop])
                        //     );
                    } else if (prop === "TrainingSubTypeId") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "RewardPoints") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "Search") {
                        aFlaEmpty = false;
                        if (/^\+?(0|[1-9]\d*)$/.test(oViewFilter[prop])) {
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter(
                                            "RewardPoints",
                                            FilterOperator.EQ,
                                            oViewFilter[prop]
                                        ),
                                    ],
                                    false
                                )
                            );
                        } else {
                            aCurrentFilterValues.push(
                                new Filter(
                                    [
                                        new Filter(
                                            "tolower(Title)",
                                            FilterOperator.Contains,
                                            "'" + oViewFilter[prop].trim().toLowerCase().replace("'", "''") + "'"
                                        )

                                    ],
                                    false
                                )
                            );
                        }
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
                if (endFilter.aFilters !== null && endFilter.aFilters.length > 0) {
                    for (var i = 0; i < endFilter.aFilters.length; i++) {
                        if (endFilter.aFilters[i].sPath === "StartDate") {
                            delete endFilter.aFilters[i];
                        }
                    }
                }

                oBinding2.filter(endFilter);
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

        onAddVideo: function (oEvent) {
            // this.getModel("appView").setProperty("/trainingType", "VIDEO");
            // this.getRouter().navTo("createObject");
            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAddT", {
                mode: "add",
                id: "null",
            });
        },

        onListItemPressOnlineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            this.getModel("appView").setProperty("/flgEditOn", false);
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
            this.getModel("appView").setProperty("/flgEditOn", false);
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
            this.getModel("appView").setProperty("/flgEditOn", false);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            console.log(sPath);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onEditOnlineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            this.getModel("appView").setProperty("/flgEditOn", true);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            var that = this;
            var todayDate = new Date();
            that.getModel().read("/" + sPath, {
                success: function (sData) {
                    if (sData.Status === 0) {
                        if (todayDate < sData.EndDate) {
                            oRouter.navTo("RouteTrainingTab", {
                                mode: "edit",
                                prop: window.encodeURIComponent(sPath),
                            });
                        } else {
                            that.showToast.call(that, "MSG_EXPIRED_TRAININGS_CANT_BE_EDITED");
                        }
                    } else {
                        that.showToast.call(that, "MSG_ACTIVE_TRAININGS_CANT_BE_EDITED");
                    }
                }
            })
        },

        onEditOfflineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "OFFLINE");
            this.getModel("appView").setProperty("/flgEditOn", true);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            var that = this;
            that.getModel().read("/" + sPath, {
                success: function (sData) {
                    if (sData.Status === 0) {
                        oRouter.navTo("RouteTrainingTab", {
                            mode: "edit",
                            prop: window.encodeURIComponent(sPath),
                        });
                    } else {
                        that.showToast.call(that, "MSG_ACTIVE_TRAININGS_CANT_BE_EDITED");
                    }
                }
            })
        },

        onEditVideo: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            this.getModel("appView").setProperty("/flgEditOn", true);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            var that = this;
            that.getModel().read("/" + sPath, {
                success: function (sData) {
                    if (sData.Status === 0) {
                        oRouter.navTo("RouteTrainingTab", {
                            mode: "edit",
                            prop: window.encodeURIComponent(sPath),
                        });
                    } else {
                        that.showToast.call(that, "MSG_ACTIVE_TRAININGS_CANT_BE_EDITED");
                    }
                }
            })
        },

        onDeleteOnlineTraining: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var that = this;
            var todayDate = new Date();
            that.getModel().read(sPath, {
                success: function (sData) {
                    if (todayDate < sData.EndDate) {
                        if (sData.Status === 0) {
                            function onYes() {
                                var data = sPath + "/IsArchived";
                                that.getModel().update(data, {
                                    IsArchived: true
                                }, {
                                    success: that.showToast.bind(that, "MSG_SUCCESS_TRAINING_REMOVE")
                                });
                            }
                            that.showWarning("MSG_CONFIRM_TRAINING_DELETE", onYes);
                        } else {
                            that.showToast.call(that, "MSG_ACTIVE_TRAININGS_CANT_BE_DELETED");
                        }
                    } else {
                        function onYes() {
                            var data = sPath + "/IsArchived";
                            that.getModel().update(data, {
                                IsArchived: true
                            }, {
                                success: that.showToast.bind(that, "MSG_SUCCESS_TRAINING_REMOVE")
                            });
                        }
                        that.showWarning("MSG_CONFIRM_TRAINING_DELETE", onYes);
                    }
                }
            })
        },

        onDeleteOfflineTraining: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var that = this;
            that.getModel().read(sPath, {
                success: function (sData) {
                    function onYes() {
                        var data = sPath + "/IsArchived";
                        that.getModel().update(data, {
                            IsArchived: true
                        }, {
                            success: that.showToast.bind(that, "MSG_SUCCESS_TRAINING_REMOVE")
                        });
                    }
                    that.showWarning("MSG_CONFIRM_TRAINING_DELETE", onYes);
                }
            })
        },

        onDeleteVideo: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var that = this;
            that.getModel().read(sPath, {
                success: function (sData) {
                    if (sData.Status === 0) {
                        function onYes() {
                            var data = sPath + "/IsArchived";
                            that.getModel().update(data, {
                                IsArchived: true
                            }, {
                                success: that.showToast.bind(that, "MSG_SUCCESS_VIDEO_REMOVE")
                            });
                        }
                        that.showWarning("MSG_CONFIRM_VIDEO_DELETE", onYes);
                    } else {
                        that.showToast.call(that, "MSG_ACTIVE_TRAININGS_CANT_BE_DELETED");
                    }
                }
            })
        },

        onActiveInActive: function (oEvent) {
            debugger;
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var data = sPath + "/Status";
            var that = this;
            that.getModel().read(sPath, {
                success: function (sData) {
                    if (sData.Status === 0) {
                        that.getModel().update(data, {
                            Status: 1
                        }, {
                            success: that.showToast.bind(that, "MSG_SUCCESS_ACTIVATED_SUCCESSFULLY")
                        });
                    }
                    if (sData.Status === 1) {
                        that.getModel().update(data, {
                            Status: 0
                        }, {
                            success: that.showToast.bind(that, "MSG_SUCCESS_DEACTIVATED_SUCCESSFULLY")
                        });
                    }
                }
            })
        },

        onRefreshView: function () {
            var oModel = this.getModel();
            oModel.refresh(true);
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