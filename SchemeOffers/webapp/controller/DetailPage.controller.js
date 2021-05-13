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
      "com.knpl.pragati.SchemeOffers.controller.DetailPage",
      {
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

          var oView = this.getView();
          var sExpandParam = "OfferType,CreatedByDetails";
          console.log(oProp);
          if (oProp.trim() !== "") {
            oView.bindElement({
              path: "/OfferSet(" + oProp + ")",
              parameters: {
                expand: sExpandParam,
              },
            });
          }
          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: true,
            bindProp: "OfferSet(" + oProp + ")",
            HasTillDate: true,
            ImageLoaded: true,
            SchemeId: oProp, //.replace(/[^0-9]/g, ""),
            //ProfilePic:"/KNPL_PAINTER_API/api/v2/odata.svc/PainterSet(717)/$value",
            tableDealay: 0,
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
              IsSpecificPainPainter: 0,
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
              IsSpecificPainPainter: false,
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
              PerGrowth: [
                { Name: "1" },
                { Name: "2" },
                { Name: "3" },
                { Name: "4" },
                { Name: "5" },
              ],
              Rewards: [
                {
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
            },
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl2");

          var othat = this;
          var c1, c2, c3, c4, c5, c7, c8;
          var oView = this.getView();

          c1 = this._loadEditProfile("Display");
          c1.then(function () {
            c2 = othat._getInitData(oProp);
            c2.then(function (data) {
              c3 = othat._SetRbtnData(data);
              c3.then(function (data) {
                //c4 = othat._setViewData2(data);
                c4 = othat._setViewData1(data);
                c4.then(function (data) {
                  c5 = othat._setViewData2(data);
                });
              });
            });
          });
          this._toggleButtonsAndView(false);
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
            "OfferZone,OfferDepot,OfferDivision,OfferApplicableProductCategory,OfferApplicableProductClassification,OfferApplicableProduct,OfferApplicablePack,OfferProductRewardRatio/Product,OfferPackRewardRatio/Pack," +
            "OfferPainterType,OfferPainterArchiType,OfferPainterPotential,OfferBuyerProductCategory,OfferBuyerProductClassification,OfferBuyerProduct,OfferBuyerPack,OfferNonBuyerProductCategory," +
            "OfferNonBuyerProductClassification,OfferNonBuyerProduct,OfferNonBuyerPack," +
            "OfferBonusProductCategory,OfferBonusProductClassification,OfferBonusProduct,OfferBonusPack," +
            "OfferBonusProductRewardRatio/Product,OfferBonusPackRewardRatio/Pack";
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
        _setViewData2: function (oData) {
          var promise = jQuery.Deferred();

          var oView = this.getView();
          var oModelControl2 = oView.getModel("oModelControl2");
          var Table1 = [],
            Table2 = [];

          if (oData["OfferProductRewardRatio"]["results"].length > 0) {
            oModelControl2.setProperty(
              "/Table/Table1",
              oData["OfferProductRewardRatio"]["results"]
            );
          }
          if (oData["IsSpecificApplicablePack"] === false) {
            if (oData["OfferProductRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table2",
                oData["OfferProductRewardRatio"]["results"]
              );
            }
          } else {
            if (oData["OfferPackRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table2",
                oData["OfferPackRewardRatio"]["results"]
              );
            }
          }

          if (oData["OfferBonusProductRewardRatio"]["results"].length > 0) {
            oModelControl2.setProperty(
              "/Table/Table3",
              oData["OfferBonusProductRewardRatio"]["results"]
            );
          }
          if (oData["IsSpecificBonusPack"] === false) {
            if (oData["OfferBonusProductRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table4",
                oData["OfferBonusProductRewardRatio"]["results"]
              );
            }
          } else {
            if (oData["OfferBonusPackRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table4",
                oData["OfferBonusPackRewardRatio"]["results"]
              );
            }
          }
          //console.log(oModelControl2)
          promise.resolve(oData);
          return promise;
        },
        _setViewData1: function (oData) {
          var promise = jQuery.Deferred();
          //console.log(oData);
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
            AppPacks4 = [];
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
              aDepots.push({ DepotId: x["DepotId"] });
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

          if (oData["OfferPainterArchiType"]["results"].length > 0) {
            for (var x of oData["OfferPainterArchiType"]["results"]) {
              ArcheTypes.push(x["ArchiTypeId"]);
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

          if (oData["OfferNonBuyerProductCategory"]["results"].length > 0) {
            for (var x of oData["OfferNonBuyerProductCategory"]["results"]) {
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
            IsSpecificPainter: "IsSpecificPainter",
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
          var oCtrl2Model = oView.getModel("oModelControl2");
          var c1, c2, c3, c4, c5, c6;
          var othat = this;
          c1 = othat._loadEditProfile("Edit");
          c1.then(function () {
            c2 = othat._GetInitEditData();
            c2.then(function (data) {
              c3 = othat._setEditControlModel(data);
              c3.then(function (data) {
                c4 = othat._SetEditRbtnData(data);
                c4.then(function (data) {
                  c5 = othat._setEditViewData1(data);
                  c5.then(function (data) {
                    c6 = othat._setEditViewData2(data);
                  });
                });
              });
              //othat.getView().getModel("oModelView").refresh(true);
            });
          });

          // this._initSaveModel();
        },
        _GetInitEditData: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oData = oView.getModel();
          var oModelControl2 = oView.getModel("oModelControl2");
          var sPath = oModelControl2.getProperty("/bindProp");
          var othat = this;
          var exPand =
            "OfferZone,OfferDepot,OfferDivision,OfferApplicableProductCategory,OfferApplicableProductClassification,OfferApplicableProduct,OfferApplicablePack,OfferProductRewardRatio,OfferPackRewardRatio," +
            "OfferPainterType,OfferPainterArchiType,OfferPainterPotential,OfferBuyerProductCategory,OfferBuyerProductClassification,OfferBuyerProduct,OfferBuyerPack,OfferNonBuyerProductCategory," +
            "OfferNonBuyerProductClassification,OfferNonBuyerProduct,OfferNonBuyerPack," +
            "OfferBonusProductCategory,OfferBonusProductClassification,OfferBonusProduct,OfferBonusPack," +
            "OfferBonusProductRewardRatio,OfferBonusPackRewardRatio";
          oView.getModel().read("/" + sPath, {
            urlParameters: {
              $expand: exPand,
            },
            success: function (data) {
              console.log(data);
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
            ImageLoaded: false,
            BonusValidity: oBonusValidity,
            modeEdit: false,
            StartDate: "",
            EndDate: "",
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
            },
            Table: {
              Table1: [
                {
                  RequiredVolume: "",
                  RequiredPoints: "",
                  RewardPoints: "",
                  RewardGiftId: "",
                  RewardCash: "",
                },
              ],
              Table2: [],
              Table3: [
                {
                  StartDate: null,
                  EndDate: null,
                  BonusPoints: "",
                },
              ],
              Table4: [],
            },
            oData: {
              Products: [],
              Packs: [],
              PerGrowth: [
                { Name: "1" },
                { Name: "2" },
                { Name: "3" },
                { Name: "4" },
                { Name: "5" },
              ],
              Rewards: [
                {
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
            },
          };
          var oConrtrolModel = new JSONModel(oDataControl);
          oView.setModel(oConrtrolModel, "oModelControl");

          var oModelView = new JSONModel(oData);
          oView.setModel(oModelView, "oModelView");

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

          if (oData["OfferProductRewardRatio"]["results"].length > 0) {
            oModelControl2.setProperty(
              "/Table/Table1",
              oData["OfferProductRewardRatio"]["results"]
            );
          }
          if (oData["IsSpecificApplicablePack"] === false) {
            if (oData["OfferProductRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table2",
                oData["OfferProductRewardRatio"]["results"]
              );
            }
          } else {
            if (oData["OfferPackRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table2",
                oData["OfferPackRewardRatio"]["results"]
              );
            }
          }

          if (oData["OfferBonusProductRewardRatio"]["results"].length > 0) {
            oModelControl2.setProperty(
              "/Table/Table3",
              oData["OfferBonusProductRewardRatio"]["results"]
            );
          }
          if (oData["IsSpecificBonusPack"] === false) {
            if (oData["OfferBonusProductRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table4",
                oData["OfferBonusProductRewardRatio"]["results"]
              );
            }
          } else {
            if (oData["OfferBonusPackRewardRatio"]["results"].length > 0) {
              oModelControl2.setProperty(
                "/Table/Table4",
                oData["OfferBonusPackRewardRatio"]["results"]
              );
            }
          }
          //console.log(oModelControl2)
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
            IsSpecificPainter: "IsSpecificPainter",
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

        _setEditViewData1: function (oData) {
          var promise = jQuery.Deferred();
          //console.log(oData);
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
            AppPacks4 = [];
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
              aDepots.push({ DepotId: x["DepotId"] });
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

          if (oData["OfferPainterArchiType"]["results"].length > 0) {
            for (var x of oData["OfferPainterArchiType"]["results"]) {
              ArcheTypes.push(x["ArchiTypeId"]);
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

          if (oData["OfferNonBuyerProductCategory"]["results"].length > 0) {
            for (var x of oData["OfferNonBuyerProductCategory"]["results"]) {
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

          promise.resolve(oData);
          return promise;
        },

        handleSavePress: function () {
          var oView = this.getView();
          this._ValidateSaveData();
        },
        _ValidateSaveData: function () {
          var oView = this.getView();
          var oValidate = new Validator();
          var oForm = oView.byId("FormChange");

          var bFlagValidate = oValidate.validate(oForm);

          var sFile = this.getView().byId("idFileUpload").oFileUpload.files[0];
          var bFileFlag = false;

          if (bFlagValidate == false) {
            MessageToast.show("Kinldy Input All the Mandatory(*) fields.");
            return;
          }
          //check if it has file
          if (sFile !== undefined) {
            bFileFlag = true;
          }
          console.log(bFileFlag);
          //validate the data

          this._postDataToSave(bFileFlag);
        },
        _postDataToSave: function (bFileFlag) {
          var c1, c2, c3, c4, c5, c6, c7;
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
                    c6 = othat._CreateOffer(oPayLoad);
                    c6.then(function () {
                      othat.handleCancelPress();
                    });
                  });
                });
              });
            });
          });
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
        _CreatePayLoadPart4: function (oPayLoad) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModel = oView.getModel("oModelControl");
          var bRewardSelected = oModel.getProperty("/Rbtn/Rewards");
          var aFinalArray = [];
          if (bRewardSelected === 0) {
            var oDataTbl = JSON.parse(
              JSON.stringify(oModel.getProperty("/Table/Table1"))
            );
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["RequiredVolume"] !== "" && ele["RewardPoints"] !== "") {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else {
                    ele[x] = parseInt(ele[x]);
                  }
                }

                return ele;
              }
            });
            oPayLoad["OfferProductRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
          // this menas that specific is selected we will check first
          // if packs all is selected and products data will be displayed

          var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks1");
          if (bAllProdSelected === 0) {
            var oDataTbl = JSON.parse(
              JSON.stringify(oModel.getProperty("/Table/Table2"))
            );
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["RequiredVolume"] !== "" && ele["RewardPoints"] !== "") {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else if (x !== "ProductCode") {
                    ele[x] = parseInt(ele[x]);
                  }
                }
               
                return ele;
              }
            });
            oPayLoad["OfferProductRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
          if (bAllProdSelected === 1) {
            var oDataTbl = JSON.parse(
              JSON.stringify(oModel.getProperty("/Table/Table2"))
            );
             
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
            console.log(oDataTbl);
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["StartDate"] !== null &&
                ele["EndDate"] !== null &&
                ele["BonusPoints"] !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else if (x == "BonusPoints") {
                    ele[x] = parseInt(ele[x]);
                  }
                }
                return ele;
              }
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
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["StartDate"] !== null &&
                ele["EndDate"] !== null &&
                ele["BonusPoints"] !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else if (x == "BonusPoints") {
                    ele[x] = parseInt(ele[x]);
                  }
                }
                delete ele["Name"];
                return ele;
              }
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
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["StartDate"] !== null &&
                ele["EndDate"] !== null &&
                ele["BonusPoints"] !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else if (x == "BonusPoints") {
                    ele[x] = parseInt(ele[x]);
                  }
                }
                delete ele["Name"];
                return ele;
              }
            });
            oPayLoad["OfferBonusPackRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
        },
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
                ProductCode: elem,
              };
            }
          );
          oPayLoad["OfferApplicablePack"] = sMultiKeys["AppPacks1"].map(
            function (elem) {
              return {
                SkuCode: elem,
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
          oPayLoad["OfferPainterArchiType"] = sMultiKeys["ArcheTypes"].map(
            function (elem) {
              return {
                ArchiTypeId: parseInt(elem),
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
              ProductCode: elem,
            };
          });
          oPayLoad["OfferBuyerPack"] = sMultiKeys["AppPacks2"].map(function (
            elem
          ) {
            return {
              SkuCode: elem,
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
                ProductCode: elem,
              };
            }
          );
          oPayLoad["OfferNonBuyerPack"] = sMultiKeys["AppPacks3"].map(function (
            elem
          ) {
            return {
              SkuCode: elem,
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
              ProductCode: elem,
            };
          });
          oPayLoad["OfferBonusPack"] = sMultiKeys["AppPacks4"].map(function (
            elem
          ) {
            return {
              SkuCode: elem,
            };
          });
          promise.resolve(oPayLoad);
          return promise;
        },
        _CreateOffer: function (oPayLoad) {
          var promise = jQuery.Deferred();
          var othat = this;
          var oView = this.getView();
          var oDataModel = oView.getModel();
          var oProp = oView.getModel("oModelControl2").getProperty("/bindProp");
          console.log(oPayLoad);
          return new Promise((resolve, reject) => {
            oDataModel.update("/" + oProp, oPayLoad, {
              success: function (data) {
                MessageToast.show("Offer Sucessfully Created.");
                //othat._navToHome();

                console.log(data);
                resolve(data);
              },
              error: function (data) {
                MessageToast.show("Error In Creating the Schemes.");
                reject(data);
              },
            });
          });
        },
        _UploadFile: function (data) {
          var oView = this.getView();
          var data = oView.getModel("oModelView").getData();
          var oFile = oView.byId("idFileUpload").oFileUpload.files[0];
          var sServiceUrl = this.getOwnerComponent(this)
            .getManifestObject()
            .getEntry("/sap.app").dataSources.mainService.uri;

          var sUrl = sServiceUrl + "SchemeSet(" + data["Id"] + ")/$value";
          jQuery.ajax({
            method: "PUT",
            url: sUrl,
            cache: false,
            contentType: false,
            processData: false,
            data: oFile,
            success: function (data) {},
            error: function () {},
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
        onViewAttachment: function (oEvent) {
          var oButton = oEvent.getSource();
          var oView = this.getView();
          if (!this._pKycDialog) {
            Fragment.load({
              name:
                "com.knpl.pragati.SchemeOffers.view.fragment.AttachmentDialog",
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
        onAttachDialogClose: function (oEvent) {
          oEvent.getSource().getParent().close();
        },
        onAfterAttachClose: function (oEvent) {
          this._pKycDialog.destroy();
          delete this._pKycDialog;
        },
        _toggleButtonsAndView: function (bEdit) {
          var oView = this.getView();
          oView.byId("edit").setVisible(!bEdit);
          oView.byId("save").setVisible(bEdit);
          oView.byId("cancel").setVisible(bEdit);
        },
        handleCancelPress: function () {
          var oView = this.getView();
          var othat = this;
          var oProp = oView.getModel("oModelControl2").getProperty("/SchemeId");

          var c1, c2, c3, c4;
          this._initData(oProp);
        },
      }
    );
  }
);
