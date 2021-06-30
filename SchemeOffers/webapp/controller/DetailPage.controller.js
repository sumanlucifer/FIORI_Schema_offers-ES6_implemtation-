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
                    var sExpandParam = "OfferType,CreatedByDetails";

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
                        Buttons: {
                            Redeem: true, // check if its already redeemed
                            SendForApproval: false
                        },
                        Dialog: {
                            Remarks: "",
                            OfferStatus: "",
                        }
                    };
                    var oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "oModelControl3");
                    //oView.byId("idIconTabBar").setSelectedKey("0");
                    if (sMode === "edit") {
                        this.handleEditPress();
                    } else {
                        this._initData(oProp);
                    }
                },
                _initData: function (oProp) {
                    var oData = {
                        modeEdit: false,
                        bindProp: "OfferSet(" + oProp + ")",
                        HasTillDate: true,
                        ImageLoaded: false,
                        mode: "display",
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
                            BrReqCash: 0
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
                        },
                        OfferType: {},
                        oData: {
                            Products: [],
                            Packs: [],
                            PerGrowth: [{
                                    Name: "1"
                                },
                                {
                                    Name: "2"
                                },
                                {
                                    Name: "3"
                                },
                                {
                                    Name: "4"
                                },
                                {
                                    Name: "5"
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
                            RewardRationCount: 1
                        },
                    };
                    var oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "oModelControl2");

                    var othat = this;
                    var c1, c1b, c2, c2b, c3, c4, c5, c6, c7, c8;
                    var oView = this.getView();

                    c1 = this._loadEditProfile("Display");
                    c1.then(function () {
                        c1b = othat._CheckLoginData();
                        c1b.then(function () {
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
                                                    c7.then(function () {
                                                        c8 = othat._CheckAttachment();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                })
                            });
                        })
                    }); //c1.then
                    this._toggleButtonsAndView(false);
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
                    var oLoginData = oLoginModel.getData()

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
                                            oControlModel.setProperty("/LoggedInUser", data["results"][0]);


                                        }
                                    }
                                    resolve();
                                },
                            });
                        })

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
                    var oData = oView.getModel();

                    var sPath = "/MasterOfferTypeSet(" + oFFerTypeId + ")";

                    oData.read(sPath, {
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
                _getInitData: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oModelControl2 = oView.getModel("oModelControl2");
                    var sPath = oModelControl2.getProperty("/bindProp");
                    var othat = this;
                    var exPand =
                        "OfferZone,OfferDepot,OfferDivision,OfferApplicableProductCategory,OfferApplicableProductClassification,OfferApplicableProduct,OfferApplicablePack,OfferRewardRatio," +
                        "OfferPainterType,OfferPainterArcheType,OfferPainterPotential,OfferBuyerProductCategory,OfferBuyerProductClassification,OfferBuyerProduct,OfferBuyerPack,OfferNonBuyerProductCategory," +
                        "OfferNonBuyerProductClassification,OfferNonBuyerProduct,OfferNonBuyerPack," +
                        "OfferBonusProductCategory,OfferBonusProductClassification,OfferBonusProduct,OfferBonusPack," +
                        "OfferBonusRewardRatio/Product,OfferBonusRewardRatio/Pack,OfferSpecificPainter/Painter,ParentOffer";
                    return new Promise((resolve, reject) => {
                        oView.getModel().read("/" + sPath, {
                            urlParameters: {
                                $expand: exPand,
                            },
                            success: function (data) {
                                var oModel = new JSONModel(data);
                                othat.getView().setModel(oModel, "oModelDisplay")
                                resolve(data);
                            },
                            error: function () {
                                reject();
                            },
                        });

                    })


                },
                _setViewData2: function (oData) {
                    var promise = jQuery.Deferred();

                    var oView = this.getView();
                    var oModelControl2 = oView.getModel("oModelControl2");
                    var Table1 = [],
                        Table2 = [];

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
                        Painters = [];
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
                                DepotId: x["DepotId"]
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
                            AppProd1.push(x["ProductCode"]);
                        }
                    }
                    oModelControl2.setProperty("/MultiCombo/AppProd1", AppProd1);

                    if (oData["OfferApplicablePack"]["results"].length > 0) {
                        for (var x of oData["OfferApplicablePack"]["results"]) {
                            AppPacks1.push(x["SkuCode"]);
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
                            AppProd2.push(x["ProductCode"]);
                        }
                    }
                    oModelControl2.setProperty("/MultiCombo/AppProd2", AppProd2);

                    if (oData["OfferBuyerPack"]["results"].length > 0) {
                        for (var x of oData["OfferBuyerPack"]["results"]) {
                            AppPacks2.push(x["SkuCode"]);
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
                            AppProd3.push(x["ProductCode"]);
                        }
                    }
                    oModelControl2.setProperty("/MultiCombo/AppProd3", AppProd3);

                    if (oData["OfferNonBuyerPack"]["results"].length > 0) {
                        for (var x of oData["OfferNonBuyerPack"]["results"]) {
                            AppPacks3.push(x["SkuCode"]);
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
                            AppProd4.push(x["ProductCode"]);
                        }
                    }
                    oModelControl2.setProperty("/MultiCombo/AppProd4", AppProd4);

                    if (oData["OfferBonusPack"]["results"].length > 0) {
                        for (var x of oData["OfferBonusPack"]["results"]) {
                            AppPacks4.push(x["SkuCode"]);
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
                    var c1, c2, c3, c4, c5, c6, c7, c8, c9, c10;
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
                                        c6 = othat._setAdditionalData2(data);
                                        c6.then(function (oData) {
                                            c7 = othat._OfferTypeValidation2(data);
                                            c7.then(function (data) {
                                                c8 = othat._CheckEditImage(data);
                                                c8.then(function (data) {
                                                    c9 = othat._getLoggedInUserDeatils(data);
                                                    c9.then(function (data) {
                                                        c10 = othat._destroyDialogs();
                                                        //_destroyDialogs
                                                    })
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                        //othat.getView().getModel("oModelView").refresh(true);
                    });


                    // this._initSaveModel();
                },
                _setAdditionalData2: function (oData) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
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
                    promise.resolve(oData);
                    return promise;
                },
                _OfferTypeValidation2: function (oData) {
                    var oFFerTypeId = oData["OfferTypeId"];
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var oData = oView.getModel();

                    var sPath = "/MasterOfferTypeSet(" + oFFerTypeId + ")";

                    oData.read(sPath, {
                        success: function (data) {
                            oModel.setProperty("/OfferType", data);
                            oModel.refresh();
                            this._OfferTypeFieldsSet();
                        }.bind(this),
                    });
                    promise.resolve(oData);
                    return promise;
                },
                _CheckEditImage: function (oData) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelControl = this.getView().getModel("oModelControl");
                    var oProp = oView.getModel("oModelControl3").getProperty("/bindProp");
                    var sImageUrl =
                        "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
                    jQuery
                        .get(sImageUrl)
                        .done(function () {
                            oModelControl.setProperty("/ImageLoaded", true);
                        })
                        .fail(function () {
                            oModelControl.setProperty("/ImageLoaded", false);
                        });

                    promise.resolve(oData);
                    return promise;
                },
                _GetInitEditData: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oModelControl2 = oView.getModel("oModelControl3");
                    var sPath = oModelControl2.getProperty("/bindProp");
                    var othat = this;
                    var exPand =
                        "OfferZone,OfferDepot,OfferDivision,OfferApplicableProductCategory,OfferApplicableProductClassification,OfferApplicableProduct/Product,OfferApplicablePack/Pack,OfferRewardRatio," +
                        "OfferPainterType,OfferPainterArcheType,OfferPainterPotential,OfferBuyerProductCategory,OfferBuyerProductClassification,OfferBuyerProduct/Product,OfferBuyerPack/Pack,OfferNonBuyerProductCategory," +
                        "OfferNonBuyerProductClassification,OfferNonBuyerProduct/Product,OfferNonBuyerPack/Pack," +
                        "OfferBonusProductCategory,OfferBonusProductClassification,OfferBonusProduct/Product,OfferBonusPack/Pack," +
                        "OfferBonusRewardRatio,OfferSpecificPainter/Painter,ParentOffer";
                    oView.getModel().read("/" + sPath, {
                        urlParameters: {
                            $expand: exPand
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
                        ImageLoaded: false,
                        mode: "edit",
                        BonusValidity: oBonusValidity,
                        modeEdit: false,
                        StartDate: "",
                        EndDate: "",
                        MinDate: new Date(),
                        LoggedInUser: {},
                        OfferType: {
                            BasicInformation: true,
                            ApplicableProducts: true,
                            RewardRatio: true,
                            ApplicablePainters: true,
                            ApplicablePainterProducts: true,
                            AdditionalReward: true,
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
                            BrReqCash: 0
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
                        },
                        oData: {
                            Products: [],
                            Packs: [],
                            PerGrowth: [{
                                    Name: "1"
                                },
                                {
                                    Name: "2"
                                },
                                {
                                    Name: "3"
                                },
                                {
                                    Name: "4"
                                },
                                {
                                    Name: "5"
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
                            PainterCount: ""
                        },
                    };
                    var oConrtrolModel = new JSONModel(oDataControl);
                    oView.setModel(oConrtrolModel, "oModelControl");
                    var oModelView = new JSONModel(oData);
                    oView.setModel(oModelView, "oModelView");
                    console.log(oConrtrolModel);
                    //oModelView.refresh()
                    this._getProductsData();
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
                                DepotId: x["DepotId"]
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
                    var c1, c2, c3, c4, c5, c5A, c6, c7;
                    var othat = this;

                    c1 = othat._CreatePayloadPart1();
                    //Create PayLoadPart1 Removing the 1.empty values 2. Converting the Values into Ineger;s
                    // Create the Payload 2 in this we set the Bolean Values of All/Specific to the respective backend fields;
                    // _CreatePayloadPart3 this is used to set the value of the elements in the array
                    // create payload 4 and 5 used for table 1,2 and table 3,4
                    //othat._CreatePayloadPart2();othat._UploadFile(mParam1, bFileFlag);
                    c1.then(function (oPayload) {
                        c2 = othat._CreatePayloadPart2(oPayload);
                        c2.then(function (oPayload) {
                            c3 = othat._CreatePayloadPart3(oPayload);
                            c3.then(function (oPayLoad) {
                                c4 = othat._CreatePayLoadPart4(oPayLoad);
                                c4.then(function (oPayLoad) {
                                    //c5 = othat._CreateOffer(oPayLoad);
                                    c5 = othat._CreatePayLoadPart5(oPayLoad);
                                    c5.then(function (oPayLoad) {
                                        c5A = othat._CreateWorkFlowData(oPayLoad);
                                        c5A.then(function () {
                                            c6 = othat._CreateOffer(oPayLoad);
                                            c6.then(function (oPayLoad) {
                                                c7 = othat._UploadFile(oPayLoad, bFileFlag);
                                                c7.then(function (data) {
                                                    othat.handleCancelPress(data);
                                                });
                                            });
                                        })
                                    });
                                });
                            });
                        });
                    });
                },
                _CreateOffer: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var othat = this;
                    var oView = this.getView();
                    var oDataModel = oView.getModel();
                    var oProp = oView.getModel("oModelControl3").getProperty("/bindProp");
                    console.log(oPayLoad);

                    return new Promise((resolve, reject) => {
                        oDataModel.update("/" + oProp, oPayLoad, {
                            success: function (data) {
                                MessageToast.show("Offer Successfully Updated.");
                                othat._navToHome();
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

                _reLoadInitData: function () {},

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
                    jQuery
                        .get(sImageUrl)
                        .done(function () {
                            oModelControl.setProperty("/ImageLoaded", true);
                        })
                        .fail(function () {
                            oModelControl.setProperty("/ImageLoaded", false);
                        });

                    promise.resolve();
                    return promise;
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
                        error: function () {},
                    });
                },
                onIcnTbarChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    if (sKey == "1") {
                        oView.byId("PainteTable1").rebindTable();
                    } else if (sKey == "2") {
                        oView.byId("PainteTable2").rebindTable();
                    }
                },

                onBeforeBindPainterTable1: function (oEvent) {
                    var oView = this.getView();
                    var sOfferId = oView.getModel("oModelControl3").getProperty("/OfferId");
                    var aFilter = [];
                    var aFilter1 = new Filter(
                        [
                            new Filter(
                                "ProgressStatus",
                                FilterOperator.EQ,
                                "STARTED"
                            ),
                            new Filter(
                                "ProgressStatus",
                                FilterOperator.EQ,
                                "COMPLETED"
                            )
                        ],
                        false
                    )

                    var aFilter2 = new Filter("OfferId", FilterOperator.EQ, parseInt(sOfferId));
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
                    var sOfferId = oView.getModel("oModelControl3").getProperty("/OfferId");
                    var aFilter = [];
                    var aFilter1 = new Filter(
                        "RedemptionStatus",
                        FilterOperator.EQ,
                        "REDEEMED"
                    );
                    var aFilter2 = new Filter("OfferId", FilterOperator.EQ, parseInt(sOfferId));
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
                onApplyRedemption: function () {
                    var othat = this;
                    MessageBox.confirm(
                        "Are you sure you want to redeem the offer", {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    othat._onOfferRedeem();
                                }
                            },
                        }
                    );



                },
                _onOfferRedeem: function () {
                    var oView = this.getView();
                    var othat = this;
                    var oModelControl = oView.getModel("oModelControl3")
                    var sOfferId = oModelControl.getProperty("/OfferId");
                    var oData = oView.getModel();

                    oData.read("/RedeemOfferRewardForAllPainter", {
                        urlParameters: {
                            OfferId: sOfferId
                        },
                        success: function (oData) {

                            // oModelControl.setProperty("/Buttons/Redeem",false)
                            // oModelControl.refresh(true);
                            MessageToast.show("Offer Successfully Redeemed.")
                        },
                        error: function () {
                            MessageBox.error("Unable to redeem to the offer because of server error.")
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
                        error: function () {},
                    });
                },
                onOpenRemarksDialog: function (oEvent) {
                    //open the dialog
                    var othat = this;
                    var oView = this.getView();
                    var oModelC = oView.getModel("oModelControl3");
                    oModelC.setProperty("/Dialog/OfferStatus", oEvent);
                    oModelC.setProperty("/Dialog/Remarks", "");
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
                    var oValidate = new Validator()
                    var bFlagValidate = oValidate.validate(oForm, true);
                    if (!bFlagValidate) {
                        MessageToast.show("Kindly fill all the mandatory fields to continue.");
                        return;
                    }

                    var oData = oView.getModel();
                    var oPayload = this.getView().getModel("oModelDisplay").getData();
                    var oModelC = oView.getModel("oModelControl3");
                    var sOfferStatus = oModelC.getProperty("/Dialog/OfferStatus");
                    var sRemark = oModelC.getProperty("/Dialog/Remarks");
                    var oNewPayLoad = Object.assign({}, oPayload);
                    oNewPayLoad["Remark"] = sRemark;
                    // if the offer status if 
                    if (sOfferStatus === "PUBLISHED" || sOfferStatus === "PENDING" || sOfferStatus === "APPROVED" || sOfferStatus === "REJECTED") {
                        oNewPayLoad["OfferStatus"] = sOfferStatus;
                        if (sOfferStatus === "PUBLISHED") {
                            oNewPayLoad["IsPublished"] = true
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
                    }else {
                         oNewPayLoad["IsWorkFlowApplicable"] = false;
                    }

                    console.log(oNewPayLoad);
                    var sPath = oView.getModel("oModelControl3").getProperty("/bindProp");
                    oData.update("/" + sPath, oNewPayLoad, {
                        success: function () {
                            this._RemarksDialog2.close();
                            MessageToast.show("Offer Successfully Updated.");
                            this._navToHome();

                        }.bind(this),
                        error: function () {
                            this._RemarksDialog2.close();
                            MessageBox.error("Unable to update the offer.");
                        }.bind(this)
                    })

                },
                onEscalate: function () {
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oPayload = this.getView().getModel("oModelDisplay").getData();
                    var oNewPayLoad = Object.assign({}, oPayload);
                    oNewPayLoad["InitiateForceTat"] = true;
                    var sPath = oView.getModel("oModelControl3").getProperty("/bindProp");
                    oData.update("/" + sPath, oNewPayLoad, {
                        success: function () {
                            MessageToast.show("Offer Successfully Escalated.");
                            this._navToHome();

                        }.bind(this),
                        error: function () {
                            MessageBox.error("Unanle to update the offer.");
                        }
                    })
                }
            }
        );
    }
);