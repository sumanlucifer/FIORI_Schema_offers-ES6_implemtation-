sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.Catelogue.controller.App", {

        onInit: function () {
            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function () {


                //Fetch loggedIn User ID to disable delete button for loggedIn user

                var oModel = this.getOwnerComponent().getModel()
                oModel.callFunction("/GetLoggedInAdmin", {
                    method: "GET",
                    success: function (data) {
                        oViewModel.setProperty("/busy", false);
                        oViewModel.setProperty("/delay", iOriginalBusyDelay);
                        oViewModel.setProperty("/loggedUserId", data.results[0].Id);
                        oViewModel.setProperty("/loggedUserRoleId", data.results[0].RoleId);
                    }
                });
            }.bind(this);



            // disable busy indication when the metadata is loaded and in case of errors
            this.getOwnerComponent().getModel().metadataLoaded().
                then(fnSetAppNotBusy);
            this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });

});