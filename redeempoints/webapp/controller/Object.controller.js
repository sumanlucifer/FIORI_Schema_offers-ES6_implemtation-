sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "com/knpl/pragati/redeempoints/model/cmbxDtype2",
    "com/knpl/pragati/redeempoints/controller/Validator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, ValueState, Fragment, cmbxDtype2, Validator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.redeempoints.controller.Object", {
        cmbxDtype2: cmbxDtype2,
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
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
            this._initData(sPainterId);
        },
        _initData: function (mParam1) {
            var oView = this.getView();

            var oDataControl = {
                bBusy: false,
                bEnable:false,
                bPayloadSent: false,
                aQuantity: [{ value: "1", key: 1 }, { value: "2", key: 2 }, { value: "3", key: 3 }, { value: "4", key: 4 }, { value: "5", key: 5 }, { value: "6", key: 6 }, { value: "7", key: 7 }, { value: "8", key: 8 }, { value: "9", key: 9 }, { value: "10", key: 10 }],
                aFileds: {
                    MembershipId: "",
                    PainterName: ""
                }
            };
            var oDataView = {
                PainterId: "",
                AddFields: {
                    CategoryId: "",
                    ClassId: "",
                    ProductId: "",
                    Mobile: "",
                    Name: "",
                    MembershipCard: "",
                    Points: 0,
                    ZoneId: "",
                    DivisionId: "",
                    Depot: "",
                    PDealer: "",
                    Otp: "",//integer
                    Slab:""
                },
                Remark: "",
                ComplaintStatus: "RESOLVED",
                ApprovalStatus: "APPROVED",
                ResolutionType: 2,
                ComplaintSubtypeId: 1,
                ComplaintTypeId: 1,
                PainterComplainProducts: [{
                    PainterId: "",//integer
                    ProductSKUCode: "",
                    ProductQuantity: 1,//integer
                    Points: 0,//integer

                }]
            }
            var oModel1 = new JSONModel(oDataView);
            var oModel2 = new JSONModel(oDataControl)
            oView.setModel(oModel1, "oModelView");
            oView.setModel(oModel2, "oModelControl");
            this._showFormFragment("Add");
            console.log(mParam1);
            if (mParam1 !== "new") {
                this._getPainterDetails(mParam1);
            }


        },
        _getInitialPainterDetails: function (mParam1) {
            var oView = this.getView()
            var oData = oView.getModel()
            var sPath = "/PainterSet(" + mParam1 + ")";

            oData.read(sPath, {
                success: function () {

                },
                error: function () {

                }
            })
        },

        onPressSave: function () {

            console.log(this.getView().getModel("oModelView").getData());
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

            if (oView.getModel("oModelControl").getProperty("/bPayloadSent")) {
                return;
            }

            //console.log(oPayLoad);
            oView.getModel("oModelControl").setProperty("/bBusy", true);
            oView.getModel("oModelControl").setProperty("/bPayloadSent", true);

            //Double click issue solution

            oData.create("/PainterComplainsSet", oPayLoad, {
                success: function () {
                    MessageToast.show("Condonation request Sucessfully Submitted.")
                    othat.onNavBack();
                    oView.getModel("oModelControl").setProperty("/bBusy", false);
                },
                error: function (a) {
                    oView.getModel("oModelControl").setProperty("/bPayloadSent", false);
                    oView.getModel("oModelControl").setProperty("/bBusy", false);
                    MessageBox.error(
                        "Unable to create Condonation request due to the server issues",
                        {
                            title: "Error Code: " + a.statusCode,
                        }
                    );

                }
            })

        },
        onCategoryChange: function (oEvent) {
            this._ClearProdPack()

        },
        onClassificationChange: function () {
            this._ClearProdPack()
        },
        _ClearProdPack: function () {
            var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            oModel.setProperty("/AddFields/ProductId", "")
            oModel.setProperty("/PainterComplainProducts/0/ProductSKUCode", "");
            oModel.refresh();
            var oFilter = [];
            var sCategory = oModel.getProperty("/AddFields/CategoryId");
            //var sClass = oModel.getProperty("/AddFields/ClassId");
            if (sCategory) {
                oFilter.push(new Filter("ProductCategory/Id", FilterOperator.EQ, sCategory));
            }
            // if (sClass) {
            //     oFilter.push(new Filter("ProductClassification/Id", FilterOperator.EQ, sClass));
            // }

            oView.byId("Products").getBinding("items").filter(oFilter);
        },
        onProductChange: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            oModel.setProperty("/PainterComplainProducts/0/ProductSKUCode", "");
            var aFilter = new Filter("ProductCode", FilterOperator.EQ, sKey);
            oView.byId("Packs").getBinding("items").filter(aFilter)
        },
        onPackChange: function (oEvent) {
            var oView = this.getView();
            var sKey = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
            var oModel = oView.getModel("oModelView");
            oModel.setProperty("/PainterComplainProducts/0/Points", parseInt(sKey["Points"]));
            oModel.setProperty("/PainterComplainProducts/0/ProductQuantity", 1);


        },
        onValueHelpRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name:
                        "com.knpl.pragati.redeempoints.view.subview.ValueHelpDialog",
                    controller: this,
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding


                // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });
        },
        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter(
                [
                    new Filter({
                        path: "Name",
                        operator: "Contains",
                        value1: sValue.trim(),
                        caseSensitive: false
                    }),
                    new Filter("Mobile", FilterOperator.Contains, sValue.trim()),
                ],
                false
            );

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        onValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);
            var oViewModel = this.getView().getModel("oModelView");
            if (!oSelectedItem) {
                return;
            }
            var obj = oSelectedItem.getBindingContext().getObject();

            this._getPainterDetails(obj["Id"]);
        },
        _getPainterDetails: function (mParam) {
            var oView = this.getView();
            var oData = oView.getModel();
            var oViewModel = oView.getModel("oModelView");
            var sPath = "/PainterSet(" + mParam + ")";

            //Added Busy
            oView.getModel("oModelControl").setProperty("/bBusy", true);

            oData.read(sPath, {
                urlParameters: {
                    $expand: 'Depot,PrimaryDealerDetails',
                    $select: 'Id,MembershipCard,Mobile,ZoneId,Name,DivisionId,Depot/Depot,PrimaryDealerDetails/DealerName'
                },
                success: function (obj) {
                    oView.getModel("oModelControl").setProperty("/bBusy", false);
                    oView.getModel("oModelControl").setProperty("/bEnable", true);

                    oViewModel.setProperty(
                        "/AddFields/MembershipCard",
                        obj["MembershipCard"]
                    );
                    oViewModel.setProperty("/AddFields/Mobile", obj["Mobile"]);
                    oViewModel.setProperty("/AddFields/Name", obj["Name"]);
                    oViewModel.setProperty("/AddFields/ZoneId", obj["ZoneId"]);
                    oViewModel.setProperty("/AddFields/DivisionId", obj["DivisionId"]);
                    oViewModel.setProperty("/PainterComplainProducts/0/PainterId", obj["Id"]);
                    oViewModel.setProperty("/PainterId", obj["Id"]);
                    if (obj["Depot"]) {
                        oViewModel.setProperty("/AddFields/Depot", obj["Depot"]["Depot"]);
                    }
                    if (obj["PrimaryDealerDetails"]) {
                        oViewModel.setProperty("/AddFields/PDealer", obj["PrimaryDealerDetails"]["DealerName"]);
                    }
                },
                error: function () {
                    oView.getModel("oModelControl").setProperty("/bBusy", false);
                }
            })
        },
        onPointsChange: function (oEvent) {
            var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            // var iPoints = oModel.getProperty("/PainterComplainProducts/0/Points");
            // var sKey = oEvent.getSource().getSelectedKey();
            // var aNewPoints = iPoints * sKey;
            // oModel.setProperty("/PainterComplainProducts/0/Points", aNewPoints);

        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */



        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */



        _setView: function () {

            var oViewModel = this.getModel("objectView"),
                data = {
                    PainterId: "",
                    ComplaintTypeId: "",
                    ComplaintSubtypeId: "",
                    ResolutionId: "",
                    TokenCode: "",
                    RewardPoints: "",
                    RewardGiftId: "",
                    ResolutionOthers: ""
                };


            oViewModel.setProperty("/oDetails", data);

        },

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
        _bindView: function (sObjectPath) {
            var oViewModel = this.getModel("objectView"),
                oDataModel = this.getModel();

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oDataModel.metadataLoaded().then(function () {
                            // Busy indicator on view should only be set if metadata is loaded,
                            // otherwise there may be two busy indications next to each other on the
                            // screen. This happens because route matched handler already calls '_bindView'
                            // while metadata is loaded.
                            oViewModel.setProperty("/bBusy", true);
                        });
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/bBusy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Id,
                sObjectName = oObject.AgeGroupId;

            oViewModel.setProperty("/busy", false);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },




        _filterProduct: function (aFilters) {

            var oViewModel = this.getModel("objectView"),
                aFilters = [];

            if (oViewModel.getProperty("/ProductCategory"))
                aFilters.push(new Filter("ProductCategory/Id", FilterOperator.EQ, oViewModel.getProperty("/ProductCategory")));

            if (oViewModel.getProperty("/ProductClassification"))
                aFilters.push(new Filter("ProductClassification/Id", FilterOperator.EQ, oViewModel.getProperty("/ProductClassification")));

            this.getView().byId(sap.ui.core.Fragment.createId("Add", "Product")).getBinding("items").filter(aFilters);

            oViewModel.setProperty("/ProductId", "");
        },
        /*Aditya changes start*/
        onSendOtp: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oModelView = this.getModel("oModelView");
            var mobile = oModelView.getProperty("/AddFields/Mobile")
            var btnOtp = this.getView().byId("btnOTP"),
                inputOtp = this.getView().byId("inputOTP"),
                btnOtpResend = this.getView().byId("btnOTPResend"),
                verifyOtp = this.getView().byId("btnOTPVerify");

            oModel.callFunction(
                "/SendMobileOTP", {
                method: "GET",
                urlParameters: {
                    Mobile: mobile
                },
                success: function (oData, response) {
                    btnOtp.setVisible(false);
                    inputOtp.setVisible(true);
                    btnOtpResend.setVisible(true);
                    verifyOtp.setVisible(true);
                    //  var jModel = new sap.ui.model.json.JSONModel();
                    //  var myData = {};
                    //  myData.Fare = oData;
                    //  jModel.setData(myData);
                    //  oContext.getView().setModel(jModel, "fareModel");
                },
                error: function (oError) {

                }
            });

        },
        onVerifyOtp: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oModelView = this.getModel("oModelView");
            var mobile = oModelView.getProperty("/AddFields/Mobile"),
                otp = oModelView.getProperty("/AddFields/Otp");
            oModel.callFunction(
                "/VerifyMobileOTP", {
                method: "GET",
                urlParameters: {
                    Mobile: mobile,
                    MobileOTP: parseInt(otp),
                    DeviceId:1234,
                    DeviceType:"Android"
                },
                success: function (oData, response) {
                        var data=oData.results[0];
                        if(data["ErrorCode"]==417){
                            MessageToast.show("Enter valid OTP.")
                        }
                    //  var jModel = new sap.ui.model.json.JSONModel();
                    //  var myData = {};
                    //  myData.Fare = oData;
                    //  jModel.setData(myData);
                    //  oContext.getView().setModel(jModel, "fareModel");
                },
                error: function (oError) {

                }
            });

        },
        onValueHelpSlabs: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name:
                        "com.knpl.pragati.redeempoints.view.subview.ValueHelpDialogSlabs",
                    controller: this,
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding


                // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });

        },
        onValueHelpSlabsClose: function (oEvent) {
            var oModelView=this.getModel("oModelView");
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);
            var oViewModel = this.getView().getModel("oModelView");
            if (!oSelectedItem) {
                return;
            }
            var obj = oSelectedItem.getBindingContext().getObject();

            oModelView.setProperty("/AddFields/Slab",obj["RequestType"]);
            //this._getPainterDetails(obj["Id"]);
        },
        onValueHelpSlabsSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter(
                [
                    new Filter({
                        path: "RequestType",
                        operator: "Contains",
                        value1: sValue.trim(),
                        caseSensitive: false
                    }),
                    new Filter("Category", FilterOperator.Contains, sValue.trim()),
                ],
                false
            );

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        /*Aditya chnages end*/

    });

});