sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/m/MessageBox",
    "sap/m/MessageToast"

], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, syncStyleClass,MessageBox,MessageToast) {
	"use strict";

	return BaseController.extend("com.knpl.pragati.groupnotifications.controller.Object", {

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
                    delay: 0,
                    TargetDetails:{

                    }
                    
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });
            this._initData();
		},

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
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
           // this._property = oEvent.getParameter("arguments").property;
            if(this._action=="edit"){
                this.getModel("objectView").setProperty("/sMode", "E");
            }
            else{
                this.getModel("objectView").setProperty("/sMode", "V");
            }
            
            this.getModel("objectView").setProperty("/busy", true);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("/NotificationGroupSet", {
					Id: sObjectId
				});
				// this._bindView("/" + sObjectPath);
				// this._bindView("/" + sObjectPath, sObjectId);
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Members,Members/Painter,Members/Admin,Members/Role,NotificationGroupZone,NotificationGroupDivision,NotificationGroupDepot,NotificationGroupPainterType,NotificationGroupPainterArcheType"
					},
					success: this._setView.bind(this)
                });
                //added fix masterdepotSet error on _fnChangeDivDepot
                //gets the Mastedepot set in odataModel
                this.getModel().read("/MasterDepotSet", {
					
				});
            }.bind(this));
            this._initData();
		},

		/** 
		 * Match for create route trigger
		 * @function 
		 */
		_onCreateObjectMatched: function () {
			this.getModel("objectView").setProperty("/sMode", "C");
			this.getModel("objectView").setProperty("/busy", true);
			this._setView();
		},

		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit User scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			this._oMessageManager.removeAllMessages();
			var oViewModel = this.getModel("objectView");
            oViewModel.setProperty("/busy", false);
            var aArray = [];
			if (data) {
                oViewModel.setProperty("/oDetails", data);
                if(data.IsTargetGroup==false){
                oViewModel.setProperty("/oDetails/Members", data.Members.results);
                oViewModel.setProperty("/TargetDetails/TargetFilterType", "PAINTER");
                oViewModel.setProperty("/TargetDetails/TargetFilterType", "PAINTER");
             oViewModel.setProperty("/TargetDetails/NotificationGroupZone", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupDivision", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupDepot", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupPainterType", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupPainterArcheType", []);
                }else if(data.IsTargetGroup==true){
                    oViewModel.setProperty("/oDetails/Members",[]);
                    oViewModel.setProperty("/TargetDetails/TargetFilterType", "GROUP");
                    aArray = [];
                            if (data.NotificationGroupZone && data.NotificationGroupZone.results) {
                                for (var a of data["NotificationGroupZone"]["results"]) {
                                    aArray.push(a["ZoneId"]);
                                }
                            }
                            data.NotificationGroupZone = aArray;

                    oViewModel.setProperty("/TargetDetails/NotificationGroupZone", data.NotificationGroupZone);
                    aArray = [];
                            if (data.NotificationGroupDivision && data.NotificationGroupDivision.results) {
                                for (var a of data["NotificationGroupDivision"]["results"]) {
                                    aArray.push(a["DivisionId"]);
                                }
                            }
                            data.NotificationGroupDivision = aArray;

                    oViewModel.setProperty("/TargetDetails/NotificationGroupDivision", data.NotificationGroupDivision);

                     aArray = [];
                            if (data.NotificationGroupDepot && data.NotificationGroupDepot.results) {
                                for (var a of data["NotificationGroupDepot"]["results"]) {
                                    aArray.push({DepotId:a["DepotId"]});
                                }
                            }
                            data.NotificationGroupDepot = aArray;

                    oViewModel.setProperty("/TargetDetails/NotificationGroupDepot", data.NotificationGroupDepot);

                    aArray = [];
                            if (data.NotificationGroupPainterType && data.NotificationGroupPainterType.results) {
                                for (var a of data["NotificationGroupPainterType"]["results"]) {
                                    aArray.push(a["PainterTypeId"]);
                                }
                            }
                            data.NotificationGroupPainterType = aArray;

                    oViewModel.setProperty("/TargetDetails/NotificationGroupPainterType", data.NotificationGroupPainterType);

                     aArray = [];
                            if (data.NotificationGroupPainterArcheType && data.NotificationGroupPainterArcheType.results) {
                                for (var a of data["NotificationGroupPainterArcheType"]["results"]) {
                                    aArray.push(a["PainterArcheTypeId"]);
                                }
                            }
                            data.NotificationGroupPainterArcheType = aArray;

                    oViewModel.setProperty("/TargetDetails/NotificationGroupPainterArcheType", data.NotificationGroupPainterArcheType);

                }
                this.onMultyZoneSet();
				return;
			}
			oViewModel.setProperty("/oDetails", {
				GroupName: "",
				Members: [],
				IsArchived: false
            });
            oViewModel.setProperty("/TargetDetails/TargetFilterType", "PAINTER");
             oViewModel.setProperty("/TargetDetails/NotificationGroupZone", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupDivision", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupDepot", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupPainterType", []);
             oViewModel.setProperty("/TargetDetails/NotificationGroupPainterArcheType", []);

		},

		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
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


		onDeleteMember: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				iIndex = +(oEvent.getParameter("listItem").getBindingContext("objectView").sPath.match(/\d+/)[0]);
			oViewModel.getProperty("/oDetails/Members").splice(iIndex, 1);
			oViewModel.refresh();
		},

		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},
		/* 
		 * @function
		 * Save edit or create Group details 
		 */
		onSave: function () {
			this._oMessageManager.removeAllMessages();
            var oViewModel = this.getModel("objectView");
            var GroupType=oViewModel.getProperty("/TargetDetails/TargetFilterType");
            var oPayload;
            if(GroupType=="PAINTER"){
            oPayload = oViewModel.getProperty("/oDetails");
            oPayload["IsTargetGroup"]=false;
            oPayload["NotificationGroupZone"]=null;
            oPayload["NotificationGroupDivision"]=null;
            oPayload["NotificationGroupDepot"]=null;
            oPayload["NotificationGroupPainterType"]=null;
            oPayload["NotificationGroupPainterArcheType"]=null;
            var oValid = this._fnValidation(oPayload);
                    if (oValid.IsNotValid) {
                        //this.showError(this._fnMsgConcatinator(oValid.sMsg));
                    MessageToast.show(this.getResourceBundle().getText(oValid.sMsg));
                        return;
                    }
            }
            else if(GroupType=="GROUP"){
                var oPayload = oViewModel.getProperty("/oDetails");
                var oValid = this._fnValidationGroup(oPayload);
                    if (oValid.IsNotValid) {
                        //this.showError(this._fnMsgConcatinator(oValid.sMsg));
                    MessageToast.show(this.getResourceBundle().getText(oValid.sMsg));
                        return;
                    }
                var oZoneMulti = this.getView().byId("idZone");
                var oDivisionMulti = this.getView().byId("idDivision");
                var oDepotMulti = this.getView().byId("multiInputDepotAdd");
                var oPainterTypeMulti = this.getView().byId("idPainterType");
                var oPainterArcheTypeMulti = this.getView().byId("idPainterArcheType");
                var oZoneData=[];
                var oDepotData=[];
                var oDivisionData=[];
                var oPainterTypeData=[];
                var oPainterArcheTypeData=[];
                var aZones=[];
                var aDepot=[];
                var aDivisions=[]
                var aPainterTypes=[]
                var aArcheTypes=[]
                var xUniqueZone = new Set();
                var xUniqueDepot = new Set();
                var xUniqueDiv = new Set();
                var xUniquePType = new Set();
                var xUniqueAType = new Set();
                    
                    aZones=oZoneMulti.getSelectedItems();
                    aZones.forEach(function (ele) {
                        if (xUniqueZone.has(ele.getKey()) == false) {
                            oZoneData.push({
                               // Zone: ele.getText(),
                                ZoneId: ele.getKey()
                            });
                            xUniqueZone.add(ele.getKey());
                        }
                    });
                    aDivisions=oDivisionMulti.getSelectedItems();
                    aDivisions.forEach(function (ele) {
                        if (xUniqueDiv.has(ele.getKey()) == false) {
                            oDivisionData.push({
                                DivisionId: ele.getKey()
                            });
                            xUniqueDiv.add(ele.getKey());
                        }
                    });
                    aDepot=oDepotMulti.getTokens();
                    aDepot.forEach(function (ele) {
                        if (xUniqueDepot.has(ele.getKey()) == false) {
                            oDepotData.push({
                                DepotId: ele.getKey()
                            });
                            xUniqueDepot.add(ele.getKey());
                        }
                    });
                    aPainterTypes=oPainterTypeMulti.getSelectedItems();
                    aPainterTypes.forEach(function (ele) {
                        if (xUniquePType.has(ele.getKey()) == false) {
                            oPainterTypeData.push({
                                PainterTypeId: parseInt(ele.getKey())
                            });
                            xUniquePType.add(ele.getKey());
                        }
                    });
                    aArcheTypes=oPainterArcheTypeMulti.getSelectedItems();
                    aArcheTypes.forEach(function (ele) {
                        if (xUniqueAType.has(ele.getKey()) == false) {
                            oPainterArcheTypeData.push({
                                PainterArcheTypeId: parseInt(ele.getKey())
                            });
                            xUniqueAType.add(ele.getKey());
                        }
                    });
                var GroupName=oViewModel.getProperty("/oDetails/GroupName");
                var Members=oViewModel.getProperty("/oDetails/Members");
                oPayload = oViewModel.getProperty("/TargetDetails");
                oPayload = oViewModel.getProperty("/oDetails");
                oPayload["NotificationGroupZone"]=oZoneData;
                oPayload["NotificationGroupDivision"]=oDivisionData;
                oPayload["NotificationGroupDepot"]=oDepotData;
                oPayload["NotificationGroupPainterType"]=oPainterTypeData;
                oPayload["NotificationGroupPainterArcheType"]=oPainterArcheTypeData;
                oPayload["GroupName"]=GroupName;
                oPayload["Members"]=null;
                oPayload["IsTargetGroup"]=true;
                 
                 delete oPayload.TargetFilterType;
            }
			

			
            oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload);
		},

		_fnValidation: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.GroupName) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_GROUP");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_GROUP",
					target: "/oDetails/GroupName"
                });
                
			} else
			if (data.Members.length === 0) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_MEMBERS");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_MEMBERS",
					target: "/oDetails/Members"
				});
			}
			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
			return oReturn;
        },
        _fnValidationGroup: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.GroupName) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_GROUP");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_GROUP",
					target: "/oDetails/GroupName"
                });
                
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

		CUOperation: function (oPayload) {
            var oViewModel = this.getModel("objectView");
            var GroupType=oViewModel.getProperty("/TargetDetails/TargetFilterType");
			delete oPayload.__metadata;
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;
            if(GroupType=="PAINTER"){
                        if (oClonePayload.Members !== null && oClonePayload.Members.length > 0) {
                            for (var i = 0; i < oClonePayload.Members.length; i++) {
                                var oMembers = oClonePayload.Members[i];
                                delete oMembers.__metadata;
                                // delete oMembers.VolunteerAssignment;
                                // delete oMembers.UserPreference;
                                // delete oMembers.UserDevice;
                                // delete oMembers.Specialities;
                                delete oMembers.Admin;
                                delete oMembers.Role;
                                delete oMembers.Painter;//Aditya chnages
                                }
                            }
             }

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {

					var sKey = that.getModel().createKey("/NotificationGroupSet", {
						Id: oClonePayload.Id
					});
					that.getModel().update(sKey, oClonePayload, {
						success: function () {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							//that.showToast.call(that, "MSG_SUCCESS_UPDATE");
							res(oClonePayload);
							// that.onCancel();
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				} else {
					that.getModel().create("/NotificationGroupSet", oClonePayload, {
						success: function (data) {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							//that.showToast.call(that, "MSG_SUCCESS_CREATE");
							res(data);
							// that.onCancel();
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							//rej();
						}
					});
				}
			});
		},

		handleConfirm: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				aData = oViewModel.getProperty("/oDetails/Members"),
				aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				for (var i = 0; i < aContexts.length; i++) {
                    var userData = aContexts[i].getObject();
                    if(userData.Admin){
                         var painterData=this.getModel().getData("/" + userData.Admin.__ref);
                    }
                    else {
                    var painterData=this.getModel().getData("/" + userData.Painter.__ref);
                   }
                    var roleData = this.getModel().getData("/" + userData.Role.__ref);
                    userData.Painter=painterData;
					userData.Role.Role = roleData.Role;
					aData.push(userData);
				}
			}
			var uniqueArray = this.removeDuplicates(aData, "Id");
			oViewModel.setProperty("/oDetails/Members", uniqueArray);
			oViewModel.refresh(true);

			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
		},

		removeDuplicates: function (originalArray, prop) {
			var newArray = [];
			var lookupObject = {};

			for (var i in originalArray) {
				lookupObject[originalArray[i][prop]] = originalArray[i];
			}

			for (i in lookupObject) {
				newArray.push(lookupObject[i]);
			}
			return newArray;
		},

		handleClose: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
		},

		addMember: function (oEvent) {
			var oView = this.getView();
			if (!this._oDialog) {
				Fragment.load({
					name: "com.knpl.pragati.groupnotifications.view.fragment.SelectMemberDialog",
					controller: this
						// id: "fragmentId"
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					this._oDialog = oDialog;
					this._configDialog();
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog();
				this._oDialog.open();
			}
		},

		_configDialog: function () {
			var bMultiSelect = true;
			this._oDialog.setMultiSelect(bMultiSelect);

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = "Confirm";
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// connect dialog to the root view 
			//of this component (models, lifecycle)
			this.getView().addDependent(this._oDialog);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		// handleSearch: function (oEvent) {

		// 	var sQuery = oEvent.getParameter("value").toLowerCase();
		// 	sQuery = "'" + sQuery + "'";

		// 	// if (sQuery && sQuery.length > 0) {

		// 	var sPath = "/UserSet";
		// 	if (sQuery) {
		// 		var oCustomParam = {
		// 			Query: sQuery
		// 		};
		// 	}
		// 	var oSorter = new sap.ui.model.Sorter("RoleId", false);
			
		// 	var sExpand = "Admin,Role,Painter";
		// 	var sSelect = "Id,Admin/Name,Painter/Name,Admin/Email,Admin/Mobile,Painter/Mobile,Painter/Email,RoleId,Role/Role";

		// 	this._Template = this._Template ? this._Template : sap.ui.getCore().byId("userDialog");
		// 	var aFilters = new sap.ui.model.Filter({
		// 		filters: [
		// 			new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
		// 		]
		// 	});

		// 	//Call bindTable with function parameters....
		// 	if (sQuery) {
		// 		this.bindTable("tableDialog", sPath, this._Template, aFilters, sExpand, sSelect, oSorter, oCustomParam);
		// 	} else {
		// 		this.bindTable("tableDialog", sPath, this._Template, aFilters, sExpand, sSelect, oSorter);
		// 	}

		// },



		// /** 
		//  * 
		//  * @param sTableId - Table Id
		//  * @param sPath - binding path
		//  * @param oTemplate - Item template 
		//  * Optional? @param aFilters - filters array
		//  * Optional? @param aCustomParam - Custom paramter
		//  */
		// bindTable: function (sTableId, sPath, oTemplate, aFilters, sExpand, sSelect, oSorter, oCustomParam) {
		// 	// debugger;
		// 	var oBindSettings = {
		// 		path: sPath,
		// 		template: oTemplate.clone(),
		// 		parameters: {}
		// 	};

		// 	if (!!aFilters) {
		// 		oBindSettings.filters = aFilters;
		// 	}

		// 	if (!!oCustomParam) {
		// 		oBindSettings.parameters.custom = oCustomParam;
		// 	}

		// 	if (!!sExpand) {
		// 		oBindSettings.parameters.expand = sExpand;
		// 	}

		// 	if (!!sSelect) {
		// 		oBindSettings.parameters.select = sSelect;
		// 	}

		// 	if (!!oSorter) {
		// 		oBindSettings.sorter = oSorter;
		// 	}

		// 	// this.getView().byId(sTableId).bindItems(oBindSettings);
		// 	sap.ui.getCore().byId(sTableId).unbindItems();
		// 	sap.ui.getCore().byId(sTableId).bindItems(oBindSettings);

        // },
        handleFilters: function(oEvent){
            var sQuery = oEvent.getParameter("value").toLowerCase();
            sQuery = "'" + sQuery + "'";
            var sPath = "/UserSet";
			var oSorter = new sap.ui.model.Sorter("RoleId", false);
			var sExpand = "Admin,Role,Painter";
			var sSelect = "Id,Admin/Name,Painter/Name,Admin/Email,Admin/Mobile,Painter/Mobile,Painter/Email,RoleId,Role/Role";
            var aFilters =[];
            aFilters.push(new Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false));
            aFilters.push(new Filter('PainterId', sap.ui.model.FilterOperator.GT, 0));
            if(sQuery){
            aFilters.push( new Filter(
                                        [
                                            new Filter(
                                                {
                                                    path: "tolower(Painter/Name)",
                                                    operator: "Contains",
                                                    value1: sQuery.trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "tolower(Painter/Email)",
                                                    operator: "Contains",
                                                    value1: sQuery.trim(),
                                                    caseSensitive: false
                                                }
                                            ),
                                            new Filter(
                                                {
                                                    path: "tolower(Painter/Mobile)",
                                                    operator: "Contains",
                                                    value1: sQuery.trim(),
                                                    caseSensitive: false
                                                }
                                            )
                                            
                                        ],
                                        false
                                    )
                                );
                            }

                            
                     var oBinding = oEvent.getSource().getBinding("items");
			        oBinding.filter(aFilters);


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
                        "com.knpl.pragati.groupnotifications.view.fragment.PainterValueHelp",
                        this
                    );
                    this.getView().addDependent(this._oValueHelpDialog);

                    this._oValueHelpDialog.setBusy(true);

                    this._oValueHelpDialog.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/UserSet", filters: [oFilter], parameters: { expand: "Painter,Painter/Depot,Painter/Division,Painter/ArcheType,Painter/PainterType" }, events:
                                    {
                                        dataReceived: function () {
                                            this._oValueHelpDialog.setBusy(false);
                                            this._oValueHelpDialog.update();
                                            
                                            // var update=this._oValueHelpDialog.update();
                                            // update.then(
                                            //     function(){
                                            //         debugger;
                                            //         this._oValueHelpDialog.setBusy(false)
                                            //     }
                                                
                                            // );
                                            
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

                   // this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                    this._oValueHelpDialog.open();
                },

                
                onValueHelpCancelPressPainter: function () {
                    this._oValueHelpDialog.close();
                },

                onValueHelpOkPressPainter: function (oEvent) {
                    var oData = [];
                    var xUnique = new Set();
                    var oViewModel = this.getModel("objectView"),
                aData = oViewModel.getProperty("/oDetails/Members");
                    var aTokens = oEvent.getParameter("tokens");
                    if (aTokens && aTokens.length) {
				for (var i = 0; i < aTokens.length; i++) {
                    var userData = aTokens[i].getCustomData()[0].getValue();
                    if(userData.AdminId){
                         var painterData=this.getModel().getData("/" + userData.Admin.__ref);
                    }
                    else {
                    var painterData=this.getModel().getData("/" + userData.Painter.__ref);
                   }
                    //var roleData = this.getModel().getData("/" + userData.Role.__ref);
                    userData.Painter=painterData;
					//userData.Role.Role = roleData.Role;
					aData.push(userData);
				}
			}
			var uniqueArray = this.removeDuplicates(aData, "Id");
			oViewModel.setProperty("/oDetails/Members", uniqueArray);
			oViewModel.refresh(true);

			

                    // aTokens.forEach(function (ele) {
                    //     if (xUnique.has(ele.getKey()) == false) {
                    //         oData.push({
                    //             Name: ele.getText(),
                    //             Id: ele.getKey()
                    //         });
                    //         xUnique.add(ele.getKey());
                    //     }
                    // });

                    // this.getView().getModel("objectView").setProperty("/oDetails/Receivers", oData);
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
                onRadioBtnChange: function (oEvent) {
                    var selectedIndex = oEvent.mParameters.selectedIndex;
                    var oViewModel = this.getModel("objectView");

                    switch (selectedIndex) {

                        case 0:
                            this.getModel("objectView").setProperty("/TargetDetails/TargetFilterType", "PAINTER");
                            
                            break;
                        
                        case 1:
                            this.getModel("objectView").setProperty("/TargetDetails/TargetFilterType", "GROUP");
                             //oViewModel.setProperty("/TargetDetails/GroupPainters", []);
                            // if (this._oValueHelpDialogP) {
                            //     this._oValueHelpDialogP.destroy();
                            //     delete this._oValueHelpDialogP;
                            // }
                            break;
                        
                    }
                },
                onMultyZoneSet : function (){
                    var oViewModel = this.getModel("objectView");
                    var sKeys = oViewModel.getProperty("/TargetDetails/NotificationGroupZone");
                    var oDivision = this.getView().byId("idDivision");
                    
                    this._fnChangeDivDepot({
                        src: { path: "/TargetDetails/NotificationGroupZone" },
                        target: { localPath: "/TargetDetails/NotificationGroupDivision", oDataPath: "/MasterDivisionSet", key: "Zone" }
                    });

                    this._fnChangeDivDepot({
                        src: { path: "/TargetDetails/NotificationGroupDivision" },
                        target: { localPath: "/TargetDetails/NotificationGroupDepot", oDataPath: "/MasterDepotSet", key: "Division", targetKey: "DepotId" }
                    });

                    var aDivFilter = [];
                    for (var y of sKeys) {
                        aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                    }
                    oDivision.getBinding("items").filter(aDivFilter);
                    
                },
                onMultyZoneChange: function (oEvent) {
                    var sKeys = oEvent.getSource().getSelectedKeys();
                    var oDivision = this.getView().byId("idDivision");
                    
                    this._fnChangeDivDepot({
                        src: { path: "/TargetDetails/NotificationGroupZone" },
                        target: { localPath: "/TargetDetails/NotificationGroupDivision", oDataPath: "/MasterDivisionSet", key: "Zone" }
                    });

                    this._fnChangeDivDepot({
                        src: { path: "/TargetDetails/NotificationGroupDivision" },
                        target: { localPath: "/TargetDetails/NotificationGroupDepot", oDataPath: "/MasterDepotSet", key: "Division", targetKey: "DepotId" }
                    });

                    var aDivFilter = [];
                    for (var y of sKeys) {
                        aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                    }
                    oDivision.getBinding("items").filter(aDivFilter);
                },

                onMultyDivisionChange: function (oEvent) {

                    this._fnChangeDivDepot({
                        src: { path: "/TargetDetails/NotificationGroupDivision" },
                        target: { localPath: "/TargetDetails/NotificationGroupDepot", oDataPath: "/MasterDepotSet", key: "Division", targetKey: "DepotId" }
                    });
                },
                _fnChangeDivDepot: function (oChgdetl) {

                    var aTarget = this.getModel("objectView").getProperty(oChgdetl.target.localPath),
                        aNewTarget = [];

                    var aSource = this.getModel("objectView").getProperty(oChgdetl.src.path),
                        oSourceSet = new Set(aSource);

                    

                    var oModel = this.getModel(), tempPath, tempdata;

                    aTarget.forEach(function (ele) {
                        if (typeof ele === "string") {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                Id: ele
                            });
                        }
                        else {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                Id: ele[oChgdetl.target.targetKey]
                            });
                        }
                        tempdata = oModel.getData(tempPath);
                        if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                            aNewTarget.push(ele)
                        }
                    });

                    this.getModel("objectView").setProperty(oChgdetl.target.localPath, aNewTarget);
                },
                onValueHelpRequestedDepot: function () {
                    this._oMultiInput = this.getView().byId("multiInputDepotAdd");
                    this.oColModel = new JSONModel({
                        cols: [
                            {
                                label: "Depot Id",
                                template: "Id",
                                width: "10rem",
                            },
                            {
                                label: "Depot",
                                template: "Depot",
                            }
                        ],
                    });

                    var aCols = this.oColModel.getData().cols;

                    this._oValueHelpDialog = sap.ui.xmlfragment(
                        "com.knpl.pragati.groupnotifications.view.fragment.DepotValueHelp",
                        this
                    );
                    var oDataFilter = {
                        Id: "",
                        Depot: "",
                    }
                    var oModel = new JSONModel(oDataFilter);
                    this.getView().setModel(oModel, "DepotFilter");

                    this.getView().addDependent(this._oValueHelpDialog);

                    this._oValueHelpDialog.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/MasterDepotSet", events:
                                    {
                                        dataReceived: function () {
                                            this._oValueHelpDialog.update();
                                        }.bind(this)
                                    }
                                });
                            }

                            if (oTable.bindItems) {
                                oTable.bindAggregation("items", "/MasterDepotSet", function () {
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
                onFilterBarSearch: function (oEvent) {
                    var afilterBar = oEvent.getParameter("selectionSet"),
                        aFilters = [];

                    aFilters.push(
                        new Filter({
                            path: "Id",
                            operator: FilterOperator.Contains,
                            value1: afilterBar[0].getValue(),
                            caseSensitive: false,
                        })
                    );
                    aFilters.push(
                        new Filter({
                            path: "Depot",
                            operator: FilterOperator.Contains,
                            value1: afilterBar[1].getValue(),
                            caseSensitive: false,
                        })
                    );

                    this._filterTable(
                        new Filter({
                            filters: aFilters,
                            and: true,
                        })
                    );
                },

                onValueHelpAfterOpen: function () {
                    var aFilter = this._getfilterforControl();

                    this._filterTable(aFilter, "Control");
                    this._oValueHelpDialog.update();
                },
                _getfilterforControl: function () {
                    var sDivision = this.getView().getModel("objectView").getProperty("/TargetDetails/NotificationGroupDivision");
                    var aFilters = [];
                    if (sDivision) {
                        for (var y of sDivision) {
                            aFilters.push(new Filter("Division", FilterOperator.EQ, y));
                        }
                    }
                    if (aFilters.length == 0) {
                        return [];
                    }

                    return new Filter({
                        filters: aFilters,
                        and: false,
                    });
                },

                onValueHelpCancelPress: function () {
                    this._oValueHelpDialog.close();
                },

                onValueHelpOkPress: function (oEvent) {
                    var oData = [];
                    var xUnique = new Set();
                    var aTokens = oEvent.getParameter("tokens");

                    aTokens.forEach(function (ele) {
                        if (xUnique.has(ele.getKey()) == false) {
                            oData.push({
                                DepotId: ele.getKey()
                            });
                            xUnique.add(ele.getKey());
                        }
                    });

                    this.getView()
                        .getModel("objectView")
                        .setProperty("/TargetDetails/NotificationGroupDepot", oData);
                    this._oValueHelpDialog.close();
                },











	});

});