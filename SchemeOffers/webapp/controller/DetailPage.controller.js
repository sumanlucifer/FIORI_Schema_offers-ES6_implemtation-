// @ts-ignore
sap.ui.define(
    [
        "com/knpl/pragati/SchemeOffers/controller/BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Sorter",
        "sap/ui/core/Fragment",
        "sap/ui/Device",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/m/Avatar",
        "sap/ui/core/ValueState",
        "sap/ui/core/util/Export",
        "sap/ui/core/util/ExportTypeCSV",
        "com/knpl/pragati/SchemeOffers/model/formatter",
        "com/knpl/pragati/SchemeOffers/controller/Validator",
        "com/knpl/pragati/SchemeOffers/model/customInt",
        "com/knpl/pragati/SchemeOffers/model/cmbxDtype2",
    ],
    function (
        BaseController,
        Filter,
        FilterOperator,
        JSONModel,
        Sorter,
        Fragment,
        Device,
        MessageBox,
        MessageToast,
        Avatar,
        ValueState,
        Export,
        ExportTypeCSV,
        Formatter,
        Validator,
        customInt,
        cmbxDtype2
    ) {
        "use strict";
        return BaseController.extend(
            "com.knpl.pragati.SchemeOffers.controller.DetailPage", {
            formatter: Formatter,
            customInt: customInt,
            cmbxDtype2: cmbxDtype2,
            onInit: function () {
                //Router Object
                var oViewModel = new JSONModel({
                    busy: false,
                    editable: false,
                });
                this.getView().setModel(oViewModel, "DetailViewModel");
                this.oViewModel = this.getView().getModel("DetailViewModel");
                this.oResourceBundle = this.getOwnerComponent()
                    .getModel("i18n")
                    .getResourceBundle();
                this.oRouter = this.getRouter();
                this.oRouter
                    .getRoute("DetailPage")
                    .attachPatternMatched(this._onObjectMatched, this);
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
            _onObjectMatched: function (oEvent) {

                var oProp = window.decodeURIComponent(
                    oEvent.getParameter("arguments").prop
                );
                var sMode = window.decodeURIComponent(
                    oEvent.getParameter("arguments").mode
                );
                var oView = this.getView();
                var sExpandParam = "OfferType,CreatedByDetails,UpdatedByDetails,BannerMediaList,PamphletMediaList";
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/OfferSet(" + oProp + ")",
                        parameters: {
                            expand: sExpandParam,
                        },
                    });
                }
                this._SetDisplayData(oProp, sMode);
            },
            _SetDisplayData: function (oProp, sMode) {
                var oView = this.getView();
                var oData = {
                    ImageUploaded: "", // Have to check again,
                    bindProp: "OfferSet(" + oProp + ")",
                    mode: "display",
                    OfferId: oProp,
                    selectedKey: 0,
                    LoggedInUser: {},
                    PageBusy: true,
                    MinDate: new Date(), //for min date selection
                    Buttons: {
                        Redeem: false, // check if its already redeemed
                        SendForApproval: false,
                        RedeemEnable: true
                    },
                    Dialog: {
                        Remarks: "",
                        OfferStatus: "",
                    },
                    oData: {
                        Painters: []
                    },
                    Rbtn: {
                        AddPainter: 0
                    },
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
                    PainterOfferCount: "0"
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelControl3");
                //oView.byId("idIconTabBar").setSelectedKey("0");
                //executionLog Changes
                this.oWorkflowModel = new JSONModel();
                this.oWorkflowModel.attachRequestCompleted(this._setWfData, this);
                this.getView().setModel(this.oWorkflowModel, "wfmodel");
                //this._LoadPainterData(0, 16);
                if (sMode === "edit") {
                    this.handleEditPress();
                } else {
                    this._initData(oProp);
                }

            },
            _LoadPainterDataV2: function () {

                var oView = this.getView();
                var oControlModel = oView.getModel("oModelControl3");
                var iOfferId = oControlModel.getProperty("/OfferId")
                var oTable = oView.byId("idPainterTable")
                oTable.bindItems({
                    path: "/OfferEligibleAndQualifiedPainterSet",
                    template: oView.byId("idPainterTableTemplate"),
                    templateShareable: true,
                    parameters: {
                        custom: {
                            OfferId: "" + iOfferId + ""
                        }
                    }
                })
            },
            onPainterTableUpdate: function (oEvent) {
                var sTitle,
                    oTable = oEvent.getSource(),
                    iTotalItems = oEvent.getParameter("total");
                if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                    sTitle = this.getResourceBundle().getText("OfferReportCount", [
                        iTotalItems,
                    ]);
                } else {
                    sTitle = this.getResourceBundle().getText("OfferReportCount", [0]);
                }
                this.getView()
                    .getModel("oModelControl3")
                    .setProperty("/PainterOfferCount", sTitle);
            },
            _LoadPainterData: function (mSkip, mTop) {

                return true;
            },
            _initData: function (oProp) {
                var oData = {
                    modeEdit: false,
                    bindProp: "OfferSet(" + oProp + ")",
                    HasTillDate: true,
                    ImageLoaded: true,
                    mode: "display",
                    EndDate: "",
                    EndDate2: "",
                    OfferId: oProp, //.replace(/[^0-9]/g, ""),
                    //ProfilePic:"/KNPL_PAINTER_API/api/v2/odata.svc/PainterSet(717)/$value",
                    tableDealay: 0,
                    Dialog: {
                        Bonus1: {},
                        Key1: "",
                        Bonus2: {},
                        Key2: "",
                        ProdVH: "",
                        PackVH: "",
                    },
                    MultiCombo: {
                        Zones: [],
                        Divisions: [],
                        Depots: [],
                        ArcheTypes: [],
                        PainterType: [],
                        Potential: [],
                        PainterProducts: [],
                        ApplicableProducts: [],
                        BonusApplicableProducts: [],
                        PCat1: [],
                        PCat2: [],
                        PCat3: [],
                        PCat4: [],
                        PClass1: [],
                        PClass2: [],
                        PClass3: [],
                        PClass4: [],
                        AppProd1: [],
                        AppProd2: [],
                        AppProd3: [],
                        AppProd4: [],
                        AppPacks1: [],
                        AppPacks2: [],
                        AppPacks3: [],
                        AppPacks4: [],
                        Painters: [],
                        Reward: [],
                        Reward2: [],
                    },
                    Rbtn: {
                        PCat1: 0,
                        PCat2: 0,
                        PCat3: 0,
                        PCat4: 0,
                        PClass1: 0,
                        PClass2: 0,
                        PClass3: 0,
                        PClass4: 0,
                        AppProd1: 0,
                        AppProd2: 0,
                        AppProd3: 0,
                        AppProd4: 0,
                        AppPacks1: 0,
                        AppPacks2: 0,
                        AppPacks3: 0,
                        AppPacks4: 0,
                        Rewards: 0,
                        BRewards: 0,
                        TopAll: 0,
                        Zones: 0,
                        Divisions: 0,
                        Depots: 0,
                        AppPainter: 0,
                        ParentOffer: 0,
                        BrReqVol: 0,
                        BrReqCash: 0,
                        MultiReward: 0
                    },
                    MultiEnabled: {
                        PCat1: false,
                        PClass1: false,
                        PClass2: false,
                        AppProd1: false,
                        AppProd2: false,
                        AppPacks1: false,
                        AppPacks2: false,
                        PCat2: false,
                        PCat3: false,
                        PCat4: false,
                        PClass3: false,
                        PClass4: false,
                        AppProd3: false,
                        AppProd4: false,
                        AppPacks3: false,
                        AppPacks4: false,
                        Rewards: false,
                        BRewards: false,
                        Zones: false,
                        Divisions: false,
                        Depots: false,
                        AppPainter: false,
                    },
                    Table: {
                        Table1: [],
                        Table2: [],
                        Table3: [],
                        Table4: [],
                        Table5: [],
                        Table6: [],
                        Table7: [],
                        Table8: [],
                        Table9: [],
                        Table10: [],
                        // added by deepanjali start
                        Table11: [],
                        Table12: []
                        // added by deepanjali end
                    },
                    OfferType: {
                        BasicInformation: true,
                        ApplicableProducts: true,
                        RewardRatio: true,
                        ApplicablePainters: true,
                        ApplicablePainterProducts: true,
                        AdditionalReward: true,
                        EarnedPointsCondition: false,
                        ProductValueCondition: false,
                        RedemptionCycleCondition: false,
                    },
                    oData: {
                        Products: [],
                        Packs: [],
                        PerGrowth: [{
                            Name: "1",
                        },
                        {
                            Name: "2",
                        },
                        {
                            Name: "3",
                        },
                        {
                            Name: "4",
                        },
                        {
                            Name: "5",
                        },
                        ],
                        Rewards: [{
                            key: 1,
                            Name: "TV",
                        },
                        {
                            key: 2,
                            Name: "Washing Machine",
                        },
                        {
                            key: 3,
                            Name: "Fridge",
                        },
                        ],
                    },
                    Fields: {
                        Date1: null,
                        Date2: null,
                        ParentOfferTitle: "",
                        RewardRationCount: 1,
                    },
                    OfferDeselectedPainter: []
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelControl2");
                var othat = this;
                var c1, c1b, c1c, c2, c2b, c3, c4, c5, c6, c7, c7B, c8, c9;
                var oView = this.getView();
                c1 = this._loadEditProfile("Display");
                c1.then(function () {
                    c1b = othat._CheckLoginData();
                    c1b.then(function () {
                        c1c = othat._getInitPayLoad(oProp);
                        c1c.then(function () {
                            c2 = othat._getInitData(oProp);
                            c2.then(function (data) {
                                c2b = othat._setWorkflowFlags(data);
                                c2b.then(function (data) {
                                    c3 = othat._SetRbtnData(data);
                                    c3.then(function (data) {
                                        c4 = othat._setViewData1(data);
                                        c4.then(function (data) {
                                            c5 = othat._setViewData2(data);
                                            c5.then(function (data) {
                                                c6 = othat._setAdditionalData(data);
                                                c6.then(function (data) {
                                                    c7 = othat._OfferTypeValidation(data);
                                                    c7.then(function (data) {
                                                        c7B = othat._CheckPromiseData(data);
                                                        c7B.then(function (data) {
                                                            //c8 = othat._CheckAttachment();
                                                            // c8.then(function () {
                                                            c9 = othat._RemovePageBusy();
                                                            // });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        })
                    });
                }); //c1.then
                this._toggleButtonsAndView(false);
            },
            _CheckPromiseData: function (oData) {
                var promise = jQuery.Deferred();
                // work flow releated data
                //console.log(oData);
                promise.resolve(oData);
                return promise;
            },
            _RemovePageBusy: function () {
                this.getView()
                    .getModel("oModelControl3")
                    .setProperty("/PageBusy", false);
            },
            _setWorkflowFlags: function (oData) {
                var promise = jQuery.Deferred();
                // work flow releated data
                promise.resolve(oData);
                return promise;
            },
            _CheckLoginData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel();
                var oLoginModel = oView.getModel("LoginInfo");
                var oControlModel = oView.getModel("oModelControl3");
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
            },
            _setAdditionalData: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl2");
                oModelControl.setProperty(
                    "/Rbtn/AppPainter",
                    oData["PainterSelection"]
                );
                promise.resolve(oData);
                return promise;
            },
            _OfferTypeValidation: function (oData) {
                var oFFerTypeId = oData["OfferTypeId"];
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl2");
                var oDataModel = oView.getModel();
                var sPath = "/MasterOfferTypeSet(" + oFFerTypeId + ")";
                oDataModel.read(sPath, {
                    success: function (data) {
                        oModel.setProperty("/OfferType", data);
                        oModel.refresh();
                    },
                });
                promise.resolve(oData);
                return promise;
            },
            onPressEdit: function () {
                this.oViewModel.setProperty("/editable", true);
            },
            onPressSave: function () {
                this.oViewModel.setProperty("/editable", false);
            },
            _getInitPayLoad: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel();
                var oModelControl2 = oView.getModel("oModelControl2");
                var sPath = oModelControl2.getProperty("/bindProp");
                var othat = this;
                promise.resolve()
                return promise;
            },
            _getInitData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel();
                var oModelControl2 = oView.getModel("oModelControl2");
                var sPath = oModelControl2.getProperty("/bindProp");
                var othat = this;
                var exPand =
                    "OfferZone,BannerMediaList,PamphletMediaList,OfferDepot,OfferDivision,OfferApplicableProductCategory,OfferApplicableProductClassification,OfferApplicableProduct/Product,OfferApplicablePack/Pack,OfferRewardRatio," +
                    "OfferPainterType,OfferPainterArcheType,OfferPainterPotential,OfferBuyerProductCategory,OfferBuyerProductClassification,OfferBuyerProduct/Product,OfferBuyerPack/Pack,OfferNonBuyerProductCategory," +
                    "OfferNonBuyerProductClassification,OfferNonBuyerProduct/Product,OfferNonBuyerPack/Pack," +
                    "OfferBonusProductCategory,OfferBonusProductClassification,OfferBonusProduct/Product,OfferBonusPack/Pack," +
                    "OfferBonusRewardRatio/Product,OfferBonusRewardRatio/Pack,OfferSpecificPainter/Painter,ParentOffer,OfferConditions,OfferEarnedPointsCondition,OfferProductValueCondition/Product,OfferRedemptionCycleCondition,OfferAchiever,OfferContributionRatio/Product,OfferContributionRatio/Pack";
                return new Promise((resolve, reject) => {
                    oView.getModel().read("/" + sPath, {
                        urlParameters: {
                            $expand: exPand,
                        },
                        success: function (data) {
                            var oModel = new JSONModel(data);
                            othat.getView().setModel(oModel, "oModelDisplay");
                            resolve(data);
                        },
                        error: function () {
                            reject();
                        },
                    });
                });
            },
            _setViewData2: function (oData) {

                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl2 = oView.getModel("oModelControl2");
                var Table1 = [],
                    Table2 = [];

                // added by deepanjali strat
                if (oData["BannerMediaList"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table11",
                        oData["BannerMediaList"]["results"]
                    );
                }
                if (oData["PamphletMediaList"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table12",
                        oData["PamphletMediaList"]["results"]
                    );
                }
                // added by deepanjali end
                if (oData["OfferRewardRatio"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table2",
                        oData["OfferRewardRatio"]["results"]
                    );
                }
                // if (oData["IsSpecificApplicablePack"] === false) {
                //     if (oData["OfferRewardRatio"]["results"].length > 0) {
                //         oModelControl2.setProperty(
                //             "/Table/Table2",
                //             oData["OfferRewardRatio"]["results"]
                //         );
                //     }
                // } else {
                //     if (oData["OfferRewardRatio"]["results"].length > 0) {
                //         oModelControl2.setProperty(
                //             "/Table/Table2",
                //             oData["OfferRewardRatio"]["results"]
                //         );
                //     }
                // }
                if (oData["OfferBonusRewardRatio"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table3",
                        oData["OfferBonusRewardRatio"]["results"]
                    );
                }
                if (oData["IsSpecificBonusPack"] === false) {
                    if (oData["OfferBonusRewardRatio"]["results"].length > 0) {
                        oModelControl2.setProperty(
                            "/Table/Table4",
                            oData["OfferBonusRewardRatio"]["results"]
                        );
                    }
                } else {
                    if (oData["OfferBonusRewardRatio"]["results"].length > 0) {
                        oModelControl2.setProperty(
                            "/Table/Table4",
                            oData["OfferBonusRewardRatio"]["results"]
                        );
                    }
                }
                // condtions table added here
                if (oData["OfferEarnedPointsCondition"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table5",
                        oData["OfferEarnedPointsCondition"]["results"]
                    );
                }
                if (oData["OfferProductValueCondition"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table6",
                        oData["OfferProductValueCondition"]["results"]
                    );
                }
                if (oData["OfferRedemptionCycleCondition"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table7",
                        oData["OfferRedemptionCycleCondition"]["results"]
                    );
                }
                if (oData["OfferAchiever"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table8",
                        oData["OfferAchiever"]["results"]
                    );
                }
                //deleted painters
                // if (oData["OfferDeselectedPainter"]["results"].length > 0) {
                //     oModelControl2.setProperty(
                //         "/Table/TableDelPainters",
                //         oData["OfferDeselectedPainter"]["results"]
                //     );
                // }
                if (oData["OfferContributionRatio"]["results"].length > 0) {
                    if (oData["ContributionType"] === 0) {
                        console.log("table9")
                        oModelControl2.setProperty(
                            "/Table/Table9",
                            oData["OfferContributionRatio"]["results"]
                        );
                    } else if (oData["ContributionType"] === 1) {
                        console.log("table10")
                        oModelControl2.setProperty(
                            "/Table/Table10",
                            oData["OfferContributionRatio"]["results"]
                        );
                    }

                }
                promise.resolve(oData);
                return promise;
            },
            _setViewData1: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl2 = oView.getModel("oModelControl2");
                var aZones = [],
                    aDivisions = [],
                    aDepots = [],
                    aArchiTypes = [],
                    aPainterProducts = [],
                    aApplicableProducts = [],
                    aBonusApplicableProducts = [],
                    PCat1 = [],
                    PClass1 = [],
                    AppProd1 = [],
                    AppPacks1 = [],
                    PainterType = [],
                    ArcheTypes = [],
                    Potential = [],
                    PCat2 = [],
                    PClass2 = [],
                    AppProd2 = [],
                    AppPacks2 = [],
                    PCat3 = [],
                    PClass3 = [],
                    AppProd3 = [],
                    AppPacks3 = [],
                    PCat4 = [],
                    PClass4 = [],
                    AppProd4 = [],
                    AppPacks4 = [],
                    Painters = [],
                    DelPainters = [];
                //setting zone data
                if (oData["OfferZone"]["results"].length > 0) {
                    for (var x of oData["OfferZone"]["results"]) {
                        aZones.push(x["ZoneId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Zones", aZones);
                if (oData["OfferDivision"]["results"].length > 0) {
                    for (var x of oData["OfferDivision"]["results"]) {
                        aDivisions.push(x["DivisionId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Divisions", aDivisions);
                if (oData["OfferDepot"]["results"].length > 0) {
                    for (var x of oData["OfferDepot"]["results"]) {
                        aDepots.push({
                            DepotId: x["DepotId"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Depots", aDepots);
                if (oData["OfferApplicableProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferApplicableProductCategory"]["results"]) {
                        PCat1.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat1", PCat1);
                if (
                    oData["OfferApplicableProductClassification"]["results"].length > 0
                ) {
                    for (var x of oData["OfferApplicableProductClassification"][
                        "results"
                    ]) {
                        PClass1.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass1", PClass1);
                if (oData["OfferApplicableProduct"]["results"].length > 0) {
                    for (var x of oData["OfferApplicableProduct"]["results"]) {
                        AppProd1.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd1", AppProd1);
                if (oData["OfferApplicablePack"]["results"].length > 0) {
                    for (var x of oData["OfferApplicablePack"]["results"]) {
                        AppPacks1.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks1", AppPacks1);
                if (oData["OfferPainterType"]["results"].length > 0) {
                    for (var x of oData["OfferPainterType"]["results"]) {
                        PainterType.push(x["PainterTypeId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PainterType", PainterType);
                if (oData["OfferPainterArcheType"]["results"].length > 0) {
                    for (var x of oData["OfferPainterArcheType"]["results"]) {
                        ArcheTypes.push(x["ArcheTypeId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/ArcheTypes", ArcheTypes);
                if (oData["OfferPainterPotential"]["results"].length > 0) {
                    for (var x of oData["OfferPainterPotential"]["results"]) {
                        Potential.push(x["PotentialId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Potential", Potential);
                if (oData["OfferBuyerProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerProductCategory"]["results"]) {
                        PCat2.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat2", PCat2);
                if (oData["OfferBuyerProductClassification"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerProductClassification"]["results"]) {
                        PClass2.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass2", PClass2);
                if (oData["OfferBuyerProduct"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerProduct"]["results"]) {
                        AppProd2.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd2", AppProd2);
                if (oData["OfferBuyerPack"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerPack"]["results"]) {
                        AppPacks2.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks2", AppPacks2);
                if (oData["OfferNonBuyerProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferNonBuyerProductCategory"]["results"]) {
                        PCat3.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat3", PCat3);
                if (
                    oData["OfferNonBuyerProductClassification"]["results"].length > 0
                ) {
                    for (var x of oData["OfferNonBuyerProductClassification"][
                        "results"
                    ]) {
                        PClass3.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass3", PClass3);
                if (oData["OfferNonBuyerProduct"]["results"].length > 0) {
                    for (var x of oData["OfferNonBuyerProduct"]["results"]) {
                        AppProd3.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd3", AppProd3);
                if (oData["OfferNonBuyerPack"]["results"].length > 0) {
                    for (var x of oData["OfferNonBuyerPack"]["results"]) {
                        AppPacks3.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks3", AppPacks3);
                if (oData["OfferBonusProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferBonusProductCategory"]["results"]) {
                        PCat4.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat4", PCat4);
                if (oData["OfferBonusProductClassification"]["results"].length > 0) {
                    for (var x of oData["OfferBonusProductClassification"]["results"]) {
                        PClass4.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass4", PClass4);
                if (oData["OfferBonusProduct"]["results"].length > 0) {
                    for (var x of oData["OfferBonusProduct"]["results"]) {
                        AppProd4.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd4", AppProd4);
                if (oData["OfferBonusPack"]["results"].length > 0) {
                    for (var x of oData["OfferBonusPack"]["results"]) {
                        AppPacks4.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks4", AppPacks4);
                if (oData["OfferSpecificPainter"]["results"].length > 0) {
                    for (var x of oData["OfferSpecificPainter"]["results"]) {
                        Painters.push({
                            PainterId: x["Painter"]["Id"],
                            PainterName: x["Painter"]["Name"],
                        });
                    }
                }
                // oModelControl2.setProperty("/OfferDeselectedPainter", DelPainters);
                // if (oData["OfferDeselectedPainter"]["results"].length > 0) {
                //     for (var x of oData["OfferDeselectedPainter"]["results"]) {
                //         DelPainters.push({
                //             PainterId: x["PainterId"],
                //             PainterName: x["Painter"]["Name"],
                //         });
                //     }
                // }
                oModelControl2.setProperty("/MultiCombo/Painters", Painters);
                promise.resolve(oData);
                return promise;
            },
            _SetRbtnData: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl2");
                var oRbtn = oModel.getProperty("/Rbtn");
                var oMultiEnabled = oModel.getProperty("/MultiEnabled");
                var aBoleanProps = {
                    IsSpecificZone: "Zones",
                    IsSpecificDivision: "Divisions",
                    IsSpecificDepot: "Depots",
                    IsSpecificApplicableProductCategory: "PCat1",
                    IsSpecificApplicableProductClassification: "PClass1",
                    IsSpecificApplicableProduct: "AppProd1",
                    IsSpecificApplicablePack: "AppPacks1",
                    IsSpecificRewardRatio: "Rewards",
                    IsSpecificBuyerProductCategory: "PCat2",
                    IsSpecificBuyerProductClassification: "PClass2",
                    IsSpecificBuyerProduct: "AppProd2",
                    IsSpecificBuyerPack: "AppPacks2",
                    IsSpecificNonBuyerProductCategory: "PCat3",
                    IsSpecificNonBuyerProductClassification: "PClass3",
                    IsSpecificNonBuyerProduct: "AppProd3",
                    IsSpecificNonBuyerPack: "AppPacks3",
                    IsSpecificBonusProductCategory: "PCat4",
                    IsSpecificBonusProductClassification: "PClass4",
                    IsSpecificBonusProduct: "AppProd4",
                    IsSpecificBonusPack: "AppPacks4",
                    IsSpecificBonusRewardRatio: "BRewards",
                    IsSpecificPainter: "AppPainter",
                };
                for (var a in aBoleanProps) {
                    oMultiEnabled[aBoleanProps[a]] = oData[a];
                    if (oData[a] == true) {
                        oRbtn[aBoleanProps[a]] = 1;
                    } else {
                        oRbtn[aBoleanProps[a]] = 0;
                    }
                }
                promise.resolve(oData);
                return promise;
            },
            handleEditPress: function () {
                this._toggleButtonsAndView(true);
                var oView = this.getView();
                var oCtrl2Model = oView.getModel("oModelControl3");
                oCtrl2Model.setProperty("/mode", "edit");
                var c1,
                    c2,
                    c3,
                    c4,
                    c5,
                    c6,
                    c7,
                    c8,
                    c9,
                    c9B,
                    c9C,
                    c10,
                    c11,
                    c12,
                    c13,
                    c14;
                var othat = this;
                c2 = othat._GetInitEditData();
                c2.then(function (data) {
                    c3 = othat._setEditControlModel(data);
                    c3.then(function (data) {
                        c4 = othat._SetEditRbtnData(data);
                        c4.then(function (data) {
                            c5 = othat._setEditViewData1(data);
                            c5.then(function (data) {
                                c6 = othat._setEditViewData2(data);
                                c6.then(function (data) {
                                    //workflow related data is set here
                                    c6 = othat._setAdditionalData2(data);
                                    c6.then(function (oData) {
                                        c7 = othat._OfferTypeValidation2(data);
                                        c7.then(function (data) {
                                            //c8 = othat._CheckEditImage(data);
                                            //c8.then(function (data) {
                                            c9 = othat._getLoggedInUserDeatils(data);
                                            c9.then(function (data) {
                                                // no data required from the previous steop
                                                c9B = othat._EditCreatehashData(data);
                                                c9B.then(function (data) {
                                                    c9C = othat._CheckPromiseData(data);
                                                    c9C.then(function () {
                                                        c10 = othat._getProductsData([]);
                                                        c10.then(function () {
                                                            c11 = othat._getPacksData();
                                                            c11.then(function () {
                                                                c12 = othat._CreateBonusRewardTable("Edit");
                                                                c12.then(function () {
                                                                    c13 = othat._destroyDialogs();
                                                                    c13.then(function () {
                                                                        c14 = othat._RemovePageBusy();
                                                                        othat.getView().getModel("oModelControl").refresh(true)
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                            //});
                                        });
                                    });
                                });
                            });
                        });
                    });
                    //othat.getView().getModel("oModelView").refresh(true);
                });
                //_destroyDialogs
                // this._initSaveModel();
            },
            _checkPromise: function (data) {
                var promise = jQuery.Deferred();
                //console.log(data);
                promise.resolve(data);
                return promise;
            },
            _EditCreatehashData: function (oData) {
                var promise = jQuery.Deferred();
                var oModelControl = this.getView().getModel("oModelControl");
                var aHashPCat1 = {};
                var aHashPCat2 = {};
                var aHashPCat3 = {};
                var aHashPCat4 = {};
                var aHashPClass1 = {};
                var aHashPClass2 = {};
                var aHashPClass3 = {};
                var aHashPClass4 = {};
                var aHashAppProd1 = {},
                    aHashAppProd2 = {},
                    aHashAppProd3 = {},
                    aHashAppProd4 = {};
                var aHashAppPack1 = {},
                    aHashAppPack2 = {},
                    aHashAppPack3 = {},
                    aHashAppPack4 = {};
                var aHashArcheType = {},
                    aHashPainterType = {},
                    aHashPotential = {};
                var aHashZone = {},
                    aHashDivision = {},
                    aHashDepot = {};
                var aHashPainter = {};
                var aDataPCat1 = oData["OfferApplicableProductCategory"]["results"];
                var aDataPCat2 = oData["OfferBuyerProductCategory"]["results"];
                var aDataPCat3 = oData["OfferNonBuyerProductCategory"]["results"];
                var aDataPCat4 = oData["OfferBonusProductCategory"]["results"];
                var aDataPClass1 =
                    oData["OfferApplicableProductClassification"]["results"];
                var aDataPClass2 =
                    oData["OfferBuyerProductClassification"]["results"];
                var aDataPClass3 =
                    oData["OfferNonBuyerProductClassification"]["results"];
                var aDataPClass4 =
                    oData["OfferBonusProductClassification"]["results"];
                var aDataAppProd1 = oData["OfferApplicableProduct"]["results"],
                    aDataAppProd2 = oData["OfferBuyerProduct"]["results"],
                    aDataAppProd3 = oData["OfferNonBuyerProduct"]["results"],
                    aDataAppProd4 = oData["OfferBonusProduct"]["results"];
                var aDataAppPack1 = oData["OfferApplicablePack"]["results"],
                    aDataAppPack2 = oData["OfferBuyerPack"]["results"],
                    aDataAppPack3 = oData["OfferNonBuyerPack"]["results"],
                    aDataAppPack4 = oData["OfferBonusPack"]["results"];
                var aDataArcheType = oData["OfferPainterArcheType"]["results"],
                    aDataPainterType = oData["OfferPainterType"]["results"],
                    aDataPotential = oData["OfferPainterPotential"]["results"];
                var aDataZone = oData["OfferZone"]["results"],
                    aDataDivision = oData["OfferDivision"]["results"],
                    aDataDepot = oData["OfferDepot"]["results"];
                var aDataPainter = oData["OfferSpecificPainter"]["results"];
                for (var a in aDataPCat1) {
                    aHashPCat1[aDataPCat1[a]["ProductCategoryCode"]] = a;
                }
                oModelControl.setProperty("/Hash/PCat1", aHashPCat1);
                for (var a in aDataPCat2) {
                    aHashPCat2[aDataPCat2[a]["ProductCategoryCode"]] = a;
                }
                oModelControl.setProperty("/Hash/PCat2", aHashPCat2);
                for (var a in aDataPCat3) {
                    aHashPCat3[aDataPCat3[a]["ProductCategoryCode"]] = a;
                }
                oModelControl.setProperty("/Hash/PCat3", aHashPCat3);
                for (var a in aDataPCat4) {
                    aHashPCat4[aDataPCat4[a]["ProductCategoryCode"]] = a;
                }
                oModelControl.setProperty("/Hash/PCat4", aHashPCat4);
                // Product Classification Data
                for (var b in aDataPClass1) {
                    aHashPClass1[aDataPClass1[b]["ProductClassificationCode"]] = b;
                }
                oModelControl.setProperty("/Hash/PClass1", aHashPClass1);
                for (var b in aDataPClass2) {
                    aHashPClass2[aDataPClass2[b]["ProductClassificationCode"]] = b;
                }
                oModelControl.setProperty("/Hash/PClass2", aHashPClass2);
                for (var b in aDataPClass3) {
                    aHashPClass3[aDataPClass3[b]["ProductClassificationCode"]] = b;
                }
                oModelControl.setProperty("/Hash/PClass3", aHashPClass3);
                for (var b in aDataPClass4) {
                    aHashPClass4[aDataPClass4[b]["ProductClassificationCode"]] = b;
                }
                oModelControl.setProperty("/Hash/PClass4", aHashPClass4);
                //Products Data
                for (var c in aDataAppProd1) {
                    aHashAppProd1[aDataAppProd1[c]["ProductCode"]] = c;
                }
                oModelControl.setProperty("/Hash/AppProd1", aHashAppProd1);
                for (var c in aDataAppProd2) {
                    aHashAppProd2[aDataAppProd2[c]["ProductCode"]] = c;
                }
                oModelControl.setProperty("/Hash/AppProd2", aHashAppProd2);
                for (var c in aDataAppProd3) {
                    aHashAppProd3[aDataAppProd3[c]["ProductCode"]] = c;
                }
                oModelControl.setProperty("/Hash/AppProd3", aHashAppProd3);
                for (var c in aDataAppProd4) {
                    aHashAppProd4[aDataAppProd4[c]["ProductCode"]] = c;
                }
                oModelControl.setProperty("/Hash/AppProd4", aHashAppProd4);
                //Pack Data 5
                for (var d in aDataAppPack1) {
                    aHashAppPack1[aDataAppPack1[d]["SkuCode"]] = d;
                }
                oModelControl.setProperty("/Hash/AppPack1", aHashAppPack1);
                for (var d in aDataAppPack2) {
                    aHashAppPack2[aDataAppPack2[d]["SkuCode"]] = d;
                }
                oModelControl.setProperty("/Hash/AppPack2", aHashAppPack2);
                for (var d in aDataAppPack3) {
                    aHashAppPack3[aDataAppPack3[d]["SkuCode"]] = d;
                }
                oModelControl.setProperty("/Hash/AppPack3", aHashAppPack3);
                for (var d in aDataAppPack4) {
                    aHashAppPack4[aDataAppPack4[d]["SkuCode"]] = d;
                }
                oModelControl.setProperty("/Hash/AppPack4", aHashAppPack4);
                //archetype, paintertype, potential
                for (var e in aDataArcheType) {
                    aHashArcheType[aDataArcheType[e]["ArcheTypeId"]] = e;
                }
                oModelControl.setProperty("/Hash/ArcheType", aHashArcheType);
                for (var e in aDataPainterType) {
                    aHashPainterType[aDataPainterType[e]["PainterTypeId"]] = e;
                }
                oModelControl.setProperty("/Hash/PainterType", aHashPainterType);
                for (var e in aDataPotential) {
                    aHashPotential[aDataPotential[e]["PotentialId"]] = e;
                }
                //zone division depot
                for (var f in aDataZone) {
                    aHashZone[aDataZone[f]["ZoneId"]] = f;
                }
                oModelControl.setProperty("/Hash/Zone", aHashZone);
                for (var f in aDataDivision) {
                    aHashDivision[aDataDivision[f]["DivisionId"]] = f;
                }
                oModelControl.setProperty("/Hash/Division", aHashDivision);
                for (var f in aDataDepot) {
                    aHashDepot[aDataDepot[f]["DepotId"]] = f;
                }
                oModelControl.setProperty("/Hash/Depot", aHashDepot);
                //painter
                for (var g in aDataPainter) {
                    aHashPainter[aDataPainter[g]["PainterId"]] = g;
                }
                oModelControl.setProperty("/Hash/Painter", aHashPainter);
                promise.resolve(oData);
                return promise;
            },
            _setAdditionalData2: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModelView = oView.getModel("oModelView");
                oModelControl.setProperty(
                    "/Rbtn/AppPainter",
                    oData["PainterSelection"]
                );
                if (oData["ParentOfferId"] !== null && oData["ParentOfferId"] !== 0) {
                    oModelControl.setProperty("/Rbtn/ParentOffer", 1);
                }
                // setting the information for bonus applicable offers
                if (oData["BonusApplicableTopPainter"]) {
                    oModelControl.setProperty("/Rbtn/TopAll", 1);
                }
                //archetype.painter type,potential
                // work flow reated flags
                oModelView.setProperty("/Remark", "");
                // set applicable painter count
                oModelControl.setProperty("/Fields/PainterCount", oModelView.getProperty("/ApplicablePainterCount"))
                promise.resolve(oData);
                return promise;
            },
            _OfferTypeValidation2: function (oData) {
                var oFFerTypeId = oData["OfferTypeId"];
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oDataModel = oView.getModel();
                var sPath = "/MasterOfferTypeSet(" + oFFerTypeId + ")";
                oDataModel.read(sPath, {
                    success: function (data) {
                        oModel.setProperty("/OfferType", data);
                        oModel.refresh();
                        this._OfferTypeFieldsSet();
                    }.bind(this),
                });
                promise.resolve(oData);
                return promise;
            },
            _CheckEditImage: function (mParam1) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = this.getView().getModel("oModelControl");
                var oProp = oView.getModel("oModelControl3").getProperty("/bindProp");
                var sImageUrl =
                    "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
                return new Promise((resolve, reject) => {
                    jQuery
                        .get(sImageUrl)
                        .done(function (oData) {
                            oModelControl.setProperty("/ImageLoaded", true);
                            resolve(mParam1);
                        })
                        .fail(function (oData) {
                            oModelControl.setProperty("/ImageLoaded", false);
                            resolve(mParam1);
                        });
                });
            },
            _GetInitEditData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oData = oView.getModel();
                var oModelControl2 = oView.getModel("oModelControl3");
                var sPath = oModelControl2.getProperty("/bindProp");
                var othat = this;
                var exPand =
                    "OfferZone,BannerMediaList,PamphletMediaList,OfferDepot,OfferDivision,OfferApplicableProductCategory,OfferApplicableProductClassification,OfferApplicableProduct/Product,OfferApplicablePack/Pack,OfferRewardRatio/RewardGift," +
                    "OfferPainterType,OfferPainterArcheType,OfferPainterPotential,OfferBuyerProductCategory,OfferBuyerProductClassification,OfferBuyerProduct/Product,OfferBuyerPack/Pack,OfferNonBuyerProductCategory," +
                    "OfferNonBuyerProductClassification,OfferNonBuyerProduct/Product,OfferNonBuyerPack/Pack," +
                    "OfferBonusProductCategory,OfferBonusProductClassification,OfferBonusProduct/Product,OfferBonusPack/Pack," +
                    "OfferBonusRewardRatio,OfferSpecificPainter/Painter,ParentOffer,OfferConditions,OfferEarnedPointsCondition,OfferProductValueCondition,OfferRedemptionCycleCondition,OfferAchiever,OfferContributionRatio/Product,OfferContributionRatio/Pack";
                oView.getModel().read("/" + sPath, {
                    urlParameters: {
                        $expand: exPand,
                    },
                    success: function (data) {
                        promise.resolve(data);
                    },
                    error: function () {
                        promise.reject();
                    },
                });
                return promise;
            },
            _setEditControlModel: function (data) {
                var promise = jQuery.Deferred();
                var oData = data;
                var oView = this.getView();
                var oModelControl2 = oView.getModel("oModelControl2");
                var oBonusValidity = [];
                var oDataControl = {
                    HasTillDate: false,
                    FormTitle: "",
                    ImageLoaded: true,
                    mode: "edit",
                    BonusValidity: oBonusValidity,
                    modeEdit: false,
                    StartDate: "",
                    EndDate: "",
                    AddInfoTable: false,
                    MinDate: new Date(),
                    LoggedInUser: {},
                    OfferType: {
                        BasicInformation: true,
                        ApplicableProducts: true,
                        RewardRatio: true,
                        ApplicablePainters: true,
                        ApplicablePainterProducts: true,
                        AdditionalReward: true,
                        EarnedPointsCondition: false,
                        ProductValueCondition: false,
                        RedemptionCycleCondition: false,
                    },
                    Search: {
                        PainterVh: {
                            ZoneId: "",
                            DivisionId: "",
                            DepotId: "",
                            PainterType: "",
                            ArcheType: "",
                            MembershipCard: "",
                            Name: "",
                            Mobile: "",
                        },
                        DepotVh: {
                            DepotId: "",
                            Division: "",
                        },
                    },
                    Dialog: {
                        Bonus1: {},
                        Key1: "",
                        Bonus2: {},
                        Key2: "",
                        ProdVH: "",
                        PackVH: "",
                    },
                    MultiCombo: {
                        Zones: [],
                        Divisions: [],
                        Depots: [],
                        ArcheTypes: [],
                        PainterType: [],
                        Potential: [],
                        PainterProducts: [],
                        ApplicableProducts: [],
                        BonusApplicableProducts: [],
                        PCat1: [],
                        PCat2: [],
                        PCat3: [],
                        PCat4: [],
                        PClass1: [],
                        PClass2: [],
                        PClass3: [],
                        PClass4: [],
                        AppProd1: [],
                        AppProd2: [],
                        AppProd3: [],
                        AppProd4: [],
                        AppPacks1: [],
                        AppPacks2: [],
                        AppPacks3: [],
                        AppPacks4: [],
                        Painters: [],
                        Reward: [],
                        Reward2: [],
                    },
                    Rbtn: {
                        PCat1: 0,
                        PCat2: 0,
                        PCat3: 0,
                        PCat4: 0,
                        PClass1: 0,
                        PClass2: 0,
                        PClass3: 0,
                        PClass4: 0,
                        AppProd1: 0,
                        AppProd2: 0,
                        AppProd3: 0,
                        AppProd4: 0,
                        AppPacks1: 0,
                        AppPacks2: 0,
                        AppPacks3: 0,
                        AppPacks4: 0,
                        Rewards: 0,
                        BRewards: 0,
                        TopAll: 0,
                        Zones: 0,
                        Divisions: 0,
                        Depots: 0,
                        AppPainter: 0,
                        ParentOffer: 0,
                        BrReqVol: 0,
                        BrReqCash: 0,
                        Bns2ReqPercent: 0,
                        MultiReward: 0,
                        AddFlag: 0
                    },
                    MultiEnabled: {
                        PCat1: false,
                        PClass1: false,
                        PClass2: false,
                        AppProd1: false,
                        AppProd2: false,
                        AppPacks1: false,
                        AppPacks2: false,
                        PCat2: false,
                        PCat3: false,
                        PCat4: false,
                        PClass3: false,
                        PClass4: false,
                        AppProd3: false,
                        AppProd4: false,
                        AppPacks3: false,
                        AppPacks4: false,
                        Rewards: false,
                        BRewards: false,
                        Zones: false,
                        Divisions: false,
                        Depots: false,
                        AppPainter: false,
                        ParentOffer: false
                    },
                    Table: {
                        Table1: [],
                        Table2: [],
                        Table3: [],
                        Table4: [],
                        Table5: [],
                        Table6: [],
                        Table7: [],
                        Table8: [],
                        Table9: [],
                        Table10: [],
                        Table11: [],
                        Table12: []
                    },
                    oData: {
                        Products: [],
                        Packs: [],
                        PerGrowth: [{
                            Name: "1",
                        },
                        {
                            Name: "2",
                        },
                        {
                            Name: "3",
                        },
                        {
                            Name: "4",
                        },
                        {
                            Name: "5",
                        },
                        ],
                        Rewards: [{
                            key: 1,
                            Name: "TV",
                        },
                        {
                            key: 2,
                            Name: "Washing Machine",
                        },
                        {
                            key: 3,
                            Name: "Fridge",
                        },
                        ],
                    },
                    Fields: {
                        Date1: null,
                        Date2: null,
                        ParentOfferTitle: "",
                        RewardRationCount: 1,
                        PainterCount: "",
                    },
                    Hash: {
                        PCat1: {},
                        PCat2: {},
                        PCat3: {},
                        PCat4: {},
                        PClass1: {},
                        PClass2: {},
                        PClass3: {},
                        PClass4: {},
                        AppProd1: {},
                        AppProd2: {},
                        AppProd3: {},
                        AppProd4: {},
                        AppPack1: {},
                        AppPack2: {},
                        AppPack3: {},
                        AppPack4: {},
                        Potential: {},
                        PainterType: {},
                        ArcheType: {},
                        Zone: {},
                        Division: {},
                        Depot: {},
                        Painter: {},
                    },
                };
                var oConrtrolModel = new JSONModel(oDataControl);
                oView.setModel(oConrtrolModel, "oModelControl");
                var oModelView = new JSONModel(oData);
                oView.setModel(oModelView, "oModelView");
                //oModelView.refresh()
                //this._getProductsData([]);
                promise.resolve(data);
                return promise;
            },
            _setEditViewData2: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl2 = oView.getModel("oModelControl");
                var Table1 = [],
                    Table2 = [];
                if (oData["OfferRewardRatio"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table2",
                        oData["OfferRewardRatio"]["results"]
                    );
                }
                if (oData["BannerMediaList"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table11",
                        oData["BannerMediaList"]["results"]
                    );
                }
                if (oData["PamphletMediaList"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table12",
                        oData["PamphletMediaList"]["results"]
                    );
                }
                // if (oData["IsSpecificApplicablePack"] === false) {
                //     if (oData["OfferRewardRatio"]["results"].length > 0) {
                //         oModelControl2.setProperty(
                //             "/Table/Table2",
                //             oData["OfferRewardRatio"]["results"]
                //         );
                //     }
                // } else {
                //     if (oData["OfferRewardRatio"]["results"].length > 0) {
                //         oModelControl2.setProperty(
                //             "/Table/Table2",
                //             oData["OfferRewardRatio"]["results"]
                //         );
                //     }
                // }
                if (oData["OfferBonusRewardRatio"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table3",
                        oData["OfferBonusRewardRatio"]["results"]
                    );
                }
                if (oData["IsSpecificBonusPack"] === false) {
                    if (oData["OfferBonusRewardRatio"]["results"].length > 0) {
                        oModelControl2.setProperty(
                            "/Table/Table4",
                            oData["OfferBonusRewardRatio"]["results"]
                        );
                    }
                } else {
                    if (oData["OfferBonusRewardRatio"]["results"].length > 0) {
                        oModelControl2.setProperty(
                            "/Table/Table4",
                            oData["OfferBonusRewardRatio"]["results"]
                        );
                    }
                }
                if (oData["OfferEarnedPointsCondition"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table5",
                        oData["OfferEarnedPointsCondition"]["results"]
                    );
                }
                if (oData["OfferProductValueCondition"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table6",
                        oData["OfferProductValueCondition"]["results"]
                    );
                }
                if (oData["OfferRedemptionCycleCondition"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table7",
                        oData["OfferRedemptionCycleCondition"]["results"]
                    );
                }
                if (oData["OfferAchiever"]["results"].length > 0) {
                    oModelControl2.setProperty(
                        "/Table/Table8",
                        oData["OfferAchiever"]["results"]
                    );
                }
                if (oData["OfferContributionRatio"]["results"].length > 0) {
                    if (oData["ContributionType"] === 0) {
                        oModelControl2.setProperty(
                            "/Table/Table9",
                            oData["OfferContributionRatio"]["results"]
                        );
                    } else if (oData["ContributionType"] === 1) {
                        oModelControl2.setProperty(
                            "/Table/Table10",
                            oData["OfferContributionRatio"]["results"]
                        );
                    }

                }
                promise.resolve(oData);
                return promise;
            },
            _SetEditRbtnData: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var oRbtn = oModel.getProperty("/Rbtn");
                var oMultiEnabled = oModel.getProperty("/MultiEnabled");
                var aBoleanProps = {
                    IsSpecificZone: "Zones",
                    IsSpecificDivision: "Divisions",
                    IsSpecificDepot: "Depots",
                    IsSpecificApplicableProductCategory: "PCat1",
                    IsSpecificApplicableProductClassification: "PClass1",
                    IsSpecificApplicableProduct: "AppProd1",
                    IsSpecificApplicablePack: "AppPacks1",
                    IsSpecificRewardRatio: "Rewards",
                    IsSpecificBuyerProductCategory: "PCat2",
                    IsSpecificBuyerProductClassification: "PClass2",
                    IsSpecificBuyerProduct: "AppProd2",
                    IsSpecificBuyerPack: "AppPacks2",
                    IsSpecificNonBuyerProductCategory: "PCat3",
                    IsSpecificNonBuyerProductClassification: "PClass3",
                    IsSpecificNonBuyerProduct: "AppProd3",
                    IsSpecificNonBuyerPack: "AppPacks3",
                    IsSpecificBonusProductCategory: "PCat4",
                    IsSpecificBonusProductClassification: "PClass4",
                    IsSpecificBonusProduct: "AppProd4",
                    IsSpecificBonusPack: "AppPacks4",
                    IsSpecificBonusRewardRatio: "BRewards",
                    IsSpecificPainter: "AppPainter",
                    IsMultiRewardAllowed: "MultiReward",
                    IsSpecificAchieverCount: "AddFlag"
                };
                for (var a in aBoleanProps) {
                    oMultiEnabled[aBoleanProps[a]] = oData[a];
                    if (oData[a] === true) {
                        oRbtn[aBoleanProps[a]] = 1;
                    } else {
                        oRbtn[aBoleanProps[a]] = 0;
                    }
                }
                promise.resolve(oData);
                return promise;
            },
            _setEditViewData1: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl2 = oView.getModel("oModelControl");
                var aZones = [],
                    aDivisions = [],
                    aDepots = [],
                    aArchiTypes = [],
                    aPainterProducts = [],
                    aApplicableProducts = [],
                    aBonusApplicableProducts = [],
                    PCat1 = [],
                    PClass1 = [],
                    AppProd1 = [],
                    AppPacks1 = [],
                    PainterType = [],
                    ArcheTypes = [],
                    Potential = [],
                    PCat2 = [],
                    PClass2 = [],
                    AppProd2 = [],
                    AppPacks2 = [],
                    PCat3 = [],
                    PClass3 = [],
                    AppProd3 = [],
                    AppPacks3 = [],
                    PCat4 = [],
                    PClass4 = [],
                    AppProd4 = [],
                    AppPacks4 = [],
                    Painters = [],
                    ParentOffer = "";
                //setting zone data
                if (oData["OfferZone"]["results"].length > 0) {
                    for (var x of oData["OfferZone"]["results"]) {
                        aZones.push(x["ZoneId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Zones", aZones);
                if (oData["OfferDivision"]["results"].length > 0) {
                    for (var x of oData["OfferDivision"]["results"]) {
                        aDivisions.push(x["DivisionId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Divisions", aDivisions);
                if (oData["OfferDepot"]["results"].length > 0) {
                    for (var x of oData["OfferDepot"]["results"]) {
                        aDepots.push({
                            DepotId: x["DepotId"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Depots", aDepots);
                if (oData["OfferApplicableProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferApplicableProductCategory"]["results"]) {
                        PCat1.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat1", PCat1);
                if (
                    oData["OfferApplicableProductClassification"]["results"].length > 0
                ) {
                    for (var x of oData["OfferApplicableProductClassification"][
                        "results"
                    ]) {
                        PClass1.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass1", PClass1);
                if (oData["OfferApplicableProduct"]["results"].length > 0) {
                    for (var x of oData["OfferApplicableProduct"]["results"]) {
                        AppProd1.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd1", AppProd1);
                if (oData["OfferApplicablePack"]["results"].length > 0) {
                    for (var x of oData["OfferApplicablePack"]["results"]) {
                        AppPacks1.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                            ProductCode: x["Pack"]["ProductCode"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks1", AppPacks1);
                if (oData["OfferPainterType"]["results"].length > 0) {
                    for (var x of oData["OfferPainterType"]["results"]) {
                        PainterType.push(x["PainterTypeId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PainterType", PainterType);
                if (oData["OfferPainterArcheType"]["results"].length > 0) {
                    for (var x of oData["OfferPainterArcheType"]["results"]) {
                        ArcheTypes.push(x["ArcheTypeId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/ArcheTypes", ArcheTypes);
                if (oData["OfferPainterPotential"]["results"].length > 0) {
                    for (var x of oData["OfferPainterPotential"]["results"]) {
                        Potential.push(x["PotentialId"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Potential", Potential);
                if (oData["OfferBuyerProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerProductCategory"]["results"]) {
                        PCat2.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat2", PCat2);
                if (oData["OfferBuyerProductClassification"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerProductClassification"]["results"]) {
                        PClass2.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass2", PClass2);
                if (oData["OfferBuyerProduct"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerProduct"]["results"]) {
                        AppProd2.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd2", AppProd2);
                if (oData["OfferBuyerPack"]["results"].length > 0) {
                    for (var x of oData["OfferBuyerPack"]["results"]) {
                        AppPacks2.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks2", AppPacks2);
                if (oData["OfferNonBuyerProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferNonBuyerProductCategory"]["results"]) {
                        PCat3.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat3", PCat3);
                if (
                    oData["OfferNonBuyerProductClassification"]["results"].length > 0
                ) {
                    for (var x of oData["OfferNonBuyerProductClassification"][
                        "results"
                    ]) {
                        PClass3.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass3", PClass3);
                if (oData["OfferNonBuyerProduct"]["results"].length > 0) {
                    for (var x of oData["OfferNonBuyerProduct"]["results"]) {
                        AppProd3.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd3", AppProd3);
                if (oData["OfferNonBuyerPack"]["results"].length > 0) {
                    for (var x of oData["OfferNonBuyerPack"]["results"]) {
                        AppPacks3.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks3", AppPacks3);
                if (oData["OfferBonusProductCategory"]["results"].length > 0) {
                    for (var x of oData["OfferBonusProductCategory"]["results"]) {
                        PCat4.push(x["ProductCategoryCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PCat4", PCat4);
                if (oData["OfferBonusProductClassification"]["results"].length > 0) {
                    for (var x of oData["OfferBonusProductClassification"]["results"]) {
                        PClass4.push(x["ProductClassificationCode"]);
                    }
                }
                oModelControl2.setProperty("/MultiCombo/PClass4", PClass4);
                if (oData["OfferBonusProduct"]["results"].length > 0) {
                    for (var x of oData["OfferBonusProduct"]["results"]) {
                        AppProd4.push({
                            Id: x["Product"]["Id"],
                            Name: x["Product"]["ProductName"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppProd4", AppProd4);
                if (oData["OfferBonusPack"]["results"].length > 0) {
                    for (var x of oData["OfferBonusPack"]["results"]) {
                        AppPacks4.push({
                            Id: x["Pack"]["SkuCode"],
                            Name: x["Pack"]["Description"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/AppPacks4", AppPacks4);
                if (oData["OfferSpecificPainter"]["results"].length > 0) {
                    for (var x of oData["OfferSpecificPainter"]["results"]) {
                        Painters.push({
                            PainterId: x["Painter"]["Id"],
                            PainterName: x["Painter"]["Name"],
                        });
                    }
                }
                oModelControl2.setProperty("/MultiCombo/Painters", Painters);
                if (oData["ParentOffer"] !== null) {
                    //ParentOffer
                    ParentOffer = oData["ParentOffer"]["Title"];
                }
                oModelControl2.setProperty("/Fields/ParentOfferTitle", ParentOffer);
                promise.resolve(oData);
                return promise;
            },
            handleSavePress: function () {
                var oView = this.getView();
                var oWizard = this.getView().byId("wizardViewBranching");
                this._ValidateSaveData();
            },
            _ValidateSaveData: function () {
                var oView = this.getView();
                var oValidate = new Validator();
                var oForm = oView.byId("vBoxForms");
                var oWizardView = this.getView().byId("wizardViewBranching");
                var oSteps = oWizardView.byId("CreateProductWizard").getSteps();
                var bFlagValidate = oValidate.validate(oSteps, true);
                var aTableValidation = this._CheckTableValidation();
                var aTableBonusValidation = this._CheckTableBonusValidation();
                var bTableCondition1 = this._CheckTableCondition1();
                var bTableCondition2 = this._CheckTableCondition2();
                var bTableCondition3 = this._CheckTableCondition3();
                var bTableCondition4 = this._CheckTableCondition4();
                var bTableCondition5 = this._CheckTableCondition5();
                var bTableCondition6 = this._CheckTableCondition6();
                var sFile = oWizardView.byId("idFileUpload").oFileUpload.files[0];
                var bFileFlag = false;
                if (bFlagValidate == false) {
                    MessageToast.show("Kindly Input All the Mandatory(*) fields.");
                    return;
                }
                //check if it has file
                if (sFile !== undefined) {
                    bFileFlag = true;
                }
                if (!aTableValidation[0]) {
                    MessageToast.show(aTableValidation[1]);
                    return;
                }
                if (!aTableBonusValidation[0]) {
                    MessageToast.show(aTableBonusValidation[1]);
                    return;
                }
                if (!bTableCondition1[0]) {
                    MessageToast.show(bTableCondition1[1]);
                    return;
                }
                if (!bTableCondition2[0]) {
                    MessageToast.show(bTableCondition2[1]);
                    return;
                }
                if (!bTableCondition3[0]) {
                    MessageToast.show(bTableCondition3[1]);
                    return;
                }
                if (!bTableCondition4[0]) {
                    MessageToast.show(bTableCondition4[1]);
                    return;
                }
                if (!bTableCondition5[0]) {
                    MessageToast.show(bTableCondition5[1]);
                    return;
                }
                if (!bTableCondition6[0]) {
                    MessageToast.show(bTableCondition6[1]);
                    return;
                }
                this._postDataToSave(bFileFlag);
            },
            // _CheckTableValidation: function () {
            //     // check if the table 1 or 2 is visible
            //     var oView = this.getView();
            //     var oModel = oView.getModel("oModelControl");
            //     var oModelData = oModel.getData();
            //     if (oModelData["Table"]["Table2"].length == 0) {
            //         return [false, "Kindly Enter the data in the Reward Ratio Table to Continue"]
            //     }
            //     return [true, ""]
            // },
            _postDataToSave: function (bFileFlag) {
                var c1, c1B, c2, c3, c4, c5, c5A, c5A1, c5A2, c5B, c6, c7;
                var othat = this;
                c1 = othat._CreatePayloadPart1();
                //Create PayLoadPart1 Removing the 1.empty values 2. Converting the Values into Ineger;s
                // Create the Payload 2 in this we set the Bolean Values of All/Specific to the respective backend fields;
                // _CreatePayloadPart3 this is used to set the value of the elements in the array
                // create payload 4 and 5 used for table 1,2 and table 3,4
                //othat._CreatePayloadPart2();othat._UploadFile(mParam1, bFileFlag);
                c1.then(function (oPayload) {
                    c1B = othat._CreatePayLoadPart1AForEndDate(oPayload)
                    c1B.then(function (oPayload) {
                        c2 = othat._CreatePayloadPart2(oPayload);
                        c2.then(function (oPayload) {
                            c3 = othat._CreatePayloadPart3(oPayload);
                            c3.then(function (oPayLoad) {
                                c4 = othat._CreatePayLoadPart4(oPayLoad);
                                c4.then(function (oPayLoad) {
                                    //c5 = othat._CreateOffer(oPayLoad);
                                    c5 = othat._CreatePayLoadPart5(oPayLoad);
                                    c5.then(function (oPayLoad) {
                                        c5A1 = othat._CreatePayLoadConditions(oPayLoad);
                                        c5A1.then(function (oPayLoad) {
                                            c5A2 = othat._CreatePayLoadPartContriCndtn(oPayLoad);
                                            c5A2.then(function () {
                                                c5A = othat._CreateWorkFlowData(oPayLoad);
                                                c5A.then(function () {
                                                    c5B = othat._CheckExpandPainter(oPayLoad);
                                                    c5B.then(function () {
                                                        c6 = othat._UpdateOffer(oPayLoad);
                                                        c6.then(function (oPayLoad) {
                                                            c7 = othat._UploadFile(oPayLoad, bFileFlag);
                                                            c7.then(function (data) {
                                                                othat.handleCancelPress(data);
                                                            });
                                                        });
                                                    });
                                                });
                                            })
                                        })
                                    });
                                });
                            });
                        });
                    })
                });
            },
            _UpdateOffer: function (oPayLoad) {
                var promise = jQuery.Deferred();
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oProp = oView.getModel("oModelControl3").getProperty("/bindProp");
                //console.log(oPayLoad);
                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + oProp, oPayLoad, {
                        success: function (data) {
                            MessageToast.show("Offer Successfully Updated.");
                            //othat._navToHome();
                            resolve(data);
                        },
                        error: function (data) {
                            MessageToast.show("Error In Creating the Offer.");
                            reject(data);
                        },
                    });
                });
            },
            _UploadFile: function (mParam1, mParam2) {
                var promise = jQuery.Deferred();
                if (!mParam2) {
                    promise.resolve();
                    return promise;
                }
                var oView = this.getView();
                var oWizardView = oView.byId("wizardViewBranching");
                var oFile = oWizardView.byId("idFileUpload").oFileUpload.files[0];
                var sServiceUrl = this.getOwnerComponent(this)
                    .getManifestObject()
                    .getEntry("/sap.app").dataSources.mainService.uri;
                var data = oView.getModel("oModelView").getData();
                var sUrl = sServiceUrl + "OfferSet(" + data["Id"] + ")/$value";
                new Promise((resolve, reject) => {
                    jQuery.ajax({
                        method: "PUT",
                        url: sUrl,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: oFile,
                        success: function (data) {
                            resolve();
                        },
                        error: function () {
                            resolve();
                        },
                    });
                });
            },
            _RemoveEmptyValue: function (mParam) {
                var obj = Object.assign({}, mParam);
                // remove string values
                for (var b in obj) {
                    if (obj[b] === "") {
                        obj[b] = null;
                    }
                }
                return obj;
            },
            _reLoadInitData: function () { },
            _loadEditProfile: function (mParam) {
                var oView = this.getView();
                var promise = jQuery.Deferred();
                var othat = this;
                var oVboxProfile = oView.byId("idVbProfile");
                var sFragName = mParam == "Edit" ? "ChangeDetail" : "DisplayDetail";
                oVboxProfile.destroyItems();
                return Fragment.load({
                    id: oView.getId(),
                    controller: othat,
                    name: "com.knpl.pragati.SchemeOffers.view.fragment." + sFragName,
                }).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },
            // Attachment View and other Changes
            _CheckAttachment: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var oModelControl = this.getView().getModel("oModelControl2");
                var oProp = oModelControl.getProperty("/bindProp");
                var sImageUrl =
                    "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
                return new Promise((resolve, reject) => {
                    jQuery
                        .get(sImageUrl)
                        .done(function () {
                            oModelControl.setProperty("/ImageLoaded", true);
                            resolve();
                        })
                        .fail(function () {
                            oModelControl.setProperty("/ImageLoaded", false);
                            resolve();
                        });
                });
            },
            onAfterAttachClose: function (oEvent) {
                this._pKycDialog.destroy();
                delete this._pKycDialog;
            },
            _toggleButtonsAndView: function (bEdit) {
                var oView = this.getView();
                oView.byId("edit").setVisible(false);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);
            },
            handleCancelPress: function () {
                var oView = this.getView();
                var othat = this;
                var oProp = oView.getModel("oModelControl3").getProperty("/OfferId");
                this._navToHome();
                var c1, c2, c3, c4;
                //this._initData(oProp);
            },
            onDeactivate: function (oEvent) {
                var oView = this.getView();
                var oBject = {};
                var sPath =
                    "/" +
                    oView.getModel("oModelControl3").getProperty("/bindProp") +
                    "/IsActive";
                var oData = oView.getModel();
                var othat = this;
                var oPayLoad = {
                    IsActive: false,
                };
                oData.update(sPath, oPayLoad, {
                    success: function () {
                        othat._navToHome();
                    },
                    error: function () { },
                });
            },
            onIcnTbarChange: function (oEvent) {
                var oView = this.getView();
                var sKey = oEvent.getSource().getSelectedKey();
                var oCtrl2Model = oView.getModel("oModelControl3");

                if (sKey == "1") {
                    this._LoadPainterDataV2();
                    //this._LoadPainterData(0, 16);
                    //oView.byId("idPainterTable").getModel().refresh();
                } else if (sKey == "2") {
                    //oView.byId("PainteTable2").rebindTable();
                } else if (sKey == "3") {
                    oView.byId("OfferHistory").rebindTable();
                } else if (sKey == "4") {
                    oCtrl2Model.setProperty("/PageBusy", true)
                    var sMode = oCtrl2Model.getProperty("/mode");
                    var oData = null;
                    if (sMode === "display") {
                        oData = oView.getModel("oModelDisplay").getData();
                    } else if (sMode === "edit") {
                        oData = oView.getModel("oModelView").getData();
                    }
                    this._getExecLogData(oData);
                } else if (sKey == "5") {
                    this.onfilterOfferPainter();
                }
            },
            onBeforeBindPainterTable1: function (oEvent) {
                var oView = this.getView();
                var sOfferId = oView
                    .getModel("oModelControl3")
                    .getProperty("/OfferId");
                var aFilter = [];
                var aFilter1 = new Filter(
                    [
                        new Filter("ProgressStatus", FilterOperator.EQ, "STARTED"),
                        new Filter("ProgressStatus", FilterOperator.EQ, "COMPLETED"),
                    ],
                    false
                );
                var aFilter2 = new Filter(
                    "OfferId",
                    FilterOperator.EQ,
                    parseInt(sOfferId)
                );
                aFilter.push(aFilter1);
                aFilter.push(aFilter2);
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "Painter";
                oBindingParams.filters.push(
                    new Filter({
                        filters: aFilter,
                        and: true,
                    })
                );
            },
            onBeforeBindPainterTable2: function (oEvent) {
                //qualified
                var oView = this.getView();
                var sOfferId = oView
                    .getModel("oModelControl3")
                    .getProperty("/OfferId");
                var aFilter = [];
                var aFilter1 = new Filter(
                    "RedemptionStatus",
                    FilterOperator.EQ,
                    "REDEEMED"
                );
                var aFilter2 = new Filter(
                    "OfferId",
                    FilterOperator.EQ,
                    parseInt(sOfferId)
                );
                aFilter.push(aFilter1);
                aFilter.push(aFilter2);
                // var oPainterId = oView
                //     .getModel("oModelControl2")
                //     .getProperty("/PainterId");
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "Painter";
                // var oFilter = new Filter("PainterId", FilterOperator.EQ, oPainterId);
                oBindingParams.filters.push(
                    new Filter({
                        filters: aFilter,
                        and: true,
                    })
                );
            },
            onBeforeBindOfferHistory: function (oEvent) {
                var oView = this.getView();
                var sOfferId = oView
                    .getModel("oModelControl3")
                    .getProperty("/OfferId");
                var aFilter = [];
                var aFilter2 = new Filter(
                    "OfferId",
                    FilterOperator.EQ,
                    parseInt(sOfferId)
                );
                aFilter.push(aFilter2);
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(
                    new Filter({
                        filters: aFilter,
                        and: true,
                    })
                );
                oBindingParams.sorter.push(new Sorter("UpdatedAt", true));
            },
            onApplyRedemption: function () {
                var othat = this;
                var oModelControl = this.getView().getModel("oModelControl3");
                MessageBox.confirm("Are you sure you want to redeem the offer", {
                    actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction == "OK") {
                            this.getView().getModel("oModelControl3").setProperty("/PageBusy", true);
                            oModelControl.setProperty("/PageBusy", true);
                            oModelControl.setProperty("/Buttons/RedeemEnable", false);
                            othat._onOfferRedeem();
                        }
                    }.bind(this),
                });
            },
            _onOfferRedeem: function () {
                var oView = this.getView();
                var othat = this;
                var oModelControl = oView.getModel("oModelControl3");
                var sOfferId = oModelControl.getProperty("/OfferId");
                var oData = oView.getModel();
                oData.read("/RedeemOfferRewardForAllPainter", {
                    urlParameters: {
                        OfferId: sOfferId,
                    },
                    success: function (oData) {
                        //console.log(oData);
                        if (oData.hasOwnProperty("Message")) {
                            MessageToast.show(oData["Message"]);
                        } else {
                            MessageToast.show("Offer Successfully Redeemed.");
                        }
                        //othat._LoadPainterData(0, 16);
                        oModelControl.setProperty("/PageBusy", false);
                        oModelControl.setProperty("/Buttons/Redeem", true);
                        othat.handleCancelPress();
                        othat.getView().getModel().refresh(true);
                        oModelControl.refresh(true);
                    }.bind(this),
                    error: function () {
                        oModelControl.setProperty("/PageBusy", false)
                        MessageBox.error(
                            "Unable to redeem to the offer because of server error."
                        );
                    },
                });
            },
            onActivate: function (oEvent) {
                var oView = this.getView();
                var oBject = {};
                var sPath =
                    "/" +
                    oView.getModel("oModelControl3").getProperty("/bindProp") +
                    "/IsActive";
                var oData = oView.getModel();
                var othat = this;
                var oPayLoad = {
                    IsActive: true,
                };
                oData.update(sPath, oPayLoad, {
                    success: function () {
                        othat._navToHome();
                    },
                    error: function () { },
                });
            },
            onOpenRemarksDialog: function (oEvent) {
                //open the dialog
                var othat = this;
                var oView = this.getView();
                var oModelC = oView.getModel("oModelControl3");
                oModelC.setProperty("/Dialog/OfferStatus", oEvent);
                oModelC.setProperty("/Dialog/Remarks", "");
                // aCheck1 is for checking if the offer status is approved or not as we we have to set the remark on that basis.
                var aCheck1 = ["APPROVED"];
                if (aCheck1.indexOf(oEvent) >= 0) {
                    oModelC.setProperty("/Dialog/Remarks", "Approved");
                }
                //console.log(oEvent);
                if (!this._RemarksDialog2) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.SchemeOffers.view.fragment.ChangeStatus",
                        controller: othat,
                    }).then(
                        function (oDialog) {
                            this._RemarksDialog2 = oDialog;
                            oView.addDependent(this._RemarksDialog2);
                            this._RemarksDialog2.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._RemarksDialog2);
                    this._RemarksDialog2.open();
                }
                //set the flag for status and empty the status
                // close the dialog
                //move the approve sta
            },
            onCloseStatus: function () {
                this._RemarksDialog2.close();
            },


            onApproveReject: function () {
                var oView = this.getView();
                var oForm = oView.byId("RemarkForm");
                var oValidate = new Validator();
                var bFlagValidate = oValidate.validate(oForm, true);
                var othat = this;
                if (!bFlagValidate) {
                    MessageToast.show(
                        "Kindly fill all the mandatory fields to continue."
                    );
                    return;
                }
                var oModelC = oView.getModel("oModelControl3");
                this._RemarksDialog2.setBusy(true);
                oModelC.setProperty("/PageBusy", true);
                var oData = oView.getModel();
                var oPayload = this.getView().getModel("oModelDisplay").getData();
                var sOfferStatus = oModelC.getProperty("/Dialog/OfferStatus");
                var sRemark = oModelC.getProperty("/Dialog/Remarks");
                var oNewPayLoad = {};
                oNewPayLoad["Remark"] = sRemark;
                // if the offer status if
                if (
                    sOfferStatus === "PUBLISHED" ||
                    sOfferStatus === "PENDING" ||
                    sOfferStatus === "APPROVED" ||
                    sOfferStatus === "REJECTED"
                ) {
                    oNewPayLoad["OfferStatus"] = sOfferStatus;
                    if (sOfferStatus === "PUBLISHED") {
                        oNewPayLoad["IsPublished"] = true;
                    } else {
                        oNewPayLoad["IsPublished"] = false;
                    }
                    oNewPayLoad["InitiateForceTat"] = false;
                } else if (sOfferStatus === "ESCALATE") {
                    oNewPayLoad["InitiateForceTat"] = true;
                }
                // check is workflow flag
                var aCheck2 = ["PENDING", "APPROVED", "REJECTED", "ESCALATE"];
                if (aCheck2.indexOf(sOfferStatus) >= 0) {
                    oNewPayLoad["IsWorkFlowApplicable"] = true;
                } else {
                    oNewPayLoad["IsWorkFlowApplicable"] = false;
                }
                var sPath = oView.getModel("oModelControl3").getProperty("/bindProp");
                var c1, c1B, c2, c3;
                c1B = othat._CreatePayLoadPart1AForEndDate(oNewPayLoad);
                c1B.then(function (oNewPayLoad) {
                    c2 = othat._UpdateSingleProperty(oNewPayLoad, "OfferStatus");
                    c2.then(function (oNewPayLoad) {
                        othat._RemarksDialog2.setBusy(false);
                        othat._RemarksDialog2.close();
                        oModelC.setProperty("/PageBusy", true)
                        othat.handleCancelPress(oNewPayLoad)
                    })
                })
            },
            _UpdateSingleProperty: function (oPayLoad, sProperty) {
                var promise = jQuery.Deferred();
                var othat = this;
                var oView = this.getView();
                var oDataModel = oView.getModel();
                var oProp = oView.getModel("oModelControl3").getProperty("/bindProp") + "/" + sProperty;
                //console.log(oPayLoad);
                return new Promise((resolve, reject) => {
                    oDataModel.update("/" + oProp, oPayLoad, {
                        success: function (data) {
                            MessageToast.show("Offer Successfully Updated.");
                            //othat._navToHome();
                            resolve(data);
                        },
                        error: function (data) {
                            MessageToast.show("Error In Updating the Offer.");
                            reject(data);
                        },
                    });
                });
            },
            onEndDateCndtDisplay: function (oEvent) {
                var oSource = oEvent.getSource()
                var oModelDisplay = this.getView().getModel("oModelDisplay");
                var iInitialValue = oSource.data("dataValue");
                var newValue = oSource.getDateValue();
                var oEndDate = oModelDisplay.getProperty("/EndDate")
                if (!newValue) {
                    oSource.setDateValue(iInitialValue)
                    MessageToast.show("Date cannot be blank.");
                    return;
                }
                if (newValue > oEndDate) {
                    oSource.setDateValue(iInitialValue)
                    MessageToast.show("Date cannot be more than Offer End Date.");
                    return;
                }
            },
            onEndDateCndtAddInfo: function (oEvent) {
                var oSource = oEvent.getSource()
                var oModelDisplay = this.getView().getModel("oModelControl2");
                var OfferEndDate = this.getView().getModel("oModelDisplay").getProperty("/EndDate");
                var iInitialValue = oSource.data("dataValue");
                var newValue = oSource.getDateValue();
                var oEndDate = oModelDisplay.getProperty("/EndDate")
                if (!newValue) {
                    oSource.setDateValue(iInitialValue)
                    MessageToast.show("Date cannot be blank.");
                    return;
                }
                if (newValue > oEndDate) {
                    oSource.setDateValue(iInitialValue)
                    MessageToast.show("Date cannot be more than Offer End Date.");
                    return;
                }
                if (newValue > OfferEndDate) {
                    oSource.setDateValue(iInitialValue)
                    MessageToast.show("Date cannot be more than Offer End Date.");
                    return;

                }
            },
            onNavEndDtDspCnd1: function (oEvent) {
                var oSrc = oEvent.getSource();
                var sValue = oSrc.getDateValue();
                oSrc.data("dataValue", sValue);
            },
            onDetailPageSave: function () {
                var oView = this.getView();
                var oValidate = new Validator();
                var oForm = oView.byId("FormDisplay");
                var bFlagValidate = oValidate.validate(oForm, true);
                if (!bFlagValidate) {
                    MessageToast.show("Kindly Input All the mandatory fields to continue.");
                    return;
                }
                this._postDetailSave();
            },
            _postDetailSave: function () {
                var oView = this.getView();
                var oModelView = oView.getModel("oModelDisplay");
                var oModelControl2 = oView.getModel("oModelControl2");
                var oViewData = oModelView.getData();
                //var delPainters = oModelControl2.getProperty("/OfferDeselectedPainter");
                // if (delPainters != null) {
                //     delPainters.forEach(function (ele) {
                //         console.log(ele);
                //         delete ele["PainterName"];
                //         ele["OfferId"] = oViewData.Id.toString();
                //     })
                // }
                // console.log(delPainters);
                //debugger;
                //1. Detail Page End Date Change
                oViewData["EndDate"] = new Date(
                    oViewData["EndDate"].setHours(23, 59, 59, 999)
                );
                //2. End Date Changed For the Earned Points Table
                if (oViewData["OfferEarnedPointsCondition"].hasOwnProperty("results")) {
                    if (oViewData["OfferEarnedPointsCondition"]["results"].length > 0) {
                        oViewData["OfferEarnedPointsCondition"]["results"].forEach(function (mPram1) {
                            mPram1["EndDate"] = new Date(
                                mPram1["EndDate"].setHours(23, 59, 59, 999)
                            );
                        })
                    }
                }
                // 3.End Date Changed For the Achiever Points Table
                if (oViewData["OfferAchiever"].hasOwnProperty("results")) {
                    if (oViewData["OfferAchiever"]["results"].length > 0) {
                        oViewData["OfferAchiever"]["results"].forEach(function (mPram1) {
                            mPram1["EndDate"] = new Date(
                                mPram1["EndDate"].setHours(23, 59, 59, 999)
                            );
                        })
                    }
                }
                //3. Delete painters 
                // if (oViewData["OfferDeselectedPainter"].hasOwnProperty("results")) {
                //     delPainters.forEach(function (ele) {
                //         //console.log(ele);
                //         delete ele["PainterName"];
                //         ele["PainterId"] = parseInt(ele["PainterId"]);
                //         ele["OfferId"] = oViewData.Id;
                //         oViewData["OfferDeselectedPainter"]["results"].push(ele)
                //     })
                //     // if (oViewData["OfferDeselectedPainter"]["results"].length > 0) {
                //     //oViewData["OfferDeselectedPainter"]["results"].push(delPainters);
                //     // }

                // }
                var oModelC = oView.getModel("oModelControl3");
                oModelC.setProperty("/PageBusy", true);
                var othat = this;
                var c1, c1B, c2, c3;
                c1B = othat._CheckExpandPainter(oViewData);
                c1B.then(function (oViewData) {
                    c2 = othat._UpdateOffer(oViewData);
                    c2.then(function (oViewData) {
                        oModelC.setProperty("/PageBusy", true)
                        othat.handleCancelPress()
                    })
                })
            },
            onRepublishPageSave: function () {
                var oView = this.getView();
                var oValidate = new Validator();
                var oForm = oView.byId("FormDisplay");
                var bFlagValidate = oValidate.validate(oForm, true);
                if (!bFlagValidate) {
                    MessageToast.show("Kindly Input All the mandatory fields to continue.");
                    return;
                }
                this._postPublishSave();
            },
            _postPublishSave: function () {
                var oView = this.getView();
                var oModelView = oView.getModel("oModelDisplay");
                var publishData = oModelView.getData();
                var changeEndDate = publishData.EndDate;
                var oViewData1 = {};
                //1. Detail Page End Date Change
                oViewData1["EndDate"] = changeEndDate;
                oViewData1["Remark"] = "Offer-Re-Published";
                oViewData1["OfferStatus"] = "PUBLISHED";
                var othat = this;
                var c1, c1B;
                c1 = othat._CreatePayLoadPart1AForEndDate(oViewData1);
                c1.then(function (oPayload) {
                    c1B = othat._UpdateSingleProperty(oPayload, "OfferStatus");
                    othat._navToHome();
                });
            },
            //execution Log
            _getExecLogData: function (oData) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                //for Test case scenerios delete as needed
                var sWorkFlowInstanceId = oData["WorkflowInstanceId"];
                var oModelCtrl = oView.getModel("oModelControl3")
                if (sWorkFlowInstanceId) {
                    var sUrl =
                        "/comknplpragatiSchemeOffers/bpmworkflowruntime/v1/workflow-instances/" +
                        sWorkFlowInstanceId +
                        "/execution-logs";
                    this.oWorkflowModel.loadData(sUrl);
                } else {
                    this.oWorkflowModel.setData([]);
                    oModelCtrl.setProperty("/PageBusy", false)
                }
                promise.resolve();
                return promise;
            },
            _setWfData: function () {
                //TODO: format subject FORCETAT
                //console.log(this.oWorkflowModel.getData());
                var oView = this.getView();
                var oModelCtrl = oView.getModel("oModelControl3")
                var aWfData = this.oWorkflowModel.getData(),
                    taskSet = new Set([
                        "WORKFLOW_STARTED",
                        "WORKFLOW_COMPLETED",
                        "WORKFLOW_CANCELED",
                        "USERTASK_CREATED",
                        "USERTASK_COMPLETED",
                        "USERTASK_CANCELED_BY_BOUNDARY_EVENT", //TODO: Change text to TAT triggered
                    ]);
                aWfData = aWfData.filter((ele) => taskSet.has(ele.type));
                //console.log(aWfData);
                this.oWorkflowModel.setData(aWfData);
                oModelCtrl.setProperty("/PageBusy", false)

            },
            onPainterListDownload: function () {
                var oView = this.getView();
                var sServiceUrl = this.getOwnerComponent(this)
                    .getManifestObject()
                    .getEntry("/sap.app").dataSources.mainService.uri;
                var sOfferId = oView
                    .getModel("oModelControl3")
                    .getProperty("/OfferId");
                var sSource = "/KNPL_PAINTER_API/api/v2/odata.svc/" + "OfferEligibleAndQualifiedPainterSet(0)/$value?OfferId=" + sOfferId
                //console.log(sSource)
                sap.m.URLHelper.redirect(sSource, true);
            },
            // added by deepanjali start
            openPdf: function (oEvent) {

                var oView = this.getView();

                var oProp = oView.getModel("oModelControl3").getProperty("/bindProp");
                var oContext = oEvent.getSource().getBindingContext("oModelControl2");
                var sSource = "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value?doc_type=banner&language_code=" + oContext.getProperty("LanguageCode");

                sap.m.URLHelper.redirect(sSource, true);
            },
            openPamdf: function (oEvent) {
                debugger;
                var oView = this.getView();

                var oProp = oView.getModel("oModelControl3").getProperty("/bindProp");
                var oContext = oEvent.getSource().getBindingContext("oModelControl2");
                var sSource = "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value?doc_type=pamphlet&language_code=" + oContext.getProperty("LanguageCode");

                sap.m.URLHelper.redirect(sSource, true);
            },
            // added by deepanjali end
            exportExcel: function () {
                var oExport = new Export({
                    // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                    exportType: new ExportTypeCSV({
                        separatorChar: "\t",
                        mimeType: "application/vnd.ms-excel",
                        charset: "utf-8",
                        fileExtension: "xls"
                    }),
                    // Pass in the model created above
                    models: this.getView().getModel(),
                    // binding information for the rows aggregation
                    rows: {
                        path: "/OfferSet"
                    },
                    // column definitions with column name and binding info for the content
                    columns: [{
                        name: "Row",
                        template: {
                            content: "{Title}"
                        }
                    }, {
                        name: "Offer Code",
                        template: {
                            content: "{OfferCode}"
                        }
                    }]
                });
                // download exported file
                oExport.saveFile().catch(function (oError) {
                    MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                }).then(function () {
                    oExport.destroy();
                });
            },
            onPainterUpdatedStart: function (oEvent) {
                if (oEvent.getParameter("reason") === "Growing") {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl3")
                    var aPaintLength = oModel.getProperty("/oData/Painters").length;
                    this._LoadPainterData(aPaintLength, aPaintLength + 15)
                }
                //_LoadPainterData
            },
            //Deleted painter code start
            onRemovePainter: function (oEvent) {

                var oView = this.getView();
                var oBject = oEvent.getSource().getBindingContext().getObject();
                var sPath = oEvent.getSource().getBindingContext().getPath();
                var othat = this;
                var oData = oView.getModel();
                //console.log(oData);
                MessageBox.warning(
                    "Are you sure you want to remove the painter? ", {
                    actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction == "OK") {
                            othat._Deactivate(oData, sPath, oBject);
                        }
                    },
                }
                );
            },
            _Deactivate: function (oData, sPath, oBject) {
                var oPayload = {
                    IsArchived: true,
                };
                oData.update(sPath + "/IsArchived", oPayload, {
                    success: function (mData) {
                        MessageToast.show(" Sucessfully Removed.");
                        oData.refresh();
                    },
                    error: function (data) {
                        var oRespText = JSON.parse(data.responseText);
                        MessageBox.error(oRespText["error"]["message"]["value"]);
                    },
                });
            },
            _EmptyPromise: function (mParam) {
                var oPromise = jQuerry.Deferred();

                oPromise.resolve(mParam)
                return oPromise
            },

            onfilterOfferPainter: function () {
                var oView = this.getView()
                var oModel = oView.getModel("oModelControl3");
                var offerId = oModel.getProperty("/OfferId");
                var oTable = oView.byId("idDelPainterTable");
                oTable.bindItems({
                    path: "/OfferDeselectedPainterSet",
                    template: oView.byId("tblDeSelPainterDepnd"),
                    parameters: {
                        expand: 'Painter',
                    },
                    templateShareable: true,
                    filters: [new Filter("OfferId", FilterOperator.EQ, offerId), new Filter("IsArchived", FilterOperator.EQ, false)],
                    sorter: new Sorter("CreatedAt", false)
                })

            }
            //     fnrebindTable: function (oEvent) {

            //     var oBindingParams = oEvent.getParameter("bindingParams");
            //     oBindingParams.sorter.push(new sap.ui.model.Sorter('Id', true));
            //     oBindingParams.parameters["expand"] = "OfferDeselectedPainter,OfferDeselectedPainter/Painter,OfferDeselectedPainter/Painter/Depot";
            //     var oView = this.getView();
            //     var oModel = oView.getModel("oModelDisplay")
            //     var OfferId = oModel.getProperty("/Id");
            //     console.log(OfferId);
            //     var filter=new Filter({
            //             filters: [
            //                 new Filter({
            //                     filters: [
            //                         new Filter("Id", sap.ui.model.FilterOperator.EQ,OfferId)
            //                     ], and: false
            //                 })
            //             ]
            //         });
            //         oBindingParams.filters.push(filter);
            // },

        } // end 
        );
    }
);
