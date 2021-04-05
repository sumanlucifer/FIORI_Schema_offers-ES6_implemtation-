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
          customInt:customInt,
          cmbxDtype2:cmbxDtype2,
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
        _initData:function(){
            var oView = this.getView();
            var oDataControl = {

            }
            var oConrtrolModel = new JSONModel(oDataControl)

            var oDataView = {
                SchemeTypeIdd:"",
                Title:"",
                Description:"",
                StartDate:null,
                EndDate:null
            }
            var oViewMOdel = new JSONModel(oDataView);
            oView.setModel(oViewMOdel,"oModelView");
            oView.setModel(oDataControl,"oModelControl");
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
            //validate the data 

            this._postDataToSave();

        },
        _postDataToSave(){
            //creating the payload
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            console.log(oModelView.getData());

        }
      }
    );
  }
);
