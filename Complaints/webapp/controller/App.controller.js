sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Complaints.controller.App",
      {
        onInit: function () {
          var oViewModel,
            fnSetAppNotBusy,
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

          oViewModel = new JSONModel({
            busy: true,
            delay: 0,
          });
          this.setModel(oViewModel, "appView");

          fnSetAppNotBusy = function () {
            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/delay", iOriginalBusyDelay);
          };

         function fnLoadLoginData (){
                 this.getOwnerComponent().getModel()
                     .callFunction("/GetLoggedInAdmin",{
                                    method: "GET",
                                    urlParameters: {
                                    $expand: "UserType"
                                        },
                                    success: function(data){
                                            oViewModel.setProperty("/loginData", data["results"].length > 0 ? data["results"][0] : null);
                                            fnSetAppNotBusy();
                                    }.bind(this)
                                    });
                }

          // disable busy indication when the metadata is loaded and in case of errors
          this.getOwnerComponent()
            .getModel()
            .metadataLoaded()
            .then( fnLoadLoginData.bind(this) );

          this.getOwnerComponent()
            .getModel()
            .attachMetadataFailed(fnSetAppNotBusy);

          // apply content density mode to root view
          this.getView().addStyleClass(
            this.getOwnerComponent().getContentDensityClass()
          );
          // set the model for data update and delete
            this.getOwnerComponent()
            .getModel().attachRequestSent(function () {
            oViewModel.setProperty("/busy", true);
          });
            this.getOwnerComponent()
            .getModel().attachRequestCompleted(function () {
            oViewModel.setProperty("/busy", false);
          });
        },
      }
    );
  }
);
