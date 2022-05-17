sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.groupnotifications.controller.Worklist", {

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
                oTable = this.byId("table");

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
            // Add the worklist page to the flp routing history
            // 	this.addHistoryEntry({
            // 		title: this.getResourceBundle().getText("worklistViewTitle"),
            // 		icon: "sap-icon://table-view",
            // 		intent: "#Groups-display"
            // 	}, true);
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter
                .getRoute("worklist")
                .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
            console.log("method trigerred");
            var c1, c2, c3;
            var othat = this;
            c1 = othat._getLoggedInInfo();
            c1.then(function () {
                //c2 = othat._initLoginFilterTable1()
            })
        },
        _initLoginFilterTable1:function(){
            var promise = $.Deferred();
            var oView = this.getView();
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
        _CreateLeadsFilter: function (mParam1) {
            var oView = this.getView();
            var oLoginData = oView.getModel("LoginInfo").getData();
            var aFilter = [];
            if (oLoginData["UserTypeId"] === 3) {
                if (oLoginData["AdminDivision"]["results"].length > 0) {
                    for (var x of oLoginData["AdminDivision"]["results"]) {
                        aFilter.push(new Filter("Members/Painter/DivisionId", FilterOperator.EQ, x["DivisionId"]));
                        //aFilter.push(new Filter("NotificationGroupDivision/DivisionId", FilterOperator.EQ, x["DivisionId"]))
                    }
                }else if (oLoginData["AdminZone"]["results"].length > 0) {
                    for (var x of oLoginData["AdminZone"]["results"]) {
                        aFilter.push(new Filter("Members/Painter/ZoneId", FilterOperator.EQ, x["ZoneId"]))
                    }
                }
                if (aFilter.length > 0) {
                    var aEndFilter = [new Filter("IsArchived", FilterOperator.EQ,false)];
                    aEndFilter.push(new Filter({
                        filters: aFilter,
                        and: false
                    }))
                    return aEndFilter;

                }
            }
            return false;
        },
        _getLoggedInInfo:function(){
            var oData = this.getModel();
            var oLoginData = this.getView().getModel("LoginInfo");
            return new Promise((resolve,reject)=>{
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
                    error:function(){
                        reject();
                    }
                });
            }) 
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
                that = this,
                aFilters,
                sQuery = this.getModel("worklistView").getProperty("/sQuery");
            if (sQuery && sQuery.length > 0) {
                aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('tolower(GroupName)', sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: true
                });
            } else {
                aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
                    ],
                    and: true
                });
            }
            this.getModel().read("/NotificationGroupSet/$count", {
                filters: [aFilters],
                async: true,
                success: function (counter) {
                    sTitle = that.getResourceBundle().getText("worklistTableTitleCount", [counter]);
                    that.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
                }
            });
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPressView: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource(), "view");
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
                var sQuery = oEvent.getParameter("query").toLowerCase();
                if (sQuery && sQuery.length > 0) {
                    sQuery = "'" + sQuery + "'";
                    this.getModel("worklistView").setProperty("/sQuery", sQuery);
                    aTableSearchState = [new Filter('tolower(GroupName)', FilterOperator.Contains, sQuery),
                        new Filter("IsArchived", FilterOperator.EQ, false)
                    ];
                } else {
                    this.getModel("worklistView").setProperty("/sQuery", null);
                    aTableSearchState = [new Filter("IsArchived", FilterOperator.EQ, false)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
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
        _showObject: function (oItem, action) {
            // this.getRouter().navTo("object", {
            // 	objectId: oItem.getBindingContext().getProperty("Id")
            // });
            this.getRouter().navTo("object", {
                action: action,
                objectId: oItem.getBindingContext().getProperty("Id")
            });

        },

        onAdd: function (oEvent) {
            this.getRouter().navTo("createObject");
        },

        onEdit: function (oEvent) {
            this._showObject(oEvent.getSource(), "edit");
        },

        onRefreshView: function () {
            var oModel = this.getModel();
            oModel.refresh(true);
        },

        // onDelete: function (oEvent) {
        // 	var sPath = oEvent.getSource().getBindingContext().getPath();

        // 	function onYes() {
        //         var data = this.getModel().getData(sPath);
        //         delete data.__metadata;
        //         data.IsArchived=true;
        //         var that=this;
        // 		this.getModel().update(sPath,data, {
        // 			 success: function () {
        //                 that.showToast(that.getResourceBundle().getText("MSG_SUCCESS_ADM_REMOVE"));
        //             },
        //             error: function (oError) {}

        // 		});
        // 	}
        // 	this.showWarning(this.getResourceBundle().getText("MSG_CONFIRM_DELETE"), onYes.bind(this));
        // },
        onDelete: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var that = this;
            that.getModel().read(sPath, {
                success: function (sData) {
                    function onYes() {
                        var data = sPath + "/IsArchived";
                        that.getModel().update(data, {
                            IsArchived: true
                        }, {
                            success: that.showToast(that.getResourceBundle().getText("MSG_SUCCESS_ADM_REMOVE"))
                        });
                    }
                    that.showWarning("MSG_CONFIRM_DELETE", onYes);
                }
            })
        },


        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
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
        showToast: function (msg) {

            MessageToast.show(msg);
            this.getModel("worklistView").refresh(true);
        },



    });
});