sap.ui.define(
    [
        "com/knpl/pragati/redeempoints/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "com/knpl/pragati/redeempoints/controller/Validator",
        "sap/ui/core/ValueState",
        "../model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        MessageBox,
        MessageToast,
        Fragment,
        Validator,
        ValueState,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.redeempoints.controller.Detail", {
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
                    console.log(sId);

                    this._initData(sId);
                },

                _initData: function (oProp) {
                    var oData = {
                        modeEdit: false,
                        bindProp: "PainterLoyaltyRedemptionRequestSet('" + oProp + "')",
                        // TokenCode: true,
                        // tokenCodeValue: "",
                        // ImageLoaded: false,
                        // ComplainResolved: false,
                        // ProbingSteps: "",
                        // ComplainCode: "",
                        // ComplainId: oProp,
                        UUID: oProp,
                        LoggedInUser: {},
                        bBusy: false
                    };
                    var oDataModel;
                    var oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "oModelControl");
                    var othat = this;
                    this._sErrorText = this.getOwnerComponent()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText("errorText");
                    var oBindProp = oData["bindProp"];
                    var c1A, c1, c2;

                    othat._showFormFragment("Display");

                    c1A = othat._CheckLoginData();
                    c1A.then(function () {
                        c1 = othat._setDisplayData(oBindProp);
                        c1.then(function (mParam) {
                            c2 = othat._initEditData(oBindProp);
                        })
                    })
                },
                _CheckLoginData: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oLoginModel = oView.getModel("LoginInfo");
                    var oControlModel = oView.getModel("oModelControl");
                    var oLoginData = oLoginModel.getData();

                    if (Object.keys(oLoginData).length === 0) {
                        return new Promise((resolve, reject) => {
                            oData.callFunction("/GetLoggedInAdmin", {
                                method: "GET",
                                urlParameters: {
                                    $expand: "UserType",
                                },
                                success: function (data) {
                                    if (data.hasOwnProperty("results")) {
                                        if (data["results"].length > 0) {
                                            oLoginModel.setData(data["results"][0]);
                                            oControlModel.setProperty(
                                                "/LoggedInUser",
                                                data["results"][0]
                                            );
                                        }
                                    }
                                    resolve();
                                },
                            });
                        });
                    } else {
                        oControlModel.setProperty("/LoggedInUser", oLoginData);
                        promise.resolve();
                        return promise;
                    }
                    console.log(oControlModel)
                },

                _setDisplayData: function (oProp) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();

                   var exPand = "PainterDetails/PainterBankDetails,PainterDetails/PainterKycDetails,PainterDetails/Depot,MasterSlabBankRedemptionDetails";
                    var othat = this;
                    if (oProp.trim() !== "") {
                        oView.bindElement({
                            path: "/" + oProp,
                            parameters: {
                                expand: exPand,
                            },
                            events: {
                                dataRequested: function (oEvent) {
                                    //  oView.setBusy(true);
                                },
                                dataReceived: function (oEvent) {
                                    //  oView.setBusy(false);
                                },
                            },
                        });
                    }
                    promise.resolve();
                    return promise;
                },
                _initEditData: function (oProp) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oDataValue = "";
                    var othat = this;
                    //var exPand = "PainterDetails/PainterBankDetails,PainterDetails/PainterKycDetails,PainterDetails/Depot,MasterSlabBankRedemptionDetails";
                    oView.getModel("oModelControl").setProperty("/bBusy", true);
                    oView.getModel().read("/" + oProp, {
                        urlParameters: {
                            //$expand: exPand,
                            // $select:'PainterComplainProducts'
                        },
                        success: function (data) {
                            var oViewModel = new JSONModel(data);
                            oView.getModel("oModelControl").setProperty("/bBusy", false);
                            oViewModel.setProperty("/Remark", "")
                            oView.setModel(oViewModel, "oModelView");

                        },
                        error: function () {
                            oView.getModel("oModelControl").setProperty("/bBusy", false);

                        },
                    });
                    promise.resolve();
                    return promise;
                },
                onApproveReject: function (mParam1) {

                    var oView = this.getView();
                    var oForm = oView.byId("DisplayData");
                    var oValidate = new Validator();
                    var bFlagValidate = oValidate.validate(oForm, true);
                    var othat = this;
                    if (!bFlagValidate) {
                        MessageToast.show(
                            "Kindly fill all the mandatory fields to continue."
                        );
                        return;
                    }
                    var oModelC = oView.getModel("oModelControl");
                    oModelC.setProperty("/bBusy", true)
                    var oData = oView.getModel();
                    var oPayload = this.getView().getModel("oModelView").getData();

                    var oNewPayLoad = Object.assign({}, oPayload);

                    // if the offer status if
                    if (mParam1 === "APPROVED") {
                       oNewPayLoad.Status = "APPROVED";
                    }
                    if (mParam1 === "REJECTED") {
                        oNewPayLoad.Status = "REJECTED";
                    }
                    if (mParam1 === "ESCALATE") {
                        oNewPayLoad.InitiateForceTat = true;
                    }

                    var c1, c2, c3;


                    c2 = othat._UpdatePoints(oNewPayLoad);
                    c2.then(function (oNewPayLoad) {
                        oModelC.setProperty("/bBusy", false);
                        othat.onNavBack();

                    })

                },
                _UpdatePoints: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var othat = this;
                    var oView = this.getView();
                    var oDataModel = oView.getModel();
                    var oProp = oView.getModel("oModelControl").getProperty("/bindProp");
                    console.log(oPayLoad);

                    return new Promise((resolve, reject) => {
                        oDataModel.update("/" + oProp, oPayLoad, {
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


                },
                _CreatePayLoadEdit2: function (mParam1) {
                    var promise = jQuery.Deferred();

                    promise.resolve(mParam1);
                },
                _CreatePayLoadEdit3: function (mParam1) {
                    var promise = jQuery.Deferred();

                    promise.resolve(mParam1);

                },
                _RemoveEmptyValueV1: function (mParam) {
                    var obj = Object.assign({}, mParam);
                    // remove string values
                    var oNew = Object.entries(obj).reduce(
                        (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)), {}
                    );
                    // remove the null values
                    var oNew2 = Object.entries(oNew).reduce(
                        (a, [k, v]) => (v === null ? a : ((a[k] = v), a)), {}
                    );

                    return oNew2;
                },

                handleCancelPress: function () {
                    this.onNavBack();
                }
            }

        );
    }
);