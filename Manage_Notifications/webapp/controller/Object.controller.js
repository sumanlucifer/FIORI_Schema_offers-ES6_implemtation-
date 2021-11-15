sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
    "sap/ui/core/SeparatorItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    

], function (BaseController, JSONModel, formatter, SeparatorItem,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("com.knpl.pragati.Manage_Notifications.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					IsLater: true,
                    delay: 0,
                    currDate:new Date()

				});
               
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			//this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });
            this.oRouter = this.getRouter();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("objectView"),
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

		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {

            this._action = oEvent.getParameter("arguments").action;
            this._property = oEvent.getParameter("arguments").property;


			var that = this;
			var TtlNotification;
            //var viewchar = this.getModel("appView").getProperty("/viewFlag");
            this._initData();
			if ( this._action === "edit") {
				that.getModel("objectView").setProperty("/sMode", "E");
				TtlNotification = this.getView().getModel("i18n").getResourceBundle().getText("TtlEditNotification");
                this.getModel("objectView").setProperty("/TtlNotification", TtlNotification);
                this.getModel("objectView").setProperty("/Receivers", []);
                that.getModel("objectView").setProperty("/busy", true);
			// var sObjectId = oEvent.getParameter("arguments").property;
			// this.getModel().metadataLoaded().then(function () {
			// 	var sObjectPath = that.getModel().createKey("/NotificationSet", {
			// 		UUID: sObjectId
			// 	});
			// 	// this._bindView("/" + sObjectPath); Redirection
			// 	that.getModel().read(sObjectPath, {
			// 		urlParameters: {
			// 			"$expand": "Redirection,Receivers/Role"
			// 		},
			// 		// success: this._setView.bind(this)
			// 		success: function (data) {
			// 			that._setView.call(that, data);
			// 		}
			// 	});
            // }.bind(that));
            this.getObjectData(this._property);
			} else if(this._action === "add"){
                    this._onCreateObjectMatched();
            }
            else {
                that.getModel("objectView").setProperty("/sMode", "V");
                TtlNotification = this.getView().getModel("i18n").getResourceBundle().getText("TtlViewNotification");
                this.getModel("objectView").setProperty("/TtlNotification", TtlNotification);
                that.getModel("objectView").setProperty("/busy", true);
                this.getObjectData(this._property);
			}
			
		},

		/** 
		 * Match for create route trigger
		 * @function 
		 */
		_onCreateObjectMatched: function () {
			this.getModel("objectView").setProperty("/sMode", "C");
			// this.getModel("objectView").setProperty("/TtlNotification", "Add Notification");
			var TtlNotification = this.getView().getModel("i18n").getResourceBundle().getText("TtlAddNotification");
			this.getModel("objectView").setProperty("/TtlNotification", TtlNotification);
			this.getModel("objectView").setProperty("/busy", true);
            this._setView();
            this._initData();
        },
        getObjectData: function(objectId) {
            var sObjectId = objectId;
            var that=this;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("/NotificationSet", {
					UUID: sObjectId
				});
				// this._bindView("/" + sObjectPath); Redirection
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Redirection,Receivers,Receivers/Painter,Receivers/Role"
					},
					// success: this._setView.bind(this)
					success: function (data) {
						that._setView.call(that, data);
					}
				});
			}.bind(that));
        },
        _initData: function (){
            
            var oView = this.getView();
            
            var oDataControl = {
                 Search: {
                            PainterVh: {
                                ZoneId: "",
                                DivisionId: "",
                                DepotId: "",
                                PainterType: "",
                                ArcheType: "",
                                MembershipCard: "",
                                Name: "",
                                Mobile: ""
                            },
                            DepotVh: {
                                DepotId: "",
                                Division: ""
                            }
                        },
                     }


            var oConrtrolModel = new JSONModel(oDataControl);
            oView.setModel(oConrtrolModel, "oModelControl");

        },

		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit Event scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);

			if (data) {
				if (data.Receivers) {
					data.Receivers = data.Receivers.results.map(function (ele) {
						return ele;
					});
				}
				oViewModel.setProperty("/oDetails", data);
				if (data.ScheduledDate === null) {
					oViewModel.setProperty("/oDetails/IsLater", false);
				} else {
					oViewModel.setProperty("/oDetails/IsLater", true);
				}
				return;
			}
			oViewModel.setProperty("/oDetails", {
				Subject: "",
				Body: "",
				RedirectionType: "",
				RedirectionTo: "",
				IsGroupNotification: false,
				GroupId: null,
				Receivers: [],
				ScheduledDate: null,
				ScheduledTime: null,
				IsLater: false
			});
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
		},

		getGroupHeader: function (oGroup) {
			return new SeparatorItem({
				text: oGroup.key
			});
		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},

		/* 
		 * @function
		 * Save edit or create FAQ details 
		 */
		onDraft: function () {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");

			if (oPayload.IsGroupNotification === false) {
				oPayload.GroupId = null;
			}

			if (oPayload.IsGroupNotification === true) {
				oPayload.Receivers = [];
				if (oPayload.GroupId !== null) {
					oPayload.GroupId = parseInt(oPayload.GroupId);
				}
			}

			if (oPayload.IsLater === false) {
				oPayload.ScheduledDate = null;
				oPayload.ScheduledTime = null;
			}

			oPayload.NotificationStatus = "DRAFT";

			if (oPayload.GroupId !== null) {
				oPayload.GroupId = parseInt(oPayload.GroupId);
			}

			var oValid = this._fnValidationView(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			oPayload.Receivers = oPayload.Receivers.map(function (ele) {
				return {
					Id: ele.Id
				};
			});

			oViewModel.setProperty("/busy", true);
            this.CUOperation(oPayload);
            
		},

		onPublish: function () {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");
            
			if (oPayload.IsGroupNotification === false) {
				oPayload.GroupId = null;
			}

			if (oPayload.IsGroupNotification === true) {
				oPayload.Receivers = [];
				if (oPayload.GroupId !== null) {
					oPayload.GroupId = parseInt(oPayload.GroupId);
				}
			}

			if (oPayload.IsLater === false) {
				oPayload.ScheduledDate = null;
				oPayload.ScheduledTime = null;
			}

			oPayload.NotificationStatus = "SCHEDULED";

			if (oPayload.GroupId !== null) {
				oPayload.GroupId = parseInt(oPayload.GroupId);
			}

			var oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			oPayload.Receivers = oPayload.Receivers.map(function (ele) {
				return {
					Id: ele.Id
				};
			});

			oViewModel.setProperty("/busy", true);
            this.CUOperation(oPayload);
		},

		/*
		 * To validate values of payload
		 * @constructor  
		 * @param data : data to be tested upon
		 * @returns Object
		 * @param IsNotValid : true for failed validation cases
		 * @param sMsg : Warning message to be shown for validation error
		 * 
		 * 
		 */
		_fnValidation: function (data) {
            var oViewModel = this.getModel("objectView");
            var groupComboBox = this.getView().byId("idGroupCombo");
            var groupId=groupComboBox.getSelectedItem();
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [],
                url = data.RedirectionTo,
                regexHttp=/https/,
				regex =/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                if(data.RedirectionType=="LINK"){
                if(!url.match(regexHttp)){
                    url="https://"+url;
                    data.RedirectionTo=url
                }
            }
			if (!data.Subject) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SUBJECT");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SUBJECT",
					target: "/oDetails/Subject"
				});
			} else
			if (!data.Body) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_BODY");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_BODY",
					target: "/oDetails/Body"
				});
			} else
			if (!data.RedirectionTo && data.RedirectionType) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_RTO");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_RTO",
					target: "/oDetails/RedirectionTo"
				});
			} else
			if (data.RedirectionTo!== "" && data.RedirectionType === 'LINK' && !url.match(regex)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_URL",
					target: "/oDetails/RedirectionTo"
				});
			} else
			if (!data.GroupId && data.IsGroupNotification === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_GROUPID");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_GROUPID",
					target: "/oDetails/GroupId"
				});
			} else
			if (data.Receivers.length === 0 && data.IsGroupNotification === false) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_RECEIVERS");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_RECEIVERS",
					target: "/oDetails/Receivers"
				});
			} else
			if (!data.ScheduledDate && data.IsLater === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SDATE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SDATE",
					target: "/oDetails/ScheduledDate"
				});
			} else
			if (!data.ScheduledTime && data.IsLater === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_STIME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_STIME",
					target: "/oDetails/ScheduledTime"
				});
            }else
            if (data.GroupId && !groupId) {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_VALDTN_ERR_GROUPID");
                aCtrlMessage.push({
                    message: "MSG_VALDTN_ERR_GROUPID",
                    target: "/oDetails/GroupId"
                });

            }else
            if (data.ScheduledDate && data.ScheduledTime && data.IsLater === true) {
                var time=data.ScheduledTime;
                var date=new Date(data.ScheduledDate);
                var sDay=date.getDay(),sMonth=date.getMonth(),sYear=date.getUTCFullYear();
                var currDate=new Date();
                var cDay=currDate.getDay(),cMonth=currDate.getMonth(),cYear=currDate.getUTCFullYear();
                var currTime=currDate.getHours()+":"+currDate.getMinutes();
                var cDateString=cDay+"-"+cMonth+"-"+cYear;
                var sDateString=sDay+"-"+sMonth+"-"+sYear;
                var regex = new RegExp(':', 'g');
                var tPicker= this.getView().byId("idTimePicker");
                if(sDateString == cDateString){
                                var regex = new RegExp(':', 'g');
                            if(parseInt(time.replace(regex, ''), 10) < parseInt(currTime.replace(regex, ''), 10)){
                              oReturn.IsNotValid = true;
                                    oReturn.sMsg.push("MSG_VALDTN_ERR_STIME");
                                aCtrlMessage.push({
                                message: "MSG_VALDTN_ERR_STIME",
                                target: "/oDetails/ScheduledTime"
                            });
                            tPicker.setValue(null);
                            }
                        
                }else if(date < currDate){
                    oReturn.IsNotValid = true;
                                    oReturn.sMsg.push("MSG_VALDTN_ERR_STIME");
                                aCtrlMessage.push({
                                message: "MSG_VALDTN_ERR_STIME",
                                target: "/oDetails/ScheduledDate"
                            });
                }
                
			}

			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
			return oReturn;
		},

		_fnValidationView: function (data) {
            
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.Subject) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SUBJECT");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SUBJECT",
					target: "/oDetails/Subject"
				});
			}if (!data.ScheduledDate && data.IsLater === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SDATE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SDATE",
					target: "/oDetails/ScheduledDate"
				});
			} else
			if (!data.ScheduledTime && data.IsLater === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_STIME_PAST");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_STIME_PAST",
					target: "/oDetails/ScheduledTime"
				});
            }else if (data.ScheduledDate && data.ScheduledTime && data.IsLater === true) {
                var time=data.ScheduledTime;
                var date=new Date(data.ScheduledDate);
                var sDay=date.getDay(),sMonth=date.getMonth(),sYear=date.getUTCFullYear();
                var currDate=new Date();
                var cDay=currDate.getDay(),cMonth=currDate.getMonth(),cYear=currDate.getUTCFullYear();
                var currTime=currDate.getHours()+":"+currDate.getMinutes();
                var cDateString=cDay+"-"+cMonth+"-"+cYear;
                var sDateString=sDay+"-"+sMonth+"-"+sYear;
                var regex = new RegExp(':', 'g');
                var tPicker= this.getView().byId("idTimePicker");
                if(sDateString == cDateString){
                                var regex = new RegExp(':', 'g');
                            if(parseInt(time.replace(regex, ''), 10) < parseInt(currTime.replace(regex, ''), 10)){
                              oReturn.IsNotValid = true;
                                    oReturn.sMsg.push("MSG_VALDTN_ERR_STIME");
                                aCtrlMessage.push({
                                message: "MSG_VALDTN_ERR_STIME",
                                target: "/oDetails/ScheduledTime"
                            });
                            tPicker.setValue(null);
                            }
                        
                }
               
                
			}

			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
			return oReturn;
		},

		_genCtrlMessages: function (aCtrlMsgs) {
			var that = this,
				oViewModel = that.getModel("objectView");
			aCtrlMsgs.forEach(function (ele) {
				that._oMessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: that.getResourceBundle().getText(ele.message),
						type: sap.ui.core.MessageType.Error,
						target: ele.target,
						processor: oViewModel,
						persistent: true
					}));
			});
		},

		_fnMsgConcatinator: function (aMsgs) {
			var that = this;
			return aMsgs.map(function (x) {
				return that.getResourceBundle().getText(x);
			}).join("");
        },
        onChangeTime: function(oEvent){
            var tPicker= this.getView().byId("idTimePicker");
            var sState=tPicker.getValueState();
            if(sState=="Error"){
                tPicker.setValueState("");
            }

        },

		CUOperation: function (oPayload) {
			delete oPayload.__metadata;
			if (oPayload.IsGroupNotification === true) {
				delete oPayload.Receivers;
			}
			if (oPayload.IsGroupNotification === false) {
				delete oPayload.Group;
			}
			var oViewModel = this.getModel("objectView");
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {
					var sKey = that.getModel().createKey("/NotificationSet", {
						UUID: oClonePayload.UUID
					});
					that.getModel().update(sKey, oClonePayload, {
						success: function () {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_UPDATE");
							res(oClonePayload);
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				} else {
					that.getModel().create("/NotificationSet", oClonePayload, {
						success: function (data) {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_CREATE");
							res(data);
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				}
			});
        },
        
                onValueHelpRequestedPainter: function () {
                    this._oMultiInput = this.getView().byId("multiInputPainterAdd");
                    this.oColModel = new JSONModel({
                        cols: [
                            {
                                label: "Membership ID",
                                template: "Painter/MembershipCard",
                            },
                            {
                                label: "Name",
                                template: "Painter/Name",
                            },
                            {
                                label: "Mobile Number",
                                template: "Painter/Mobile",
                            },
                            {
                                label: "Zone",
                                template: "Painter/ZoneId",
                            },
                            {
                                label: "Division",
                                template: "Painter/DivisionId",
                            },
                            {
                                label: "Depot",
                                template: "Painter/Depot/Depot",
                            },
                            {
                                label: "Painter Type",
                                template: "Painter/PainterType/PainterType",
                            },
                            {
                                label: "Painter ArcheType",
                                template: "Painter/ArcheType/ArcheType",
                            }
                        ],
                    });

                    var aCols = this.oColModel.getData().cols;
                     var oFilter = new sap.ui.model.Filter({filters:[
                          new Filter("IsArchived", sap.ui.model.FilterOperator.EQ, false),
                          new Filter("PainterId", sap.ui.model.FilterOperator.GT, 0)
                        ],and:true});

                    this._oValueHelpDialog = sap.ui.xmlfragment(
                        "com.knpl.pragati.Manage_Notifications.view.fragments.PainterValueHelp",
                        this
                    );
                    this.getView().addDependent(this._oValueHelpDialog);

                    this._oValueHelpDialog.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/UserSet", filters: [oFilter], parameters: { expand: "Painter,Painter/Depot,Painter/Division,Painter/ArcheType,Painter/PainterType" }, events:
                                    {
                                        dataReceived: function () {
                                            this._oValueHelpDialog.update();
                                        }.bind(this)
                                    }
                                });
                            }

                            if (oTable.bindItems) {
                                oTable.bindAggregation("items", "/UserSet", function () {
                                    return new sap.m.ColumnListItem({
                                        cells: aCols.map(function (column) {
                                            return new sap.m.Label({
                                                text: "{" + column.template + "}",
                                            });
                                        }),
                                    });
                                });
                            }

                            this._oValueHelpDialog.update();
                        }.bind(this)
                    );

                    this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                    this._oValueHelpDialog.open();
                },

                // onFilterBarSearchPainter: function (oEvent) {
                //     //   debugger;
                //     var afilterBar = oEvent.getParameter("selectionSet"),
                //         aFilters = [];

                //     for (var i = 0; i < afilterBar.length; i++) {
                //         if (afilterBar[i].getValue()) {
                //             aFilters.push(
                //                 new Filter({
                //                     path: afilterBar[i].mProperties.name,
                //                     operator: FilterOperator.Contains,
                //                     value1: afilterBar[i].getValue(),
                //                     caseSensitive: false,
                //                 })
                //             );
                //         }
                //     }

                //     aFilters.push(
                //         new Filter({
                //             path: "IsArchived",
                //             operator: FilterOperator.EQ,
                //             value1: false,
                //         })
                //     );

                //     this._filterTable(
                //         new Filter({
                //             filters: aFilters,
                //             and: true,
                //         })
                //     );
                // },

                onValueHelpCancelPressPainter: function () {
                    this._oValueHelpDialog.close();
                },

                onValueHelpOkPressPainter: function (oEvent) {
                    var oData = [];
                    var xUnique = new Set();
                    var aTokens = oEvent.getParameter("tokens");

                    aTokens.forEach(function (ele) {
                        if (xUnique.has(ele.getKey()) == false) {
                            oData.push({
                                PainterName: ele.getText(),
                                //PainterId: ele.getKey(),
                                Id: ele.getKey()
                            });
                            xUnique.add(ele.getKey());
                        }
                    });

                    this.getView().getModel("objectView").setProperty("/oDetails/Receivers", oData);
                    this._oValueHelpDialog.close();
                },
                onValueHelpAfterClose: function () {
                  
                    if (this._oValueHelpDialog) {
                        this._oValueHelpDialog.destroy();
                        delete this._oValueHelpDialog;
                    } 
                   
                },

                _filterTable: function (oFilter, sType) {
                    var oValueHelpDialog = this._oValueHelpDialog;

                    oValueHelpDialog.getTableAsync().then(function (oTable) {
                        if (oTable.bindRows) {
                            oTable.getBinding("rows").filter(oFilter, sType || "Application");
                        }

                        if (oTable.bindItems) {
                            oTable
                                .getBinding("items")
                                .filter(oFilter, sType || "Application");
                        }

                        oValueHelpDialog.update();
                    });
                },


                onFilterBarSearchPainter: function (oEvent) {
                    var afilterBar = oEvent.getParameter("selectionSet");

                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView().getModel("oModelControl").getProperty("/Search/PainterVh");
                    var aFlaEmpty = true;
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "ZoneId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/ZoneId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DivisionId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("Painter/DepotId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "PainterType") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Painter/PainterTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
                                );
                            } else if (prop === "ArcheType") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Painter/ArcheTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
                                );
                            } else if (prop === "MembershipCard") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Painter/MembershipCard", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
                                );
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Painter/Name", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
                                );
                            } else if (prop === "Mobile") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Painter/Mobile", operator: FilterOperator.Contains, value1: oViewFilter[prop] })
                                );
                            }
                        }
                    }

                    // aCurrentFilterValues.push(new Filter({
                    //     path: "IsArchived",
                    //     operator: FilterOperator.EQ,
                    //     value1: false
                    // }))
                    
                   
                    if(aCurrentFilterValues.length >0){
                        this._FilterPainterValueTable(
                            new Filter({
                                filters: aCurrentFilterValues,
                                and: true,
                            })
                        );
                    }
                },
                onPVhZoneChange: function (oEvent) {
                    var sId = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();

                    var oDivision = sap.ui.getCore().byId("idPVhDivision");
                    var oDivItems = oDivision.getBinding("items");
                    var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
                    oDivision.clearSelection();
                    oDivision.setValue("");
                    oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                    //setting the data for depot;
                    var oDepot = sap.ui.getCore().byId("idPVhDepot");
                    oDepot.clearSelection();
                    oDepot.setValue("");
                    // clearning data for dealer
                },
                onPVhDivisionChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oDepot = sap.ui.getCore().byId("idPVhDepot");
                    var oDepBindItems = oDepot.getBinding("items");
                    oDepot.clearSelection();
                    oDepot.setValue("");
                    oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
                },
                onClearPainterVhSearch: function () {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl"), aCurrentFilterValues = [];
                    oModel.setProperty("/Search/PainterVh", {
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
                        PainterType: "",
                        ArcheType: "",
                        MembershipCard: "",
                        Name: "",
                        Mobile: ""
                    });
                    aCurrentFilterValues.push(new Filter({
                        path: "IsArchived",
                        operator: FilterOperator.EQ,
                        value1: false
                    }));
                   
                    this._FilterPainterValueTable(
                        new Filter({
                            filters: aCurrentFilterValues,
                            and: true,
                        })
                    );
                },
                _FilterPainterValueTable: function (oFilter, sType) {
                    var oValueHelpDialog = this._oValueHelpDialog;

                    oValueHelpDialog.getTableAsync().then(function (oTable) {
                        if (oTable.bindRows) {
                            oTable.getBinding("rows").filter(oFilter, sType || "ApplicatApplication");
                        }

                        if (oTable.bindItems) {
                            oTable
                                .getBinding("items")
                                .filter(oFilter, sType || "Application");
                        }

                        oValueHelpDialog.update();
                    });
                },
        onPressBreadcrumbLink: function(){
            this.oRouter.navTo("worklist");
        },
        onRedirectionChange: function (){
             var oView = this.getView();
             var oModel = oView.getModel("objectView")
             oModel.setProperty("/oDetails/RedirectionTo","")

        }




	});

});