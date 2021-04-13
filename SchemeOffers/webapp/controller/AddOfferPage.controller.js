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

          this.oRouter
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
            BonusValidity: oBonusValidity,
            StartDate:"",
            EndDate:"",
            RewardGift:[{
                Id:1,
                Name:"TV"
            },{
                Id:2,
                Name:"Washing Machine"
            }]
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
          console.log(bFlagValidate);
          var sFile = this.getView().byId("idFileUpload").oFileUpload.files[0];
          var bFileFlag = false;
         
          if(bFlagValidate==false){
              MessageToast.show("Kinldy Input All the Mandatory(*) fields.");
              return
          }
          //check if it has file
           if(sFile!==undefined){
              bFileFlag=true
          }
          //validate the data

          this._postDataToSave(bFileFlag);
          

        },
        
        onAfterRendering: function () {
         // this.getView().byId("startDate").setMinDate(new Date());
        },
        _postDataToSave(bFileFlag) {
          //creating the payload
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
         
          var oDataModel = oView.getModel();
          var oPayLoad = this._RemoveEmptyValue(oModelView.getData());

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
          console.log(oPayLoad);
          var othat = this;
          oDataModel.create("/SchemeSet", oPayLoad, {
            success: function (data) {
              MessageToast.show("Scheme Sucessfully Created.");
                if(bFileFlag){
                    othat._UploadFile(data)
                }
              //othat._navToHome();
            },
            error: function () {
              MessageToast.show("Error In Creating the Schemes.");
            },
          });
        },
        _UploadFile:function(data){
            
            var oView = this.getView()
            var oFile = oView.byId("idFileUpload").oFileUpload.files[0];
            var sServiceUrl = this.getOwnerComponent(this)
            .getManifestObject()
            .getEntry("/sap.app").dataSources.mainService.uri;
            var sUrl =
            sServiceUrl +
            "SchemeSet(" +
            data["Id"] +
            ")/$value";
            jQuery.ajax({
                method: "PUT",
                url: sUrl ,
                cache: false,
                contentType: false,
                processData: false,
                data: oFile,
                success: function (data) {},
                error: function () {},
              })
        



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
