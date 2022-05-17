sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Sorter) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Manage_Notifications.controller.Worklist", {

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
                saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
                shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
                tableBusyDelay: 0
            });
            this.setModel(oViewModel, "worklistView");

            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
            oTable1.attachEventOnce("updateFinished1", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
            oTable2.attachEventOnce("updateFinished2", function () {
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
            // Add the worklist page to the flp routing history
            // this.addHistoryEntry({
            // 	title: this.getResourceBundle().getText("worklistViewTitle"),
            // 	icon: "sap-icon://table-view",
            // 	intent: "#Notifications-display"
            // }, true);
            this.oRouter = this.getRouter();
            var oDataControl = {
                filterBar: {
                    StartDate: null,
                    EndDate: null,
                    Title: "",
                    Name: ""
                },
            };
            var oMdlCtrl = new JSONModel(oDataControl);
            this.getView().setModel(oMdlCtrl, "oModelControl");

            this.getRouter().getRoute("worklist").attachPatternMatched(this._onObjectMatched, this);


        },

        _onObjectMatched: function (oEvent) {
            // this.getModel().refresh(true);
            this.onRefresh();
            var c1,c2,c3;
            var othat=this;
            c1= othat._getLoggedInInfo();
            c1.then(function(){
                c2=othat._initLoginFilterTable1()
            })
        },
        _initLoginFilterTable1:function(){
            var promise = $.Deferred();
            var oView = this.getView();
            var oLoginData = this.getView().getModel("LoginInfo").getData();
            var aFilter = [];
            var aLeadsFilter = this._CreateLeadsFilter()
            if (aLeadsFilter) {
                oView.byId("table").getBinding("items").filter(new Filter({
                    filters: aLeadsFilter,
                    and: true
                }), "Application")
            }


            promise.resolve();
            return promise;
        },
        _getLoggedInInfo: function () {
            var oData = this.getView().getModel();
            var oLoginData = this.getView().getModel("LoginInfo");
            return new Promise((resolve, reject) => {
                oData.callFunction("/GetLoggedInAdmin", {
                    method: "GET",
                    urlParameters: {
                        $expand: "UserType,AdminZone,AdminDivision",
                    },
                    success: function (data) {
                        if (data.hasOwnProperty("results")) {
                            if (data["results"].length > 0) {
                                oLoginData.setData(data["results"][0]);
                                // console.log(oLoginData)
                            }
                        }
                        resolve();
                    },
                    error: function () {
                        reject();
                    }
                });
            })
        },
        _CreateLeadsFilter: function (mParam1) {
            var oView = this.getView();
            var oLoginData = oView.getModel("LoginInfo").getData();
            var aFilter = [];
            if (oLoginData["UserTypeId"] === 3) {
                if (oLoginData["AdminDivision"]["results"].length > 0) {
                    for (var x of oLoginData["AdminDivision"]["results"]) {
                        aFilter.push(new Filter("Receivers/Painter/DivisionId", FilterOperator.EQ, x["DivisionId"]))
                    }
                }else if (oLoginData["AdminZone"]["results"].length > 0) {
                    for (var x of oLoginData["AdminZone"]["results"]) {
                        aFilter.push(new Filter("Receivers/Painter/ZoneId", FilterOperator.EQ, x["ZoneId"]))
                    }
                }
                if (aFilter.length > 0) {
                    var aEndFilter = [new Filter("IsArchived", FilterOperator.EQ,false),new Filter("IsSystemGenerated", FilterOperator.EQ,false)];
                    aEndFilter.push(new Filter({
                        filters: aFilter,
                        and: false
                    }))
                    return aEndFilter;

                }
            }
            return false;
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
            var sTitle, sDraft,
                oTable = this.getView().byId("table"),
                iTotalItems = oEvent.getParameter("total");
            // sDraft = this.getResourceBundle().getText("draftCount", [iTotalItems]);
            // this.getModel("worklistView").setProperty("/draft", sDraft);

            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sDraft = this.getResourceBundle().getText("draftCount", [
                    iTotalItems,
                ]);
            } else {
                sDraft = this.getResourceBundle().getText("draftCount", [0]);
            }
            this.getModel("worklistView").setProperty("/draft", sDraft);


        },

        onUpdateFinished1: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle, sSchedule,
                oTable = this.getView().byId("table1"),
                iTotalItems = oEvent.getParameter("total");
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sSchedule = this.getResourceBundle().getText("scheduledCount", [
                    iTotalItems,
                ]);
            } else {
                sSchedule = this.getResourceBundle().getText("scheduledCount", [0]);
            }
            this.getModel("worklistView").setProperty("/scheduled", sSchedule);
        },

        onUpdateFinished2: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle, sTrigger,
                oTable = this.getView().byId("table2"),
                iTotalItems = oEvent.getParameter("total");
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTrigger = this.getResourceBundle().getText("triggeredCount", [
                    iTotalItems,
                ]);
            } else {
                sTrigger = this.getResourceBundle().getText("triggeredCount", [0]);
            }
            this.getModel("worklistView").setProperty("/triggered", sTrigger);
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

        /**
         * Event handler when the share in JAM button has been clicked
         * @public
         */
        onShareInJamPress: function () {
            var oViewModel = this.getModel("worklistView"),
                oShareDialog = sap.ui.getCore().createComponent({
                    name: "sap.collaboration.components.fiori.sharing.dialog",
                    settings: {
                        object: {
                            id: location.href,
                            share: oViewModel.getProperty("/shareOnJamTitle")
                        }
                    }
                });
            oShareDialog.open();
        },

        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any master list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                // var sQuery = oEvent.getParameter("query");
                var sQuery = oEvent.getParameter("query").toLowerCase();
                sQuery = "'" + sQuery + "'";
                if (sQuery && sQuery.length > 0) {
                    this.getModel("worklistView").setProperty("/sQuery", sQuery);
                    aTableSearchState = [new Filter('tolower(Subject)', FilterOperator.Contains, sQuery),
                        new Filter("IsArchived", FilterOperator.EQ, false),
                        new Filter('IsSystemGenerated', FilterOperator.EQ, false)
                    ];
                } else {
                    this.getModel("worklistView").setProperty("/sQuery", null);
                    aTableSearchState = [new Filter("IsArchived", FilterOperator.EQ, false),
                        new Filter('IsSystemGenerated', FilterOperator.EQ, false)
                    ];
                }
                this._applySearch(aTableSearchState);
            }

        },



        onRefreshView: function () {
            var oModel = this.getModel();
            oModel.refresh(true);
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            var oTable = this.byId("table");
            var oTable1 = this.byId("table1");
            var oTable2 = this.byId("table2");
            oTable.getBinding("items").refresh();
            oTable1.getBinding("items").refresh();
            oTable2.getBinding("items").refresh();
        },

        // onLink: function (oEvent) {
        // 	window.open(url, '_blank');
        // },
        onAdd: function (oEvent) {
            // this.getModel("appView").setProperty("/viewFlag", "Y");
            // this.getRouter().navTo("createObject");
            this.oRouter.navTo("object", {
                action: "add",
                property: ""
            });

        },

        onEdit: function (oEvent) {
            // this.getModel("appView").setProperty("/viewFlag", "Y");
            // this._showObject(oEvent.getSource());
            // var sPath = oEvent.getSource().getBindingContext().getPath();
            this.oRouter.navTo("object", {
                action: "edit",
                property: oEvent.getSource().getBindingContext().getProperty("UUID")
            });

        },

        // onView: function (oEvent) {
        // 	// this.getModel("appView").setProperty("/viewFlag", "X");
        //     // this._showObject(oEvent.getSource());
        //     this.oRouter.navTo("object", {
        //         action: "view",
        //         property: oEvent.getSource().getBindingContext().getProperty("UUID")
        //     });
        // },


        onDelete: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();

            function onYes() {
                var data = this.getModel().getData(sPath);
                this.getModel().update(sPath, {
                    Subject: data.Subject,
                    Body: data.Body,
                    RedirectionType: data.RedirectionType,
                    RedirectionTo: data.RedirectionTo,
                    IsGroupNotification: data.IsGroupNotification,
                    GroupId: data.GroupId,
                    ScheduledDate: data.ScheduledDate,
                    ScheduledTime: data.ScheduledTime,
                    IsArchived: true
                }, {
                    success: this.showToast.bind(this, "MSG_SUCCESS_REMOVE")
                });
            }
            this.showWarning("MSG_CONFIRM_DELETE", onYes);
        },
        onListItemPress: function (oEvent) {
            this.oRouter.navTo("object", {
                action: "view",
                property: oEvent.getSource().getBindingContext().getProperty("UUID")
            });
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
                objectId: oItem.getBindingContext().getProperty("UUID")
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oTable1 = this.byId("table1"),
                oTable2 = this.byId("table2"),
                oViewModel = this.getModel("worklistView");
            // "Application"
            oTable.getBinding("items").filter(aTableSearchState);
            oTable1.getBinding("items").filter(aTableSearchState);
            oTable2.getBinding("items").filter(aTableSearchState);
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },
        onFilter: function (oEvent) {
            var aCurrentFilterValues = [];
            var oViewFilter = this.getView()
                .getModel("oModelControl")
                .getProperty("/filterBar");
            var aFlaEmpty = true;
            for (let prop in oViewFilter) {
                if (oViewFilter[prop]) {
                    if (prop === "Title") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "Subject",
                                operator: "Contains",
                                value1: oViewFilter[prop].trim(),
                                caseSensitive: false
                            }),
                        );
                    } else if (prop === "Name") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter({
                                path: "CreatorName",
                                operator: "Contains",
                                value1: oViewFilter[prop].trim(),
                                caseSensitive: false
                            }),
                        );
                    } else if (prop === "StartDate") {
                        aFlaEmpty = false;
                        aCurrentFilterValues.push(
                            new Filter(
                                "CreatedAt",
                                FilterOperator.GE,
                                new Date(oViewFilter[prop])
                            )
                        );
                    } else if (prop === "EndDate") {
                        aFlaEmpty = false;
                        var oDate = oViewFilter[prop].setDate(oViewFilter[prop].getDate() + 1);
                        aCurrentFilterValues.push(
                            new Filter("CreatedAt", FilterOperator.LT, oDate)
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
            var oTable1 = this.getView().byId("table1");
            var oTable2 = this.getView().byId("table2");
            var oBinding = oTable.getBinding("items");
            var oBinding1 = oTable1.getBinding("items");
            var oBinding2 = oTable2.getBinding("items");
            if (!aFlaEmpty) {
                oBinding.filter(endFilter);
                oBinding1.filter(endFilter);
                oBinding2.filter(endFilter);
            } else {
                oBinding.filter([]);
                oBinding1.filter([]);
                oBinding2.filter([]);
            }
        },
        _ResetFilterBar: function () {
            var aCurrentFilterValues = [];
            var aResetProp = {
                StartDate: null,
                EndDate: null,
                Title: "",
                Name: ""

            };
            var oViewModel = this.getView().getModel("oModelControl");
            oViewModel.setProperty("/filterBar", aResetProp);
            var oTable = this.byId("table");
            var oTable1 = this.getView().byId("table1");
            var oTable2 = this.getView().byId("table2");
            var oBinding = oTable.getBinding("items");
            var oBinding1 = oTable1.getBinding("items");
            var oBinding2 = oTable2.getBinding("items");
            oBinding.filter([]);
            oBinding1.filter([]);
            oBinding2.filter([]);
            oBinding.sort(new Sorter({
                path: "CreatedAt",
                descending: true
            }));
            oBinding1.sort(new Sorter({
                path: "CreatedAt",
                descending: true
            }));
            oBinding2.sort(new Sorter({
                path: "CreatedAt",
                descending: true
            }));
            //this._fiterBarSort();
        },



    });
});