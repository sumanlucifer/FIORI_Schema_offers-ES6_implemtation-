sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.knpl.pragati.Training.controller.AddMaster", {
      onInit: function () {
        console.log("Controller Master");

        var oRouter = this.getOwnerComponent().getRouter();
        this._formFragments = {};

        oRouter.getRoute("RouteAddMaster").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (oEvent) {
        
        var sArgMode = oEvent.getParameter("arguments").mode;
        this._initData(sArgMode);
        console.log(sArgMode);
      },
      _initData: function (mMode) {
        var oData = {
          Mode: mMode,
          FormData: {
            TrainingType: "",
          },
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "oModelView");
        
      },
      onPressSave: function () {
        var oView = this.getView();
        var oDataModel = oView.getModel();
        var oMdlView = oView.getModel("oModelView");
        var aPayload = oMdlView.getProperty("/FormData");
        console.log(aPayload);
        if (aPayload["TrainingType"].trim() == "") {
          MessageBox.error("Kindly enter Training Type");
          return;
        }
        oDataModel.create("/MasterTrainingTypeSet", aPayload, {
          success: function (data) {
            MessageToast.show("Successfully Created.");
          },
          error: function (data) {
            var oRespText = JSON.parse(data.responseText);
            MessageBox.error(oRespText["error"]["message"]["value"]);
          },
        });
      },
      onNavBtnPress: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        var oView = this.getView();
        oRouter.navTo("TargetList", {
          mode: "Add",
          prop:"none"
        });
      },
      onEditPress: function (oEvent) {
        var oRouter = this.getOwnerComponent().getRouter();
         var sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .substr(1);
        var oView = this.getView();
        oRouter.navTo("TargetList", {
          mode: "Edit",
          prop:sPath
        });
      },
    });
  }
);
