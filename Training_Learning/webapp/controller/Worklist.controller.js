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
                oTable1 = this.byId("table1"),
                oTable2 = this.byId("table2");

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
                tableNoData: this.getResourceBundle().getText("tableNoData"),
                tableBusyDelay: 0,
                currDate: new Date(),
                filterBar: {
                    StartDate: null,
                    Status: null,
                    Link: null,
                    TrainingSubTypeId: null,
                    TrainingZone: "",
                    TrainingDivision: "",
                    TrainingDepot: "",
                    Search: "",
                    RewardPoints: null
                }
            });
            this.setModel(oViewModel, "worklistView");

            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            var dat = this;
            oTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                //Fetch loggedIn User ID to disable delete button for loggedIn user
                var oModel = dat.getModel();
                oModel.callFunction("/GetLoggedInAdmin", {
                    method: "GET",
                    success: function (data) {
                        dat.getModel("appView").setProperty("/loggedUserId", data.results[0].Id);
                        dat.getModel("appView").setProperty("/loggedUserRoleId", data.results[0].RoleId);
                    }
                });
            });
            // oTable1.attachEventOnce("updateFinished", function () {
            //     // Restore original busy indicator delay for worklist's table
            //     oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            // });
            // this._ResetFilterBar();
            this._addSearchFieldAssociationToFB();

            var oRouter = this.getOwnerComponent().getRouter(this);
            oRouter.getRoute("worklist").attachMatched(this.onRefreshView, this);
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
                oTable = this.getView().byId("table"),
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
                // oTable = oEvent.getSource(),
                oTable = this.getView().byId("table1"),
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
                // oTable = oEvent.getSource(),
                oTable = this.getView().byId("table2"),
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

        onZoneChange: function (oEvent) {
          var sId = oEvent.getSource().getSelectedKey();
          var oView = this.getView();
        //   var oModelView = oView.getModel("worklistView");
          var oDivision = oView.byId("idDivision");
          var oDivItems = oDivision.getBinding("items");
        //   var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
          oDivision.clearSelection();
          oDivision.setValue("");
          oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
          //setting the data for depot;
          var oDepot = oView.byId("idDepot");
          oDepot.clearSelection();
          oDepot.setValue("");
        },

        onDivisionChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey();
          var oView = this.getView();
          var oDepot = oView.byId("idDepot");
          var oDepBindItems = oDepot.getBinding("items");
          oDepot.clearSelection();
          oDepot.setValue("");
          oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
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
                Status: null,
                Link: null,
                TrainingSubTypeId: null,
                TrainingZone: "",
                TrainingDivision: "",
                TrainingDepot: "",
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
            for (let prop in oViewFilter) {
                if (oViewFilter[prop]) {

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
                    } else if (prop === "Status") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "TrainingZone") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("TrainingZone/ZoneId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "TrainingDivision") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("TrainingDivision/DivisionId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "TrainingDepot") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter("TrainingDepot/DepotId", FilterOperator.EQ, oViewFilter[prop])
                        );
                    } else if (prop === "Link") {
                        aFlaEmpty = false;
                        if (parseInt(oViewFilter[prop]) == 0) {
                            aCurrentFilterValues.push(
                                new Filter("Url", FilterOperator.NE, "")
                            );
                        } else {
                            aCurrentFilterValues.push(
                                new Filter("Url", FilterOperator.EQ, "")
                            );
                        }
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
                    }
                }
            }

            var endFilter = new Filter({
                filters: aCurrentFilterValues,
                and: true,
            });

            var oTable = this.getView().byId("table");
            var oBinding = oTable.getBinding("items");
            if (!aFlaEmpty) {
                oBinding.filter(endFilter);
            } else {
                oBinding.filter([]);
            }

            // Search code for Offline Training
            var aCurrentFilterValues2 = [];
            var oViewFilter2 = this.getView().getModel("worklistView").getProperty("/filterBar");
            var aFlaEmpty2 = true;
            for (let prop in oViewFilter2) {
                if (oViewFilter2[prop]) {

                    if (prop === "TrainingSubTypeId") {
                        aFlaEmpty2 = false;
                        aCurrentFilterValues2.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter2[prop])
                        );
                    } 
                    // else if (prop === "RewardPoints") {
                    //     aFlaEmpty2 = false;
                    //     aCurrentFilterValues2.push(
                    //         new Filter(prop, FilterOperator.EQ, oViewFilter2[prop])
                    //     );
                    // } 
                    else if (prop === "Search") {
                        aFlaEmpty2 = false;
                        if (/^\+?(0|[1-9]\d*)$/.test(oViewFilter2[prop])) {
                            aCurrentFilterValues2.push(
                                new Filter(
                                    [
                                        new Filter(
                                            "RewardPoints",
                                            FilterOperator.EQ,
                                            oViewFilter2[prop]
                                        ),
                                    ],
                                    false
                                )
                            );
                        } else {
                            aCurrentFilterValues2.push(
                                new Filter(
                                    [
                                        new Filter(
                                            "tolower(Title)",
                                            FilterOperator.Contains,
                                            "'" + oViewFilter2[prop].trim().toLowerCase().replace("'", "''") + "'"
                                        )

                                    ],
                                    false
                                )
                            );
                        }
                    }
                }
            }

            var endFilter2 = new Filter({
                filters: aCurrentFilterValues2,
                and: true,
            });

            var oTable2 = this.getView().byId("table2");
            var oBinding2 = oTable2.getBinding("items");

            if (!aFlaEmpty2) {
                oBinding2.filter(endFilter2);
            } else {
                oBinding2.filter([]);
            }

            // Search code for Video Training
            var aCurrentFilterValues1 = [];
            var oViewFilter1 = this.getView().getModel("worklistView").getProperty("/filterBar");
            var aFlaEmpty1 = true;
            for (let prop in oViewFilter1) {
                if (oViewFilter1[prop]) {

                    if (prop === "StartDate") {

                        var dateValue = oViewFilter1[prop];
                        var pattern = "dd/MM/yyyy";
                        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                            pattern: pattern
                        });

                        var oNow = new Date(dateValue);
                        var newDate = oDateFormat.format(oNow);

                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter("CreatedAt", FilterOperator.GE, new Date(oViewFilter1[prop]))
                        );
                    } else if (prop === "Status") {
                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter1[prop])
                        );
                    } else if (prop === "TrainingZone") {
                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter("TrainingZone/ZoneId", FilterOperator.EQ, oViewFilter1[prop])
                        );
                    } else if (prop === "TrainingDivision") {
                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter("TrainingDivision/DivisionId", FilterOperator.EQ, oViewFilter1[prop])
                        );
                    } else if (prop === "TrainingDepot") {
                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter("TrainingDepot/DepotId", FilterOperator.EQ, oViewFilter1[prop])
                        );
                    }
                    else if (prop === "TrainingSubTypeId") {
                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter1[prop])
                        );
                    } else if (prop === "RewardPoints") {
                        aFlaEmpty1 = false;
                        aCurrentFilterValues1.push(
                            new Filter(prop, FilterOperator.EQ, oViewFilter1[prop])
                        );
                    } else if (prop === "Search") {
                        aFlaEmpty1 = false;
                        if (/^\+?(0|[1-9]\d*)$/.test(oViewFilter1[prop])) {
                            aCurrentFilterValues1.push(
                                new Filter(
                                    [
                                        new Filter(
                                            "RewardPoints",
                                            FilterOperator.EQ,
                                            oViewFilter1[prop]
                                        ),
                                    ],
                                    false
                                )
                            );
                        } else {
                            aCurrentFilterValues1.push(
                                new Filter(
                                    [
                                        new Filter(
                                            "tolower(Title)",
                                            FilterOperator.Contains,
                                            "'" + oViewFilter1[prop].trim().toLowerCase().replace("'", "''") + "'"
                                        )

                                    ],
                                    false
                                )
                            );
                        }
                    }
                }
            }

            var endFilter1 = new Filter({
                filters: aCurrentFilterValues1,
                and: true,
            });

            var oTable1 = this.getView().byId("table1");
            var oBinding1 = oTable1.getBinding("items");

            if (!aFlaEmpty1) {
                oBinding1.filter(endFilter1);
            } else {
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
                trtype: "ONLINE",
                id: "null",
            });
        },

        onAddOfflineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "OFFLINE");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteAddT", {
                mode: "add",
                trtype: "OFFLINE",
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
                trtype: "VIDEO",
                id: "null",
            });
        },

        onListItemPressOnlineTraining: function (oEvent) {
            var that = this;
            this.getModel("appView").setProperty("/flgViewOn", true);
            this.getModel("appView").setProperty("/flgViewOnVd", false);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            that.getModel().read("/" + sPath, {
                success: function (data) {
                    that.getModel("appView").setProperty("/__metadata", data.__metadata);
                }
            })

            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            this.getModel("appView").setProperty("/flgEditOn", false);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                trtype: "ONLINE",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onListItemPressOfflineTraining: function (oEvent) {
            var that = this;
            this.getModel("appView").setProperty("/flgViewOn", false);
            this.getModel("appView").setProperty("/flgViewOnVd", false);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            that.getModel().read("/" + sPath, {
                success: function (data) {
                    that.getModel("appView").setProperty("/__metadata", data.__metadata);
                }
            })

            this.getModel("appView").setProperty("/trainingType", "OFFLINE");
            this.getModel("appView").setProperty("/flgEditOn", false);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                trtype: "OFFLINE",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onListItemPressVideo: function (oEvent) {
            var that = this;
            this.getModel("appView").setProperty("/flgViewOn", true);
            this.getModel("appView").setProperty("/flgViewOnVd", true);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            that.getModel().read("/" + sPath, {
                success: function (data) {
                    that.getModel("appView").setProperty("/__metadata", data.__metadata);
                }
            })

            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            this.getModel("appView").setProperty("/flgEditOn", false);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTrainingTab", {
                mode: "view",
                trtype: "VIDEO",
                prop: window.encodeURIComponent(sPath),
            });
        },

        onEditOnlineTraining: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "ONLINE");
            this.getModel("appView").setProperty("/flgEditOn", true);
            this.getModel("appView").setProperty("/flgViewOn", false);
            this.getModel("appView").setProperty("/flgViewOnVd", false);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            var that = this;
            var todayDate = new Date();
            that.getModel().read("/" + sPath, {
                success: function (data) {
                    that.getModel("appView").setProperty("/__metadata", data.__metadata);
                }
            })

            that.getModel().read("/" + sPath, {
                success: function (sData) {
                    if (todayDate < sData.EndDate) {
                        if (todayDate < sData.StartDate) {
                            oRouter.navTo("RouteTrainingTab", {
                                mode: "edit",
                                trtype: "ONLINE",
                                prop: window.encodeURIComponent(sPath),
                            });
                        } else {
                            that.showToast.call(that, "MSG_TRAINING_ALREADY_STARTED_CANT_BE_EDITED");
                        }
                    } else {
                        that.showToast.call(that, "MSG_EXPIRED_TRAININGS_CANT_BE_EDITED");
                    }
                }
            })
        },

        onEditVideo: function (oEvent) {
            this.getModel("appView").setProperty("/trainingType", "VIDEO");
            this.getModel("appView").setProperty("/flgEditOn", true);
            this.getModel("appView").setProperty("/flgViewOn", false);
            this.getModel("appView").setProperty("/flgViewOnVd", true);
            var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
            var oRouter = this.getOwnerComponent().getRouter();
            var that = this;

            that.getModel().read("/" + sPath, {
                success: function (data) {
                    that.getModel("appView").setProperty("/__metadata", data.__metadata);
                }
            })

            that.getModel().read("/" + sPath, {
                success: function (sData) {
                    oRouter.navTo("RouteTrainingTab", {
                        mode: "edit",
                        trtype: "VIDEO",
                        prop: window.encodeURIComponent(sPath),
                    });
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
                                    success: that.showToast.bind(that, "MSG_SUCCESS_LIVE_TRAINING_REMOVE")
                                });
                            }
                            that.showWarning("MSG_CONFIRM_LIVE_TRAINING_DELETE", onYes);
                        } else {
                            that.showToast.call(that, "MSG_ACTIVE_TRAININGS_CANT_BE_DELETED");
                        }
                    } else {
                        function onYes() {
                            var data = sPath + "/IsArchived";
                            that.getModel().update(data, {
                                IsArchived: true
                            }, {
                                success: that.showToast.bind(that, "MSG_SUCCESS_LIVE_TRAINING_REMOVE")
                            });
                        }
                        that.showWarning("MSG_CONFIRM_LIVE_TRAINING_DELETE", onYes);
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
                            success: that.showToast.bind(that, "MSG_SUCCESS_OFFLINE_TRAINING_REMOVE")
                        });
                    }
                    that.showWarning("MSG_CONFIRM_OFFLINE_TRAINING_DELETE", onYes);
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
                        if (sData.Url === "") {
                            that.showToast.call(that, "MSG_PLEASE_ADD_URL_BEFORE_ACTIVATING_TRAINING");
                        } else {
                            that.getModel().update(data, {
                                Status: 1
                            }, {
                                success: that.showToast.bind(that, "MSG_SUCCESS_ACTIVATED_SUCCESSFULLY")
                            });
                        }
                    }
                    if (sData.Status === 1) {
                        that.getModel().update(data, {
                            Status: 0
                        }, {
                            success: that.showToast.bind(that, "MSG_SUCCESS_DEACTIVATED_SUCCESSFULLY")
                        });
                    }
                    if (sData.Status === 2) {
                        that.showToast.call(that, "MSG_EXPIRED_TRAININGS_CANT_BE_CHANGED");
                    }
                }
            })
        },

        onRefreshView: function () {
            var oModel = this.getModel();
            oModel.refresh(true);
        }

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        // _showObject: function (oItem) {
        //     this.getRouter().navTo("object", {
        //         objectId: oItem.getBindingContext().getProperty("Id")
        //     });
        // }

    });
});
