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
            RewardGift: [
              {
                Id: 1,
                Name: "TV",
              },
              {
                Id: 2,
                Name: "Washing Machine",
              },
            ],
            MultiCombo: {
              Zones: [],
              Divisions: [],
              Depots: [],
              ArcheTypes: [],
              PainterProducts: [],
              ApplicableProducts: [],
              BonusApplicableProducts: [],
              PCat1: [],
              PCat2: [],
              PCat3: [],
              PCat4:[],
              PClass1: [],
              PClass2: [],
              PClass3: [],
              PClass4:[],
              AppProd1: [],
              AppProd2: [],
              AppProd3: [],
              AppProd4:[],
              AppPacks1: [],
              AppPacks2: [],
              AppPacks3: [],
              AppPacks4:[],
              PainterType: [],
            },
            Rbtn: {
              PCat1: 0,
              PCat2: 0,
              PCat3: 0,
              PCat4:0,
              PClass1: 0,
              PClass2: 0,
              PClass3: 0,
              PClass4:0,
              AppProd1: 0,
              AppProd2: 0,
              AppProd3: 0,
              AppProd4:0,
              AppPacks1: 0,
              AppPacks2: 0,
              AppPacks3: 0,
              AppPacks4:0,
              Rewards: 0,
              BRewards:0,
              TopAll:0
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
              PCat4:false,
              PClass3: false,
              PClass4:false,
              AppProd3: false,
              AppProd4:false,
              AppPacks3: false,
              AppPacks4:false,
              Rewards:false,
              BRewards:false
              
            },
            Table: {
              Table1: [
                {
                  RVolume: "",
                  RPoints: "",
                },
              ],
              Table2: [],
              Table3:[{
                  ValidFrom:null,
                  ValidTo:null
              }],
              Table4:[]
            },
            oData: {
              Products: [],
              Packs: [],
              PerGrowth:[{Name:"1"},{Name:"2"},{Name:"3"},{Name:"4"},{Name:"5"}]
            },
            Fields: {
              Date1: null,
              Date2: null
            },
          };
          var oConrtrolModel = new JSONModel(oDataControl);

          var oDataView = {
            SchemeTypeId: "",
            Title: "",
            Description: "",
            StartDate: null,
            EndDate: null,
            SchemeZones: [],
            SchemeDivisions: [],
            SchemeDepots: [],
            IsSpecificPainter: false,
            SchemePainterArchiTypes: [],
            SchemePainterProducts: [],
            PotentialId: "",
            SlabId: "",
            SchemeApplicableProducts: [],
            PurchaseVolumeRequired: "",
            AccuredPointsRequired: "",
            RewardPoints: "",
            RewardCash: "",
            RewardGiftId: "",
            HasBonusPercentage: false,
            BonusRewardPoints: "",
            SchemeBonusApplicableProducts: [],
            BonusValidityDurationYear: "",
            BonusValidityDurationMonth: "",
            BonusValidityDurationDays: "",
            BonusValidityDate: null,
          };
          var oViewMOdel = new JSONModel(oDataView);
          oView.setModel(oViewMOdel, "oModelView");
          oView.setModel(oConrtrolModel, "oModelControl");

          // adding the fragment
          this._showFormFragment("ChangeDetail");
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

          //this._postDataToSave(bFileFlag);
        },

        onAfterRendering: function () {
          // this.getView().byId("startDate").setMinDate(new Date());
        },
        _postDataToSave(bFileFlag) {
          //creating the payload
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var oDataModel = oView.getModel();
          var oViewData = oModelView.getData();
          var oPayLoad = this._RemoveEmptyValue(oViewData);
          //setting up zone data in the array.
          oPayLoad["SchemeZones"] = oModelControl
            .getProperty("/MultiCombo/Zones")
            .map(function (k) {
              return { ZoneId: k };
            });
          //setting up division data in the array.
          oPayLoad["SchemeDivisions"] = oModelControl
            .getProperty("/MultiCombo/Divisions")
            .map(function (k) {
              return { DivisionId: k };
            });
          oPayLoad["SchemeDepots"] = oModelControl
            .getProperty("/MultiCombo/Depots")
            .map(function (k) {
              return { DepotId: k["DepotId"] };
            });
          //setting up the depot data in the array.
          console.log(
            oView.byId("idDepots").getTokens(),
            oModelControl.getData()
          );
          console.log(oPayLoad);

          var inTegerProperty = [
            "PurchaseVolumeRequired",
            "AccuredPointsRequired",
            "RewardPoints",
            "RewardCash",
            "BonusRewardPoints",
            "BonusValidityDurationYear",
            "BonusValidityDurationMonth",
            "BonusValidityDurationDays",
          ];
          for (var y of inTegerProperty) {
            if (oPayLoad.hasOwnProperty(y)) {
              oPayLoad[y] = parseInt(oPayLoad[y]);
            }
          }
          // setting the zone, division, depot data.

          var othat = this;
          oDataModel.create("/SchemeSet", oPayLoad, {
            success: function (data) {
              MessageToast.show("Scheme Sucessfully Created.");
              if (bFileFlag) {
                othat._UploadFile(data);
              }
              //othat._navToHome();
            },
            error: function () {
              MessageToast.show("Error In Creating the Schemes.");
            },
          });
        },
        _UploadFile: function (data) {
          var oView = this.getView();
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
