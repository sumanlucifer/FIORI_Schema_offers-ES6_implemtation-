sap.ui.define(
    [
        "com/knpl/pragati/redeempoints/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        MessageBox,
        MessageToast,
        Fragment
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.redeempoints.controller.Detail",
            {

                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.getRoute("Detail").attachMatched(this._onRouteMatched, this);
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
                        bindProp: "PainterComplainsSet(" + oProp + ")",
                        TokenCode: true,
                        tokenCodeValue: "",
                        ImageLoaded: false,
                        ComplainResolved: false,
                        ProbingSteps: "",
                        ComplainCode: "",
                        ComplainId: oProp,
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
                    var c1, c2;

                    othat._showFormFragment("Display");


                    c1 = othat._setDisplayData(oBindProp);
                    c1.then(function (mParam) {
                        c2 = othat._initEditData(oBindProp);
                    })

                },
                _setDisplayData: function (oProp) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();

                    var sExpandParam =
                        "Painter/Depot,Painter/PrimaryDealerDetails,PainterComplainProducts";
                    var othat = this;
                    if (oProp.trim() !== "") {
                        oView.bindElement({
                            path: "/" + oProp,
                            parameters: {
                                expand: sExpandParam,
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
                    var exPand = "PainterComplainProducts/ProductPackDetails/ProductDetails/ProductCategory,PainterComplainProducts/ProductPackDetails/ProductCategoryDetails";
                    oView.getModel("oModelControl").setProperty("/bBusy", true);
                    oView.getModel().read("/" + oProp, {
                        urlParameters: {
                            $expand: exPand,
                            $select:'PainterComplainProducts'
                        },
                        success: function (data) {
                            var oViewModel = new JSONModel(data);
                            oView.getModel("oModelControl").setProperty("/bBusy", false);
                            oView.setModel(oViewModel, "oModelView");
                          
                        },
                        error: function () {
                            oView.getModel("oModelControl").setProperty("/bBusy", false);

                         },
                    });
                    promise.resolve();
                    return promise;
                },
                _setInitData: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    // setting the resolved flag if we have the value from backend;
                    if (
                        oModelView.getProperty("/ComplaintStatus") === "RESOLVED" ||
                        oModelView.getProperty("/ComplaintStatus") === "WITHDRAWN"
                    ) {
                        oModelControl.setProperty("/ComplainResolved", true);
                        oModelControl.setProperty("/TokenCode", false);
                    }
                    //setting the filtering for the scenario and Type Id
                    var sComplainSubType = oModelView.getProperty("/ComplaintSubtypeId");
                    var sComplaintStatus = oModelView.getProperty("/ComplaintStatus");
                    var aResolutionFilter = [];

                    if (sComplainSubType !== "") {
                        aResolutionFilter.push(
                            new Filter("TypeId", FilterOperator.EQ, sComplainSubType)
                        );
                        oView
                            .byId("FormattedText")
                            .bindElement(
                                "/MasterComplaintSubtypeSet(" + sComplainSubType + ")"
                            );
                    }
                    oView
                        .byId("resolution")
                        .getBinding("items")
                        .filter(aResolutionFilter);

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
                    //setting token code scenario
                    if (oModelView.getProperty("/TokenCode") !== "") {
                        oModelControl.setProperty(
                            "/tokenCodeValue",
                            oModelView.getProperty("/TokenCode")
                        );
                        oModelControl.setProperty("/TokenCode", false);
                    }
                    //set data for the smart table
                    oModelControl.setProperty(
                        "/ComplainCode",
                        oModelView.getProperty("/ComplaintCode")
                    );
                    //oView.byId("smartHistory").rebindTable();
                },
                _CheckImage: function (oProp) {
                    var oView = this.getView();
                    var oModelControl = this.getView().getModel("oModelControl");
                    var sImageUrl =
                        "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
                    jQuery
                        .get(sImageUrl)
                        .done(function () {
                            oModelControl.setProperty("/ImageLoaded", true);
                            console.log("Image Exist");
                        })
                        .fail(function () {
                            oModelControl.setProperty("/ImageLoaded", false);
                            console.log("Image Doesnt Exist");
                        });
                },
                _loadEditProfile: function (mParam) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oVboxProfile = oView.byId("idVbx");
                    var sFragName = mParam == "Edit" ? "EditProfile" : "DisplayComplaint";
                    oVboxProfile.destroyItems();
                    return Fragment.load({
                        id: oView.getId(),
                        controller: othat,
                        name: "com.knpl.pragati.redeempoints.view.subview." + sFragName,
                    }).then(function (oControlProfile) {
                        oView.addDependent(oControlProfile);
                        oVboxProfile.addItem(oControlProfile);
                        promise.resolve();
                        return promise;
                    });
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
                            channel: "'Complains'",
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
                        error: function () { },
                    });
                },
                onViewAttachment: function (oEvent) {
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    if (!this._pKycDialog) {
                        Fragment.load({
                            name:
                                "com.knpl.pragati.Complaints.view.fragments.AttachmentDialog",
                            controller: this,
                        }).then(
                            function (oDialog) {
                                this._pKycDialog = oDialog;
                                oView.addDependent(this._pKycDialog);
                                this._pKycDialog.open();
                            }.bind(this)
                        );
                    } else {
                        oView.addDependent(this._pKycDialog);
                        this._pKycDialog.open();
                    }
                },
                onPressCloseDialog: function (oEvent) {
                    oEvent.getSource().getParent().close();
                },
                onDialogClose: function (oEvent) {
                    this._pKycDialog.open().destroy();
                    delete this._pKycDialog;
                },
                handleSavePress: function () {
                    var oModel = this.getView().getModel("oModelView");
                    var oValidator = new Validator();
                    var oVbox = this.getView().byId("idVbx");
                    var bValidation = oValidator.validate(oVbox, true);
                    if (bValidation == false) {
                        MessageToast.show(
                            "Kindly input the fields in proper format to continue. "
                        );
                    }
                    if (bValidation) {
                        oModel.setProperty("/InitiateForceTat", false);
                        this._postDataToSave();
                    }
                },
                onChangeResolution: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelView");
                    var sKey = oEvent.getSource().getSelectedKey();
                    if (sKey !== 90) {
                        oModel.setProperty("/ResolutionOthers", "");
                    }
                    //console.log(oModel);
                },
                onScenarioChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var sSuTypeId = oView
                        .getModel("oModelView")
                        .getProperty("/ComplaintSubtypeId");

                    var oResolution = oView.byId("resolution");
                    //clearning the serction for the resolution
                    var aFilter = [];
                    if (sKey) {
                        aFilter.push(new Filter("Scenario", FilterOperator.EQ, sKey));
                    }
                    if (sSuTypeId !== "") {
                        aFilter.push(new Filter("TypeId", FilterOperator.EQ, sSuTypeId));
                    }
                    oResolution.setSelectedKey("");

                    oResolution.getBinding("items").filter(aFilter);
                },
                handleSavePress: function () {
                    var oModel = this.getView().getModel("oModelView");
                    var oValidator = new Validator();
                    var oVbox = this.getView().byId("idVbx");
                    var bValidation = oValidator.validate(oVbox, true);
                    if (bValidation == false) {
                        MessageToast.show(
                            "Kindly input the fields in proper format to continue."
                        );
                    }
                    if (bValidation) {
                        oModel.setProperty("/InitiateForceTat", false);
                        console.log("Propery")
                        this._postDataToSave();
                    }
                },
                _postDataToSave: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");

                    var oData = oView.getModel();
                    var sPath = oView.getElementBinding().getPath();
                    var oViewData = oView.getModel("oModelView").getData();
                    var oPayload = Object.assign({}, oViewData);
                    for (var a in oPayload) {
                        if (oPayload[a] === "") {
                            oPayload[a] = null;
                        }
                    }
                    var othat = this;
                    console.log(oPayload);
                    oData.update(sPath, oPayload, {
                        success: function () {
                            MessageToast.show("Complaint Sucessfully Updated.");
                            oData.refresh(true);
                            othat.onNavBack();
                        },
                        error: function (a) {
                            MessageBox.error(othat._sErrorText, {
                                title: "Error Code: " + a.statusCode,
                            });
                        },
                    });

                    //var oProp =
                },
                handleCancelPress: function () {
                    this.onNavBack();
                }
            }

        );
    }
);
