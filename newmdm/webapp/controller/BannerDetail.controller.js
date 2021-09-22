sap.ui.define(
    [
        "com/knpl/pragati/MDM/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "com/knpl/pragati/MDM/controller/Validator",
        "sap/ui/core/ValueState",
        "com/knpl/pragati/MDM/model/formatter",
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
        Filter,
        FilterOperator,
        Sorter,
        Validator,
        ValueState,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.MDM.controller.BannerDetail", {
            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    busy: false,
                    editable: false,
                });
                this.getView().setModel(oViewModel, "oModelView");
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("bannerDetail").attachMatched(this._onRouteMatched, this);
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

            },
            _onRouteMatched: function (oEvent) {
                var oProp = window.decodeURIComponent(
                    oEvent.getParameter("arguments").prop
                );
                var sMode = window.decodeURIComponent(
                    oEvent.getParameter("arguments").mode
                );
                var oView = this.getView();
                debugger;
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/MobileBannerImageSet(" + oProp + ")"
                    });
                }

                this._initData(oProp);
            },

            _initData: function (oProp) {
                var oData = {
                    modeEdit: false,
                    bindProp: "MobileBannerImageSet('" + oProp + "')",
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelControl");
                var othat = this;

                othat._showFormFragment("DetailBannerImage");
            },

            _showFormFragment: function (sFragmentName) {
                var objSection = this.getView().byId("oVbxSmtTbl");
                var oView = this.getView();
                objSection.destroyItems();
                var othat = this;
                this._getFormFragment(sFragmentName).then(function (oVBox) {
                    oView.addDependent(oVBox);
                    objSection.addItem(oVBox);
                });
            },

            _getFormFragment: function (sFragmentName) {
                var oView = this.getView();
                var othat = this;
                this._formFragments = Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.pragati.MDM.view.fragment." + sFragmentName,
                    controller: othat,
                }).then(function (oFragament) {
                    return oFragament;
                });
                // }

                return this._formFragments;
            },

            handleCancelPress: function () {
                this.onNavBack();
            },

            // _setDisplayData: function (oProp) {
            //     var promise = jQuery.Deferred();
            //     var oView = this.getView();

            //     var exPand = "PainterDetails/PainterBankDetails,PainterDetails/PainterKycDetails,PainterDetails/Depot,MasterSlabBankRedemptionDetails";
            //     var othat = this;
            //     if (oProp.trim() !== "") {
            //         oView.bindElement({
            //             path: "/" + oProp,
            //             parameters: {
            //                 expand: exPand,
            //             },
            //             events: {
            //                 dataRequested: function (oEvent) {
            //                     //  oView.setBusy(true);
            //                 },
            //                 dataReceived: function (oEvent) {
            //                     //  oView.setBusy(false);
            //                 },
            //             },
            //         });
            //     }
            //     promise.resolve();
            //     return promise;
            // },

            // _initEditData: function (oProp) {
            //     var promise = jQuery.Deferred();
            //     var oView = this.getView();
            //     var oDataValue = "";
            //     var othat = this;
            //     //var exPand = "PainterDetails/PainterBankDetails,PainterDetails/PainterKycDetails,PainterDetails/Depot,MasterSlabBankRedemptionDetails";

            //     oView.getModel("oModelControl").setProperty("/bBusy", true);
            //     return new Promise((resolve, reject) => {
            //         oView.getModel().read("/" + oProp, {

            //             success: function (data) {
            //                 var oViewModel = new JSONModel(data);
            //                 oView.getModel("oModelControl").setProperty("/bBusy", false);
            //                 oViewModel.setProperty("/Remark", "")
            //                 oView.setModel(oViewModel, "oModelView");
            //                 resolve(data)

            //             },
            //             error: function () {
            //                 oView.getModel("oModelControl").setProperty("/bBusy", false);

            //             },
            //         });
            //     })


            // },

        }

        );
    }
);