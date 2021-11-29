sap.ui.define(
    ["./BaseController", "sap/ui/model/json/JSONModel","../service/FioriSessionService"],
    function (BaseController, JSONModel, FioriSessionService) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Complaints.controller.App",
            {
                onInit: function () {
                    FioriSessionService.sessionKeepAlive();
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

                    function fnLoadLoginData() {
                        this.getOwnerComponent().getModel().setSizeLimit(400);
                        this.getOwnerComponent().getModel()
                            .callFunction("/GetLoggedInAdmin", {
                                method: "GET",
                                urlParameters: {
                                    $expand: "UserType"
                                },
                                success: function (data) {
                                    if (data["results"].length > 0) {
                                        oViewModel.setProperty("/loginData", data["results"][0]);
                                        oViewModel.setProperty("/iUserLevel",
                                            this._getRoleLevel(data["results"][0].UserType.UserType));
                                    }


                                    fnSetAppNotBusy();
                                }.bind(this)
                            });
                    }

                    // disable busy indication when the metadata is loaded and in case of errors
                    this.getOwnerComponent()
                        .getModel()
                        .metadataLoaded()
                        .then(fnLoadLoginData.bind(this));

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

                _getRoleLevel: function (sRole) {
                    switch (sRole) {
                        case "AGENT":
                            return 1;
                        case "TL":
                            return 2;
                        case "CC_PROJECT_MANAGER":
                            return 3;
                        case "HO_MARKETING":
                            return 4;
                        default:
                            return 1;
                    }
                }

            }
        );
    }
);
