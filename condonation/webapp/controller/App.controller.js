sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../service/FioriSessionService"
], function (BaseController, JSONModel, FioriSessionService) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.condonation.controller.App", {

        onInit: function () {
            FioriSessionService.sessionKeepAlive();
            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function () {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            // disable busy indication when the metadata is loaded and in case of errors
            this.getOwnerComponent().getModel().metadataLoaded().
                then(fnSetAppNotBusy);
            this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);
            this.getOwnerComponent().getModel().metadataLoaded().then(this.fnLoadLoginData.bind(this));

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
          
            /*
            //No need
            this.getOwnerComponent()
                .getModel()
                .attachRequestSent(function () {
                    oViewModel.setProperty("/busy", true);
                });
            this.getOwnerComponent()
                .getModel()
                .attachRequestCompleted(function () {
                    oViewModel.setProperty("/busy", false);
                });
            */

        },
        fnLoadLoginData:function() {
                   
            var oLoginModel = this.getView().getModel("LoginInfo");
            var oViewModel = this.getView().getModel("appView");
            this.getOwnerComponent().getModel()
                .callFunction("/GetLoggedInAdmin", {
                    method: "GET",
                    urlParameters: {
                        $expand: "UserType"
                    },
                    success: function (data) {
                        if (data.hasOwnProperty("results")) {
                            if (data["results"].length > 0) {
                                data["results"][0]["UserTypeId"]=2
                                oLoginModel.setData(data["results"][0]);
                            }
                        }

                        oViewModel.setProperty("/busy", false);
                    }.bind(this),
                    error:function(){
                        oViewModel.setProperty("/busy", false);
                    }
                });
        }

    });

});