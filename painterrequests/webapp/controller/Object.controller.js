sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "../controller/Validator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, ValueState, Fragment, Validator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.painterrequests.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
           
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


            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Add").attachMatched(this._onRouterMatched, this);


        },
        _onRouterMatched: function (oEvent) {
            var sPainterId = oEvent.getParameter("arguments").Id;
            this._initData();
        },
        _initData: function () {
            var oView = this.getView();
            var othat = this;
            var c1, c2, c3;
            var c1 = othat._AddObjectControlModel("Add", null);
            c1.then(function () {
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function () {
                        c3 = othat._LoadAddFragment("AddComplaint");
                        c3.then(function () {
                            oView.getModel("oModelControl").setProperty("/PageBusy", false)
                        })
                    })
                })
            })

        },
        _setInitViewModel: function () {
            /*
             * Author: manik saluja
             * Date: 02-Dec-2021
             * Language:  JS
             * Purpose: Used to set the view data model that is bindined to value fields of control in xml
             */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oDataView = {
                Remark: "",
                ComplaintTypeId: ""
            }
            var oModel1 = new JSONModel(oDataView);
            oView.setModel(oModel1, "oModelView");
            promise.resolve();
            return promise;
        },
        _LoadAddFragment: function (mParam) {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var othat = this;
            var oVboxProfile = oView.byId("oVBoxAddObjectPage");
            var sResourcePath = oView.getModel("oModelControl").getProperty("/resourcePath")
            oVboxProfile.destroyItems();
            return Fragment.load({
                id: oView.getId(),
                controller: othat,
                name: sResourcePath + ".view.fragments." + mParam,
            }).then(function (oControlProfile) {
                oView.addDependent(oControlProfile);
                oVboxProfile.addItem(oControlProfile);
                promise.resolve();
                return promise;
            });
        },


        onPressSave: function () {

            //console.log(this.getView().getModel("oModelView").getData());
            var oView = this.getView();
            var oValidate = new Validator();
            var oForm = oView.byId("FormCondonation");

            var bFlagValidate = oValidate.validate(oForm);
            if (bFlagValidate == false) {
                MessageToast.show("Kinldy Input All the Mandatory(*) fields.");
                return;
            }
            this._postDataToSave();
        },
        _postDataToSave: function () {
            var oView = this.getView();
            var othat = this;
            var oData = oView.getModel();
            var oModelView = oView.getModel("oModelView");
            var oPayLoad = Object.assign({}, oModelView.getData());
            delete oPayLoad["AddFields"];
            delete oPayLoad["Slabs"];

            if (oView.getModel("oModelControl").getProperty("/bPayloadSent")) {
                return;
            }

            //console.log(oPayLoad);
            oView.getModel("oModelControl").setProperty("/bBusy", true);
            oView.getModel("oModelControl").setProperty("/bPayloadSent", true);

            //Double click issue solution

            oData.create("/PainterLoyaltyRedemptionRequestSet", oPayLoad, {
                success: function () {
                    MessageToast.show("Redemption request Sucessfully Submitted.")
                    othat.onNavBack();
                    oView.getModel("oModelControl").setProperty("/bBusy", false);
                },
                error: function (a) {
                    oView.getModel("oModelControl").setProperty("/bPayloadSent", false);
                    oView.getModel("oModelControl").setProperty("/bBusy", false);
                    MessageBox.error(
                        "Unable to create Redemption request due to the server issues", {
                            title: "Error Code: " + a.statusCode,
                        }
                    );

                }
            })

        },

    });

});