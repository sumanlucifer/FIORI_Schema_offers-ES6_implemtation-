sap.ui.define(
  [
    "com/knpl/pragati/ComplaintManagement/controller/BaseController",
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
    "com/knpl/pragati/ComplaintManagement/controller/Validator",
    "sap/ui/model/type/Date",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "com/knpl/pragati/ComplaintManagement/model/customInt",
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
    Validator,
    DateType,
    Filter,
    FilterOperator,
    DateFormat,
    History
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ComplaintManagement.controller.EditComplaint",
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
            .getRoute("RouteEditCmp")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );
          var oView = this.getView();
          var sExpandParam = "ComplaintType,Painter,ComplaintSubtype";

          console.log(oProp);

          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: oProp,
          };
          var oDataModel;
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl");
          var othat = this;
          var c1, c2, c3, c4;
          c1 = othat._loadEditProfile("Display");
          c1.then(function () {
            c2 = othat._setDisplayData(oProp);
          });
        },
        _setDisplayData: function (oProp) {
          var promise = jQuery.Deferred();
          var oView=this.getView();
          var sExpandParam = "ComplaintType,Painter,ComplaintSubtype";
            if (oProp.trim() !== "") {
              oView.bindElement({
                path: "/" + oProp,
                parameters: {
                  expand: sExpandParam,
                },
                dataRequested: function (oEvent) {
						oView.setBusy(true);
				},
				dataReceived: function (oEvent) {
                        oView.setBusy(false);
                        
				}
              });
            }
          promise.resolve();
          return promise;
        },
        _initEditData: function (oProp) {
             var promise = jQuery.Deferred();
          console.log(this.getView().getModel().getObject("/ComplaintSet(22)"));
           promise.resolve();
          return promise;
          
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
            name:
              "com.knpl.pragati.ComplaintManagement.view.fragments." +
              sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
            promise.resolve();
            return promise;
          });
        },
        handleSavePress: function () {
          console.log(this.getView().getModel().getObject("/ComplaintSet(22)"));
        },
        handleCancelPress: function () {
          this.onNavBack();
        },
        onNavBack: function (oEvent) {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("worklist", {}, true);
          }
        },
      }
    );
  }
);
