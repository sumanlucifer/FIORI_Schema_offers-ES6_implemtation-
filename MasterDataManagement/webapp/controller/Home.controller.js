sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend(
      "com.knpl.pragati.MasterDataManagement.controller.Home",
      {
        onInit: function () {
          //console.log("this is the updated code");
          var fnSetAppNotBusy = function(oEvent){
              //console.log("Medta Data Loaded");
          };
          var fnSetNotloaded = function(){
              //console.log("Metadata Not loaded");
          }
          var oModelData = this.getOwnerComponent().getModel();
          oModelData.read("/MasterLanguageSet",{
              success:function(data){
                 // console.log(data)
              },
              error:function(data){
                //console.log(data);
              }
          })

        },
      }
    );
  }
);
