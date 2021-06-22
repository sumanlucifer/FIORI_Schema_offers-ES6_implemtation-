sap.ui.define(
    [
        "com/knpl/pragati/ContactPainter/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/layout/form/FormElement",
        "sap/m/Input",
        "sap/m/Label",
        "sap/ui/core/library",
        "sap/ui/core/message/Message",
        "sap/m/DatePicker",
        "sap/ui/core/ValueState",
        "com/knpl/pragati/ContactPainter/controller/Validator",
        "sap/ui/model/type/Date",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/format/DateFormat",
        "sap/ui/core/routing/History",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/VBox",
        "sap/m/Token",
        "sap/m/ObjectStatus",
        "com/knpl/pragati/ContactPainter/model/customInt",
        "com/knpl/pragati/ContactPainter/model/cmbxDtype2",
        "../model/formatter"
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
        FormElement,
        Input,
        Label,
        library,
        Message,
        DatePicker,
        ValueState,
        Validator,
        DateType,
        Filter,
        FilterOperator,
        DateFormat,
        History,
        Dialog,
        Button,
        VBox,
        Token,
        ObjectStatus,
        customInt1,
        customInt2,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.ContactPainter.controller.ProfilePainter", {
            formatter: formatter,
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter(this);
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

                oRouter
                    .getRoute("RouteProfile")
                    .attachMatched(this._onRouteMatched, this);
            },
            _onRouteMatched: function (oEvent) {
                var oProp = window.decodeURIComponent(
                    oEvent.getParameter("arguments").prop
                );
                var oView = this.getView();
                var sExpandParam =
                    "AgeGroup,Depot,PainterType,Slab,MaritalStatus,Religion,BusinessCategory,BusinessGroup,ArcheType,Preference/Language,PainterContact,PrimaryDealerDetails,PainterAddress/CityDetails,PainterAddress/StateDetails,PainterSegmentation/TeamSizeDetails,PainterSegmentation/PainterExperienceDetails,PainterSegmentation/SitePerMonthDetails,PainterSegmentation/PotentialDetails ,PainterFamily/RelationshipDetails,PainterBankDetails/AccountTypeDetails,PainterBankDetails/BankNameDetails,Vehicles/VehicleTypeDetails,Dealers,Preference/SecurityQuestion,PainterKycDetails/KycTypeDetails";
                console.log(oProp);
                if (oProp.trim() !== "") {
                    oView.bindElement({
                        path: "/PainterSet(" + oProp + ")",
                        parameters: {
                            expand: sExpandParam,
                        },
                    });
                }
                this._initData(oProp);
            },
            _initData: function (oProp) {
                var oData = {
                    modeEdit: false,
                    bindProp: "PainterSet(" + oProp + ")",
                    iCtbar: true,
                    PainterId: oProp, //.replace(/[^0-9]/g, ""),
                    //ProfilePic:"/KNPL_PAINTER_API/api/v2/odata.svc/PainterSet(717)/$value",
                    ProfilePic: "/KNPL_PAINTER_API/api/v2/odata.svc/PainterSet(" +
                        oProp +
                        ")/$value",
                    Search: {
                        Referral: "",
                        Tokens: "",
                        Complains: "",
                        //LoyaltyPoints: "",
                    },
                    ApplyLoyaltyPoints: "",
                    AddReferral: {
                        ReferralName: "",
                        ReferralMobile: "",
                        ReferralEmail: "",
                    },
                    tableDealay: 0,
                    selectedSection: "referral"
                };
                var oView = this.getView();
                var oModel = new JSONModel(oData);

                oView.setModel(oModel, "oModelControl2");
                var c1, c2, c3, c4;
                var othat = this;
                c1 = othat._loadEditProfile("Display");
                c1.then(function () {
                    c2 = othat._loadEditBanking("Display");
                    c2.then(function () {
                        c3 = othat._loadEditKyc("Display");
                        c3.then(function () {
                            c4 = othat._toggleButtonsAndView(false);
                        })
                    })
                })

                // this._loadEditProfile("Display");
                // this._loadEditBanking("Display");
                // this._loadEditKyc("Display"); 
                // 


                //rebind Loyalty table

                this._initFilerForTables();
                oView.byId("ObjectPageLayout").setSelectedSection(oView.byId("profile"));

            },
            onSectionChange: function (oEvent) {
                var oView = this.getView();
                var oSection = oEvent.getParameter("section");
                var sId = oSection.getId();
                if (sId.match("loyaltysection")) {
                    oView.byId("smrtLoyalty").rebindTable();
                } else if (sId.match("learnSection")) {
                    console.log("learnSection")
                    oView.byId("smrtLiveTraining").rebindTable();
                    oView.byId("smrtOfflineTraining").rebindTable();
                    oView.byId("smrtVideoTraining").rebindTable();
                }


            },

            handleEditPress: function () {
                this._toggleButtonsAndView(true);
                var oView = this.getView();
                var oCtrl2Model = oView.getModel("oModelControl2");
                oCtrl2Model.setProperty("/modeEdit", true);
                oCtrl2Model.setProperty("/iCtbar", false);
                var c1, c2, c3, c4;
                var othat = this;
                c1 = othat._loadEditProfile("Edit");
                c1.then(function () {
                    c2 = othat._loadEditBanking("Edit");
                    c2.then(function () {
                        c3 = othat._loadEditKyc("Edit"); //Aditya Changes
                        c3.then(function () {
                            c4 = othat._initEditData();
                            c4.then(function () {
                                othat.getView().getModel("oModelView").refresh(true);
                                othat._RefreshSmartables();
                            });
                        });
                    });
                });

                // this._initSaveModel();
            },
            _RefreshSmartables: function () {
                var oView = this.getView();
                oView.byId("smrtLoyalty").rebindTable();
                oView.byId("smrtLiveTraining").rebindTable();
                oView.byId("smrtOfflineTraining").rebindTable();
                oView.byId("smrtVideoTraining").rebindTable();
            },
            _initEditData: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oControlModel2 = oView.getModel("oModelControl2");
                var sPath = oControlModel2.getProperty("/bindProp");
                var iPainterId = parseInt(oControlModel2.getProperty("/PainterId"));

                var oDataCtrl = {
                    modeEdit: false,
                    bindProp: sPath,
                    PainterId: iPainterId,
                    EditTb1FDL: false,
                    EditTb2AST: false,
                    AnotherMobField: false,
                    BankExistStatus: "",
                    AddNewBank: false,
                    EditBank: false,//Aditya Chnage
                    EditBankButton: false,//Aditya Chnage
                    AddBankDocButton: false,//Aditya Chnage
                    InitialDocType: "",//Aditya Chnage
                    AddBankDoc: false,//Aditya Chnage
                    EditField:false,
                    DocumentType: [{ Name: "Passbook", Id: 0 }, { Name: "Cheque", Id: 1 }],//Aditya Chnage
                    KycImage: {
                        Image1: "",
                        Image2: "",
                    },
                    BankImage: {
                        Image1: ""
                    },
                    PainterAddBanDetails: {
                        AccountHolderName: "",
                        AccountTypeId: "",
                        BankNameId: "",
                        AccountNumber: "",
                        IfscCode: "",
                        PainterId: iPainterId,
                        Status: "PENDING",
                    },
                    PainterAddDet: {
                        JoiningDate: "",
                        StateKey: "",
                        Citykey: "",
                        DealerId: "",
                        SecondryDealer: [],
                        SMobile1: "",
                        SMobile2: "",
                        DOJ: "",
                        ConfrmAccNum: "",
                    },
                };
                var oControlModel = new JSONModel(oDataCtrl);

                oView.setModel(oControlModel, "oModelControl");

                var oDataValue = oView.getModel().getObject("/" + sPath, {
                    expand: "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,PainterKycDetails,Vehicles,Dealers",
                });
                // setting the value property for the date this will help in resolving the date validation
                // at the time of calling the validation function

                var oDate = oDataValue["JoiningDate"];
                var oDateFormat = DateFormat.getDateTimeInstance({
                    pattern: "dd/MM/yyyy",
                });
                oControlModel.setProperty(
                    "/PainterAddDet/JoiningDate",
                    oDateFormat.format(oDate)
                );
                // setting up secondry mobile number data
                var iCountContact = 0;
                for (var j of oDataValue["PainterContact"]) {
                    if (iCountContact == 0) {
                        oControlModel.setProperty("/PainterAddDet/SMobile1", j["Mobile"]);
                    } else if (iCountContact == 1) {
                        oControlModel.setProperty("/PainterAddDet/SMobile2", j["Mobile"]);
                        oControlModel.setProperty("/AnotherMobField", true);
                    }
                    iCountContact++;
                }

                // setting up Dealers data

                // setting up the state/city filtering data
                var oCity = oView.byId("cmbCity"),
                    sStateKey = oDataValue["PainterAddress"]["StateId"] || "",
                    aFilterCity = [],
                    oBindingCity = oCity.getBinding("items");
                if (sStateKey !== "") {
                    aFilterCity.push(
                        new Filter("StateId", FilterOperator.EQ, sStateKey)
                    );
                    oBindingCity.filter(aFilterCity);
                }
                //setting up the filtering data for the Depot, Divisio
                var sZoneId = oDataValue["ZoneId"];
                if (sZoneId !== null) {
                    oView
                        .byId("idDivision")
                        .getBinding("items")
                        .filter(new Filter("Zone", FilterOperator.EQ, sZoneId));
                }
                var sDivisionId = oDataValue["DivisionId"];
                if (sDivisionId !== null) {
                    oView
                        .byId("idDepot")
                        .getBinding("items")
                        .filter(new Filter("Division", FilterOperator.EQ, sDivisionId));
                }
                var sDepotId = oDataValue["DepotId"];
                if (oDataValue["DealerId"]) {
                    oView.byId("idMinpPDealers").addToken(
                        new Token({
                            text: "{PrimaryDealerDetails/DealerName} - " +
                                oDataValue["DealerId"],
                        })
                    );
                }

                var oSecTokens = oDataValue["Dealers"];

                oControlModel.setProperty(
                    "/PainterAddDet/SecondryDealer",
                    oSecTokens
                );


                // setting up kyc data
                //var oKycData = oDataValue["PainterBankDetails"];
                if (oDataValue.hasOwnProperty("PainterKycDetails")) {
                    var oKycData = oDataValue["PainterKycDetails"];
                    if (oKycData.hasOwnProperty("Id")) {
                        var sKycImageUrl1 =
                            "/KNPL_PAINTER_API/api/v2/odata.svc/PainterKycDetailsSet(" +
                            oKycData["Id"] +
                            ")/$value?image_type=front";
                        var sKycImageUrl2 =
                            "/KNPL_PAINTER_API/api/v2/odata.svc/PainterKycDetailsSet(" +
                            oKycData["Id"] +
                            ")/$value?image_type=back";
                        oControlModel.setProperty("/KycImage/Image1", sKycImageUrl1);
                        oControlModel.setProperty("/KycImage/Image2", sKycImageUrl2);
                    }
                }
                /*Aditya changes start*/
                if (oDataValue.hasOwnProperty("PainterBankDetails")) {
                    var oBankData = oDataValue["PainterBankDetails"];

                    var InitialDocType = oBankData["DocumentType"];
                    oControlModel.setProperty("/InitialDocType", InitialDocType);

                    if (oBankData.hasOwnProperty("Id")) {
                        if (oBankData["DocumentType"] == 0) {
                            var sBankImageUrl1 =
                                "/KNPL_PAINTER_API/api/v2/odata.svc/PainterBankDetailsSet(" +
                                oBankData["Id"] +
                                ")/$value?image_type=passbook";
                        } else if (oBankData["DocumentType"] == 1) {
                            var sBankImageUrl1 =
                                "/KNPL_PAINTER_API/api/v2/odata.svc/PainterBankDetailsSet(" +
                                oBankData["Id"] +
                                ")/$value?image_type=cheque";
                        }
                        oControlModel.setProperty("/BankImage/Image1", sBankImageUrl1);
                        //oControlModel.setProperty("/KycImage/Image2", sBankImageUrl2);
                    }
                }
                /*Aditya changes end*/

                // setting up model to the view
                var oNewData = Object.assign({}, oDataValue);

                var oModel = new JSONModel(oDataValue);
                oView.setModel(oModel, "oModelView");
                // setting up the fields data so that the mobile user can also be viewed
                var sReqFields = [
                    "Email",
                    "Mobile",
                    "Name",
                    "PainterTypeId",
                    "MaritalStatusId",
                    "ReligionId",
                    "HouseType",
                    "BusinessCategoryId",
                    "BusinessGroupId",
                    "ArcheTypeId",
                    "DivisionId",
                    "DepotId",
                    "ZoneId",
                    "PainterAddress/AddressLine1",
                    "PainterAddress/Town",
                    "PainterAddress/CityId",
                    "PainterAddress/StateId",
                    "PainterAddress/PinCode",
                    "Preference/SecurityQuestionId",
                    "Preference/SecurityAnswer",
                    "PainterSegmentation/TeamSizeId",
                    "PainterSegmentation/PainterExperience",
                    "PainterSegmentation/SitePerMonthId",
                    "PainterSegmentation/PotentialId",
                    "PainterBankDetails/IfscCode",
                    "PainterBankDetails/BankNameId",
                    "PainterBankDetails/AccountTypeId",
                    // "PainterBankDetails/AccountNumber",
                    // "PainterBankDetails/AccountHolderName",
                    // "PainterKycDetails/KycTypeId",
                    // "PainterKycDetails/GovtId",
                ];
                var sValue = "",
                    sPlit;
                for (var k of sReqFields) {
                    sValue = oModel.getProperty("/" + k);
                    sPlit = k.split("/");
                    if (sPlit.length > 1) {
                        if (
                            toString.call(oModel.getProperty("/" + sPlit[0])) !==
                            "[object Object]"
                        ) {
                            oModel.setProperty("/" + sPlit[0], {});
                        }
                    }
                    if (sValue == undefined) {
                        oModel.setProperty("/" + k, "");
                    }
                }

                oModel.refresh(true);
                oControlModel.refresh(true);
                promise.resolve();
                return promise;
            },
            _checkJson: function (mParam) {
                try {
                    JSON.parse(mParam);
                } catch (e) {
                    return false;
                }
                return true;
            },
            _setCopyForFragment: function () { },
            handleSavePress: function () {
                // this._toggleButtonsAndView(false);
                var oView = this.getView();
                // oView.getModel("oModelControl").setProperty("/modeEdit", false);
                this.onPressSave();
                // this._postDataToSave();
            },

            // onCrossNavigate: function(sSemAction){
            //       var oNavigationHandler = new sap.ui.generic.app.navigation.service.NavigationHandler(this);
            //        oNavigationHandler.navigate("Manage", sSemAction, {Add: true});
            // },



            onCloseStatus: function () {
                this.byId("ChangeStatus").close();

            },

            onChangeStatus: function () {

                var oView = this.getView(),
                    aStatus = [{
                        key: "ACTIVATED"
                    }, {
                        key: "DEACTIVATED"
                    }, {
                        key: "NOT_CONTACTABLE"
                    }],
                    oModelControl = oView.getModel("oModelControl2"),
                    sCurrentStatus = oView.getBindingContext().getProperty("ActivationStatus"),
                    oChangeStatus = {
                        aApplicableStatus: aStatus.filter(ele => ele.key != sCurrentStatus),
                        oPayload: {
                            ActivationStatus: "",
                            ActivationStatusChangeReason: ""
                        }
                    };

                oModelControl.setProperty("/oChangeStatus", oChangeStatus);

                // create dialog lazily
                if (!this.byId("ChangeStatus")) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.ContactPainter.view.fragments.ChangeStatus",
                        controller: this
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oView.addDependent(oDialog);
                        oDialog.open();
                    });
                } else {
                    this.byId("ChangeStatus").open();
                }
            },

            onConfirmStatus: function () {
                var oPayload = this.getView().getModel("oModelControl2").getProperty("/oChangeStatus/oPayload");

                if (!oPayload.ActivationStatus)
                    return;

                if (!oPayload.ActivationStatusChangeReason)
                    return;

                var sPath = this.getView().getBindingContext().getPath();
                this.getView().getModel().update(sPath +
                    "/ActivationStatus", oPayload, {
                    success: function () {
                        MessageToast.show(`Status has been changed to ${oPayload.ActivationStatus}`);
                        this.onCloseStatus();
                    }.bind(this)
                })


            },

            onCrossNavigate: function (sAction) {
                console.log("Cross Navigate Trigerred");
                var sPainterId = this.getView().getModel("oModelControl2").getProperty("/PainterId") + "";
                console.log(sPainterId);
                this.Navigate({
                    target: {
                        semanticObject: "Manage",
                        action: sAction,
                        params: {
                            PainterId: sPainterId
                        }
                    }
                });
            },

            Navigate: function (oSemAct) {
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                    oCrossAppNav.toExternal({
                        target: {
                            semanticObject: oSemAct.target.semanticObject,
                            action: oSemAct.target.action
                        },
                        params: oSemAct.target.params
                    })
                }
            },

            onPressSave: function () {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModel = oView.getModel("oModelView");
                var oValidator = new Validator();
                var oVbox1 = oView.byId("ObjectPageLayout");
                // var oVbox2 = oView.byId("idVbBanking");
                var bValidation = oValidator.validate(oVbox1, true);
                var cValidation = true; // oValidator.validate(oVbox2);
                var dTbleFamily = !oModelControl.getProperty("/EditTb1FDL");
                var eTbleAssets = !oModelControl.getProperty("/EditTb2AST");
                var sBankId = oModelControl.getProperty("/EditBank");
                var addBankDoc = oModelControl.getProperty("/AddBankDoc");
                if(addBankDoc){
                    this.eValidateBank = this._CheckTheBank();//Aditya chnages
                }
                
                this.sServiceURI = this.getOwnerComponent(this)
                    .getManifestObject()
                    .getEntry("/sap.app").dataSources.mainService.uri;
                if (dTbleFamily == false) {
                    MessageToast.show(
                        "Kindly save the details in the 'Family Details' table to continue."
                    );
                }
                if (eTbleAssets == false) {
                    MessageToast.show(
                        "Kindly save the details in the 'Vehicles Details' table to continue."
                    );
                }
                if (bValidation == false) {
                    MessageToast.show(
                        "Kindly input all the mandatory(*) fields to continue."
                    );
                }
                if (cValidation == false) {
                    MessageToast.show(
                        "Kindly input all the mandatory(*) fields to continue."
                    );
                }
                
                    if(addBankDoc){
                        if (this.eValidateBank == false) {
                         MessageToast.show("Kindly upload the image of the selected Bank Details.");
                        }
                         if (bValidation && dTbleFamily && eTbleAssets && cValidation && this.eValidateBank) {
                            this._postDataToSave();
                        }
                    }
                   else {
                    if (bValidation && dTbleFamily && eTbleAssets && cValidation) {
                        this._postDataToSave();
                    }
                }

            },

            _postDataToSave: function () {
                var oView = this.getView();
                var oCtrlModel = oView.getModel("oModelControl");
                var oViewModel = this.getView().getModel("oModelView");
                var oViewData = oViewModel.getData();
                var othat = this;
                var oPayload = Object.assign({}, oViewData);
                for (var prop of oPayload["PainterFamily"]) {
                    if (prop.hasOwnProperty("editable")) {
                        delete prop["editable"];
                    }
                }
                for (var prop of oPayload["Vehicles"]) {
                    if (prop.hasOwnProperty("editable")) {
                        delete prop["editable"];
                    }
                }

                // setting up contact number data
                var aPainterSecContact = [];
                var SMobile1 = JSON.parse(
                    JSON.stringify(oCtrlModel.getProperty("/PainterAddDet/SMobile1"))
                );
                var SMobile2 = JSON.parse(
                    JSON.stringify(oCtrlModel.getProperty("/PainterAddDet/SMobile2"))
                );
                var aPainterSecContact = [];
                if (SMobile1.trim() !== "") {
                    aPainterSecContact.push({
                        Mobile: SMobile1
                    });
                }
                if (SMobile2.trim() !== "") {
                    aPainterSecContact.push({
                        Mobile: SMobile2
                    });
                }
                oPayload["PainterContact"] = aPainterSecContact;

                // dealer data save
                var oSecondryDealer = oCtrlModel.getProperty(
                    "/PainterAddDet/SecondryDealer"
                );

                var oDealers = [];
                for (var i of oSecondryDealer) {
                    oDealers.push({
                        Id: i["Id"].toString()
                    });
                }

                oPayload["Dealers"] = oDealers;

                //removing the empty values from gen data, painteraddress,preference,segmentation
                var oData = this.getView().getModel();
                var sPath = "/" + oCtrlModel.getProperty("/bindProp");
                for (var a in oPayload) {
                    if (oPayload[a] === "") {
                        oPayload[a] = null;
                    }
                }
                for (var b in oPayload["Preference"]) {
                    if (oPayload["Preference"][b] === "") {
                        oPayload["Preference"][b] = null;
                    }
                }
                for (var c in oPayload["PainterSegmentation"]) {
                    if (oPayload["PainterSegmentation"][c] === "") {
                        oPayload["PainterSegmentation"][c] = null;
                    }
                }
                var aFlagSeg = ["TeamSizeId", "PainterExperience", "SitePerMonthId", "PotentialId"];
                var bSegFalg = false;
                bSegFalg = aFlagSeg.every(function (a) {
                    return oPayload["PainterSegmentation"][a] === null;
                });
                if (bSegFalg) {
                    oPayload["PainterSegmentation"] = null;
                }


                for (var d in oPayload["PainterAddress"]) {
                    if (oPayload["PainterAddress"][d] === "") {
                        oPayload["PainterAddress"][d] = null;
                    }
                }
                /*Aditya changes start*/
                var editBank = oCtrlModel.getProperty("/EditBank");
                var editField = oCtrlModel.getProperty("/EditField");
                var addBankDoc = oCtrlModel.getProperty("/AddBankDoc");
                var InitialDocType = oCtrlModel.getProperty("/InitialDocType");
                if (editBank) {
                    if(addBankDoc){
                        this._checkBankFileUpload(oPayload);
                    }
                    // oPayload["PainterBankDetails"]["Status"] = "PENDING";
                }
                if(editField){
                         oPayload["PainterBankDetails"]["Status"] = "PENDING";
                    }
                /*Aditya changes end*/
                console.log(oPayload, sPath);
                oData.update(sPath, oPayload, {
                    success: function (oData) {
                        MessageToast.show(
                            "Painter " + oPayload["Name"] + " Sucessfully Updated"
                        );
                        othat.fnCheckProfileCompleted.call(othat, oPayload);
                        othat.handleCancelPress();
                        //oData.refresh(true);
                    },
                    error: function (a) {
                        var sMessage =
                            "Unable to update a painter due to the server issues";
                        if (a.statusCode == 409) {
                            sMessage =
                                "Mobile Number already exist, kindly enter a different mobile number.";
                        }
                        MessageBox.error(sMessage, {
                            title: "Error Code: " + a.statusCode,
                        });
                    },
                });
            },
            _ReturnObjects: function (mParam) {
                var obj = Object.assign({}, mParam);
                var oNew = Object.entries(obj).reduce(
                    (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)), {}
                );
                return oNew;
            },
            _initFilerForTables: function () {
                var oView = this.getView();
                var oPainterId = oView
                    .getModel("oModelControl2")
                    .getProperty("/PainterId");

                var oFilerByRId = new Filter(
                    "ReferredBy",
                    FilterOperator.EQ,
                    oPainterId
                );
                oView.byId("Referral").getBinding("items").filter(oFilerByRId);
                var oFilComplaints = new Filter(
                    "PainterId",
                    FilterOperator.EQ,
                    parseInt(oPainterId)
                );
                oView
                    .byId("IdTblComplaints")
                    .getBinding("items")
                    .filter(oFilComplaints);

                oView
                    .byId("IdTblCondonations")
                    .getBinding("items")
                    .filter(oFilComplaints);

                var oFilOffers = new Filter(
                    "PainterId",
                    FilterOperator.EQ,
                    oPainterId
                );
                oView.byId("idTblOffers").getBinding("items").filter(oFilOffers);
                //View.byId("idLoyaltyPoints").getBinding("items").filter(oFilOffers);

                //IdTblComplaints
            },
            onLoyaltySelChange: function (oEvent) {
                var sKey = oEvent.getParameter("item").getKey();
                if (sKey == "0") { } else { }
            },
            fmtAddress: function (mParam1, mParam2, mParam3) {
                if (mParam1) {
                    return mParam1.trim() + ", " + mParam2 + ", " + mParam3;
                } else {
                    return mParam2 + ", " + mParam3;
                }
            },
            fmtAgeGrp: function (mParam1) {
                if (mParam1) {
                    return mParam1 + " years";
                }
            },
            /*Aditya changes start*/
            fmtDocumentType: function (mParam){
            if(mParam==0){
                return "Passbook"
            }else if(mParam==1){
                return "Cheque"

            }

            },
            /*Aditya changes end*/
            onPressDealerLink: function (oEvent) {
                var oSource = oEvent.getSource();
                var oView = this.getView();
                if (!this._pPopover) {
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.ContactPainter.view.fragments.Popover",
                        controller: this,
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }
                this._pPopover.then(function (oPopover) {
                    oPopover.openBy(oSource);
                });
            },

            onSecMobLinkPress: function () {
                this.getView()
                    .getModel("oModelControl")
                    .setProperty("/AnotherMobField", true);
            },

            onPrimaryNoChang: function (oEvent) {
                var oSource = oEvent.getSource();
                if (oSource.getValueState() == "Error") {
                    return;
                }
                var bFlag = true;
                var sBindValue = "";
                var oSouceBinding = oSource.getBinding("value").getPath();
                var aFieldGroup = sap.ui.getCore().byFieldGroupId("PMobile");

                var oModelView = this.getView().getModel("oModelView");
                for (var i of aFieldGroup) {
                    if (oSource.getValue().trim() === "") {
                        break;
                    }
                    if (oSource.getId() === i.getId()) {
                        continue;
                    }
                    if (i.getValue().trim() === oSource.getValue().trim()) {
                        bFlag = false;
                        sBindValue = i.getBinding("value").getPath();
                    }
                }
                var oJson = {
                    "/Mobile": "Primary Mobile",
                    "/PainterAddDet/SMobile1": "Secondry Mobile",
                    "/PainterAddDet/SMobile2": "Secondry Mobile",
                };
                if (!bFlag) {
                    oSource.setValue("");
                    oModelView.setProperty(oSouceBinding, "");
                    MessageToast.show(
                        "This mobile number is already entered in " +
                        oJson[sBindValue] +
                        " kindly eneter a new number"
                    );
                }
            },
            onPinSuggest: function (oEvent) {
                var sTerm = oEvent.getParameter("suggestValue");
                var aFilters = [];
                if (sTerm) {
                    aFilters.push(
                        new Filter("Pincode", FilterOperator.StartsWith, sTerm)
                    );
                }

                oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
            },
            onPinCodeSelect: function (oEvent) {
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oObject = oEvent
                    .getParameter("selectedItem")
                    .getBindingContext()
                    .getObject();
                var iStateId = oObject["StateId"];
                var iCity = oObject["CityId"];
                var oCity = oView.byId("cmbCity");
                var oState = oView.byId("cmBxState");
                oCity
                    .getBinding("items")
                    .filter(new Filter("StateId", FilterOperator.EQ, iStateId));
                oState.setSelectedKey(iStateId);
                oCity.setSelectedKey(iCity);
            },
            onLinkPrimryChange: function (oEvent) {
                var oSource = oEvent.getSource();
                var sSkey = oSource.getSelectedKey();
                var sItem = oSource.getSelectedItem();
                var oView = this.getView();
                var mCmbx = oView.byId("mcmbxDlr").getSelectedKeys();
                var sFlag = true;
                for (var i of mCmbx) {
                    if (parseInt(i) == parseInt(sSkey)) {
                        sFlag = false;
                    }
                }
                if (!sFlag) {
                    oSource.clearSelection();
                    oSource.setSelectedKey("");
                    oSource.setValue("");
                    MessageToast.show(
                        "Kindly select a different dealer as its already selected as secondry dealer."
                    );
                }
            },
            onChangePDealer: function (oEvent) {
                var oSource = oEvent.getSource();
                var sKey = oSource.getSelectedKey();

                if (sKey == "") {
                    oSource.setValue("");
                    //oSource.removeAssociation("selectedItem")
                }
            },
            secDealerChanged: function (oEvent) {
                var oView = this.getView();
                var sPkey = oView.byId("cmbxPDlr").getSelectedKey();
                var mBox = oEvent.getSource();
                var oItem = oEvent.getParameters()["changedItem"];
                var sSKey = oItem.getProperty("key");
                if (sPkey == sSKey) {
                    mBox.removeSelectedItem(oItem);
                    mBox.removeSelectedItem(sSKey);
                    MessageToast.show(
                        oItem.getProperty("text") +
                        " is already selected in the Primary Dealer"
                    );
                }
            },
            onStateChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oCity = oView.byId("cmbCity"),
                    oBindingCity,
                    aFilter = [],
                    oView = this.getView();
                if (sKey !== "") {
                    oCity.clearSelection();
                    oCity.setValue("");
                    oBindingCity = oCity.getBinding("items");
                    aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
                    oBindingCity.filter(aFilter);
                }
            },
            onZoneChange: function (oEvent) {
                var sId = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oPainterDetail = oModelView.getProperty("/PainterDetails");
                var oDivision = oView.byId("idDivision");
                var oDivItems = oDivision.getBinding("items");
                var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
                // remove the division filtering if the division is not of the same zone else clear it
                //   if (oDivSelItm !== null) {
                //     var oDivObj = oDivSelItm.getBindingContext().getObject();
                //     if (oDivObj["Id"] !== sId) {
                //       oDivision.clearSelection();
                //       oDivision.setValue("");
                //     }
                //   }
                oDivision.clearSelection();
                oDivision.setValue("");
                oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));

                //setting the data for depot;
                var oDepot = oView.byId("idDepot");
                oDepot.clearSelection();
                oDepot.setValue("");
            },
            onDivisionChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
                var oDepot = oView.byId("idDepot");
                var oDepBindItems = oDepot.getBinding("items");
                oDepot.clearSelection();
                oDepot.setValue("");
                oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));

                //clearning the data for painters
            },
            onDepotChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oView = this.getView();
            },

            onPressAddFamliy: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
                var bFlag = true;
                if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length <= 5) {
                    for (var prop of oFamiDtlMdl) {
                        if (prop.hasOwnProperty("editable")) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the table before adding a new data."
                                );
                                return;
                                break;
                            }
                        }
                    }
                }
                if (oFamiDtlMdl.length >= 5) {
                    MessageToast.show(
                        "We can only add 5 family members. Kinldy remove any existing data to add a new family member."
                    );
                    bFlag = false;
                    return;
                }
                if (bFlag == true) {
                    oFamiDtlMdl.push({
                        RelationshipId: "",
                        Mobile: "",
                        Name: "",
                        editable: true,
                    });
                    oView.getModel("oModelControl").setProperty("/EditTb1FDL", true);
                    oModel.refresh();
                }
            },
            onPressEditRel: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelView")
                    .getObject();
                oObject["editable"] = true;
                oModel.refresh();
                this._setFDLTbleFlag();
            },
            onPressFDLSave: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelView")
                    .getObject();

                var oTable = oView.byId("idFamilyDetils");
                var oCells = oEvent.getSource().getParent().getParent().getCells();
                var oValidator = new Validator();
                var cFlag = oValidator.validate(oCells);

                var bFlag = true;
                // var cFlag = oValidator.validate();
                var oCheckProp = ["RelationshipId", "Name"];
                for (var abc in oCheckProp) {
                    if (oObject[abc] == "") {
                        bFlag = false;
                        break;
                    }
                }

                if (bFlag && cFlag) {
                    oObject["editable"] = false;
                    oModel.refresh(true);
                } else {
                    MessageToast.show(
                        "Kindly input 'family details' value in a proper format to continue"
                    );
                }
                // oModel.refresh(true);
                this._setFDLTbleFlag();
            },
            onKycChange: function (oEvent) {
                var oModel = this.getView().getModel("oModelView");

                var oView = this.getView();
                if (oEvent.getSource().getSelectedKey() == "") {
                    oView.byId("kycIdNo").setValueState("None");
                    oModel.setProperty("/PainterKycDetails/GovtId", "");
                }
            },
            fmtLabel: function (mParam1) {
                var oData = this.getView().getModel(),
                    oPayload = "";
                if (mParam1 == "") {
                    return "Select the KYC to enable the below field.";
                } else if (mParam1 == undefined) {
                    return "";
                } else {
                    oPayload = oData.getProperty("/MasterKycTypeSet(" + mParam1 + ")");
                    return "Enter the " + oPayload["KycType"] + " Number";
                }
            },
            fmtLink: function (mParam1) {
                var sPath = "/MasterRelationshipSet(" + mParam1 + ")";
                var oData = this.getView().getModel().getProperty(sPath);
                if (oData !== undefined && oData !== null) {
                    return oData["Relationship"];
                } else {
                    return mParam1;
                }
            },
            fmtAsset: function (mParam1) {
                var sPath = "/MasterVehicleTypeSet(" + mParam1 + ")";
                var oData = this.getView().getModel().getProperty(sPath);
                if (oData !== undefined && oData !== null) {
                    return oData["VehicleType"];
                } else {
                    return mParam1;
                }
            },
            onPressRemoveRel: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelView")
                    .getPath()
                    .split("/");
                var aFamilyDetails = oModel.getProperty("/PainterFamily");
                aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
                this._setFDLTbleFlag();
                oModel.refresh();
            },
            _setFDLTbleFlag() {
                var oView = this.getView();
                var oModel = this.getView().getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
                var bFlag = true;
                if (oFamiDtlMdl.length > 0) {
                    for (var prop of oFamiDtlMdl) {
                        if (prop["editable"] == true) {
                            bFlag = false;
                            break;
                        }
                    }
                }
                if (bFlag === false) {
                    oModelControl.setProperty("/EditTb1FDL", true);
                } else {
                    oModelControl.setProperty("/EditTb1FDL", false);
                }
            },
            onPressAdAsset: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                var oFamiDtlMdl = oModel.getProperty("/Vehicles");
                var bFlag = true;
                if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length <= 5) {
                    for (var prop of oFamiDtlMdl) {
                        if (prop.hasOwnProperty("editable")) {
                            if (prop["editable"] == true) {
                                bFlag = false;
                                MessageToast.show(
                                    "Save or delete the existing data in the 'vehicle Details' table before adding a new data."
                                );
                                return;
                                break;
                            }
                        }
                    }
                }
                if (oFamiDtlMdl.length >= 5) {
                    MessageToast.show(
                        "We can only add 5 Vehicles. Kinldy remove any existing data to add a new vehicle."
                    );
                    bFlag = false;
                    return;
                }
                if (bFlag == true) {
                    oFamiDtlMdl.push({
                        VehicleTypeId: "",
                        VehicleName: "",
                        editable: true,
                    });
                    oModelControl.setProperty("/EditTb2AST", true);
                    oModel.refresh();
                }
            },
            onAssetEdit: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelView")
                    .getObject();
                oObject["editable"] = true;

                oModel.refresh();
                this._setASTTbleFlag();
            },
            onAsetSave: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelView")
                    .getObject();
                var bFlag = true;
                var oCells = oEvent.getSource().getParent().getParent();
                var oValidator = new Validator();
                var cFlag = oValidator.validate(oCells);
                var oCheckProp = ["VehicleTypeId", "VehicleName"];
                for (var abc in oCheckProp) {
                    if (oObject[abc] == "") {
                        bFlag = false;
                        MessageToast.show(
                            "Kindly enter the complete deatils before saving."
                        );
                        break;
                    }
                }

                if (bFlag == true && cFlag == true) {
                    oObject["editable"] = false;
                } else {
                    MessageToast.show(
                        "Kindly input 'vehicle' values in porper format to save."
                    );
                }
                oModel.refresh(true);
                this._setASTTbleFlag();
            },

            onPressRemoveAsset: function (oEvent) {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelView")
                    .getPath()
                    .split("/");
                var aFamilyDetails = oModel.getProperty("/Vehicles");
                aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
                this._setASTTbleFlag();
                oModel.refresh();
            },
            _setASTTbleFlag: function () {
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var oModel = this.getView().getModel("oModelView");
                var oFamiDtlMdl = oModel.getProperty("/Vehicles");
                var bFlag = true;
                if (oFamiDtlMdl.length > 0) {
                    for (var prop of oFamiDtlMdl) {
                        if (prop["editable"] == true) {
                            bFlag = false;
                            break;
                        }
                    }
                }
                if (bFlag === false) {
                    oModelControl.setProperty("/EditTb2AST", true);
                } else {
                    oModelControl.setProperty("/EditTb2AST", false);
                }
            },
            onPrimaryAcChange: function (oEvent) {
                var oView = this.getView();
                var oSource = oEvent.getSource();
                var oSourceVal = oSource.getValue().trim();
                var oSecAccNo = oView.byId("IdPrAbCnfAccNo");
                var sSecAccVal = oSecAccNo.getValue().trim();
                if (sSecAccVal === "") {
                    return;
                } else {
                    MessageToast.show(
                        "Kindly enter the same account number in the 'Confirm Account Number' field."
                    );
                    oSecAccNo.setValue("");
                }
            },
            onConfAccChng: function (oEvent) {
                var oView = this.getView();
                var oPrimAcNum = oView.byId("IdPrAbAccountNumber");
                var oSecNumber = oEvent.getSource().getValue();
                if (oSecNumber.trim() !== oPrimAcNum.getValue().trim()) {
                    MessageToast.show(
                        "Account Number doesn't match, kindly enter it again."
                    );
                    oEvent.getSource().setValue("");
                }
            },
            fmtBankStatus: function (mParam) {
                if (mParam == "APPROVED") {
                    return 0;
                } else if (mParam == "REJECTED") {
                    return 1;
                }
            },
            onRbBankStatus: function (oEvent) {
                // var iIndex = oEvent.getSource().getSelectedIndex();
                // var oView = this.getView();
                // var oModelView = oView.getModel("oModelView");

                // if (iIndex == 0) {
                //     oModelView.setProperty("/PainterBankDetails/Status", "APPROVED");
                // } else if (iIndex == 1) {
                //     oModelView.setProperty("/PainterBankDetails/Status", "REJECTED");
                // }
                /*Aditya changes start*/
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var statusText = oEvent.getSource().getProperty('text');
                if (statusText == 'Approve') {
                    oModelView.setProperty("/PainterBankDetails/Status", "APPROVED");
                } else if (statusText == 'Reject') {
                    oModelView.setProperty("/PainterBankDetails/Status", "REJECTED");
                }

                function onYes() {
                    this.handleSavePress();
                }
                this.showWarning("Do you want to " + " " + statusText + "?", onYes);
                /*Aditya changes end*/
            },
            onRbKycStatus: function (oEvent) {
                // var iIndex = oEvent.getSource().getSelectedIndex();
                // if (iIndex == 0) {
                //     oModelView.setProperty("/PainterKycDetails/Status", "APPROVED");
                // } else if (iIndex == 1) {
                //     oModelView.setProperty("/PainterKycDetails/Status", "REJECTED");
                // }
                /*Aditya changes start*/
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var statusText = oEvent.getSource().getProperty('text');
                if (statusText == 'Approve') {
                    oModelView.setProperty("/PainterKycDetails/Status", "APPROVED");
                } else if (statusText == 'Reject') {
                    oModelView.setProperty("/PainterKycDetails/Status", "REJECTED");
                }

                function onYes() {
                    this.handleSavePress();
                }
                this.showWarning("Do you want to " + " " + statusText + "?", onYes);

                /*Aditya changes end*/
            },
            onKycView: function (oEvent) {
                var oButton = oEvent.getSource();
                var oView = this.getView();
                if (!this._pKycDialog) {
                    Fragment.load({
                        name: "com.knpl.pragati.ContactPainter.view.fragments.KycDialog",
                        controller: this,
                    }).then(
                        function (oDialog) {
                            this._pKycDialog = oDialog;
                            oView.addDependent(this._pKycDialog);
                            this._pKycDialog.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._pKycDialog);
                    this._pKycDialog.open();
                }
            },
            /*Aditya changes start*/
            onBankView: function (oEvent) {
                var oButton = oEvent.getSource();
                var oView = this.getView();
                if (!this._pBankDialog) {
                    Fragment.load({
                        name: "com.knpl.pragati.ContactPainter.view.fragments.BankDialog",
                        controller: this,
                    }).then(
                        function (oDialog) {
                            this._pBankDialog = oDialog;
                            oView.addDependent(this._pBankDialog);
                            this._pBankDialog.open();
                        }.bind(this)
                    );
                } else {
                    oView.addDependent(this._pBankDialog);
                    this._pBankDialog.open();
                }
            },
            onEditBankingFields: function () {
                var oModelCtrl = this.getView().getModel("oModelControl");
                oModelCtrl.setProperty("/EditBank", true);
                oModelCtrl.setProperty("/EditBankButton", true);
                oModelCtrl.setProperty("/AddBankDocButton", true);
                oModelCtrl.setProperty("/AddNewBank", false);
                var oModelView = this.getView().getModel("oModelView");
                this.docType = oModelView.getProperty("PainterBankDetails/DocumentType");

            },
            onEditCancelBankingFields: function () {
                var oModelCtrl = this.getView().getModel("oModelControl");
                var oModelView = this.getView().getModel("oModelView");
                oModelCtrl.setProperty("/EditBank", false);
                oModelCtrl.setProperty("/EditBankButton", false);
                oModelCtrl.setProperty("/AddBankDoc", false);
                 oModelCtrl.setProperty("/AddBankDocButton", false);
                var InitialDocType = oModelCtrl.getProperty("/InitialDocType");
                oModelView.setProperty("/PainterBankDetails/DocumentType", InitialDocType);


            },
            onUploadFileTypeMis: function () {
                MessageToast.show("Kindly upload a file of type jpg,jpeg,png");
            },
            _CheckTheBank: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelControl");
                var sBankId = oModel.getProperty("/EditBank");
                var oUpload = oView.byId("idUploadCollectionBank");
                var iItems = oUpload.getItems().length;
                if (sBankId == true) {

                    if (iItems == 0) {
                        return false;
                    }
                }
                return true;
            },
            _checkBankFileUpload: function (oData) {
                var promise = jQuery.Deferred();
                var UploadCollection = this.getView().byId("idUploadCollectionBank");
                var oItems = UploadCollection.getItems();
                var othat = this;
                var bFlag = false;
                if (oData.hasOwnProperty("PainterBankDetails")) {
                    var oBankData = oData["PainterBankDetails"];
                    if (oBankData !== null) {
                        if (oBankData.hasOwnProperty("Id")) {
                            if (oItems.length > 0) {
                                bFlag = true;
                            }
                        }
                    }
                }
                if (!bFlag) {
                    promise.resolve(oData);
                    return promise;
                }
                var sUrl =
                    this.sServiceURI +
                    "PainterBankDetailsSet(" +
                    oBankData["Id"] +
                    ")/$value?image_type=";

                var sUrl2 = "";
                var async_request = [];
                var docType = oBankData["DocumentType"];
                var oCtrlModel= this.getView().getModel("oModelControl");
                for (var x = 0; x < oItems.length; x++) {
                    var sFile = sap.ui.getCore().byId(oItems[x].getFileUploader()).oFileUpload.files[0];
                    sUrl2 = docType == 0 ? "passbook" : "cheque";
                    async_request.push(
                        jQuery.ajax({
                            method: "PUT",
                            url: sUrl + sUrl2,
                            cache: false,
                            contentType: false,
                            processData: false,
                            data: sFile,
                            success: function (data) { 
                               
                                var editField = oCtrlModel.setProperty("/EditField",true);
                            },
                            error: function () { },
                        })
                    );
                }
                if (oItems.length > 0) {
                    jQuery.when.apply(null, async_request).then(
                        function () {
                            //promise.resolve("FileUpdated");
                        },
                        function () {
                            //promise.resolve("FileNot Uplaoded");
                        }
                    );
                }
                promise.resolve(oData);
                return promise;
            },
            onAddBankDoc: function () {
                var oModelCtrl = this.getView().getModel("oModelControl");
                oModelCtrl.setProperty("/AddBankDoc", true);
                oModelCtrl.setProperty("/AddBankDocButton", false);
                // var oView = this.getView();
                // if (!this._addDocDialog) {
                //     Fragment.load({
                //         name: "com.knpl.pragati.ContactPainter.view.fragments.AddBankDocumentDialog",
                //         controller: this,
                //     }).then(
                //         function (oDialog) {
                //             this._addDocDialog = oDialog;
                //             oView.addDependent(this._addDocDialog);
                //             this._addDocDialog.open();
                //         }.bind(this)
                //     );
                // } else {
                //     oView.addDependent(this._addDocDialog);
                //     this._addDocDialog.open();
                // }


            },
            onCancelBankDoc: function (){
                var oModelCtrl = this.getView().getModel("oModelControl");
                var oModelView = this.getView().getModel("oModelView");
                oModelCtrl.setProperty("/AddBankDoc", false);
                oModelCtrl.setProperty("/AddBankDocButton", true);
                oModelCtrl.setProperty("/EditBank", false);
                oModelCtrl.setProperty("/EditBankButton", false);
                var InitialDocType = oModelCtrl.getProperty("/InitialDocType");
                oModelView.setProperty("/PainterBankDetails/DocumentType", InitialDocType);
            },
            onPressCloseDocDialog: function (oEvent) {
                var oModelCtrl = this.getView().getModel("oModelControl");
                var oModelView = this.getView().getModel("oModelView");
                oModelCtrl.setProperty("/AddBankDoc", false);
                var InitialDocType = oModelCtrl.getProperty("/InitialDocType");
                oModelView.setProperty("/PainterBankDetails/DocumentType", InitialDocType);
                oEvent.getSource().getParent().close();

            },
            onDocDialogClose: function (oEvent) {
                
                this._addDocDialog.destroy();
                delete this._addDocDialog;
            },
            onEditField:function (oEvent){
                  var oModelCtrl = this.getView().getModel("oModelControl");
                  oModelCtrl.setProperty("/EditField", true);
            },
            
            /*Aditya changes end*/
            onPressCloseDialog: function (oEvent) {
                oEvent.getSource().getParent().close();
            },
            onDialogClose: function (oEvent) {
                this._pKycDialog.destroy();
                delete this._pKycDialog;
            },
            onAddNewBank: function (oEvent) {
                var oView = this.getView();
                var oModelCtrl = oView.getModel("oModelControl");
                var oProp = oModelCtrl.getProperty("/AddNewBank");
                oModelCtrl.setProperty("/AddNewBank", true);
            },
            onAddCanNewBank: function () {
                var oView = this.getView();
                var oModelCtrl = oView.getModel("oModelControl");
                var oProp = oModelCtrl.getProperty("/AddNewBank");
                oModelCtrl.setProperty("/AddNewBank", false);
                var aFields = [
                    "IfscCode",
                    "BankNameId",
                    "AccountTypeId",
                    "AccountNumber",
                    "AccountHolderName",
                ];
                var oBject;
                aFields.forEach(function (a) {
                    oBject = oView.byId("IdPrAb" + a);
                    oBject.setValueState("None");
                    oBject.setValue("");
                    oModelCtrl.setProperty("/PainterAddBanDetails/" + a, "");
                });

                //confirm account number field reset values
                var oConfAcc = oView.byId("IdPrAbCnfAccNo");
                oConfAcc.setValue("");
                oConfAcc.setValueState("None");
                oModelCtrl.setProperty("/PainterAddDet/ConfrmAccNum", "");
            },
            fmtLowerCase: function (mParam) {
                var sStatus = "";
                if (mParam) {
                    sStatus = mParam;
                    sStatus = sStatus.toLowerCase();
                    var aCharStatus = sStatus.split("");
                    if (aCharStatus.indexOf("_") !== -1) {
                        aCharStatus[aCharStatus.indexOf("_") + 1] = aCharStatus[
                            aCharStatus.indexOf("_") + 1
                        ].toUpperCase();
                        aCharStatus.splice(aCharStatus.indexOf("_"), 1, " ");
                    }
                    aCharStatus[0] = aCharStatus[0].toUpperCase();
                    sStatus = aCharStatus.join("");
                }

                return sStatus;
            },

            _save: function () {
                var oModel = this.getView().getModel("oModelView");
            },
            dealerName: function (mParam) {
                return mParam.length;
            },
            onTablesSearch: function (oEvent) {
                var oView = this.getView();
                var sPath = oEvent.getSource().getBinding("value").getPath();
                var sValue = oEvent.getSource().getValue();
                var sPainterId = oView
                    .getModel("oModelControl2")
                    .getProperty("/PainterId");
                console.log(sPainterId);
                if (sPath.match("LoyaltyPoints")) {
                    //this._SearchLoyaltyPoints(sValue, sPainterId);
                } else if (sPath.match("Tokens")) {
                    this._SearchTokens(sValue, sPainterId);
                } else if (sPath.match("Complains")) {
                    this._SearchComplains(sValue, sPainterId);
                } else if (sPath.match("Referral")) {
                    this._SearchReferral(sValue, sPainterId);
                }
            },
            _SearchLoyaltyPoints: function (sValue, sPainterId) {
                var oView = this.getView();
                var aCurrentFilter = [];

                var oTable = oView.byId("idLoyaltyPoints");
                if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                    aCurrentFilter.push(
                        new Filter(
                            [
                                new Filter(
                                    "TotalPoints",
                                    FilterOperator.EQ,
                                    sValue.trim().substring(0, 8)
                                ),
                                new Filter(
                                    "RewardPoints",
                                    FilterOperator.EQ,
                                    sValue.trim().substring(0, 8)
                                ),
                            ],
                            false
                        )
                    );
                } else {
                    aCurrentFilter.push(
                        new Filter(
                            "tolower(PointType)",
                            FilterOperator.Contains,
                            "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                        )
                    );
                }
                aCurrentFilter.push(
                    new Filter("PainterId", FilterOperator.EQ, parseInt(sPainterId))
                );
                var endFilter = new Filter({
                    filters: aCurrentFilter,
                    and: true,
                });

                oTable.getBinding("items").filter(endFilter);
            },
            _SearchTokens: function (sValue, sPainterId) {
                var oView = this.getView();
                var aCurrentFilter = [];

                var oTable = oView.byId("idTblOffers");
                if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                    aCurrentFilter.push(
                        new Filter(
                            [
                                new Filter(
                                    "RewardPoints",
                                    FilterOperator.EQ,
                                    sValue.trim().substring(0, 8)
                                ),
                                new Filter(
                                    "Painter/Mobile",
                                    FilterOperator.Contains,
                                    sValue.trim()
                                ),
                            ],
                            false
                        )
                    );
                } else {
                    aCurrentFilter.push(
                        new Filter(
                            [
                                new Filter(
                                    "tolower(TokenCode)",
                                    FilterOperator.Contains,
                                    "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                                new Filter(
                                    "tolower(Channel)",
                                    FilterOperator.Contains,
                                    "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                            ],
                            false
                        )
                    );
                }
                aCurrentFilter.push(
                    new Filter("PainterId", FilterOperator.EQ, parseInt(sPainterId))
                );
                var endFilter = new Filter({
                    filters: aCurrentFilter,
                    and: true,
                });

                oTable.getBinding("items").filter(endFilter);
            },
            _SearchComplains: function (sValue, sPainterId) {
                var oView = this.getView();
                var aCurrentFilter = [];
                var oTable = oView.byId("IdTblComplaints");

                // this is the same case

                aCurrentFilter.push(
                    new Filter(
                        [
                            new Filter(
                                "tolower(Painter/Name)",
                                FilterOperator.Contains,
                                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                            ),
                            new Filter(
                                "tolower(Painter/MembershipCard)",
                                FilterOperator.Contains,
                                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                            ),
                            new Filter(
                                "tolower(ComplaintCode)",
                                FilterOperator.Contains,
                                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                            ),
                            new Filter(
                                "Painter/Mobile",
                                FilterOperator.EQ,
                                sValue.trim().substring(0, 10)
                            ),
                            new Filter(
                                "tolower(ComplaintType/ComplaintType)",
                                FilterOperator.Contains,
                                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                            ),
                            new Filter(
                                "tolower(ComplaintSubtype/ComplaintSubtype)",
                                FilterOperator.Contains,
                                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                            ),
                            new Filter(
                                "tolower(ComplaintStatus)",
                                FilterOperator.Contains,
                                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                            ),
                        ],
                        false
                    )
                );

                aCurrentFilter.push(
                    new Filter("PainterId", FilterOperator.EQ, parseInt(sPainterId))
                );
                var endFilter = new Filter({
                    filters: aCurrentFilter,
                    and: true,
                });

                oTable.getBinding("items").filter(endFilter);
            },
            _SearchReferral: function (sValue, sPainterId) {
                var oView = this.getView();
                var aCurrentFilter = [];

                var oTable = oView.byId("Referral");
                if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                    aCurrentFilter.push(
                        new Filter(
                            [
                                new Filter(
                                    "RewardPoints",
                                    FilterOperator.EQ,
                                    sValue.trim().substring(0, 8)
                                ),
                                new Filter(
                                    "ReferralMobile",
                                    FilterOperator.Contains,
                                    sValue.trim()
                                ),
                            ],
                            false
                        )
                    );
                } else {
                    aCurrentFilter.push(
                        new Filter(
                            [
                                new Filter(
                                    "tolower(ReferralName)",
                                    FilterOperator.Contains,
                                    "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                                new Filter(
                                    "tolower(ReferralEmail)",
                                    FilterOperator.Contains,
                                    "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                                new Filter(
                                    "tolower(ReferralStatus)",
                                    FilterOperator.Contains,
                                    "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                ),
                            ],
                            false
                        )
                    );
                }
                aCurrentFilter.push(
                    new Filter("ReferredBy", FilterOperator.EQ, parseInt(sPainterId))
                );
                var endFilter = new Filter({
                    filters: aCurrentFilter,
                    and: true,
                });

                oTable.getBinding("items").filter(endFilter);
            },
            onPressOpenTokenDialog: function (oEvent) {
                var othat = this;
                var oModelControl = this.getView().getModel("oModelControl2");
                if (!this.oDefaultDialog) {
                    this.oDefaultDialog = new Dialog({
                        title: "{i18n>ApplyToken}",
                        afterClose: function () {
                            othat.oDefaultDialog.destroy();
                            console.log("onCloseTrigerred");
                            delete othat.oDefaultDialog;
                            oModelControl.setProperty("/ApplyLoyaltyPoints", "");
                        },
                        content: [
                            new VBox({
                                alignItems: "Center",
                                items: [
                                    new Input({
                                        width: "120%",
                                        placeholder: "Enter Token Code",
                                        value: "{oModelControl2>/ApplyLoyaltyPoints}",
                                    }),
                                ],
                            }),
                        ],
                        beginButton: new Button({
                            text: "{i18n>Cancel}",
                            type: "Default",
                            press: function () {
                                othat.oDefaultDialog.close();
                            },
                        }),
                        endButton: new Button({
                            text: "{i18n>Ok}",
                            type: "Emphasized",
                            press: othat._onApplyLoyalyPoints.bind(othat),
                        }),
                    });

                    // to get access to the controller's model
                    this.getView().addDependent(this.oDefaultDialog);
                }

                this.oDefaultDialog.open();
            },
            _onApplyLoyalyPoints: function () {
                var oView = this.getView();
                var othat = this;
                var oModelControl = oView.getModel("oModelControl2");
                var sTokenCode = oModelControl
                    .getProperty("/ApplyLoyaltyPoints")
                    .trim();
                if (sTokenCode == "") {
                    MessageToast.show("Kindly enter the token code to continue");
                    return;
                }

                var oData = oView.getModel();

                oData.read("/QRCodeValidationAdmin", {
                    urlParameters: {
                        qrcode: "'" + sTokenCode + "'",
                        painterid: oModelControl.getProperty("/PainterId"),
                        channel: "'Painter Profile'",
                    },
                    success: function (oData) {
                        if (oData !== null) {
                            if (oData.hasOwnProperty("Status")) {
                                if (oData["Status"] == true) {
                                    MessageToast.show(oData["Message"]);

                                    othat.oDefaultDialog.close();
                                } else if (oData["Status"] == false) {
                                    MessageToast.show(oData["Message"]);
                                }
                                othat.getView().getModel().refresh(true);
                            }
                        }
                    },
                    error: function () { },
                });
            },
            onPressAddReferral: function (oEvent) {
                var oView = this.getView();
                // create value help dialog
                if (!this._DialogAddREferal) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.ContactPainter.view.fragments.AddReferralDialog",
                        controller: this,
                    }).then(
                        function (oValueHelpDialog) {
                            this._DialogAddREferal = oValueHelpDialog;
                            this.getView().addDependent(this._DialogAddREferal);
                            this._DialogAddREferal.open();
                        }.bind(this)
                    );
                } else {
                    this._DialogAddREferal.open();
                }
            },
            onPressSubmitReferral: function () {
                var oView = this.getView();
                var othat = this;
                var oData = oView.getModel();
                var oPayload = oView
                    .getModel("oModelControl2")
                    .getProperty("/AddReferral");
                var oModelControl = oView.getModel("oModelControl2");
                var sPainterId = oModelControl.getProperty("/PainterId");
                var oValidator = new Validator();
                if (
                    oPayload["ReferralName"].trim() == "" ||
                    oPayload["ReferralMobile"].trim() == ""
                ) {
                    MessageToast.show(
                        "Kindly Enter the referral name and mobile Number"
                    );
                    return;
                }

                var oDataValue = oData.getObject("/PainterSet(" + sPainterId + ")");

                var oSentPayoad = {
                    ReferralName: oPayload["ReferralName"].trim(),
                    ReferralMobile: oPayload["ReferralMobile"].trim(),
                    ReferralEmail: oPayload["ReferralEmail"].trim(),
                    ReferralCode: oDataValue["RegistrationReferralCode"],
                    ReferredBy: parseInt(sPainterId),
                };
                console.log(oSentPayoad);

                oData.create("/PainterReferralHistorySet", oSentPayoad, {
                    success: function () {
                        MessageToast.show("Referral Sucessfuly Added");
                        othat._DialogAddREferal.close();
                        othat.getView().getModel().refresh(true);
                    },
                    error: function (a) {
                        var sMessage =
                            "Unable to update a painter due to the server issues";

                        MessageBox.error(sMessage, {
                            title: "Error Code: " + a.statusCode,
                        });
                    },
                });
            },
            onAddReferralClose: function () {
                this._DialogAddREferal.destroy();
                delete this._DialogAddREferal;
                this.getView()
                    .getModel("oModelControl2")
                    .setProperty("/AddReferral", {
                        ReferralName: "",
                        ReferralMobile: "",
                        ReferralEmail: "",
                    });
            },
            _loadEditProfile: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("idVbProfile");
                var sFragName = mParam == "Edit" ? "EditProfile" : "Profile";
                oVboxProfile.destroyItems();
                return Fragment.load({
                    id: oView.getId(),
                    controller: othat,
                    name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
                }).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },
            _loadEditBanking: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("idVbBanking");
                var sFragName = mParam == "Edit" ? "EditBanking" : "Banking";
                oVboxProfile.destroyItems();
                return Fragment.load({
                    id: oView.getId(),
                    controller: othat,
                    name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
                }).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },
            /*Aditya changes start*/
            _loadEditKyc: function (mParam) {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;
                var oVboxProfile = oView.byId("idVbKyc");
                var sFragName = mParam == "Edit" ? "EditKyc" : "Kyc";
                oVboxProfile.destroyItems();
                return Fragment.load({
                    id: oView.getId(),
                    controller: othat,
                    name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
                }).then(function (oControlProfile) {
                    oView.addDependent(oControlProfile);
                    oVboxProfile.addItem(oControlProfile);
                    promise.resolve();
                    return promise;
                });
            },
            /*Aditya changes end*/

            handleCancelPress: function () {

                var oView = this.getView();
                var oCtrlModel2 = oView.getModel("oModelControl2");
                oCtrlModel2.setProperty("/modeEdit", false);
                oCtrlModel2.setProperty("/iCtbar", true);

                var c1, c2, c3, c4;
                var othat = this;
                c1 = othat._loadEditProfile("Display");
                c1.then(function () {
                    c2 = othat._loadEditBanking("Display");
                    c2.then(function () {
                        c3 = othat._loadEditKyc("Display");
                        c3.then(function () {
                            c4 = othat._toggleButtonsAndView(false);
                        })
                    })
                })
                oView.getModel().refresh(true);
            },

            _toggleButtonsAndView: function (bEdit) {
                var oView = this.getView();

                // Show the appropriate action buttons
                oView.byId("edit").setVisible(!bEdit);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);

                // Set the right form type
                // this._showFormFragment(bEdit ? "Change" : "Display");
            },
            _showFormFragment: function (sFragmentName) {
                // var oPage = this.byId("page");
                // oPage.removeAllContent();
                // this._getFormFragment(sFragmentName).then(function (oVBox) {
                //     oPage.insertContent(oVBox);
                // });
            },
            _dealerReset: function () {
                var oView = this.getView();
                var oModel = oView.getModel("oModelView");
                var aDiv = ["DivisionId", "DepotId", "ZoneId"];
                for (var a of aDiv) {
                    if (oModel.getProperty("/" + a) === "") {
                        oView.byId("idMinpPDealers").removeAllTokens();
                        oModel.setProperty("/DealerId", "");
                        oModel.getProperty("/PainterAddDet/SecondryDealer").length = 0;
                    }
                }
            },
            handlePDealerValue: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var oView = this.getView();
                // create value help dialog
                if (!this._PvalueHelpDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.ContactPainter.view.fragments.PDealerValHelp",
                        controller: this,
                    }).then(
                        function (oValueHelpDialog) {
                            this._PvalueHelpDialog = oValueHelpDialog;
                            this.getView().addDependent(this._PvalueHelpDialog);
                            this._openPValueHelpDialog(sInputValue);
                        }.bind(this)
                    );
                } else {
                    this._openPValueHelpDialog(sInputValue);
                }
            },
            _openPValueHelpDialog: function (sInputValue) {
                var sDepotiId = this.getView()
                    .getModel("oModelView")
                    .getProperty("/DepotId");
                var oFilter = new Filter(
                    [
                        new Filter("DealerName", FilterOperator.Contains, sInputValue),
                        new Filter(
                            "DealerSalesDetails/Depot",
                            FilterOperator.EQ,
                            sDepotiId
                        ),
                    ],
                    true
                );
                if (sInputValue.trim() == "" && sDepotiId.trim() == "") {
                    this._PvalueHelpDialog.getBinding("items").filter([]);
                } else {
                    this._PvalueHelpDialog.getBinding("items").filter(oFilter);
                }

                // open value help dialog filtered by the input value
                this._PvalueHelpDialog.open(sInputValue);
            },
            _handlePValueHelpSearch: function (evt) {
                var sValue = evt.getParameter("value");
                var aCurrentFilter = [];
                var oFilter = new Filter(
                    [
                        new Filter(
                            "tolower(DealerName)",
                            FilterOperator.Contains,
                            "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                        ),
                        new Filter("Id", FilterOperator.Contains, sValue.trim()),
                    ],
                    false
                );
                aCurrentFilter.push(oFilter);
                var sDepotId = this.getView()
                    .getModel("oModelView")
                    .getProperty("/DepotId");
                var DepotFilter = new Filter(
                    "DealerSalesDetails/Depot",
                    FilterOperator.EQ,
                    sDepotId
                );
                aCurrentFilter.push(DepotFilter);
                var endFilter = new Filter({
                    filters: aCurrentFilter,
                    and: true,
                });
                evt.getSource().getBinding("items").filter(endFilter);
            },

            _handlePValueHelpClose: function (evt) {
                var aSelectedItems = evt.getParameter("selectedItems"),
                    oMultiInput = this.byId("idMinpPDealers");
                oMultiInput.removeAllTokens();
                var oModelView = this.getView().getModel("oModelView");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    aSelectedItems.forEach(function (oItem) {
                        oMultiInput.addToken(
                            new Token({
                                text: oItem.getTitle(),
                            })
                        );
                        oModelView.setProperty("/DealerId", oItem.getDescription());
                    });
                }
            },
            onPTokenUpdate: function (oEvent) {
                if (oEvent.getParameter("type") == "removed") {
                    this.getView().getModel("oModelView").setProperty("/DealerId", "");
                }
            },
            //himank sec dealer changes
            onValueHelpRequested: function () {
                this._oMultiInput = this.getView().byId("multiInput");
                this.oColModel = new JSONModel({
                    cols: [{
                        label: "SAP Code",
                        template: "Id",
                        width: "10rem",
                    },
                    {
                        label: "Dealer Name",
                        template: "DealerName",
                    },
                    {
                        label: "Plant Code",
                        template: "PlantCode",
                    },
                    ],
                });

                var aCols = this.oColModel.getData().cols;

                this._oValueHelpDialog = sap.ui.xmlfragment(
                    "com.knpl.pragati.ContactPainter.view.fragments.SecondaryDealerValueHelp",
                    this
                );
                this.getView().addDependent(this._oValueHelpDialog);

                this._oValueHelpDialog.getTableAsync().then(
                    function (oTable) {
                        //		oTable.setModel(this.oProductsModel);
                        oTable.setModel(this.oColModel, "columns");

                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", {
                                path: "/DealerSet",
                                events: {
                                    dataReceived: function () {
                                        this._oValueHelpDialog.update();
                                    }.bind(this),
                                },
                            });
                        }

                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/DealerSet", function () {
                                return new sap.m.ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new sap.m.Label({
                                            text: "{" + column.template + "}",
                                        });
                                    }),
                                });
                            });
                        }

                        this._oValueHelpDialog.update();
                    }.bind(this)
                );

                this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
                this._oValueHelpDialog.open();
            },

            _getfilterforControl: function () {
                var sDepot = this.getView()
                    .getModel("oModelView")
                    .getProperty("/DepotId");

                var sPrimaryPainter = this.getView()
                    .getModel("oModelView")
                    .getProperty("/DealerId");
                var aFilters = [];
                if (sPrimaryPainter) {
                    aFilters.push(new Filter("Id", FilterOperator.NE, sPrimaryPainter));
                }
                if (sDepot) {
                    aFilters.push(
                        new Filter("DealerSalesDetails/Depot", FilterOperator.EQ, sDepot)
                    );
                }
                if (aFilters.length == 0) {
                    return [];
                }

                return new Filter({
                    filters: aFilters,
                    and: true,
                });
            },

            onFilterBarSearch: function (oEvent) {
                var afilterBar = oEvent.getParameter("selectionSet"),
                    aFilters = [];

                aFilters.push(
                    new Filter({
                        path: "Id",
                        operator: FilterOperator.Contains,
                        value1: afilterBar[0].getValue(),
                        caseSensitive: false,
                    })
                );
                aFilters.push(
                    new Filter({
                        path: "DealerName",
                        operator: FilterOperator.Contains,
                        value1: afilterBar[1].getValue(),
                        caseSensitive: false,
                    })
                );

                this._filterTable(
                    new Filter({
                        filters: aFilters,
                        and: true,
                    })
                );
            },

            onValueHelpAfterOpen: function () {
                var aFilter = this._getfilterforControl();

                this._filterTable(aFilter, "Control");
                this._oValueHelpDialog.update();
            },

            _filterTable: function (oFilter, sType) {
                var oValueHelpDialog = this._oValueHelpDialog;

                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter, sType || "Application");
                    }

                    if (oTable.bindItems) {
                        oTable
                            .getBinding("items")
                            .filter(oFilter, sType || "Application");
                    }

                    oValueHelpDialog.update();
                });
            },

            onValueHelpCancelPress: function () {
                this._oValueHelpDialog.close();
            },

            onValueHelpOkPress: function (oEvent) {
                var oData = [];
                var xUnique = new Set();
                var aTokens = oEvent.getParameter("tokens");

                aTokens.forEach(function (ele) {
                    if (xUnique.has(ele.getKey()) == false) {
                        oData.push({
                            DealerName: ele.getText(),
                            Id: ele.getKey(),
                        });
                        xUnique.add(ele.getKey());
                    }
                });

                //  this._oMultiInput.setTokens(aTokens);
                this.getView()
                    .getModel("oModelControl")
                    .setProperty("/PainterAddDet/SecondryDealer", oData);
                this._oValueHelpDialog.close();
            },
            //end himank
            _getFormFragment: function (sFragmentName) {
                var pFormFragment = this._formFragments[sFragmentName],
                    oView = this.getView();

                if (!pFormFragment) {
                    pFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "sap.ui.layout.sample.SimpleForm354wideDual." + sFragmentName,
                    });
                    this._formFragments[sFragmentName] = pFormFragment;
                }

                return pFormFragment;
            },
            onNavBack: function (oEvent) {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RoutePList", {}, true);
                }
            },
            //himank loyalty table changes
            onBeforeRebind: function (oEvent) {
                console.log("Binding Trigerred for loyalty")
                var oPainterId = this.getViewModel("oModelControl2").getProperty(
                    "/PainterId"
                );

                var oBindingParams = oEvent.getParameter("bindingParams"),
                    oFinancialYear = this._getfinanceYear(),
                    aFilters = [],
                    //check if CreatedAt is Passed in filter or Not
                    bApplyCurrentFinancialYear = oBindingParams.filters.every(function (
                        ele
                    ) {
                        return ele.sPath !== "CreatedAt";
                    });

                aFilters.push(new Filter("PainterId", FilterOperator.EQ, oPainterId));

                if (bApplyCurrentFinancialYear)
                    aFilters.push(
                        new Filter({
                            path: "CreatedAt",
                            operator: FilterOperator.BT,
                            value1: oFinancialYear.startYear,
                            value2: oFinancialYear.endYear,
                        })
                    );
                aFilters.push(
                    new Filter({
                        path: "IsArchived",
                        operator: FilterOperator.EQ,
                        value1: false
                    })
                );

                oBindingParams.filters.push(
                    new Filter({
                        filters: aFilters,
                        and: true,
                    })
                );
            },
            _getfinanceYear: function () {
                var oNow = new Date(),
                    iMonth = oNow.getMonth(),
                    startYear,
                    endYear;
                if (iMonth < 3) {
                    endYear = oNow.getFullYear();
                    startYear = endYear - 1;
                } else {
                    startYear = oNow.getFullYear();
                    endYear = startYear + 1;
                }

                startYear = new Date(startYear, 3, 1);
                endYear = new Date(endYear, 2, 31, 23, 59, 59);

                return {
                    endYear: endYear,
                    startYear: startYear
                };
            },
            // himank loyalty hanges end

            // knowledge table changes
            fmtVisible: function (mParam) {
                console.log(mParam);
                if (mParam === "") {
                    return true;
                }
                return false;
            },
            onBeforeRebindOfflineTrainingTable: function (oEvent) {
                // Live Training
                var oView = this.getView();

                var oPainterId = oView
                    .getModel("oModelControl2")
                    .getProperty("/PainterId");

                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "TrainingDetails/TrainingType";
                var oFilter1 = new Filter("PainterId", FilterOperator.EQ, oPainterId);
                var oFilter2 = new Filter(
                    "TrainingDetails/TrainingTypeId",
                    FilterOperator.EQ,
                    2
                );
                oBindingParams.filters.push(oFilter1);
                oBindingParams.filters.push(oFilter2);
            },
            onBeforeRebindTrainingTable: function (oEvent) {
                // Live Training
                var oView = this.getView();

                var oPainterId = oView
                    .getModel("oModelControl2")
                    .getProperty("/PainterId");

                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "TrainingDetails/TrainingType";
                var oFilter1 = new Filter("PainterId", FilterOperator.EQ, oPainterId);
                var oFilter2 = new Filter(
                    "TrainingDetails/TrainingTypeId",
                    FilterOperator.EQ,
                    1
                );
                oBindingParams.filters.push(oFilter1);
                oBindingParams.filters.push(oFilter2);
            },
            onViewQuestionaire: function (oEvent) {
                var object = oEvent.getSource().getBindingContext().getObject();

                this._TariningQuestionnaireDialog(object);
            },
            _TariningQuestionnaireDialog: function (mParam) {
                var oView = this.getView();
                var othat = this;
                if (!this._pQuestionaireDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.ContactPainter.view.fragments.TrainingQuestionnaireDialog",
                        controller: this,
                    }).then(
                        function (oDialog) {
                            this._pQuestionaireDialog = oDialog;
                            othat._setQuestioanireData(mParam);
                        }.bind(this)
                    );
                } else {
                    othat._setQuestioanireData(mParam);
                }
            },
            _setQuestioanireData: function (sPath) {
                var oView = this.getView();
                var oTable = oView.byId("Questionnaire");
                console.log(sPath);
                this._pQuestionaireDialog.bindElement({
                    path: "/PainterTrainingSet(" + sPath["Id"] + ")",
                    parameters: {
                        expand: "SubmittedQuestionnaire",
                    },
                });
                oView.addDependent(this._pQuestionaireDialog);
                this._pQuestionaireDialog.open();
            },
            QuestionaaireFactory: function (sId, oContext) {
                var oBject = oContext.getObject();
                console.log(oBject);
                var oColumnListItem = new sap.m.ColumnListItem();
                oColumnListItem.addCell(
                    new sap.m.Text({
                        text: "{Question/Question}",
                    })
                );

                var oOptionsObjet = this.getView()
                    .getModel()
                    .getProperty("/" + oBject["Question"]["__ref"]);

                oOptionsObjet["TrainingQuestionnaireOptions"]["__list"].forEach(
                    function (z) {
                        oColumnListItem.addCell(
                            new ObjectStatus({
                                text: "{/" + z + "/Option}",
                                state: {
                                    parts: [
                                        "/" + z + "/IsCorrect",
                                        "/" + z + "/Id",
                                        "SelectedOptionId",
                                    ],
                                    formatter: function (mPram1, mPram2, mPram3) {
                                        if (mPram1) {
                                            return "Success";
                                        }
                                        if (mPram2 == mPram3) {
                                            return "Error";
                                        }
                                    },
                                },
                            })
                        );
                    }
                );

                return oColumnListItem;
            },
            onQuestinaireDialogClose: function () {
                this._pQuestionaireDialog.destroy();
                delete this._pQuestionaireDialog;
            },
            fmtTrainStatus: function (mParam) {
                if (mParam.replace(/\s/g, "").toLowerCase() === "offlinetraining") {
                    return "NA";
                }
                return "Not Submitted";
            },
            // Learning/Video Training Dialog Box
            onRebindVideoTable: function (oEvent) {
                var oView = this.getView();

                var oPainterId = oView
                    .getModel("oModelControl2")
                    .getProperty("/PainterId");

                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters["expand"] = "LearningDetails";
                var oFilter = new Filter("PainterId", FilterOperator.EQ, oPainterId);
                oBindingParams.filters.push(oFilter);
            },
            onViewQuestionaireLearning: function (oEvent) {
                var object = oEvent.getSource().getBindingContext().getObject();

                this._LearningQuestionaire(object);
            },
            _LearningQuestionaire: function (mParam) {
                var oView = this.getView();
                var othat = this;
                if (!this._pQuestionaireDialog) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.ContactPainter.view.fragments.LearningQuestionDialog",
                        controller: this,
                    }).then(
                        function (oDialog) {
                            this._pQuestionaireDialog = oDialog;
                            othat._setLearningQuestData(mParam);
                        }.bind(this)
                    );
                } else {
                    othat._setLearningQuestData(mParam);
                }
            },
            _setLearningQuestData: function (sPath) {
                var oView = this.getView();
                var oTable = oView.byId("Questionnaire");

                this._pQuestionaireDialog.bindElement({
                    path: "/PainterLearningPointHistorySet(" + sPath["Id"] + ")",
                    parameters: {
                        expand: "SubmittedQuestionnaire",
                    },
                });
                oView.addDependent(this._pQuestionaireDialog);
                this._pQuestionaireDialog.open();
            },
            LearningQuestionaaireFactory: function (sId, oContext) {
                var oBject = oContext.getObject();
                console.log(oBject);
                var oColumnListItem = new sap.m.ColumnListItem();
                oColumnListItem.addCell(
                    new sap.m.Text({
                        text: "{Question/Question}",
                    })
                );

                var oOptionsObjet = this.getView()
                    .getModel()
                    .getProperty("/" + oBject["Question"]["__ref"]);

                oOptionsObjet["LearningQuestionnaireOptions"]["__list"].forEach(
                    function (z) {
                        oColumnListItem.addCell(
                            new ObjectStatus({
                                text: "{/" + z + "/Option}",
                                state: {
                                    parts: [
                                        "/" + z + "/IsCorrect",
                                        "/" + z + "/Id",
                                        "SelectedOptionId",
                                    ],
                                    formatter: function (mPram1, mPram2, mPram3) {
                                        console.log(mPram1, mPram2, mPram3);
                                        if (mPram1) {
                                            return "Success";
                                        }
                                        if (mPram2 == mPram3) {
                                            return "Error";
                                        }
                                    },
                                },
                            })
                        );
                    }
                );

                return oColumnListItem;
            },
            fmtQuestTrainStatus: function (mParam1, mParam2) {
                if (!mParam2) {
                    return "NA";
                }

                if (mParam1 == 0) {
                    return "Failure";
                } else {
                    return "Success";
                }
            },
            fmtQuestTrainStatusClr: function (mParam1, mParam2) {
                if (!mParam2) {
                    return "None"; //for status NA
                }

                if (mParam1 == 0) {
                    return "Error";
                } else {
                    return "Success";
                }
            },
        }
        );
    }
);