sap.ui.define(
  ["com/knpl/pragati/ContactPainter/controller/BaseController",
   "sap/ui/model/json/JSONModel" ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController,JSONModel) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.ContactPainter.controller.ProfilePainter", {
      onInit: function () {
        console.log("Contact Painter");
        this._initData();

      },
      _initData:function(){

        var oData = {
            profileEdit:false
        };
        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel,"oModelView")
      },
      onPressEdit:function(){
        var oCurrentProperty = this.getView().getModel("oModelView").getProperty("/profileEdit");
        console.log(oCurrentProperty);
        this.getView().getModel("oModelView").setProperty("/profileEdit",!oCurrentProperty);
      }
    });
  }
);
