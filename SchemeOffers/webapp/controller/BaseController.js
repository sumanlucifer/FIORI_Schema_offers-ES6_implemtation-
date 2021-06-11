// @Base Controller
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/BusyIndicator",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/routing/History",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "com/knpl/pragati/SchemeOffers/controller/Validator"
    ],
    function (
        Controller,
        BusyIndicator,
        Filter,
        FilterOperator,
        History,
        JSONModel,
        Fragment,
        MessageBox,
        MessageToast,
        Validator
    ) {
        "use strict";

        return Controller.extend(
            "com.knpl.pragati.SchemeOffers.controller.BaseController",
            {
                /**
                 * Convenience method for accessing the router.
                 * @public
                 * @returns {sap.ui.core.routing.Router} the router for this component
                 */
                getRouter: function () {
                    return sap.ui.core.UIComponent.getRouterFor(this);
                },

                addContentDensityClass: function () {
                    return this.getView().addStyleClass(
                        this.getOwnerComponent().getContentDensityClass()
                    );
                },
                /**
                 * Convenience method for getting the view model by name.
                 * @public
                 * @param {string} [sName] the model name
                 * @returns {sap.ui.model.Model} the model instance
                 */
                getViewModel: function (sName) {
                    return this.getView().getModel(sName);
                },

                getComponentModel: function () {
                    return this.getOwnerComponent().getModel();
                },

                /**
                 * Convenience method for setting the view model.
                 * @public
                 * @param {sap.ui.model.Model} oModel the model instance
                 * @param {string} sName the model name
                 */
                setModel: function (oModel, sName) {
                    return this.getView().setModel(oModel, sName);
                },

                /**
                 * Getter for the resource bundle.
                 * @public
                 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
                 */
                getResourceBundle: function () {
                    return this.getOwnerComponent().getModel("i18n").getResourceBundle();
                },

                //for controlling global busy indicator
                presentBusyDialog: function () {
                    BusyIndicator.show();
                },

                dismissBusyDialog: function () {
                    BusyIndicator.hide();
                },

                onPressBreadcrumbLink: function () {
                    this._navToHome();
                },

                _navToHome: function () {
                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();
                    this._destroyDialogs();
                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteLandingPage", {}, true);
                    }

                },

                onPostSchemeData: function (oPayload, fileFlag) { },
                onStartDateChange: function (oEvent) {

                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oModelView = oView.getModel("oModelView");
                    var oStartDate = oEvent.getSource().getDateValue();
                    var oEndDate = oModelView.getProperty("/EndDate");
                    if (oEndDate) {
                        if (oStartDate > oEndDate) {
                            MessageToast.show("Kinldy select a date less than end date.");
                            oModelControl.setProperty("/StartDate", "");
                            oModelView.setProperty("/StartDate", null);
                        }
                    }
                    if (oStartDate < new Date().setHours(0, 0, 0, 0)) {
                        MessageToast.show(
                            "Kindly enter a date greater than or equal to current date"
                        );
                        oModelControl.setProperty("/StartDate", "");
                        oModelView.setProperty("/StartDate", null);
                    }
                },
                onEndDateChange: function (oEvent) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oModelView = oView.getModel("oModelView");
                    var oEndDate = oEvent.getSource().getDateValue();
                    var oStartDate = oModelView.getProperty("/StartDate");
                    if (oStartDate >= oEndDate) {
                        MessageToast.show("Kinldy select a date more than start date.");
                        oModelControl.setProperty("/EndDate", "");
                        oModelView.setProperty("/EndDate", null);
                    }
                },

                onOfferTypeChanged: function (oEvent) {
                    var oView = this.getView();
                    var oSource = oEvent.getSource().getSelectedItem();
                    var object = oSource.getBindingContext().getObject();
                    var oModelControl = oView.getModel("oModelControl");
                    oModelControl.setProperty("/OfferType", object);
                    this._OfferTypeFieldsSet();
                },

                _OfferTypeFieldsSet: function () {
                    // disabling all the fields that we have to hide.
                    var oView = this.getView();
                    console.log("offer type valdidation trigerred");
                    var oModelControl = oView.getModel("oModelControl");
                    var oOfferType = oView
                        .getModel("oModelControl")
                        .getProperty("/OfferType");
                    var othat = this;
                    for (var a in oOfferType) {
                        if (!oOfferType[a]) {
                            if (a === "ApplicablePainters") {
                                othat._propertyToBlank(
                                    [
                                        "MultiCombo/ArcheTypes",
                                        "MultiCombo/PainterType",
                                        "MultiCombo/Potential",
                                        "MultiCombo/Zones",
                                        "MultiCombo/Divisions",
                                        "MultiCombo/Depots",
                                        "MultiEnabled/Zones",
                                        "MultiEnabled/Division",
                                        "MultiEnabled/Depots",
                                    ],
                                    true
                                );
                                othat._RbtnReset([
                                    "Rbtn/Zones",
                                    "Rbtn/Division",
                                    "Rbtn/Depots",
                                    "Rbtn/AppPainter",
                                ]);
                            } else if (a === "ApplicablePainterProducts") {
                                othat._propertyToBlank(
                                    [
                                        "MultiCombo/PCat2",
                                        "MultiCombo/PClass2",
                                        "MultiCombo/AppProd2",
                                        "MultiCombo/AppPacks2",
                                        "MultiCombo/PCat3",
                                        "MultiCombo/PClass3",
                                        "MultiCombo/AppProd3",
                                        "MultiCombo/AppPacks3",
                                    ],
                                    true
                                );
                                othat._RbtnReset([
                                    "Rbtn/Zones",
                                    "Rbtn/PCat2",
                                    "Rbtn/PClass2",
                                    "Rbtn/AppProd2",
                                    "Rbtn/AppPacks2",
                                    "Rbtn/PCat3",
                                    "Rbtn/PClass3",
                                    "Rbtn/AppProd3",
                                    "Rbtn/AppPacks3",
                                ]);
                            } else if (a === "AdditionalReward") {
                                othat._propertyToBlank(
                                    [
                                        "MultiCombo/PCat4",
                                        "MultiCombo/PClass4",
                                        "MultiCombo/AppProd4",
                                        "MultiCombo/AppPacks4",
                                        "Table/Table4",
                                    ],
                                    true
                                );
                                othat._RbtnReset([
                                    "Rbtn/PCat4",
                                    "Rbtn/PClass4",
                                    "Rbtn/AppProd4",
                                    "Rbtn/AppPacks4",
                                ]);
                                oModelControl.setProperty("/Table/Table3", [
                                    {
                                        StartDate: null,
                                        EndDate: null,
                                        BonusPoints: "",
                                    },
                                ]);
                            }
                        }
                    }
                },
                onMultyZoneChange: function (oEvent) {
                    var sKeys = oEvent.getSource().getSelectedKeys();
                    var oDivision = this.getView().byId("idDivision");
                    var aDivFilter = [];
                    for (var y of sKeys) {
                        aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y));
                    }
                    oDivision.getBinding("items").filter(aDivFilter);
                },
                _CheckAreaChange: function () {
                    var oView = this.getView();
                    var sZone = oView.byId("idZones");
                    var sZoneKey = sZone.getSelectedKeys();
                    var oDivision = oView.byId("idDivisions");
                    var aDivisioKeys = oDivision.getSelectedKeys();
                    var oDivisionItems = oDivision.getSelectedItems();

                    var oDivObj;

                    // check the division if its there for all the zones selected
                    for (var j of oDivisionItems) {
                        oDivObj = j.getBindingContext().getObject();
                        if (sZoneKey.indexOf(oDivObj["Zone"]) < 0) {
                            oDivision.removeSelectedItem(j); f
                        }
                    }
                    // check for the depot tokens
                    var oDepot = oView.byId("idDepots");
                    var aTokens = oDepot.getTokens();
                    var oModelControl = oView.getModel("oModelControl");
                    var aTokenKeys = oModelControl.getProperty("/MultiCombo/Depots");
                    var oNewDivisionKeys = oDivision.getSelectedKeys();
                    var aDepotToken = [];
                    for (var k in aTokenKeys) {
                        if (oNewDivisionKeys.indexOf(aTokenKeys[k]["Division"]) >= 0) {
                            aDepotToken.push(aTokenKeys[k]);
                        }
                    }
                    oModelControl.setProperty("/MultiCombo/Depots", aDepotToken);
                },
                onRbPrntOffer: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedIndex();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var oModel2 = oView.getModel("oModelView");
                    if (sKey === 0) {
                        oModel.setProperty("/Fields/ParentOfferTitle", "");
                        oModel2.setProperty("/ParentOfferId", 0);
                    }
                },

                onProd1Change: function (oEvent) {
                    var oSource = oEvent.getSource();
                    var sKeys = oSource.getSelectedKeys();
                    var aPackFilter = [];
                    var oPacks = this.getView().byId("AppPacks1");

                    for (var y of sKeys) {
                        aPackFilter.push(new Filter("ProductCode", FilterOperator.EQ, y));
                    }
                    oPacks.getBinding("items").filter(aPackFilter);

                    this._fnChangeProdPacks({
                        src: { path: "/MultiCombo/AppProd1" },
                        target: {
                            localPath: "/MultiCombo/AppPacks1",
                            oDataPath: "/MasterRepProductSkuSet",
                            key: "ProductCode",
                        },
                    });
                    this._CreateRewardTableData();
                },
                _fnChangeProdPacks: function (oChgdetl) {
                    var oView = this.getView();
                    var aSource = oView
                        .getModel("oModelControl")
                        .getProperty(oChgdetl.src.path),
                        oSourceSet = new Set(aSource);

                    var aTarget = oView
                        .getModel("oModelControl")
                        .getProperty(oChgdetl.target.localPath),
                        aNewTarget = [];

                    var oModel = this.getView().getModel(),
                        tempPath,
                        tempdata;

                    aTarget.forEach(function (ele) {
                        if (typeof ele === "string") {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                SkuCode: ele["Id"],
                            });
                        } else {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                SkuCode: ele[oChgdetl.target.targetKey],
                            });
                        }
                        tempdata = oModel.getData(tempPath);
                        if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                            aNewTarget.push(ele);
                        }
                    });

                    oView
                        .getModel("oModelControl")
                        .setProperty(oChgdetl.target.localPath, aNewTarget);
                },
                _fnChangeDivDepot: function (oChgdetl) {
                    var oView = this.getView();
                    var aSource = oView
                        .getModel("oModelControl")
                        .getProperty(oChgdetl.src.path),
                        oSourceSet = new Set(aSource);

                    var aTarget = oView
                        .getModel("oModelControl")
                        .getProperty(oChgdetl.target.localPath),
                        aNewTarget = [];

                    var oModel = this.getView().getModel(),
                        tempPath,
                        tempdata;

                    aTarget.forEach(function (ele) {
                        if (typeof ele === "string") {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                Id: ele,
                            });
                        } else {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                Id: ele[oChgdetl.target.targetKey],
                            });
                        }
                        tempdata = oModel.getData(tempPath);
                        if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                            aNewTarget.push(ele);
                        }
                    });

                    oView
                        .getModel("oModelControl")
                        .setProperty(oChgdetl.target.localPath, aNewTarget);
                },
                onBRAppDropChange: function () {
                    this._CreateBonusRewardTable();
                },
                onRbRewardRatio: function () {
                    this._CreateRewardTableData();
                },
                onBRRbChange: function () {
                    this._CreateBonusRewardTable();
                },
                onPressAddGenericReward2: function (oEvent) {
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelControl");
                    var oBj = {},
                        sPath = "";
                    if (oEvent !== "add") {
                        oBj = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getObject();
                        sPath = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getPath()
                            .split("/");
                        oModel.setProperty("/Dialog/Key2", sPath[sPath.length - 1]);
                    } else {
                        oBj = false;
                        oModel.setProperty("/Dialog/Key2", "add");
                    }

                    if (!this._RewardsDialog2) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks2",
                            controller: othat,
                        }).then(
                            function (oDialog) {
                                this._RewardsDialog2 = oDialog;
                                oView.addDependent(this._RewardsDialog2);
                                this._setAddGenericRewardDialog2(oBj);
                                this._RewardsDialog2.open();
                            }.bind(this)
                        );
                    } else {
                        oView.addDependent(this._RewardsDialog2);
                        this._setAddGenericRewardDialog2(oBj);
                        this._RewardsDialog2.open();
                    }
                },
                _setAddGenericRewardDialog2: function (oBj) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oBj1 = oBj;
                    var oBj2 = {
                        StartDate: null,
                        EndDate: null,
                        BonusPoints: "",
                    };
                    var oBj3 = {
                        StartDate: null,
                        EndDate: null,
                        BonusPoints: "",
                    };
                    var oBjFinal;
                    var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks4");
                    if (iRtnSelected === 0) {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                        oModelControl.setProperty(
                            "/Dialog/Bonus2",
                            Object.assign({}, oBjFinal)
                        );

                    } else {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                        oModelControl.setProperty(
                            "/Dialog/Bonus2",
                            Object.assign({}, oBjFinal)
                        );

                    }
                },
                onSubmitGenericRewards2: function () {
                    var oView = this.getView();
                    var oModel2 = oView.getModel("oModelControl");
                    var sKey = oModel2.getProperty("/Dialog/Key2");
                    var oPayload = oModel2.getProperty("/Dialog/Bonus2");
                    var oValidate = new Validator();
                    var oForm = oView.byId("FormAddProdPacks2");
                    var bFlagValidate = oValidate.validate(oForm, true);

                    if (oPayload["StartDate"] == null) {
                        MessageToast.show("Kindly Input Start Date to Continue");
                        return;
                    }
                    if (oPayload["EndDate"] == null) {
                        MessageToast.show("Kindly Input End Date to Continue");
                        return;
                    }
                    if (oPayload["BonusPoints"] === "") {
                        MessageToast.show("Kindly Input Bonus Points to Continue");
                        return;
                    }
                    if (!bFlagValidate) {
                        MessageToast.show("Kindly enter the fields in proper format.");
                        return;
                    }

                    var oPayloadNew = Object.assign({}, oPayload);
                    if (sKey === "add") {
                        oModel2.getProperty("/Table/Table3").push(oPayloadNew);
                    } else {
                        oModel2
                            .getProperty("/Table/Table3")
                            .splice(parseInt(sKey), 1, oPayloadNew);
                    }

                    oModel2.refresh(true);
                    this._RewardsDialog2.close();
                },
                onRemovedGenericReward2: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getPath()
                        .split("/");

                    var oTable = oModel.getProperty("/Table/Table3");

                    oTable.splice(sPath[sPath.length - 1], 1);
                    oModel.refresh(true);
                },
                onPressAddRewards2: function (oEvent) {
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelControl");
                    var oBj = {},
                        sPath = "";
                    if (oEvent !== "add") {
                        oBj = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getObject();
                        sPath = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getPath()
                            .split("/");
                        oModel.setProperty("/Dialog/Key2", sPath[sPath.length - 1]);
                    } else {
                        oBj = false;
                        oModel.setProperty("/Dialog/Key2", "add");
                    }

                    if (!this._RewardsDialog2) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks2",
                            controller: othat,
                        }).then(
                            function (oDialog) {
                                this._RewardsDialog2 = oDialog;
                                oView.addDependent(this._RewardsDialog2);
                                this._setAddRewardDialog2(oBj);
                                this._RewardsDialog2.open();
                            }.bind(this)
                        );
                    } else {
                        oView.addDependent(this._RewardsDialog2);
                        this._setAddRewardDialog2(oBj);
                        this._RewardsDialog2.open();
                    }
                },
                _setAddRewardDialog2: function (oBj) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oBj1 = oBj;
                    var oBj2 = {
                        ProductCode: "",
                        StartDate: null,
                        EndDate: null,
                        BonusPoints: "",
                    };
                    var oBj3 = {
                        SkuCode: "",
                        StartDate: null,
                        EndDate: null,
                        BonusPoints: "",
                    };
                    var oBjFinal;
                    var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks4");
                    if (iRtnSelected === 0) {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                        oModelControl.setProperty(
                            "/Dialog/Bonus2",
                            Object.assign({}, oBjFinal)
                        );
                        this._setBRProductsData();
                    } else {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                        oModelControl.setProperty(
                            "/Dialog/Bonus2",
                            Object.assign({}, oBjFinal)
                        );
                        this._setBRPacksData();
                    }
                },
                onSubmitRewards2: function () {
                    var oView = this.getView();

                    var oModel2 = oView.getModel("oModelControl");
                    var sKey = oModel2.getProperty("/Dialog/Key2");
                    var oPayload = oModel2.getProperty("/Dialog/Bonus2");
                    var oValidate = new Validator();
                    var oForm = oView.byId("FormAddProdPacks2");
                    var bFlagValidate = oValidate.validate(oForm, true);


                    if (oPayload.hasOwnProperty("SkuCode")) {
                        if (oPayload["SkuCode"] === "") {
                            MessageToast.show("Kindly Select a Pack To Continue.");
                            return;
                        }
                    }
                    if (oPayload.hasOwnProperty("ProductCode")) {
                        if (oPayload["ProductCode"] === "") {
                            MessageToast.show("Kindly Select a Product To Continue.");
                            return;
                        }

                    }
                    if (oPayload["StartDate"] == null) {
                        MessageToast.show("Kindly Input Start Date to Continue");
                        return;
                    }
                    if (oPayload["EndDate"] == null) {
                        MessageToast.show("Kindly Input End Date to Continue");
                        return;
                    }
                    if (oPayload["BonusPoints"] === "") {
                        MessageToast.show("Kindly Input Bonus Points to Continue");
                        return;
                    }
                    if (!bFlagValidate) {
                        MessageToast.show("Kindly enter the fields in proper format.");
                        return;
                    }
                    var oPayloadNew = Object.assign({}, oPayload);
                    if (sKey === "add") {
                        oModel2.getProperty("/Table/Table4").push(oPayloadNew);
                    } else {
                        oModel2
                            .getProperty("/Table/Table4")
                            .splice(parseInt(sKey), 1, oPayloadNew);
                    }

                    oModel2.refresh();
                    this._RewardsDialog2.close();
                },
                onRemovedReward2: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getPath()
                        .split("/");

                    var oTable = oModel.getProperty("/Table/Table4");

                    oTable.splice(sPath[sPath.length - 1], 1);
                    oModel.refresh();
                },
                onPressAddGenericRewards: function (oEvent) {
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelControl");
                    var oBj = {},
                        sPath = "";
                    if (oEvent !== "add") {
                        oBj = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getObject();
                        sPath = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getPath()
                            .split("/");
                        oModel.setProperty("/Dialog/Key1", sPath[sPath.length - 1]);
                    } else {
                        oBj = false;
                        oModel.setProperty("/Dialog/Key1", "add");
                    }

                    if (!this._RewardsDialog1) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks",
                            controller: othat,
                        }).then(
                            function (oDialog) {
                                this._RewardsDialog1 = oDialog;
                                oView.addDependent(this._RewardsDialog1);
                                this._setAddGenericRewardDialog(oBj);
                                this._RewardsDialog1.open();
                            }.bind(this)
                        );
                    } else {
                        oView.addDependent(this._RewardsDialog1);
                        this._setAddGenericRewardDialog(oBj);
                        this._RewardsDialog1.open();
                    }
                },
                _setAddGenericRewardDialog: function (oBj) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oBj1 = oBj;
                    var oBj2 = {
                        RequiredVolume: "",
                        RequiredPoints: "",
                        RewardPoints: "",
                        // RewardGiftId: "",
                        RewardCash: "",
                    };
                    var oBj3 = {
                        RequiredVolume: "",
                        RequiredPoints: "",
                        RewardPoints: "",
                        // RewardGiftId: "",
                        RewardCash: "",
                    };
                    var oBjFinal;
                    var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks1");
                    if (iRtnSelected === 0) {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                        oModelControl.setProperty(
                            "/Dialog/Bonus1",
                            Object.assign({}, oBjFinal)
                        );

                    } else {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                        oModelControl.setProperty(
                            "/Dialog/Bonus1",
                            Object.assign({}, oBjFinal)
                        );

                    }
                },
                onSubmitGenericRewards1: function () {
                    var oView = this.getView();

                    var oModel2 = oView.getModel("oModelControl");
                    var sKey = oModel2.getProperty("/Dialog/Key1");
                    var oPayload = oModel2.getProperty("/Dialog/Bonus1");
                    var oValidate = new Validator();
                    var oForm = oView.byId("FormAddProdPacks");
                    var bFlagValidate = oValidate.validate(oForm, true);
                    if (!oPayload["RequiredVolume"] && !oPayload["RequiredPoints"]) {
                        MessageToast.show("Kindly Input atleast Required Volume or Required Points to Continue.");
                        return;
                    }
                    if (oPayload["RewardPoints"] == "") {
                        MessageToast.show("Kindly Input Reward Points to Continue.");
                        return;
                    }
                    if (!bFlagValidate) {
                        MessageToast.show("Kindly enter the fields in proper format.");
                        return;
                    }
                    var oPayloadNew = Object.assign({}, oPayload);
                    if (sKey === "add") {
                        oModel2.getProperty("/Table/Table1").push(oPayloadNew);
                    } else {
                        oModel2
                            .getProperty("/Table/Table1")
                            .splice(parseInt(sKey), 1, oPayloadNew);
                    }


                    this._RewardsDialog1.close();
                    oModel2.refresh(true);
                },
                onRemovedGenericReward: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getPath()
                        .split("/");

                    var oTable = oModel.getProperty("/Table/Table1");

                    oTable.splice(sPath[sPath.length - 1], 1);
                    oModel.refresh(true);
                },
                onPressAddRewards: function (oEvent) {
                    var oView = this.getView();
                    var othat = this;
                    var oModel = oView.getModel("oModelControl");
                    var oBj = {},
                        sPath = "";
                    if (oEvent !== "add") {
                        oBj = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getObject();
                        sPath = oEvent
                            .getSource()
                            .getBindingContext("oModelControl")
                            .getPath()
                            .split("/");
                        oModel.setProperty("/Dialog/Key1", sPath[sPath.length - 1]);
                    } else {
                        oBj = false;
                        oModel.setProperty("/Dialog/Key1", "add");
                    }

                    if (!this._RewardsDialog1) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks",
                            controller: othat,
                        }).then(
                            function (oDialog) {
                                this._RewardsDialog1 = oDialog;
                                oView.addDependent(this._RewardsDialog1);
                                this._setAddRewardDialog(oBj);
                                this._RewardsDialog1.open();
                            }.bind(this)
                        );
                    } else {
                        oView.addDependent(this._RewardsDialog1);
                        this._setAddRewardDialog(oBj);
                        this._RewardsDialog1.open();
                    }
                },
                _setAddRewardDialog: function (oBj) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oBj1 = oBj;
                    var oBj2 = {
                        ProductCode: "",
                        RequiredVolume: "",
                        RequiredPoints: "",
                        RewardPoints: "",
                        //RewardGiftId: "",
                        RewardCash: "",
                    };
                    var oBj3 = {
                        SkuCode: "",
                        RequiredVolume: "",
                        RequiredPoints: "",
                        RewardPoints: "",
                        //RewardGiftId: "",
                        RewardCash: "",
                    };
                    var oBjFinal;
                    var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks1");
                    if (iRtnSelected === 0) {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj2;
                        oModelControl.setProperty(
                            "/Dialog/Bonus1",
                            Object.assign({}, oBjFinal)
                        );
                        this._setProductsData();
                    } else {
                        oBjFinal = oBj1 !== false ? oBj1 : oBj3;
                        oModelControl.setProperty(
                            "/Dialog/Bonus1",
                            Object.assign({}, oBjFinal)
                        );
                        this._setPacksData();
                    }
                },
                onSubmitRewards1: function () {
                    var oView = this.getView();

                    var oModel2 = oView.getModel("oModelControl");
                    var sKey = oModel2.getProperty("/Dialog/Key1");
                    var oPayload = oModel2.getProperty("/Dialog/Bonus1");
                    var oValidate = new Validator();
                    var oForm = oView.byId("FormAddProdPacks");
                    var bFlagValidate = oValidate.validate(oForm, true);

                    if (oPayload.hasOwnProperty("SkuCode")) {
                        if (oPayload["SkuCode"] === "") {
                            MessageToast.show("kindly Select a Pack To Continue.");
                            return;
                        }
                    }
                    if (oPayload.hasOwnProperty("ProductCode")) {
                        if (oPayload["ProductCode"] === "") {
                            MessageToast.show("Kindly Select a Product To Continue.");
                            return;
                        }

                    }
                    if (!oPayload["RequiredVolume"] && !oPayload["RequiredPoints"]) {
                        MessageToast.show("Kindly Input atleast Required Volume or Required Points to Continue.");
                        return;
                    }
                    if (oPayload["RewardPoints"] == "") {
                        MessageToast.show("Kindly Input Reward Points to Continue.");
                        return;
                    }
                    if (!bFlagValidate) {
                        MessageToast.show("Kindly enter the fields in proper format.");
                        return;
                    }
                    var oPayloadNew = Object.assign({}, oPayload);
                    if (sKey === "add") {
                        oModel2.getProperty("/Table/Table2").push(oPayloadNew);
                    } else {
                        oModel2
                            .getProperty("/Table/Table2")
                            .splice(parseInt(sKey), 1, oPayloadNew);
                    }

                    oModel2.refresh();
                    this._RewardsDialog1.close();
                },
                onRemovedReward: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sPath = oEvent
                        .getSource()
                        .getBindingContext("oModelControl")
                        .getPath()
                        .split("/");

                    var oTable = oModel.getProperty("/Table/Table2");

                    oTable.splice(sPath[sPath.length - 1], 1);
                    oModel.refresh();
                },
                onRbChnageMain: function (oEvent) {
                    var oView = this.getView();
                    var oSource = oEvent.getSource();
                    var sKey = oSource.getSelectedIndex();
                    var sPath = oSource.getBinding("selectedIndex").getPath();
                    var sPathArray = sPath.split("/");
                    var oModelControl = oView.getModel("oModelControl");
                    if (sKey == 1) {
                        oModelControl.setProperty("/MultiEnabled/" + sPathArray[2], true);
                    } else {
                        oModelControl.setProperty("/MultiEnabled/" + sPathArray[2], false);
                        this._propertyToBlank(["MultiCombo/" + sPathArray[2]], true);
                    }

                    var aChkTblData = ["PCat1", "PClass1", "AppProd1", "AppPacks1"];
                    var aChkTblData2 = ["PCat4", "PClass4", "AppProd4", "AppPacks4"];
                    if (aChkTblData.indexOf(sPathArray[2]) >= 0) {
                        this._CreateRewardTableData();
                    }
                    if (aChkTblData2.indexOf(sPathArray[2]) >= 0) {
                        this._CreateBonusRewardTable();
                    }
                },

                onRbBonusRewardChange: function (oEvent) { },
                _CreateBonusRewardTable: function () {
                    var oView = this.getView();
                    var othat = this;
                    var oModelControl = oView.getModel("oModelControl");
                    oModelControl.setProperty("/Table/Table4", []);
                    oModelControl.setProperty("/Table/Table3", []);
                    var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks4");
                    var oDataModel = this.getView().getModel();
                    var c1, c2, c3, c4, c5;
                },

                _CreateRewardTableData: function (oEvent) {
                    //check if all or specific table is there or not
                    var oView = this.getView();
                    var othat = this;
                    var oModelControl = oView.getModel("oModelControl");
                    oModelControl.setProperty("/Table/Table2", []);
                    oModelControl.setProperty("/Table/Table1", []);
                    var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks1");
                    var oDataModel = this.getView().getModel();
                    var c1, c2, c3, c4, c5;

                    //   if (sCheckPacks == 0) {
                    //     othat._setProductsData();
                    //   } else {
                    //     othat._setPacksData();
                    //   }
                },
                onRbTable1Change: function (oEvent) {
                    var oView = this.getView();
                    var sKey = oEvent.getSource().getSeleckedIndex();
                    var spath = oEvent.getSource().getBinding("selectedIndex").getPath();
                },

                _setProductsData: function () {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var aSelectedKeys = oModelControl.getProperty("/MultiCombo/AppProd1");
                    var oControl = [];
                    var bRbProd = oModelControl.getProperty("/Rbtn/AppProd1");
                    var aSelectedData = [];
                    if (aSelectedKeys.length <= 0 && bRbProd == 0) {
                        oControl = oModelControl.getProperty("/oData/Products");
                        for (var x of oControl) {
                            aSelectedData.push({
                                Id: x["Id"],
                                Name: x["ProductName"],
                            });
                        }
                    } else {
                        oControl = aSelectedKeys;
                        for (var x of oControl) {
                            aSelectedData.push({
                                Id: x["Id"],
                                Name: x["Name"],
                            });
                        }
                    }

                    oModelControl.setProperty("/MultiCombo/Reward", aSelectedData);
                },
                _setPacksData: function (sKey) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var aSelectedKeys = oModelControl.getProperty(
                        "/MultiCombo/AppPacks1"
                    );

                    var aSelectedData = [],
                        obj;
                    for (var x of aSelectedKeys) {
                        aSelectedData.push({
                            Id: x["Id"],
                            Name: x["Name"],
                        });
                    }
                    oModelControl.setProperty("/MultiCombo/Reward", aSelectedData);
                },
                _setBRProductsData: function () {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var aSelectedKeys = oModelControl.getProperty("/MultiCombo/AppProd4");
                    var oControl = [];
                    var bRbProd = oModelControl.getProperty("/Rbtn/AppProd4");
                    var aSelectedData = [];
                    if (aSelectedKeys.length <= 0 && bRbProd == 0) {
                        oControl = oModelControl.getProperty("/oData/Products");
                        for (var x of oControl) {
                            aSelectedData.push({
                                Id: x["Id"],
                                Name: x["ProductName"],
                            });
                        }
                    } else {
                        oControl = aSelectedKeys;
                        for (var x of oControl) {
                            aSelectedData.push({
                                Id: x["Id"],
                                Name: x["Name"],
                            });
                        }
                    }

                    oModelControl.setProperty("/MultiCombo/Reward2", aSelectedData);
                },
                _setBRPacksData: function (sKey) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var aSelectedKeys = oModelControl.getProperty(
                        "/MultiCombo/AppPacks4"
                    );

                    var aSelectedData = [],
                        obj;
                    for (var x of aSelectedKeys) {
                        aSelectedData.push({
                            Id: x["Id"],
                            Name: x["Name"],
                        });
                    }
                    oModelControl.setProperty("/MultiCombo/Reward2", aSelectedData);
                },
                _getPacksData: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var sPacks = oModelControl.getProperty("/oData/Packs");
                    var oData = oView.getModel();
                    if (sPacks.length > 0) {
                        promise.resolve();
                        return promise;
                    }
                    oData.read("/MasterRepProductSkuSet", {
                        success: function (mParam1) {
                            oModelControl.setProperty("/oData/Packs", mParam1["results"]);
                        },
                        error: function (mParam1) { },
                    });
                    promise.resolve();
                    return promise;
                },
                onValueHelpRequestedPainter: function () {
                    this._PainterMulti = this.getView().byId("Painters");

                    this.oColModel = new JSONModel({
                        cols: [
                            {
                                label: "Membership ID",
                                template: "MembershipCard",
                            },
                            {
                                label: "Name",
                                template: "Name",
                            },
                            {
                                label: "Mobile Number",
                                template: "Mobile",
                            },
                            {
                                label: "Zone",
                                template: "ZoneId",
                            },
                            {
                                label: "Division",
                                template: "DivisionId",
                            },
                            {
                                label: "Depot",
                                template: "Depot/Depot",
                            },
                            {
                                label: "Painter Type",
                                template: "PainterType/PainterType",
                            },
                            {
                                label: "Painter ArcheType",
                                template: "ArcheType/ArcheType",
                            },
                        ],
                    });
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var aCols = this.oColModel.getData().cols;
                    var oFilter = new sap.ui.model.Filter(
                        "IsArchived",
                        sap.ui.model.FilterOperator.EQ,
                        false
                    );
                    var oSearchData = {
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
                        PainterType: "",
                        ArcheType: "",
                        MembershipCard: "",
                        Name: "",
                        Mobile: ""
                    }
                    oModel.setProperty("/Search/PainterVh", oSearchData);
                    if (!this._PainterValueHelp) {
                        this._PainterValueHelp = sap.ui.xmlfragment(
                            "com.knpl.pragati.SchemeOffers.view.fragment.PainterValueHelp",
                            this
                        );
                        this.getView().addDependent(this._PainterValueHelp);

                        this._PainterValueHelp.getTableAsync().then(
                            function (oTable) {
                                oTable.setModel(this.oColModel, "columns");

                                if (oTable.bindRows) {
                                    oTable.bindAggregation("rows", {
                                        path: "/PainterSet",
                                        parameters: { expand: "Depot,PainterType,ArcheType", select: "Id,MembershipCard,Name,Mobile,ZoneId,DivisionId,Depot/Depot,PainterType/PainterType,ArcheType/ArcheType" },
                                        events: {
                                            dataReceived: function () {
                                                this._PainterValueHelp.update();
                                            }.bind(this),
                                        },
                                    });
                                }

                                if (oTable.bindItems) {
                                    oTable.bindAggregation("items", "/PainterSet", function () {
                                        return new sap.m.ColumnListItem({
                                            cells: aCols.map(function (column) {
                                                return new sap.m.Label({
                                                    text: "{" + column.template + "}",
                                                });
                                            }),
                                        });
                                    });
                                }

                                this._PainterValueHelp.update();
                            }.bind(this)
                        );

                        this._PainterValueHelp.setTokens(this._PainterMulti.getTokens());
                        this._PainterValueHelp.open();
                    } else {
                        //this._PainterValueHelp.setTokens(this._PainterMulti.getTokens());
                        this._PainterValueHelp.open();
                    }

                },
                onPainterOkayPress: function (oEvent) {
                    var oData = [];
                    var xUnique = new Set();
                    var aTokens = oEvent.getParameter("tokens");

                    aTokens.forEach(function (ele) {
                        if (xUnique.has(ele.getKey()) == false) {
                            oData.push({
                                PainterName: ele.getText(),
                                PainterId: ele.getKey(),
                            });
                            xUnique.add(ele.getKey());
                        }
                    });

                    this.getView()
                        .getModel("oModelControl")
                        .setProperty("/MultiCombo/Painters", oData);

                    this._PainterValueHelp.close();
                },
                onPainterValueAfterOpen: function () {
                    var aFilter = this._getFilterForPainterValue();
                    this._FilterPainterValueTable(aFilter, "Control");
                },
                _getFilterForPainterValue: function () {
                    var aFilters = [];
                    var aFilter1 = new Filter("IsArchived", FilterOperator.EQ, false);
                    aFilters.push(aFilter1);
                    if (aFilters.length == 0) {
                        return [];
                    }

                    return aFilter1;
                },
                _FilterPainterValueTable: function (oFilter, sType) {
                    var oValueHelpDialog = this._PainterValueHelp;

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
                                    new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DivisionId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter("DepotId", FilterOperator.EQ, oViewFilter[prop])
                                );
                            } else if (prop === "PainterType") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "PainterTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
                                );
                            } else if (prop === "ArcheType") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "ArcheTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
                                );
                            } else if (prop === "MembershipCard") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "MembershipCard", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
                                );
                            } else if (prop === "Name") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Name", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
                                );
                            } else if (prop === "Mobile") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({ path: "Mobile", operator: FilterOperator.Contains, value1: oViewFilter[prop] })
                                );
                            }
                        }
                    }

                    aCurrentFilterValues.push(new Filter({
                        path: "IsArchived",
                        operator: FilterOperator.EQ,
                        value1: false
                    }))
                    aCurrentFilterValues.push(new Filter({
                        path: "RegistrationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEREGISTERED"
                    }))
                    aCurrentFilterValues.push(new Filter({
                        path: "ActivationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEACTIVATED"
                    }))

                    this._FilterPainterValueTable(
                        new Filter({
                            filters: aCurrentFilterValues,
                            and: true,
                        })
                    );
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
                    }))
                    aCurrentFilterValues.push(new Filter({
                        path: "RegistrationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEREGISTERED"
                    }))
                    aCurrentFilterValues.push(new Filter({
                        path: "ActivationStatus",
                        operator: FilterOperator.NotContains,
                        value1: "DEACTIVATED"
                    }));
                    this._FilterPainterValueTable(
                        new Filter({
                            filters: aCurrentFilterValues,
                            and: true,
                        })
                    );
                },
                onZoneChange: function (oEvent) {
                    var oView = this.getView();
                    var oDivision = oView.byId("idDivisions");
                    var sKeys = oEvent.getSource().getSelectedKeys();
                    var aDivFilter = [];
                    for (var y of sKeys) {
                        aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y));
                    }
                    oDivision.getBinding("items").filter(aDivFilter);

                    this._fnChangeDivDepot({
                        src: { path: "/MultiCombo/Zones" },
                        target: {
                            localPath: "/MultiCombo/Divisions",
                            oDataPath: "/MasterDivisionSet",
                            key: "Zone",
                        },
                    });
                    this._fnChangeDivDepot({
                        src: { path: "/MultiCombo/Divisions" },
                        target: {
                            localPath: "/MultiCombo/Depots",
                            oDataPath: "/MasterDepotSet",
                            key: "Division",
                            targetKey: "DepotId",
                        },
                    });
                },
                onDivisionChange: function (oEvent) {
                    // Not requred to set filter for the Depots as this is a valuehelp and filter is applied in onbeforeopen event
                    this._fnChangeDivDepot({
                        src: { path: "/MultiCombo/Divisions" },
                        target: {
                            localPath: "/MultiCombo/Depots",
                            oDataPath: "/MasterDepotSet",
                            key: "Division",
                            targetKey: "DepotId",
                        },
                    });
                },

                onDepotValueHelpOpen: function (oEvent) {
                    this._oMultiInput = this.getView().byId("idDepots");
                    this.oColModel = new JSONModel({
                        cols: [
                            {
                                label: "Depot Id",
                                template: "Id",
                                width: "10rem",
                            },
                            {
                                label: "Depot Name",
                                template: "Depot",
                            },
                        ],
                    });

                    var aCols = this.oColModel.getData().cols;
                    var oView = this.getView();
                    oView.getModel("oModelControl").setProperty("/Search/DepotVh", {
                        DepotId: "",
                        Depot: ""
                    })
                    if (!this._oDepotDialog) {
                        this._oDepotDialog = sap.ui.xmlfragment(
                            "com.knpl.pragati.SchemeOffers.view.fragment.DepotFragment",
                            this
                        );
                        this.getView().addDependent(this._oDepotDialog);

                        this._oDepotDialog.getTableAsync().then(
                            function (oTable) {
                                //		oTable.setModel(this.oProductsModel);
                                oTable.setModel(this.oColModel, "columns");

                                if (oTable.bindRows) {
                                    oTable.bindAggregation("rows", {
                                        path: "/MasterDepotSet",
                                        events: {
                                            dataReceived: function () {
                                                this._oDepotDialog.update();
                                            }.bind(this),
                                        },
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

                                this._oDepotDialog.update();
                            }.bind(this)
                        );

                        this._oDepotDialog.setTokens(this._oMultiInput.getTokens());
                        this._oDepotDialog.open();
                    } else {
                        this._oDepotDialog.open();
                    }

                },
                _destroyDialogs: function () {
                    if (this._DepotDialog) {
                        this._oDepotDialog.destroy();
                        delete this._oDepotDialog;
                    }
                    if (this._PainterValueHelp) {
                        this._PainterValueHelp.destroy();
                        delete this._PainterValueHelp;
                    }
                    // if (this._RewardsDialog1) {
                    //     this._RewardsDialog1.destroy();
                    //     delete this._RewardsDialog1;
                    // } 
                    // if (this._RewardsDialog2) {
                    //     this._RewardsDialog2.destroy();
                    //     delete this._RewardsDialog2;
                    // }
                },
                onValueHelpAfterClose: function () {
                    // if (this._DepotDialog) {
                    //     this._oDepotDialog.destroy();
                    //     delete this._oDepotDialog;
                    // }
                    //   if (this._PainterValueHelp) {
                    //     this._PainterValueHelp.destroy();
                    //     delete this._PainterValueHelp;
                    //   }
                    if (this._RewardsDialog1) {
                        this._RewardsDialog1.destroy();
                        delete this._RewardsDialog1;
                    } //_RewardsDialog2
                    if (this._RewardsDialog2) {
                        this._RewardsDialog2.destroy();
                        delete this._RewardsDialog2;
                    }
                },
                onValueHelpClose: function () {
                    if (this._oDepotDialog) {
                        this._oDepotDialog.close();
                    }
                    if (this._PainterValueHelp) {
                        this._PainterValueHelp.close();
                    }
                    if (this._RewardsDialog1) {
                        this._RewardsDialog1.close();
                    }
                    if (this._RewardsDialog2) {
                        this._RewardsDialog2.close();
                    }
                },

                onDepotOkPress: function (oEvent) {
                    var oData = [];
                    var oView = this.getView();
                    var aTokens = oEvent.getParameter("tokens");
                    var aArrayBackEnd = [];
                    aTokens.forEach(function (ele) {
                        oData.push({
                            DepotId: ele.getKey(),
                            Division: ele.getCustomData()[0].getValue()["Depot"],
                        });
                    });

                    oView
                        .getModel("oModelControl")
                        .setProperty("/MultiCombo/Depots", oData);

                    this._oDepotDialog.close();
                },

                onDepotAfterOpen: function () {
                    var aFilter = this._getFilterForDepot();
                    this._FilterDepotTable(aFilter, "Control");
                },
                _getFilterForDepot: function () {
                    var sDivisions = this.getView()
                        .getModel("oModelControl")
                        .getProperty("/MultiCombo/Divisions");
                    var aFilters = [];

                    for (var div of sDivisions) {
                        aFilters.push(new Filter("Division", FilterOperator.EQ, div));
                    }

                    if (aFilters.length == 0) {
                        return [];
                    }
                    return new Filter({
                        filters: aFilters,
                        and: false,
                    });
                },
                _FilterDepotTable: function (oFilter, sType) {
                    var oValueHelpDialog = this._oDepotDialog;

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
                onDepotVhSearch: function () {
                    var oView = this.getView();
                    var aCurrentFilterValues = [];
                    var oViewFilter = this.getView().getModel("oModelControl").getProperty("/Search/DepotVh");
                    var aFlaEmpty = true;
                    for (let prop in oViewFilter) {
                        if (oViewFilter[prop]) {
                            if (prop === "DepotId") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({
                                        path: "Id",
                                        operator: "Contains",
                                        value1: oViewFilter[prop],
                                        caseSensitive: false
                                    }
                                    )
                                );
                            } else if (prop === "Depot") {
                                aFlaEmpty = false;
                                aCurrentFilterValues.push(
                                    new Filter({
                                        path: "Depot",
                                        operator: "Contains",
                                        value1: oViewFilter[prop],
                                        caseSensitive: false
                                    })
                                );
                            }
                        }
                    }



                    this._FilterDepotTable(
                        new Filter({
                            filters: aCurrentFilterValues,
                            and: true,
                        })
                    );

                },
                onClearDepotFilterVh: function () {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    oModel.setProperty("/Search/DepotVh", {
                        DepotId: "",
                        Depot: ""
                    });
                    var aCurrentFilterValues = [];
                    this._FilterDepotTable(
                        []
                    );

                },

                onProductCatChange: function (oEvent) {
                    var oView = this.getView();
                    var oSource = oEvent.getSource();
                    //var sKey = oSource.getSeleckedKeys();
                },
                onProdClassChange: function (oEvent) { },
                onAppProdChange: function (oEvent) { },
                onArchiTypeChange: function (oEvent) { },
                onPAppDropChange: function (oEvent) {
                    var aSpath = oEvent
                        .getSource()
                        .getBinding("selectedKeys")
                        .getPath()
                        .split("/");
                    var mParam1 = aSpath[aSpath.length - 1];
                    this._ClearPacksProducts(mParam1);
                    var aNumber = mParam1.match(/\d+$/)[0];
                    if (aNumber == "1") {
                        this._CreateRewardTableData();
                    } else if (aNumber == "4") {
                        this._CreateBonusRewardTable();
                    }
                },
                _ClearPacksProducts: function (mParam1) {
                    var aNumber = mParam1.match(/\d+$/)[0];
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    oModel.setProperty("/MultiCombo/AppProd" + aNumber, []);
                    oModel.setProperty("/MultiCombo/AppPacks" + aNumber, []);
                },
                onPackTokenUpdate: function (oEvent) {
                    if (oEvent.getParameter("type") === "removed") {
                        var oView = this.getView();
                        var oModel = oView.getModel("oModelControl");
                        var sPath = oEvent.getSource().getBinding("tokens").getPath();
                        var aArray = oModel.getProperty(sPath);
                        var aNewArray;
                        var aRemovedTokens = oEvent.getParameter("removedTokens");
                        var aRemovedKeys = [];
                        aRemovedTokens.forEach(function (item) {
                            aRemovedKeys.push(item.getKey());
                        });
                        console.log(aRemovedKeys);
                        aNewArray = aArray.filter(function (item) {
                            return aRemovedKeys.indexOf(item["Id"]) < 0;
                        });
                        console.log(aNewArray);
                        oModel.setProperty(sPath, aNewArray);
                    }
                },
                handlePackValueHelp: function (oEvent) {
                    var oView = this.getView();
                    var aPath = oEvent
                        .getSource()
                        .getBinding("tokens")
                        .getPath()
                        .split("/");
                    var sParam1 = aPath[aPath.length - 1];
                    console.log(sParam1);
                    var oModelControl = oView.getModel("oModelControl");
                    oModelControl.setProperty("/Dialog/PackVH", sParam1);
                    // create value help dialog
                    if (!this._PackValueHelpDialog) {
                        Fragment.load({
                            id: oView.getId(),
                            name:
                                "com.knpl.pragati.SchemeOffers.view.fragment.AppPackValueHelp",
                            controller: this,
                        }).then(
                            function (oValueHelpDialog) {
                                this._PackValueHelpDialog = oValueHelpDialog;
                                this.getView().addDependent(this._PackValueHelpDialog);
                                this._OpenPackValueHelp(sParam1);
                            }.bind(this)
                        );
                    } else {
                        this._OpenPackValueHelp(sParam1);
                    }
                },
                _OpenPackValueHelp: function (mParam1) {
                    var sPath = mParam1;
                    this._FilterForPack(mParam1);
                },
                _FilterForPack: function (mParam1) {
                    var oView = this.getView(),
                        oModel = oView.getModel("oModelControl");
                    var aNumber = mParam1.match(/\d+$/)[0];
                    var aProd = oModel.getProperty("/MultiCombo/AppProd" + aNumber);
                    var aFilter1 = [];

                    for (var a of aProd) {
                        aFilter1.push(
                            new Filter("ProductCode", FilterOperator.EQ, a["Id"])
                        );
                    }

                    this._PackValueHelpDialog.getBinding("items").filter(aFilter1, "Control");
                    this._PackValueHelpDialog.open();
                },
                _handlePackValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value").trim();
                    console.log(sValue, "Pack Valuehelp");
                    if (sValue.length > 0) {
                        var aFilter = new Filter({
                            path: "Description",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false
                        })
                        this._PackValueHelpDialog.getBinding("items").filter(aFilter, "Application");
                    }

                },
                _handlePackValueHelpConfirm: function (oEvent) {
                    var oSelected = oEvent.getParameter("selectedItems");
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var aField = oModel.getProperty("/Dialog/PackVH");
                    var aNumber = aField.match(/\d+$/)[0];
                    var aProds = [],
                        oBj;
                    for (var a of oSelected) {
                        oBj = a.getBindingContext().getObject();
                        aProds.push({ Name: oBj["Description"], Id: oBj["SkuCode"] });
                    }
                    oView
                        .getModel("oModelControl")
                        .setProperty("/MultiCombo/AppPacks" + aNumber, aProds);
                    if (aNumber == "1") {
                        this._CreateRewardTableData();
                    } else if (aNumber == "4") {
                        this._CreateBonusRewardTable();
                    }
                },
                onProdTokenUpdate: function (oEvent) {
                    if (oEvent.getParameter("type") === "removed") {
                        var oView = this.getView();
                        var oModel = oView.getModel("oModelControl");
                        var sPath = oEvent.getSource().getBinding("tokens").getPath();
                        var aArray = oModel.getProperty(sPath);
                        var aNewArray;
                        var aRemovedTokens = oEvent.getParameter("removedTokens");
                        var aRemovedKeys = [];
                        aRemovedTokens.forEach(function (item) {
                            aRemovedKeys.push(item.getKey());
                        });
                        console.log(aRemovedKeys);
                        aNewArray = aArray.filter(function (item) {
                            return aRemovedKeys.indexOf(item["Id"]) < 0;
                        });
                        console.log(aNewArray);
                        oModel.setProperty(sPath, aNewArray);
                    }
                },
                handleProdValueHelp: function (oEvent) {
                    var oView = this.getView();
                    var aPath = oEvent
                        .getSource()
                        .getBinding("tokens")
                        .getPath()
                        .split("/");
                    var sParam1 = aPath[aPath.length - 1];
                    console.log(sParam1);
                    var oModelControl = oView.getModel("oModelControl");
                    oModelControl.setProperty("/Dialog/ProdVH", sParam1);

                    // create value help dialog
                    if (!this._ProdValueHelpDialog) {
                        Fragment.load({
                            id: oView.getId(),
                            name:
                                "com.knpl.pragati.SchemeOffers.view.fragment.AppProdValuehelp",
                            controller: this,
                        }).then(
                            function (oValueHelpDialog) {
                                this._ProdValueHelpDialog = oValueHelpDialog;
                                this.getView().addDependent(this._ProdValueHelpDialog);
                                this._openPValueHelpDialog(sParam1);
                            }.bind(this)
                        );
                    } else {
                        this._openPValueHelpDialog(sParam1);
                    }
                },
                _openPValueHelpDialog: function (mParam1) {
                    var sPath = mParam1;
                    this._FilterForProds1(mParam1);
                },

                _handleProdValueHelpConfirm: function (oEvent) {
                    var oSelected = oEvent.getParameter("selectedItems");

                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var aField = oModel.getProperty("/Dialog/ProdVH");
                    var aNumber = aField.match(/\d+$/)[0];
                    var aProds = [],
                        oBj;
                    for (var a of oSelected) {
                        oBj = a.getBindingContext().getObject();
                        aProds.push({ Name: oBj["ProductName"], Id: oBj["Id"] });
                    }

                    oModel.setProperty("/MultiCombo/AppProd" + aNumber, aProds);
                    oModel.setProperty("/MultiCombo/AppPacks" + aNumber, []);

                    if (aNumber == "1") {
                        this._CreateRewardTableData();
                    } else if (aNumber == "4") {
                        this._CreateBonusRewardTable();
                    }
                },
                _handleProdValueHelpClose: function () {
                    if (this._ProdValueHelpDialog) {
                        this._ProdValueHelpDialog.destroy();
                        delete this._ProdValueHelpDialog;
                    }
                    if (this._PackValueHelpDialog) {
                        this._PackValueHelpDialog.destroy();
                        delete this._PackValueHelpDialog;
                    }
                },
                _FilterForProds1: function (mParam1) {
                    var oView = this.getView(),
                        oModel = oView.getModel("oModelControl");
                    var aNumber = mParam1.match(/\d+$/)[0];
                    console.log(aNumber);
                    var aCat = oModel.getProperty("/MultiCombo/PCat" + aNumber);
                    var aClass = oModel.getProperty("/MultiCombo/PClass" + aNumber);
                    var aFilter1 = [];
                    var aFilter2 = [];
                    for (var a of aCat) {
                        aFilter1.push(
                            new Filter("ProductCategory/Id", FilterOperator.EQ, a)
                        );
                    }
                    for (var b of aClass) {
                        aFilter2.push(
                            new Filter("ProductClassification/Id", FilterOperator.EQ, b)
                        );
                    }
                    var aFilterCat = new Filter({
                        filters: aFilter1,
                        and: false,
                    });
                    var aFilterClass = new Filter({
                        filters: aFilter2,
                        and: false,
                    });
                    var aFinalFilter = [];
                    if (aFilter1.length > 0) {
                        aFinalFilter.push(aFilterCat);
                    }
                    if (aFilter2.length > 0) {
                        aFinalFilter.push(aFilterClass);
                    }
                    this._ProdValueHelpDialog.getBinding("items").filter(aFinalFilter, "Control");
                    this._ProdValueHelpDialog.open();
                },
                _handlePValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value").trim();
                    console.log(sValue);
                    if (sValue.length > 0) {
                        var aFilter = new Filter({
                            path: "ProductName",
                            operator: "Contains",
                            value1: sValue,
                            caseSensitive: false
                        })
                        this._ProdValueHelpDialog.getBinding("items").filter(aFilter, "Application");
                    }

                },
                onRbAppPainter: function (oEvent) {
                    var iIndex = oEvent.getSource().getSelectedIndex();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    this._propertyToBlank(
                        ["PointSlabUpperLimit", "PointSlabLowerLimit"],
                        false
                    );
                    this._propertyToBlank(
                        [
                            "MultiCombo/ArcheTypes",
                            "MultiCombo/PainterType",
                            "MultiCombo/Potential",
                            "MultiCombo/PCat2",
                            "MultiCombo/PClass2",
                            "MultiCombo/AppProd2",
                            "MultiCombo/AppPacks2",
                            "MultiCombo/PCat3",
                            "MultiCombo/PClass3",
                            "MultiCombo/AppProd3",
                            "MultiCombo/AppPacks3",
                            "MultiCombo/Zones",
                            "MultiCombo/Divisions",
                            "MultiCombo/Depots",
                            "MultiCombo/Painters",
                            "Fields/Date1",
                            "Fields/Date2",
                        ],
                        true
                    );
                    oModelControl.setProperty("/Rbtn/PCat2", 0);
                    oModelControl.setProperty("/Rbtn/PClass2", 0);
                    oModelControl.setProperty("/Rbtn/AppProd2", 0);
                    oModelControl.setProperty("/Rbtn/AppPacks2", 0);
                    oModelControl.setProperty("/Rbtn/PCat3", 0);
                    oModelControl.setProperty("/Rbtn/PClass3", 0);
                    oModelControl.setProperty("/Rbtn/AppProd3", 0);
                    oModelControl.setProperty("/Rbtn/AppPacks3", 0);
                    oModelControl.setProperty("/Rbtn/Zones", 0);
                    oModelControl.setProperty("/Rbtn/Divisions", 0);
                    oModelControl.setProperty("/Rbtn/Depots", 0);

                    if (iIndex == 0) {
                        oModelControl.setProperty("/MultiCombo/AppPainter", false);
                        oModelView.setProperty("/PainterSelection", 0);
                    } else if (iIndex == 1) {
                        oModelControl.setProperty("/MultiCombo/AppPainter", true);
                        oModelView.setProperty("/PainterSelection", 1);
                    } else if (iIndex == 2) {
                        oModelControl.setProperty("/MultiCombo/AppPainter", true);
                        oModelView.setProperty("/PainterSelection", 2);

                    } //
                    // making the fields blank
                },
                onRbTopApp: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedIndex();
                    this._propertyToBlank(["BonusApplicableTopPainter"]);
                },
                onRbAppRewards: function (oEvent) {
                    var iIndex = oEvent.getSource().getSelectedIndex();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");

                    if (iIndex == 0) {
                        oModelView.setProperty("/HasBonusPercentage", false);
                        this._propertyToBlank(["BonusRewardPoints"]);
                    } else if (iIndex == 1) {
                        oModelView.setProperty("/HasBonusPercentage", true);
                        this._propertyToBlank(["BonusRewardPoints"]);
                    } //
                    // making the fields blank
                },
                onRbBonusValidity: function (oEvent) {
                    var iIndex = oEvent.getSource().getSelectedIndex();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");

                    if (iIndex == 0) {
                        oModelControl.setProperty("/HasTillDate", false);
                        this._propertyToBlank(["BonusValidityDate"]);
                    } else if (iIndex == 1) {
                        oModelControl.setProperty("/HasTillDate", true);
                        this._propertyToBlank([
                            "BonusValidityDurationYear",
                            "BonusValidityDurationMonth",
                            "BonusValidityDurationDays",
                        ]);
                    } //
                },
                onBonusVaidityTo: function (oEvent) {

                    var oView = this.getView();

                    var oModelView = oView.getModel("oModelView");
                    var oStartDate = oEvent.getSource().getDateValue();
                    var oEndDate = oModelView.getProperty("/PerformanceEndDate");
                    if (oEndDate) {
                        if (oStartDate > oEndDate) {
                            MessageToast.show("Kinldy select a date less than to date.");
                            oModelView.setProperty("/PerformanceStartDate", null);
                        }
                    }
                    if (oStartDate < new Date().setHours(0, 0, 0, 0)) {
                        MessageToast.show(
                            "Kindly enter a date greater than or equal to bonus validity to date"
                        );

                        oModelView.setProperty("/PerformanceStartDate", null);
                    }
                },
                onBonusVaidityFrom: function (oEvent) {
                    var oView = this.getView();

                    var oModelView = oView.getModel("oModelView");
                    var oEndDate = oEvent.getSource().getDateValue();
                    var oStartDate = oModelView.getProperty("/PerformanceStartDate");
                    if (oStartDate >= oEndDate) {
                        MessageToast.show("Kinldy select a date more than bonus validity from date.");

                        oModelView.setProperty("/PerformanceEndDate", null);
                    }
                },
                _propertyToBlank: function (aArray, aModel2) {
                    var aProp = aArray;
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    if (aModel2) {
                        oModelView = oView.getModel("oModelControl");
                    }

                    for (var x of aProp) {
                        var oGetProp = oModelView.getProperty("/" + x);
                        if (Array.isArray(oGetProp)) {
                            oModelView.setProperty("/" + x, []);
                            //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
                        } else if (oGetProp === null) {
                            oModelView.setProperty("/" + x, null);
                        } else if (oGetProp instanceof Date) {
                            oModelView.setProperty("/" + x, null);
                        } else if (typeof oGetProp === "boolean") {
                            oModelView.setProperty("/" + x, false);
                        } else {
                            oModelView.setProperty("/" + x, "");
                        }
                    }
                    oModelView.refresh(true);
                },
                _RbtnReset: function (aArray, aModel2 = true) {
                    var aProp = aArray;
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    if (aModel2) {
                        oModelView = oView.getModel("oModelControl");
                    }
                    for (var x of aProp) {
                        var oGetProp = oModelView.getProperty("/" + x);

                        oModelView.setProperty("/" + x, 0);
                        //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
                    }
                    oModelView.refresh(true);
                },
                onValueHelpParentOffer: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView();

                    if (!this._pOfferpDialog) {
                        this._pOfferpDialog = Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.SchemeOffers.view.fragment.OfferDialog",
                            controller: this,
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this._pOfferpDialog.then(function (oDialog) {
                        // Create a filter for the binding

                        // Open ValueHelpDialog filtered by the input's value
                        oDialog.open();
                    });
                },
                onParentOfferValueHelpClose: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    oEvent.getSource().getBinding("items").filter([]);
                    var oView = this.getView();
                    var oViewModel = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    if (!oSelectedItem) {
                        return;
                    }
                    var obj = oSelectedItem.getBindingContext().getObject();
                    oViewModel.setProperty("/ParentOfferId", obj["Id"]);
                    oModelControl.setProperty("/Fields/ParentOfferTitle", obj["Title"]);
                },
                onValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new Filter(
                        [
                            new Filter({
                                path: "Title",
                                operator: FilterOperator.Contains,
                                value1: sValue,
                                caseSensitive: false,
                            }),
                            new Filter({
                                path: "Description",
                                operator: FilterOperator.Contains,
                                value1: sValue,
                                caseSensitive: false,
                            }),
                        ],
                        false
                    );

                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                _getProductsData: function () {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var oData = oView.getModel();
                    oData.read("/MasterProductSet", {
                        success: function (mParam1) {
                            oModelControl.setProperty("/oData/Products", mParam1["results"]);
                        },
                        error: function (mParam1) { },
                    });
                },
                GetPackName: function (mParam1) {
                    var sPath = "/MasterRepProductSkuSet('" + mParam1 + "')";
                    var oData = this.getView().getModel().getProperty(sPath);
                    if (oData !== undefined && oData !== null) {
                        return oData["Description"];
                    }
                },
                GetProdName: function (mParam1) {
                    var sPath = "/MasterProductSet('" + mParam1 + "')";
                    var oData = this.getView().getModel().getProperty(sPath);
                    if (oData !== undefined && oData !== null) {
                        return oData["ProductName"];
                    }
                },
                _CreatePayloadPart1(bFileFlag) {
                    var promise = jQuery.Deferred();
                    //creating the payload
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var oDataModel = oView.getModel();
                    var oViewData = oModelView.getData();
                    var oPayLoad = this._RemoveEmptyValue(oViewData);

                    var inTegerProperty = [
                        "PointSlabUpperLimit",
                        "PointSlabLowerLimit",
                        "BonusApplicableTopPainter",
                        "ParentOfferId",
                    ];
                    for (var y of inTegerProperty) {
                        if (oPayLoad.hasOwnProperty(y)) {
                            if (oPayLoad[y] !== null) {
                                oPayLoad[y] = parseInt(oPayLoad[y]);
                            }
                        }
                    }
                    // setting the zone, division, depot data.

                    promise.resolve(oPayLoad);
                    return promise;
                },
                _CreatePayloadPart2: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    //      "IsSpecificApplicableProductCategory": false,
                    // "IsSpecificApplicableProductClassification": false,
                    // "IsSpecificApplicableProduct": false,
                    // "IsSpecificApplicablePack": false,
                    // "IsSpecificRewardRatio": false,
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
                    };
                    var oModelControl = oView.getModel("oModelControl");
                    var oPropRbtn = oModelControl.getProperty("/Rbtn");
                    for (var key in aBoleanProps) {
                        oPayLoad[key] = oPropRbtn[aBoleanProps[key]] == 0 ? false : true;
                    }

                    promise.resolve(oPayLoad);
                    return promise;
                },

                // postdata
                _CreatePayloadPart3: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var sMultiKeys = oModelControl.getProperty("/MultiCombo");

                    // setting the values of zone
                    oPayLoad["OfferZone"] = sMultiKeys["Zones"].map(function (elem) {
                        return {
                            ZoneId: elem,
                        };
                    });
                    oPayLoad["OfferDivision"] = sMultiKeys["Divisions"].map(function (
                        elem
                    ) {
                        return {
                            DivisionId: elem,
                        };
                    });
                    oPayLoad["OfferDepot"] = sMultiKeys["Depots"].map(function (elem) {
                        return {
                            DepotId: elem["DepotId"],
                        };
                    });
                    oPayLoad["OfferApplicableProductCategory"] = sMultiKeys["PCat1"].map(
                        function (elem) {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    );
                    oPayLoad["OfferApplicableProductClassification"] = sMultiKeys[
                        "PClass1"
                    ].map(function (elem) {
                        return {
                            ProductClassificationCode: elem,
                        };
                    });
                    oPayLoad["OfferApplicableProduct"] = sMultiKeys["AppProd1"].map(
                        function (elem) {
                            return {
                                ProductCode: elem["Id"],
                            };
                        }
                    );
                    oPayLoad["OfferApplicablePack"] = sMultiKeys["AppPacks1"].map(
                        function (elem) {
                            return {
                                SkuCode: elem["Id"],
                            };
                        }
                    );
                    oPayLoad["OfferPainterType"] = sMultiKeys["PainterType"].map(
                        function (elem) {
                            return {
                                PainterTypeId: parseInt(elem),
                            };
                        }
                    );
                    oPayLoad["OfferPainterArcheType"] = sMultiKeys["ArcheTypes"].map(
                        function (elem) {
                            return {
                                ArcheTypeId: parseInt(elem),
                            };
                        }
                    );
                    oPayLoad["OfferPainterPotential"] = sMultiKeys["Potential"].map(
                        function (elem) {
                            return {
                                PotentialId: parseInt(elem),
                            };
                        }
                    );
                    oPayLoad["OfferBuyerProductCategory"] = sMultiKeys["PCat2"].map(
                        function (elem) {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    );
                    oPayLoad["OfferBuyerProductClassification"] = sMultiKeys[
                        "PClass2"
                    ].map(function (elem) {
                        return {
                            ProductClassificationCode: elem,
                        };
                    });
                    oPayLoad["OfferBuyerProduct"] = sMultiKeys["AppProd2"].map(function (
                        elem
                    ) {
                        return {
                            ProductCode: elem["Id"],
                        };
                    });
                    oPayLoad["OfferBuyerPack"] = sMultiKeys["AppPacks2"].map(function (
                        elem
                    ) {
                        return {
                            SkuCode: elem["Id"],
                        };
                    });
                    oPayLoad["OfferNonBuyerProductCategory"] = sMultiKeys["PCat3"].map(
                        function (elem) {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    );
                    oPayLoad["OfferNonBuyerProductClassification"] = sMultiKeys[
                        "PClass3"
                    ].map(function (elem) {
                        return {
                            ProductClassificationCode: elem,
                        };
                    });
                    oPayLoad["OfferNonBuyerProduct"] = sMultiKeys["AppProd3"].map(
                        function (elem) {
                            return {
                                ProductCode: elem["Id"],
                            };
                        }
                    );
                    oPayLoad["OfferNonBuyerPack"] = sMultiKeys["AppPacks3"].map(function (
                        elem
                    ) {
                        return {
                            SkuCode: elem["Id"],
                        };
                    });
                    // Bonus Reward Ratio
                    oPayLoad["OfferBonusProductCategory"] = sMultiKeys["PCat4"].map(
                        function (elem) {
                            return {
                                ProductCategoryCode: elem,
                            };
                        }
                    );
                    oPayLoad["OfferBonusProductClassification"] = sMultiKeys[
                        "PClass4"
                    ].map(function (elem) {
                        return {
                            ProductClassificationCode: elem,
                        };
                    });
                    oPayLoad["OfferBonusProduct"] = sMultiKeys["AppProd4"].map(function (
                        elem
                    ) {
                        return {
                            ProductCode: elem["Id"],
                        };
                    });
                    oPayLoad["OfferBonusPack"] = sMultiKeys["AppPacks4"].map(function (
                        elem
                    ) {
                        return {
                            SkuCode: elem["Id"],
                        };
                    });

                    oPayLoad["OfferSpecificPainter"] = sMultiKeys["Painters"].map(
                        function (elem) {
                            return {
                                PainterId: parseInt(elem["PainterId"]),
                            };
                        }
                    );
                    promise.resolve(oPayLoad);
                    return promise;
                },
                _CreatePayLoadPart4: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var bRewardSelected = oModel.getProperty("/Rbtn/Rewards");
                    var aFinalArray = [];
                    if (bRewardSelected === 0) {
                        var oDataTbl = oModel
                            .getProperty("/Table/Table1")
                            .map(function (a) {
                                return Object.assign({}, a);
                            });

                        var aCheckProp = [
                            "RequiredVolume",
                            "RequiredPoints",
                            "RewardPoints",
                            // "RewardGiftId",
                            "RewardCash",
                        ];
                        aFinalArray = oDataTbl.filter(function (ele) {

                            for (var a in aCheckProp) {
                                if (ele[aCheckProp[a]] === "") {
                                    ele[aCheckProp[a]] = null;

                                } else {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }

                            return ele;

                        });
                        oPayLoad["OfferProductRewardRatio"] = aFinalArray;

                        promise.resolve(oPayLoad);
                        return promise;
                    }
                    // this menas that specific is selected we will check first
                    // if packs all is selected and products data will be displayed

                    var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks1");
                    if (bAllProdSelected === 0) {
                        var oDataTbl = oModel
                            .getProperty("/Table/Table2")
                            .map(function (a) {
                                return Object.assign({}, a);
                            });

                        var aCheckProp = [
                            "RequiredVolume",
                            "RequiredPoints",
                            "RewardPoints",
                            //"RewardGiftId",
                            "RewardCash",
                        ];
                        aFinalArray = oDataTbl.filter(function (ele) {

                            for (var a in aCheckProp) {
                                if (ele[aCheckProp[a]] === "") {
                                    ele[aCheckProp[a]] = null;
                                } else {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            return ele;

                        });
                        oPayLoad["OfferProductRewardRatio"] = aFinalArray;

                        promise.resolve(oPayLoad);
                        return promise;
                    }
                    if (bAllProdSelected === 1) {
                        var oDataTbl = oModel
                            .getProperty("/Table/Table2")
                            .map(function (a) {
                                return Object.assign({}, a);
                            });

                        var aCheckProp = [
                            "RequiredVolume",
                            "RequiredPoints",
                            "RewardPoints",
                            //"RewardGiftId",
                            "RewardCash",
                        ];

                        aFinalArray = oDataTbl.filter(function (ele) {

                            for (var a in aCheckProp) {
                                if (ele[aCheckProp[a]] === "") {
                                    ele[aCheckProp[a]] = null;
                                } else {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            return ele;

                        });
                        oPayLoad["OfferPackRewardRatio"] = aFinalArray;

                        promise.resolve(oPayLoad);
                        return promise;
                    }
                },
                _CreatePayLoadPart5: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var bRewardSelected = oModel.getProperty("/Rbtn/BRewards");
                    var aFinalArray = [];
                    if (bRewardSelected === 0) {
                        var oDataTbl = oModel
                            .getProperty("/Table/Table3")
                            .map(function (a) {
                                return Object.assign({}, a);
                            });

                        var aCheckProp = ["StartDate", "EndDate", "BonusPoints"];
                        aFinalArray = oDataTbl.filter(function (ele) {

                            for (var a in aCheckProp) {
                                if (ele[aCheckProp[a]] === "") {
                                    ele[aCheckProp[a]] = null;

                                }
                                if (aCheckProp[a] === "BonusPoints") {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            return ele;

                        });
                        oPayLoad["OfferBonusProductRewardRatio"] = aFinalArray;

                        promise.resolve(oPayLoad);
                        return promise;
                    }
                    // this menas that specific is selected we will check first
                    // if packs all is selected and products data will be displayed
                    var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks4");
                    if (bAllProdSelected === 0) {
                        var oDataTbl = oModel
                            .getProperty("/Table/Table4")
                            .map(function (a) {
                                return Object.assign({}, a);
                            });
                        var aCheckProp = ["StartDate", "EndDate", "BonusPoints"];
                        aFinalArray = oDataTbl.filter(function (ele) {

                            for (var a in aCheckProp) {
                                if (ele[aCheckProp[a]] === "") {
                                    ele[aCheckProp[a]] = null;
                                }
                                if (aCheckProp[a] === "BonusPoints") {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            return ele;

                        });
                        oPayLoad["OfferBonusProductRewardRatio"] = aFinalArray;

                        promise.resolve(oPayLoad);
                        return promise;
                    }
                    // this means that the user has selected specific for bonus reward packs
                    if (bAllProdSelected === 1) {
                        var oDataTbl = oModel
                            .getProperty("/Table/Table4")
                            .map(function (a) {
                                return Object.assign({}, a);
                            });
                        var aCheckProp = ["StartDate", "EndDate", "BonusPoints"];
                        aFinalArray = oDataTbl.filter(function (ele) {

                            for (var a in aCheckProp) {
                                if (ele[aCheckProp[a]] === "") {
                                    ele[aCheckProp[a]] = null;
                                }
                                if (aCheckProp[a] === "BonusPoints") {
                                    ele[aCheckProp[a]] = parseInt(ele[aCheckProp[a]]);
                                }
                            }
                            return ele;

                        });
                        oPayLoad["OfferBonusPackRewardRatio"] = aFinalArray;

                        promise.resolve(oPayLoad);
                        return promise;
                    }
                },
                onUploadMisMatch: function () {
                    MessageToast.show("Kindly upload a file of type .png, .jpg, .jpeg");
                },

                /**
                 * Adds a history entry in the FLP page history
                 * @public
                 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
                 * @param {boolean} bReset If true resets the history before the new entry is added
                 */
                addHistoryEntry: (function () {
                    var aHistoryEntries = [];

                    return function (oEntry, bReset) {
                        if (bReset) {
                            aHistoryEntries = [];
                        }

                        var bInHistory = aHistoryEntries.some(function (entry) {
                            return entry.intent === oEntry.intent;
                        });

                        if (!bInHistory) {
                            aHistoryEntries.push(oEntry);
                            this.getOwnerComponent()
                                .getService("ShellUIService")
                                .then(function (oService) {
                                    oService.setHierarchy(aHistoryEntries);
                                });
                        }
                    };
                })(),
            }
        );
    }
);
