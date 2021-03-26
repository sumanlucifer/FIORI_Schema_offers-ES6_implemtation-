// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/LoyaltyManagement/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageBox",
    "sap/m/MessageToast",


],
    function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageBox, MessageToast) {
        "use strict";

        return BaseController.extend("com.knpl.pragati.LoyaltyManagement.controller.AddLoyaltyPoint", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("AddLoyaltyPoint").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {

                var oProp = window.decodeURIComponent(
                    oEvent.getParameter("arguments").prop
                );
                var oView = this.getView();
                var sExpandParam = "ComplaintType,Painter,ComplaintSubtype";

                //console.log(oProp);

                this._initData(oProp);


            },

            onPressBreadcrumbLink: function () {
                this._navToHome();
            },

            onPressCancelBtn: function () {
                this._navToHome();
            },

            onPressSaveBtn: function () {

            },

            _navToHome: function () {
                this.oRouter.navTo("RouteLandingPage");
            },
            onPressTokenCode: function (oEvent) {
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                var sTokenCode = oModelControl.getProperty("/tokenCodeValue").trim();
                if (sTokenCode == "") {
                    MessageToast.show("Kindly enter the token code to continue");
                    return;
                }

                var oData = oView.getModel();

                oData.read("/QRCodeValidationAdmin", {
                    urlParameters: {
                        qrcode: "'" + sTokenCode + "'",
                        painterid: oModelView.getProperty("/PainterId"),
                    },
                    success: function (oData) {
                        if (oData !== null) {
                            if (oData.hasOwnProperty("Status")) {
                                if (oData["Status"] == true) {
                                    oModelView.setProperty(
                                        "/RewardPoints",
                                        oData["RewardPoints"]
                                    );
                                    oModelControl.setProperty("/TokenCode", false);
                                    oModelView.setProperty("/TokenCode", sTokenCode);
                                    MessageToast.show(oData["Message"]);
                                } else if (oData["Status"] == false) {
                                    oModelView.setProperty("/RewardPoints", "");
                                    oModelView.setProperty("/TokenCode", "");
                                    oModelControl.setProperty("/tokenCodeValue", "");
                                    oModelControl.setProperty("/TokenCode", true);
                                    MessageToast.show(oData["Message"]);
                                }
                            }
                        }
                    },
                    error: function () {

                    },
                });
            },


            _initData: function (oProp) {
                var oData = {
                    modeEdit: false,
                    bindProp: oProp,
                    TokenCode: true,
                    tokenCodeValue: "",
                };
                var oDataModel;
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelControl");
                var othat = this;
                this._sErrorText = this.getOwnerComponent()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText("errorText");
                var c1, c2, c3, c4;
                c1 = othat._loadEditProfile("Display");
                c1.then(function () {
                    c2 = othat._setDisplayData(oProp);
                    c2.then(function () {
                        c3 = othat._initEditData(oProp);
                    });
                });
            },
            _setDisplayData: function (oProp) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var sExpandParam = "Painter";
                var othat = this;
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/" + oProp,
                        parameters: {
                            expand: sExpandParam,
                        },
                        events: {
                            dataRequested: function (oEvent) {
                                oView.setBusy(true);
                            },
                            dataReceived: function (oEvent) {
                                oView.setBusy(false);
                            },
                        },
                    });
                }
                promise.resolve();
                return promise;
            },
            _initEditData: function (oProp) {
                var oView = this.getView();
                var oDataValue = "";
                var othat = this;

                oView.getModel().read("/" + oProp, {
                    success: function (data) {
                        var oViewModel = new JSONModel(data);
                        //console.log(data);
                        oView.setModel(oViewModel, "oModelView");
                        othat._setInitData();
                    },
                    error: function () { },
                });
            },
            _setInitData: function () {
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");

                var sReqFields = ["TokenCode", "RewardPoints"];
                var sValue = "",
                    sPlit;
                for (var k of sReqFields) {
                    sValue = oModelView.getProperty("/" + k);
                    sPlit = k.split("/");
                    if (sPlit.length > 1) {
                        if (
                            toString.call(oModelView.getProperty("/" + sPlit[0])) !==
                            "[object Object]"
                        ) {
                            oModelView.setProperty("/" + sPlit[0], {});
                        }
                    }
                    if (sValue == undefined) {
                        oModelView.setProperty("/" + k, "");
                    }
                }
            },




        });
    });
