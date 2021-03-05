sap.ui.define(
  [
    "com/knpl/pragati/Training_Learning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
    "sap/m/DatePicker",
    "sap/ui/core/ValueState",
    "sap/ui/model/type/Date",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History"
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
    FormElement,
    Input,
    Label,
    library,
    Message,
    DatePicker,
    ValueState,
    DateType,
    Filter,
    FilterOperator,
    DateFormat,
    History
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Training_Learning.controller.TrainingTab",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter(this);
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

          oRouter
            .getRoute("RouteTrainingTab")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );
          var oView = this.getView();
          var sExpandParam =
            "TrainingQuestionnaire/TrainingQuestionnaireOptions,TrainingType";
          console.log(oProp);
          if (oProp.trim() !== "") {
            oView.bindElement({
              path: "/" + oProp,
              parameters: {
                expand: sExpandParam,
              },
            });
          }
          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: oProp,
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl2");
        //   this._loadEditProfile("Display");
        //   this._loadEditBanking("Display");
        //   this._toggleButtonsAndView(false);
          var oDataValue = this.getView()
            .getModel()
            .getObject("/" + oProp, {
              expand:
                "TrainingQuestionnaire/TrainingQuestionnaireOptions,TrainingType",
            });
          console.log(oDataValue);
        },
       
        // _initEditData: function () {
        //   var promise = jQuery.Deferred();
        //   var oView = this.getView();
        //   var othat = this;
        //   var oControlModel2 = oView.getModel("oModelControl2");
        //   var sPath = oControlModel2.getProperty("/bindProp");
        //   var oDataCtrl = {
        //     modeEdit: false,
        //     bindProp: sPath,
        //     EditTb1FDL: false,
        //     EditTb2AST: false,
        //     AnotherMobField: false,
        //     PainterAddDet: {
        //       JoiningDate: "",
        //       StateKey: "",
        //       Citykey: "",
        //       DealerId: "",
        //       SecondryDealer: [],
        //       SMobile1: "",
        //       SMobile2: "",
        //       DOJ: "",
        //     },
        //   };
        //   var oControlModel = new JSONModel(oDataCtrl);

        //   oView.setModel(oControlModel, "oModelControl");

        //   var oDataValue = oView.getModel().getObject("/" + sPath, {
        //     expand:
        //       "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,PainterKycDetails,Assets,Dealers",
        //   });
        //   // setting the value property for the date this will help in resolving the date validation
        //   // at the time of calling the validation function
          
        //   var oDate = oDataValue["JoiningDate"];
        //   var oDateFormat = DateFormat.getDateTimeInstance({
        //     pattern: "dd/MM/yyyy",
        //   });
        //   oControlModel.setProperty(
        //     "/PainterAddDet/JoiningDate",
        //     oDateFormat.format(oDate)
        //   );
        //   // setting up secondry mobile number data
        //   var iCountContact = 0;
        //   for (var j of oDataValue["PainterContact"]) {
        //     if (iCountContact == 0) {
        //       oControlModel.setProperty("/PainterAddDet/SMobile1", j["Mobile"]);
        //     } else if (iCountContact == 1) {
        //       oControlModel.setProperty("/PainterAddDet/SMobile2", j["Mobile"]);
        //       oControlModel.setProperty("/AnotherMobField", true);
        //     }
        //     iCountContact++;
        //   }

        //   // setting up Dealers data
        //   var oDealer = oDataValue["Dealers"];
        //   var oDealerArray = [];
        //   for (var i of oDealer) {
        //     oDealerArray.push(i["Id"]);
        //   }
        //   oControlModel.setProperty(
        //     "/PainterAddDet/SecondryDealer",
        //     oDealerArray
        //   );
        //   // setting up the state/city filtering data
        //   var oCity = oView.byId("cmbCity"),
        //     sStateKey = oDataValue["PainterAddress"]["StateId"] || "",
        //     aFilterCity = [],
        //     oBindingCity = oCity.getBinding("items");
        //   if (sStateKey !== "") {
        //     aFilterCity.push(
        //       new Filter("StateId", FilterOperator.EQ, sStateKey)
        //     );
        //     oBindingCity.filter(aFilterCity);
        //   }

        //   // setting up model to the view
        //   var oNewData = Object.assign({}, oDataValue);
         
      
        //   var oModel = new JSONModel(oDataValue);
        //   oView.setModel(oModel, "oModelView");
        //   // setting up the fields data so that the mobile user can also be viewed
        //   var sReqFields = [
        //     "Email",
        //     "Mobile",
        //     "Name",
        //     "PainterAddress/AddressLine1",
        //     "PainterAddress/CityId",
        //     "PainterAddress/StateId",
        //     "Preference/SecurityQuestionId",
        //     "Preference/SecurityAnswer",
        //     "PainterSegmentation/TeamSizeId",
        //     "PainterSegmentation/PainterExperience",
        //     "PainterSegmentation/SitePerMonthId",
        //     "PainterSegmentation/PotentialId",
        //     "PainterBankDetails/IfscCode",
        //     "PainterBankDetails/BankNameId",
        //     "PainterBankDetails/AccountTypeId",
        //     "PainterBankDetails/AccountNumber",
        //     "PainterBankDetails/AccountHolderName",
        //     "PainterKycDetails/KycTypeId",
        //     "PainterKycDetails/GovtId",
        //   ];
        //   var sValue = "",
        //     sPlit;
        //   for (var k of sReqFields) {
        //     sValue = oModel.getProperty("/" + k);
        //     sPlit = k.split("/");
        //     if (sPlit.length > 1) {
        //       if (
        //         toString.call(oModel.getProperty("/" + sPlit[0])) !==
        //         "[object Object]"
        //       ) {
        //         console.log(sPlit);
        //         oModel.setProperty("/" + sPlit[0], {});
        //       }
        //     }
        //     if (sValue == undefined) {
        //       oModel.setProperty("/" + k, "");
        //     }
        //   }
        //   console.log(oModel);
        //   oModel.refresh(true);
        //   promise.resolve();
        //   return promise;
        // },
        // _checkJson: function (mParam) {
        //   try {
        //     JSON.parse(mParam);
        //   } catch (e) {
        //     return false;
        //   }
        //   return true;
        // },

        _getFormFragment: function (sFragmentName) {
          var pFormFragment = this._formFragments[sFragmentName],
            oView = this.getView();

          if (!pFormFragment) {
            pFormFragment = Fragment.load({
              id: oView.getId(),
              name:
                "sap.ui.layout.sample.SimpleForm354wideDual." + sFragmentName,
            });
            this._formFragments[sFragmentName] = pFormFragment;
          }

          return pFormFragment;
        }
      }
    );
  }
);
