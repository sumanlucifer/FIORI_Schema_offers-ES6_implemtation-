sap.ui.define(
    [
        "com/knpl/pragati/ContactPainter/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "../service/FioriSessionService"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, FioriSessionService) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.ContactPainter.controller.App", {
                onInit: function () {
                    this.getUserInfo();
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

                    // disable busy indication when the metadata is loaded and in case of errors
                    this.getComponentModel().metadataLoaded().then(fnSetAppNotBusy);
                    this.getComponentModel().metadataLoaded().then(this.fnLoadLoginData.bind(this));
                    this.getComponentModel().attachMetadataFailed(fnSetAppNotBusy);

                    // apply content density mode to root view
                    this.getView().addStyleClass(
                        this.getOwnerComponent().getContentDensityClass()
                    );
                    this.getComponentModel().attachRequestSent(function () {
                        oViewModel.setProperty("/busy", true);
                    });
                    this.getComponentModel().attachRequestCompleted(function () {

                        oViewModel.setProperty("/busy", false);
                    });
                },
                getUserInfo: function () {
                    const url = this.getBaseURL() + "/user-api/currentUser";
                    var oModel = new JSONModel();
                    var mock = {
                        firstname: "Dummy",
                        lastname: "User",
                        email: "dummy.user@com",
                        name: "dummy.user@com",
                        displayName: "Dummy User (dummy.user@com)"
                    };
                    console.log(url)
                    oModel.loadData(url);
                    oModel.dataLoaded()
                        .then(() => {
                            //check if data has been loaded
                            //for local testing, set mock data
                            //console.log(oModel.getData())
                            if (!oModel.getData().email) {
                                oModel.setData(mock);
                            }
                          
                            this.getOwnerComponent().setModel(oModel, "userInfo");
                        })
                        .catch(() => {
                            oModel.setData(mock);
                            this.getOwnerComponent().setModel(oModel, "userInfo");
                        });
                },

                getBaseURL: function () {
                    var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                    var appPath = appId.replaceAll(".", "/");
                    var appModulePath = jQuery.sap.getModulePath(appPath);
                    return appModulePath;
                },
                fnLoadLoginData:function() {
                    console.log("function called1")
                    var oLoginModel = this.getView().getModel("LoginInfo");
                    var oViewModel = this.getView().getModel("appView");
                    this.getOwnerComponent().getModel()
                        .callFunction("/GetLoggedInAdmin", {
                            method: "GET",
                            urlParameters: {
                                $expand: "UserType,AdminZone,AdminDivision"
                            },
                            success: function (data) {
                                if (data.hasOwnProperty("results")) {
                                    if (data["results"].length > 0) {
                                        //data["results"][0]["UserTypeId"]=3;
                                        oLoginModel.setData(data["results"][0]);
                                        //console.log(oLoginModel)
                                    }
                                }

                                oViewModel.setProperty("/busy", false);
                            }.bind(this),
                            error:function(){
                                oViewModel.setProperty("/busy", false);
                            }
                        });
                }

            }
        );
    }
);