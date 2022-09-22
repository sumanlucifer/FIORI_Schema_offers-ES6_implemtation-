sap.ui.define([
    "../controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "../controller/Validator",
    "sap/ui/core/ValueState",
    "../model/formatter",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, 
        JSONModel, 
        MessageBox, 
        MessageToast, 
        Fragment, 
        Filter, 
        FilterOperator, 
        Sorter, 
        Validator, 
        ValueState, 
        formatter,
        Dialog, Button, mobileLibrary, Text) {
        "use strict";

    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

        return BaseController.extend("com.knpl.pragati.ContactPainter.controller.Detail", {
            formatter: formatter,

            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    if (oEvent.getParameter("element").getRequired()) {
                        oEvent.getParameter("element").setValueState(ValueState.Error);
                    } else {
                        oEvent.getParameter("element").setValueState(ValueState.None);
                    }
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });

            },
            _onRouteMatched: function (oEvent) {
                var sId = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Id
                );
                var sMode = window.decodeURIComponent(
                    oEvent.getParameter("arguments").Mode
                );
                this._SetDisplayData(sId, sMode);

                this.getView().setModel(new JSONModel({
                    ToggleSiteImagesVisible: "Before",
                    SortSiteIMagesDescending: false
                }), "LocalViewModel");

                // if (oEvent.getParameter("targetControl").oFromPage) {
                //     var sFromView = oEvent.getParameter("targetControl").oFromPage.getProperty("viewName");
                //     if (sFromView === "com.knpl.dga.leadmanagement.view.SiteVisitDetail") {
                //         this.getView().byId("iconTabBar").setSelectedKey("6");
                        // this.getView().byId("VisitHistoryTbl").attachBeforeRebindTable(this.onBeforeRebindVisitHistory, this);
                //         // this.getView().byId("VisitHistoryTbl").fireBeforeRebindTable();
                //         this.getView().byId("VisitHistoryTbl").getTable().getBinding("items").refresh();
                //     }
                // }
            },

            // fnSetRatingValues: function (sRating) {
            //     switch (sRating) {
            //         case "1":
            //             return "*";
            //         case "2":
            //             return "**";
            //         case "3":
            //             return "***";
            //         case "4":
            //             return "****";
            //         case "5":
            //             return "*****";
            //     }
            // },
            
            onBeforeRebindVisitHistory: function (oEvent) {
                var oView = this.getView();
                var sId = oView.getModel("oModelDisplay").getProperty("/Id")
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "DGA,TargetLead";
                // oBindingParams.parameters["expand"] = "LeadVisitOutcomeDetails/VisitsOutcome";
                var oIdFilter = new Filter("VisitTargetId", FilterOperator.EQ, sId);
                // var oFirstVisitFilter = new Filter("LeadVisitOutcomeDetails/VisitOutcomeId", FilterOperator.NE, 1);
                // var oTaskTypeFilter = new Filter("TaskTypeId", FilterOperator.EQ, 2);
                // var oArchivedFilter = new Filter("IsArchived", FilterOperator.EQ, false);
                // oBindingParams.filters.push(oIdFilter, oTaskTypeFilter);
                oBindingParams.filters.push(oIdFilter);
                oBindingParams.sorter.push(new Sorter("Date", true));
            },

            handleLinkPress:function(oEvent){
                var sComment = oEvent.getSource().getBindingContext().getObject("Comments");
                if (!this.oDefaultMessageDialog) {
                    this.oDefaultMessageDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Default Message",
                        content: new Text({ text: sComment }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Close",
                            press: function () {
                                this.oDefaultMessageDialog.close();
                            }.bind(this)
                        })
                    });
                }
    
                this.oDefaultMessageDialog.open();
            },

            _SetDisplayData: function (oProp, sMode) {
                var oData = {
                    mode: sMode,
                    bindProp: "Leads(" + oProp + ")",
                    Id: oProp,
                    PageBusy: true,
                    IcnTabKey: "0",
                    resourcePath: "com.knpl.pragati.ContactPainter"
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelDisplay");
                if (sMode == "Edit") {
                    this._initEditData();
                } else {
                    this._initDisplayData();
                }

            },
            _initDisplayData: function () {
                var c1, c2, c3;
                var oModel = this.getView().getModel("oModelDisplay");
                var oData = oModel.getData();
                var othat = this;
                oModel.setProperty("/PageBusy", true);
                c1 = othat._dummyPromise();
                c1.then(function () {
                    c2 = othat._getDisplayData(oData["bindProp"]);
                    c2.then(function () {
                        c3 = othat._LoadFragment("BasicDetails");
                        c3.then(function () {
                            oModel.setProperty("/PageBusy", false)
                        })
                    })
                })
            },
            // _initEditData: function () {
            //     var oView = this.getView();
            //     var othat = this;
            //     var oModel = oView.getModel("oModelDisplay");
            //     var sProp = oModel.getProperty("/bindProp")
            //     var oData = oModel.getData();
            //     var c1, c2, c3, c4;
            //     var c1 = othat._AddObjectControlModel("Edit", oData["complaintId"]);
            //     oModel.setProperty("/PageBusy", true);
            //     c1.then(function () {
            //         c1.then(function () {
            //             c2 = othat._setInitViewModel();
            //             c2.then(function () {
            //                 c3 = othat._LoadFragment("AddComplaint");
            //                 c3.then(function () {
            //                     c4 = othat._getDisplayData(sProp);
            //                     c4.then(function () {
            //                         oModel.setProperty("/PageBusy", false);
            //                     })

            //                 })
            //             })
            //         })
            //     })

            // },
            // _setInitViewModel: function () {
            //     var promise = jQuery.Deferred();
            //     var oView = this.getView();
            //     var othat = this;
            //     var oModel = oView.getModel("oModelDisplay")
            //     var oProp = oModel.getProperty("/bindProp");
            //     var exPand = "ComplaintType";
            //     return new Promise((resolve, reject) => {
            //         oView.getModel().read("/" + oProp, {
            //             urlParameters: {
            //                 $expand: exPand,
            //             },
            //             success: function (data) {

            //                 var oModel = new JSONModel(data);
            //                 oView.setModel(oModel, "oModelView");
            //                 resolve();
            //             },
            //             error: function () { },
            //         });
            //     });
            // },
            // _CheckLoginData: function () {
            //     var promise = jQuery.Deferred();
            //     var oView = this.getView();
            //     var oData = oView.getModel();
            //     var oLoginModel = oView.getModel("LoginInfo");
            //     var oControlModel = oView.getModel("oModelDisplay");
            //     var oLoginData = oLoginModel.getData();

            //     if (Object.keys(oLoginData).length === 0) {
            //         return new Promise((resolve, reject) => {
            //             oData.callFunction("/GetLoggedInAdmin", {
            //                 method: "GET",
            //                 urlParameters: {
            //                     $expand: "UserType",
            //                 },
            //                 success: function (data) {
            //                     if (data.hasOwnProperty("results")) {
            //                         if (data["results"].length > 0) {
            //                             oLoginModel.setData(data["results"][0]);
            //                             oControlModel.setProperty(
            //                                 "/LoggedInUser",
            //                                 data["results"][0]
            //                             );
            //                         }
            //                     }
            //                     resolve();
            //                 },
            //             });
            //         });
            //     } else {
            //         oControlModel.setProperty("/LoggedInUser", oLoginData);
            //         promise.resolve();
            //         return promise;
            //     },

            // },

            _getDisplayData: function (oProp) {
                // @ts-ignore
                var promise = jQuery.Deferred(),
                    exPand = "PreEstimation,Quotation,MaterialRequisition,LeadSource,SourceContractor,AssignedContractors,PaintType,PaintingReqSlab,LeadServiceType,State,LeadStatus, DGA, DGADetails,SourceDealer,Dealer,LeadServiceSubType,SourceConsumer,LeadSelectedPaintingRequests,LeadSelectedPaintingRequests/MasterPaintingReq,LeadLostReason,CompetitionBrand,CompetitorServiceType,ShortClosureReason,AssignedContractors/Contractor, ConsumerFeedback/ConsumerFeedbackAnswers/Question, ConsumerFeedback/ConsumerFeedbackAnswers/Answer, SiteImages";
                if (oProp.trim() !== "") {
                    var DGAModel = this.getOwnerComponent().getModel("DGAModel");
                    this.getView().setModel(DGAModel);
                    this.getView().bindElement({
                        path: "/" + oProp,
                        parameters: {
                            expand: exPand,
                        },
                        events: {
                            dataRequested: function (oEvent) {
                                this.getView().setBusy(true);
                            }.bind(this),
                            dataReceived: function (oEvent) {
                                this.getView().setBusy(false);
                                // var oFeedbackData = oEvent.getParameter("data").ConsumerFeedback.length > 0 ? oEvent.getParameter("data").ConsumerFeedback[0].ConsumerFeedbackAnswers : [],
                                //     oFeedbackDataModel = new JSONModel(oFeedbackData);
                                // this.getView().setModel(oFeedbackDataModel, "FeedbackDataModel");
                                // this.getView().getModel("LocalViewModel").setProperty("/NoFeedbackTextVisible", (oFeedbackData.length <= 0 ? true : false));
                            }.bind(this),
                        },
                    });
                }
                promise.resolve();
                return promise;
            },
            _bindViewElement: function (sElementId, sBindingPath) {
                var oView = this.getView();
                var oElement = oView.byId(sElementId);
                oElement.bindElement(sBindingPath);
            },

            onIcnTbarChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                if (sKey == "1") {
                    // var DGAModel = oView.getModel("DGAModel");
                    // oView.byId("QuotationTbl1").setModel(DGAModel);
                    oView.byId("QuotationTbl1").rebindTable();
                    oView.byId("QuotationTbl2").rebindTable();
                    oView.byId("QuotationTbl3").rebindTable();
                    oView.byId("QuotationTbl4").rebindTable();
                    oView.byId("QuotationTbl5").rebindTable();
                }
                else if(sKey == "2"){
                    oView.byId("VisitHistoryTbl").rebindTable();
                }
            },



            _bindQuotationTbl: function (oEvent, iPaintingReqId) {
                // @ts-ignore
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var sId = oView.getModel("oModelDisplay").getProperty("/Id")
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.parameters["expand"] = "QuotationSelectedProducts,RoomType,Quotation,QuotationSelectedProducts/MasterProduct,QuotationSelectedProducts/MasterProductShades";
                var oLeadIdFilter = new Filter("LeadId", FilterOperator.EQ, sId);
                var oPaintingReqIdFiler = new Filter("LeadSelectedPaintingRequest/PaintingReqsId", FilterOperator.EQ, iPaintingReqId);
                mBindingParams.filters.push(oLeadIdFilter, oPaintingReqIdFiler);
                // mBindingParams.sorter.push(new Sorter("CreatedAt", true));
                promise.resolve();
                return promise;
            },


            onBeforeRebindQuotReq1: function (oEvent) {
                var oView = this.getView();
                var c1 = this._bindQuotationTbl(oEvent, 1);
                var othat = this;
                c1.then(() => {
                    var oBindingObject = oEvent.getSource().getBindingContext().getObject();
                    var sQuotationPath = oBindingObject.Quotation.__list[0];
                    this._bindViewElement("idTotalQuotInterior", "/" + sQuotationPath);
                    this._bindViewElement("idLblTotalQuotInterior", "/" + sQuotationPath);
                    this._bindViewElement("idQuotOCTotal", "/" + sQuotationPath);
                    this._bindViewElement("idQuotDiscountLbl", "/" + sQuotationPath);
                    this._bindViewElement("idQuotDiscount", "/" + sQuotationPath);
                    this._bindViewElement("idQuotGTotal", "/" + sQuotationPath);
                    this._bindViewElement("idQuotationDate", "/" + sQuotationPath);
                });
            },
            onBeforeRebindQuotReq2: function (oEvent) {
                var oView = this.getView();
                var c1 = this._bindQuotationTbl(oEvent, 2);
                var othat = this;
                c1.then(() => {
                    var oBindingObject = oEvent.getSource().getBindingContext().getObject();
                    var sQuotationPath = oBindingObject.Quotation.__list[0];
                    this._bindViewElement("idTotalQuotExterior", "/" + sQuotationPath);
                    this._bindViewElement("idLblTotalQuotExterior", "/" + sQuotationPath);
                });
            },
            onBeforeRebindQuotReq3: function (oEvent) {
                var oView = this.getView();
                var c1 = this._bindQuotationTbl(oEvent, 3);
                var othat = this;
                c1.then(() => {
                    var oBindingObject = oEvent.getSource().getBindingContext().getObject();
                    var sQuotationPath = oBindingObject.Quotation.__list[0];
                    this._bindViewElement("idTotalQuotWC", "/" + sQuotationPath);
                    this._bindViewElement("idLblTotalQuotWC", "/" + sQuotationPath);
                });
            },
            onBeforeRebindQuotReq4: function (oEvent) {
                var oView = this.getView();
                var c1 = this._bindQuotationTbl(oEvent, 4);
                var othat = this;
                c1.then(() => {
                    var oBindingObject = oEvent.getSource().getBindingContext().getObject();
                    var sQuotationPath = oBindingObject.Quotation.__list[0];
                    this._bindViewElement("idTotalQuotCC", "/" + sQuotationPath);
                    this._bindViewElement("idLblTotalQuotCC", "/" + sQuotationPath);
                });
            },
            onBeforeRebindQuotReq5: function (oEvent) {
                var oView = this.getView();
                var c1 = this._bindQuotationTbl(oEvent, 5);
                var othat = this;
                c1.then(() => {
                    var oBindingObject = oEvent.getSource().getBindingContext().getObject();
                    var sQuotationPath = oBindingObject.Quotation.__list[0];
                    this._bindViewElement("idTotalQuotEnamel", "/" + sQuotationPath);
                    this._bindViewElement("idLblTotalQuotEnamel", "/" + sQuotationPath);
                });
            },




            _LoadFragment: function (mParam) {
                // @ts-ignore
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("oVBoxAddObjectPage");
                var sResourcePath = oView.getModel("oModelDisplay").getProperty("/resourcePath")
                oVboxProfile.destroyItems();
                return Fragment.load({
                    id: oView.getId(),
                    controller: othat,
                    name: sResourcePath + ".view.fragments." + mParam,
                }).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },

            onpressVisitHistoryItem: function (oEvent) {
                var sId = oEvent.getSource().getBindingContext().getObject().Id,
                    sLeadId = this.getView().getElementBinding().getBoundContext().getObject().Id,
                    sVisitType = oEvent.getSource().getBindingContext().getProperty("/" + oEvent.getSource().getBindingContext().getProperty("/" + oEvent.getSource().getBindingContext().getObject().LeadVisitOutcomeDetails.__ref).VisitsOutcome.__ref).Name,
                    oRouter = this.getOwnerComponent().getRouter();

                oRouter.navTo("SiteVisitDetail", { VisitId: sId, VisitType: sVisitType, LeadId: sLeadId });
            },


            // onPressSave: function () {
            //     var bValidateForm = this._ValidateForm();
            //     if (bValidateForm) {
            //         this._postDataToSave();
            //     }

            // },
            // _postDataToSave: function () {
            //     /*
            //      * Author: manik saluja
            //      * Date: 02-Dec-2021
            //      * Language:  JS
            //      * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
            //      */
            //     var oView = this.getView();
            //     var oModelControl = oView.getModel("oModelControl");
            //     oModelControl.setProperty("/PageBusy", true);
            //     var othat = this;
            //     var c1, c2, c3;
            //     c1 = othat._CheckEmptyFieldsPostPayload();
            //     c1.then(function (oPayload) {
            //         c2 = othat._UpdatedObject(oPayload)
            //         c2.then(function () {
            //             c3 = othat._uploadFile();
            //             c3.then(function () {
            //                 oModelControl.setProperty("/PageBusy", false);
            //                 othat.onNavToHome();
            //             })
            //         })
            //     })


            // },




        }

        );
    }
);