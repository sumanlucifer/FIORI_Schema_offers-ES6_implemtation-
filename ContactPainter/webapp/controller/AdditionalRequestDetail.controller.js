sap.ui.define(
    [
        "com/knpl/pragati/ContactPainter/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "../model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator,formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.ContactPainter.controller.AdditionalRequestDetail", {
                formatter: formatter,
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteAdditionalRequestDetail").attachPatternMatched(this._onObjectMatched, this);

            },

            _onObjectMatched: function (oEvent) {
                this.sObjectId = oEvent.getParameter("arguments").Id;
                this.sPainterId = oEvent.getParameter("arguments").Pid;
                //this._getInitialRequestDetails(this.sObjectId);
                this._initData(this.sObjectId,this.sPainterId);
            },
            onPressBreadcrumbLink: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteProfile", {
                    mode: "edit",
                    prop: this.sPainterId,
                });
            },
            _initData: function (objectId,painterId){
                 var oData = {
                    UUID: objectId,
                    bBusy: false
                };
                var oDataModel;
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelControl");

                this._getInitialRequestDetails(objectId);

            },
            _getInitialRequestDetails: function (mParam1) {
                var oView = this.getView()
                var oData = oView.getModel()
                var sPath = "/PainterAdditionalBenifitSet";
                var filters = [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("UUID", FilterOperator.EQ, mParam1)];
                // var oDataValue = oView.getModel().getObject(sPath, {
                //     filters: filters,
                //     expand: "masterAdditionalBenifit",
                // });

                oData.read(sPath, {
                    urlParameters: {
                        "$expand": "masterAdditionalBenifit"
                    },
                    filters: filters,
                    success: function (data) {
                        var oModel = new JSONModel(data.results[0]);
                        oView.setModel(oModel, "oModelView");

                    },
                    error: function () {

                    }
                })
            },
            // onNavBack: function (oEvent) {
            //     var oHistory = History.getInstance();
            //     var sPreviousHash = oHistory.getPreviousHash();

            //     if (sPreviousHash !== undefined) {
            //         window.history.go(-1);
            //     } else {
            //         var oRouter = this.getOwnerComponent().getRouter();
            //         oRouter.navTo("RoutePList", {}, true);
            //     }
            // },
            onApproveReject: function (mParam1) {
                var oModelControl=this.getView().getModel("oModelControl");
                var oModelView=this.getView().getModel("oModelView");

                var oPayload = oModelView.getData();
                var oNewPayLoad = Object.assign({}, oPayload);
                oModelControl.setProperty("/bBusy", true);
                var othat=this;
                // if the offer status if
                if (mParam1 === "APPROVED") {
                    oNewPayLoad.Status = "APPROVED";
                }
                if (mParam1 === "REJECTED") {
                    oNewPayLoad.Status = "REJECTED";
                }
                 MessageBox.confirm(
                        "Kindly confirm to change the status.", {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    var c1;
                                        c1 = othat._UpdateRequest(oNewPayLoad);
                                        c1.then(function (oNewPayLoad) {
                                            oModelControl.setProperty("/bBusy", false);
                                            othat.onPressBreadcrumbLink();
                                        })
                                }
                            },
                        }
                    );
                
                

            },
            _UpdateRequest: function (oPayload){

                var promise = jQuery.Deferred();
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oProp = "PainterAdditionalBenifitSet('" + oPayload.UUID + "')";
                //console.log(oPayLoad);

                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + oProp, oPayload, {
                        success: function (data) {
                            MessageToast.show("Data Successfully Updated.");
                            //othat._navToHome();
                            resolve(data);
                        },
                        error: function (data) {
                            MessageToast.show("Error In Update");
                            reject(data);
                        },
                    });
                });

            }





        })
    });