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
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
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
    MessageToast,
    MessageBox,
    ValueState,
    Validator,
    customInt,
    cmbxDtype2
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.SchemeOffers.controller.AddOfferPage",
      {
        customInt: customInt,
        cmbxDtype2: cmbxDtype2,

        onInit: function () {
          //Router Object
          this.oRouter = this.getRouter();
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

          this.getOwnerComponent()
            .getRouter()
            .getRoute("AddOfferPage")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
          this._initData();
        },
        _initData: function () {
          var oView = this.getView();

          var oBonusValidity = [];

          for (var i = 0; i <= 12; i++) {
            oBonusValidity.push({ key: i });
          }
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
                  BonusPoints: ""
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

          var oDataView = {
            OfferTypeId: 1,
            Title: "Title",
            Description: "Check",
            StartDate: null,
            EndDate: null,
            IsSpecificZone: false,
            IsSpecificDivision: false,
            IsSpecificDepot: false,
            IsSpecificApplicableProductCategory: false,
            IsSpecificApplicableProductClassification: false,
            IsSpecificApplicableProduct: false,
            IsSpecificApplicablePack: false,
            IsSpecificRewardRatio: false,
            IsSpecificPainter: false,
            PointSlabUpperLimit: "",
            PointSlabLowerLimit: "",
            PurchaseStartDate: null,
            PurchaseEndDate: null,
            BonusApplicableTopPainter: "",
            PerformanceStartDate: null,
            PerformanceEndDate: null,
            RedemptionCycle: 1,
            OfferProductRewardRatio: [],
            OfferPackRewardRatio:[],
            OfferBonusProductRewardRatio:[],
            OfferBonusPackRewardRatio:[]
          };
          var oViewMOdel = new JSONModel(oDataView);
          oView.setModel(oViewMOdel, "oModelView");
          oView.setModel(oConrtrolModel, "oModelControl");

          // adding the fragment
          this._showFormFragment("ChangeDetail");
          //get products data
          this._getProductsData();
        },

        _getProductsData: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oData = oView.getModel();
          oData.read("/MasterProductSet", {
            success: function (mParam1) {
              oModelControl.setProperty("/oData/Products", mParam1["results"]);
            },
            error: function (mParam1) {},
          });
        },

        _showFormFragment: function (sFragmentName) {
          var objSection = this.getView().byId("oVbxSmtTbl");
          var oView = this.getView();
          objSection.destroyItems();
          var othat = this;
          this._getFormFragment(sFragmentName).then(function (oVBox) {
            oView.addDependent(oVBox);
            objSection.addItem(oVBox);
            //othat._setDataValue.call(othat);
            //othat._setUploadCollectionMethod.call(othat);
          });
        },
        _getFormFragment: function (sFragmentName) {
          var oView = this.getView();
          var othat = this;
          // if (!this._formFragments) {
          this._formFragments = Fragment.load({
            id: oView.getId(),
            name:
              "com.knpl.pragati.SchemeOffers.view.fragment." + sFragmentName,
            controller: othat,
          }).then(function (oFragament) {
            return oFragament;
          });
          // }

          return this._formFragments;
        },

        onPressBreadcrumbLink: function () {
          this._navToHome();
        },

        onPressCancel: function () {
          this._navToHome();
        },

        onPressSave: function () {
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
          //validate the data

          this._postDataToSave(bFileFlag);
        },

        onAfterRendering: function () {
          // this.getView().byId("startDate").setMinDate(new Date());
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
                  c5=othat._CreatePayLoadPart5(oPayLoad);
                   c5.then(function(oPayLoad){
                    c6 = othat._CreateOffer(oPayLoad);
                   })
                });
              });
            });
          });
        },
        _CreatePayLoadPart5:function(oPayLoad){
            var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModel = oView.getModel("oModelControl");
          var bRewardSelected = oModel.getProperty("/Rbtn/BRewards");
          var aFinalArray = [];
          if (bRewardSelected === 0) {
            var oDataTbl =oModel.getProperty("/Table/Table3").map(function(a){
                return Object.assign({},a);
            })
            console.log(oDataTbl)
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["StartDate"] !== null &&
                ele["EndDate"] !== null &&
                ele["BonusPoints"].trim() !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  }else if(x=="BonusPoints"){
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
           var oDataTbl =oModel.getProperty("/Table/Table4").map(function(a){
                return Object.assign({},a);
            })
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["StartDate"] !== null &&
                ele["EndDate"] !== null &&
                ele["BonusPoints"].trim() !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  }else if(x=="BonusPoints"){
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
           var oDataTbl =oModel.getProperty("/Table/Table4").map(function(a){
                return Object.assign({},a);
            })
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["StartDate"] !== null &&
                ele["EndDate"] !== null &&
                ele["BonusPoints"].trim() !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  }else if(x=="BonusPoints"){
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
              if (
                ele["RequiredVolume"].trim() !== "" &&
                ele["RewardPoints"].trim() !== ""
              ) {
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
              if (
                ele["RequiredVolume"].trim() !== "" &&
                ele["RewardPoints"].trim() !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else if (x!=="ProductCode") {
                    ele[x] = parseInt(ele[x]);
                  }
                }
                delete ele ["Name"]
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
            aFinalArray = oDataTbl.filter(function (ele) {
              if (
                ele["RequiredVolume"].trim() !== "" &&
                ele["RewardPoints"].trim() !== ""
              ) {
                for (var x in ele) {
                  if (ele[x] == "") {
                    ele[x] = null;
                  } else if (x!=="SkuCode") {
                    ele[x] = parseInt(ele[x]);
                  }
                }
                delete ele ["Name"]
                return ele;
              }
            });
            oPayLoad["OfferPackRewardRatio"] = aFinalArray;
           
            promise.resolve(oPayLoad);
            return promise;
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
            "ParentOfferId"
          ];
          for (var y of inTegerProperty) {
            if (oPayLoad.hasOwnProperty(y)) {
              oPayLoad[y] = parseInt(oPayLoad[y]);
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
            IsSpecificNonBuyerProduct: "AppProd2",
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
          console.log(oPayLoad);
          return new Promise((resolve, reject) => {
            oDataModel.create("/OfferSet", oPayLoad, {
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
        _CreateOffer1: function () {
          var othat = this;
        },

        _UploadFile: function (mParam1, mParam2) {
          var promise = jQuery.Deferred();
          if (!mParam2) {
            console.log("No File Found");
            promise.resolve();
            return promise;
          }
          var oView = this.getView();
          var oFile = oView.byId("idFileUpload").oFileUpload.files[0];
          var sServiceUrl = this.getOwnerComponent(this)
            .getManifestObject()
            .getEntry("/sap.app").dataSources.mainService.uri;

          var data = mParam1;
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
        _NavBack: function () {},

        _RemoveEmptyValue: function (mParam) {
          var obj = Object.assign({}, mParam);
          // remove string values
          var oNew = Object.entries(obj).reduce(
            (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)),
            {}
          );
          // remove the null values
          var oNew2 = Object.entries(oNew).reduce(
            (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
            {}
          );

          return oNew2;
        },
        onUploadFileTypeMis: function () {
          MessageToast.show("Kindly upload a file of type jpg,jpeg,png");
        },
      }
    );
  }
);
