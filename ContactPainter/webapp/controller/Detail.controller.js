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
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, MessageBox, MessageToast, Fragment, Filter, FilterOperator, Sorter, Validator, ValueState, formatter) {
        "use strict";

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
                //         // this.getView().byId("VisitHistoryTbl").attachBeforeRebindTable(this.onBeforeRebindVisitHistory, this);
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
            _bindViewElement: function(sElementId, sBindingPath) {
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
                //  else if (sKey == "3") {
                //     oView.byId("idMaterialsReqTable1").rebindTable();
                //     oView.byId("idMaterialsReqTable2").rebindTable();
                //     oView.byId("idMaterialsReqTable3").rebindTable();
                //     oView.byId("idMaterialsReqTable4").rebindTable();
                //     oView.byId("idMaterialsReqTable5").rebindTable();
                //     oView.byId("idMaterialsReqTable6").rebindTable();
                //     oView.byId("idMaterialsReqTable1").rebindTable();
                // } else if (sKey == "4") {
                //     oView.byId("DGAHistoryTbl").rebindTable();
                // } else if (sKey == "5") {
                //     this.fnSetFeedbackFormDetails();
                // } else if (sKey == "6") {
                //     oView.byId("VisitHistoryTbl").rebindTable();
                // } else if (sKey == "7") {
                //     this.getView().getModel("LocalViewModel").setProperty("/ToggleSiteImagesVisible", "Before");
                //     var sSelectedListKey = this.getView().getModel("LocalViewModel").getProperty("/ToggleSiteImagesVisible"),
                //         sListID = sSelectedListKey === "After" ? "idSiteImagesAfterList" : "idSiteImagesBeforeList";
                //     this.getView().byId(sListID).getBinding("items").refresh();
                // } else if (sKey == "8") {
                //     oView.byId("PaymentHistoryTbl").rebindTable();
                // }
            },

            // _bindPreEstimationTbl: function (oEvent, iPaintingReqId) {
            //     // @ts-ignore
            //     var promise = jQuery.Deferred();
            //     var oView = this.getView();
            //     var sId = oView.getModel("oModelDisplay").getProperty("/Id")
            //     var mBindingParams = oEvent.getParameter("bindingParams");
            //     mBindingParams.parameters["expand"] = "PreEstimationSelectedProducts,PreEstimation";
            //     var oLeadIdFilter = new Filter("LeadId", FilterOperator.EQ, sId);
            //     var oPaintingReqIdFiler = new Filter("LeadSelectedPaintingRequest/PaintingReqsId", FilterOperator.EQ, iPaintingReqId);
            //     mBindingParams.filters.push(oLeadIdFilter, oPaintingReqIdFiler);
            //     // mBindingParams.sorter.push(new Sorter("CreatedAt", true));
            //     promise.resolve();
            //     return promise;
            // },

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
            // onBeforeBindMatReqTbl1: function (oEvent) {
            //     var oView = this.getView();
            //     var c1 = this._bindMRTbl(oEvent, 1);
            //     var othat = this;
            //     c1.then(() => {
            //         var oBindingObject = oEvent.getSource().getBindingContext().getObject();
            //         var sMaterialRequisitionPath = oBindingObject.MaterialRequisition.__list[0];
            //         this._bindViewElement("idMRDate", "/" + sMaterialRequisitionPath);
            //     });
            // },
            // onBeforeBindMatReqTbl2: function (oEvent) {
            //     var oView = this.getView();
            //     var c1 = this._bindMRTbl(oEvent, 2);
            //     var othat = this;
            //     c1.then(() => {

            //     });
            // },
            // onBeforeBindMatReqTbl3: function (oEvent) {
            //     var oView = this.getView();
            //     var c1 = this._bindMRTbl(oEvent, 3);
            //     var othat = this;
            //     c1.then(() => {
            //     });
            // },
            // onBeforeBindMatReqTbl4: function (oEvent) {
            //     var oView = this.getView();
            //     var c1 = this._bindMRTbl(oEvent, 4);
            //     var othat = this;
            //     c1.then(() => {
            //     });
            // },
            // onBeforeBindMatReqTbl6: function (oEvent) {
            //     var oView = this.getView();
            //     var c1 = this._bindMRTbl(oEvent, 5);
            //     var othat = this;
            //     c1.then(() => {
            //     });
            // },
            // onBeforeBindMatReqTbl5: function (oEvent) {
            //     var oView = this.getView();
            //     var sId = oView.getModel("oModelDisplay").getProperty("/Id")
            //     var oBindingParams = oEvent.getParameter("bindingParams");
            //     oBindingParams.parameters["expand"] = "Equipment";
            //     var oFiler = new Filter("LeadId", FilterOperator.EQ, sId);
            //     oBindingParams.filters.push(oFiler);
            //     // oBindingParams.sorter.push(new Sorter("CreatedAt", true));
            // },
            // onBeforeRebindDGAHistory: function (oEvent) {
            //     var oView = this.getView();
            //     var sId = oView.getModel("oModelDisplay").getProperty("/Id")
            //     var oBindingParams = oEvent.getParameter("bindingParams");
            //     oBindingParams.parameters["expand"] = "DGA,DGA/DGAType,DGA/Depot,DGA/Pincode,DGA/PayrollCompany";
            //     var oFiler = new Filter("Id", FilterOperator.EQ, sId);
            //     oBindingParams.filters.push(oFiler);
            //     oBindingParams.sorter.push(new Sorter("CreatedAt", true));
            // },
            // onBeforeRebindVisitHistory: function (oEvent) {
            //     var sId = this.getView().getModel("oModelDisplay").getProperty("/Id"),
            //         oBindingParams = oEvent.getParameter("bindingParams"),
            //         oIdFilter = new Filter("VisitTargetId", FilterOperator.EQ, sId),
            //         oTaskTypeFilter = new Filter("TaskTypeId", FilterOperator.EQ, 1),
            //         oCompletedStatusFilter = new Filter("Status", FilterOperator.EQ, "Completed"),
            //         oInitialStatusFilter = new Filter("Status", FilterOperator.EQ, "Initial");


            //     oBindingParams.parameters["expand"] = "LeadVisitOutcomeDetails/VisitsOutcome";
            //     oBindingParams.filters.push(oIdFilter, oTaskTypeFilter, oCompletedStatusFilter,oInitialStatusFilter);
            //     oBindingParams.sorter.push(new Sorter("Date", true));
            // },

            // onBeforeRebindPaymentHistory: function (oEvent) {
            //     var promise = jQuery.Deferred(),
            //         sLeadId = this.getView().getModel("oModelDisplay").getProperty("/Id"),
            //         oLeadIdFilter = new Filter("LeadId", FilterOperator.EQ, sLeadId),
            //         oBindingParams = oEvent.getParameter("bindingParams");

            //     oBindingParams.filters.push(oLeadIdFilter);
            //     promise.resolve();
            //     return promise;
            // },

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

            // onPreEstDownload: function (oEvent) {
            //     var sServiceURL = this.getView().getModel().sServiceUrl;
            //     var oBindingObject = oEvent.getSource().getBindingContext().getObject();
            //     var sPreEstimationPath = oBindingObject.PreEstimation.__list[0];
            //     var sTokenCode = this.getView().getModel().getProperty("/" + sPreEstimationPath).TokenCode;
            //     var sURL = sServiceURL + "/" + sPreEstimationPath + "/$value?Token=" + sTokenCode;
            //     sap.m.URLHelper.redirect(sURL, true);
            // },

            // onQuotDownload: function (oEvent) {
            //     var sServiceURL = this.getView().getModel().sServiceUrl;
            //     var oBindingObject = oEvent.getSource().getBindingContext().getObject();
            //     var sQuotationPath = oBindingObject.Quotation.__list[0];
            //     var sTokenCode = this.getView().getModel().getProperty("/" + sQuotationPath).TokenCode;
            //     var sURL = sServiceURL + "/" + sQuotationPath + "/$value?Token=" + sTokenCode;
            //     sap.m.URLHelper.redirect(sURL, true);
            // },

            // onMRDownload: function (oEvent) {
            //     var sServiceURL = this.getView().getModel().sServiceUrl;
            //     var oBindingObject = oEvent.getSource().getBindingContext().getObject();
            //     var sMaterialRequisitionPath = oBindingObject.MaterialRequisition.__list[0];
            //     var sTokenCode = this.getView().getModel().getProperty("/" + sMaterialRequisitionPath).TokenCode;
            //     var sURL = sServiceURL + "/" + sMaterialRequisitionPath + "/$value?Token=" + sTokenCode;
            //     sap.m.URLHelper.redirect(sURL, true);
            // },

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
            // _UpdatedObject: function (oPayLoad) {
            //     var othat = this;
            //     var oView = this.getView();
            //     var oDataModel = oView.getModel();
            //     var oModelControl = oView.getModel("oModelControl");
            //     var sProp = oModelControl.getProperty("/bindProp")
            //     //console.log(sProp,oPayLoad)
            //     return new Promise((resolve, reject) => {
            //         oDataModel.update("/" + sProp, oPayLoad, {
            //             success: function (data) {
            //                 MessageToast.show(othat.geti18nText("Message1"));
            //                 resolve(data);
            //             },
            //             error: function (data) {
            //                 MessageToast.show(othat.geti18nText("Message2"));
            //                 oModelControl.setProperty("/PageBusy", false);
            //                 reject(data);
            //             },
            //         });
            //     });
            // }
            


        }

        );
    }
);