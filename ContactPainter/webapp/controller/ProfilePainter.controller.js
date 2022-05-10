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
        "sap/ui/model/Sorter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/format/DateFormat",
        "sap/ui/core/routing/History",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/VBox",
        "sap/m/Token",
        "sap/m/ObjectStatus",
        "sap/m/DialogType",
        "sap/m/ButtonType",
        "sap/m/Text",
        "sap/ui/core/Core",
        "com/knpl/pragati/ContactPainter/model/customInt",
        "com/knpl/pragati/ContactPainter/model/cmbxDtype2",
        "../model/customMulti",
        "../model/formatter",
        "sap/m/Title",
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
        Sorter,
        Filter,
        FilterOperator,
        DateFormat,
        History,
        Dialog,
        Button,
        VBox,
        Token,
        ObjectStatus,
        DialogType,
        ButtonType,
        Text,
        Core,
        customInt1,
        customInt2,
        customMulti,
        formatter,
        Title
    ) {
        "use strict";
        return BaseController.extend(
            "com.knpl.pragati.ContactPainter.controller.ProfilePainter", {
                formatter: formatter,
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter(this);
                    this.oWorkflowModel = new JSONModel();
                    this.oWorkflowModel.attachRequestCompleted(this._setWfData, this);
                    this.getView().setModel(this.oWorkflowModel, "wfmodel1");
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
                        "AgeGroup,Depot,PainterType,Slab,MaritalStatus,Religion,BusinessCategory,BusinessGroup,ArcheType,Preference/Language,PainterContact,PrimaryDealerDetails,PainterAddress/CityDetails,PainterAddress/PrCityDetails,PainterAddress/StateDetails,PainterAddress/PrStateDetails,PainterSegmentation/TeamSizeDetails,PainterSegmentation/PainterExperienceDetails,PainterSegmentation/SitePerMonthDetails,PainterSegmentation/PotentialDetails," +
                        "PainterFamily/RelationshipDetails,PainterBankDetails/AccountTypeDetails,PainterBankDetails/BankNameDetails,PainterBankDetails/CreatedByDetails,PainterBankDetails/UpdatedByDetails,Vehicles/VehicleTypeDetails,Dealers,Preference/SecurityQuestion,PainterKycDetails/KycTypeDetails,PainterKycDetails/CreatedByDetails,PainterKycDetails/UpdatedByDetails,PainterExpertise,CreatedByDetails,UpdatedByDetails,PainterNameChangeRequest,PainterMobileNumberChangeRequest";
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
                        selectedSection: "referral",
                        OfferRedeemDlg: {
                            RbtnRedeemType: -1,
                            UUID: "",
                            AddPoints: "",
                            AddCash: "",
                            IsMultiRewardAllowed: false
                        },
                        IctabBarLoyalty: "accrued",
                        ProfilePageBuzy: true,
                        QRCodeData: {},
                        AdditionalReqDlg: {},
                        ////////////deepanjali added/////////////////
                        AdditionalReqDlg_Remark: "",
                        ReferralMessage: "",
                        MultiCombo: {
                            Combo1: []
                        },
                        PainterUpdate: {
                            Field1: "Test",
                            FieldInput1: ""
                        },
                        NameChange: {
                            Edit: false,
                            RequestedName: "",
                            RejectRemark: ""
                        },
                        MobileChangeWorkflow: {
                            Edit: false,
                            RequestedField: "",
                            RejectRemark: ""
                        },
                        RejectRemark1: "",
                        resourcePath: "com.knpl.pragati.ContactPainter"
                    };
                    var oView = this.getView();
                    var oModel = new JSONModel(oData);
                    oView.setModel(oModel, "oModelControl2");
                    var c1a, c1b, c1, c2, c3, c4;
                    var othat = this;
                    var c1a = othat._SetBlankPromise();
                    c1a.then(function (oData) {
                        c1b = othat._SetBlankPromise(oData);
                        c1b.then(function () {
                            c1 = othat._loadEditProfile("Display");
                            c1.then(function () {
                                c2 = othat._loadEditBanking("Display");
                                c2.then(function () {
                                    c3 = othat._loadEditKyc("Display");
                                    c3.then(function () {
                                        c4 = othat._toggleButtonsAndView(false);
                                        oModel.setProperty("/ProfilePageBuzy", false);
                                    })
                                })
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

                onNameChangePress: function () {
                    this.getView().getModel("oModelControl2").setProperty("/NameChange/Edit", true);
                },
                onMobileChangePress: function () {
                    this.getView().getModel("oModelControl2").setProperty("/MobileChangeWorkflow/Edit", true);
                },
                onIconNameHistoryPress: function () {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl2");
                    if (!this._NameChangeHistoryDialog) {
                        Fragment.load({
                            controller: this,
                            name: oModelControl.getProperty("/resourcePath") + ".view.fragments.DialogHistoryNameChange",
                            id: oView.getId()
                        }).then(function (oControl) {
                            this._NameChangeHistoryDialog = oControl;
                            oView.addDependent(this._NameChangeHistoryDialog);
                            this._NameChangeHistoryDialog.open();
                            this._getWorkflowData("Name");

                        }.bind(this))
                    } else {
                        this._NameChangeHistoryDialog.open();
                    }
                },
                onIconMobileHistoryPress: function () {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl2");
                    if (!this._MobileChangeHistoryDialog) {
                        Fragment.load({
                            controller: this,
                            name: oModelControl.getProperty("/resourcePath") + ".view.fragments.DialogHistoryMobileChange",
                            id: oView.getId()
                        }).then(function (oControl) {
                            this._MobileChangeHistoryDialog = oControl;
                            oView.addDependent(this._MobileChangeHistoryDialog);
                            this._MobileChangeHistoryDialog.open();
                            this._getWorkflowData("Mobile");

                        }.bind(this))
                    } else {
                        this._MobileChangeHistoryDialog.open();
                    }
                },

                _getWorkflowData: function (mParam1) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl2");
                    var object = oView.getElementBinding().getBoundContext().getObject();

                    if (mParam1 === "Name") {
                        var sId = object["PainterNameChangeRequest"]["__ref"];
                        var sData = this.getView().getModel().getData("/" + sId);
                        this._getExecLogData1(sData["WorkflowInstanceId"])
                    } else if (mParam1 === "Mobile") {
                        var sId = object["PainterMobileNumberChangeRequest"]["__ref"];
                        var sData = this.getView().getModel().getData("/" + sId);
                        console.log(sData["WorkflowInstanceId"]);
                        this._getExecLogData1(sData["WorkflowInstanceId"])
                    }
                },
                _getExecLogData1: function (mParam1) {
                    var promise = jQuery.Deferred();
                    //for Test case scenerios delete as needed
                    var oView = this.getView();

                    var sWorkFlowInstanceId = mParam1;

                    var oModelControl = oView.getModel("oModelControl2");
                    oModelControl.setProperty("/ProfilePageBuzy", true);
                    console.log(mParam1)
                    if (sWorkFlowInstanceId) {
                        var sUrl =
                            "/comknplpragatiContactPainter/bpmworkflowruntime/v1/workflow-instances/" +
                            sWorkFlowInstanceId +
                            "/execution-logs";
                        console.log(sUrl)
                        this.oWorkflowModel.loadData(sUrl);
                        oModelControl.setProperty("/ProfilePageBuzy", false);
                    } else {
                        this.oWorkflowModel.setData([]);
                        oModelControl.setProperty("/ProfilePageBuzy", false);
                    }
                    promise.resolve();
                    return promise;
                },
                _setWfData: function () {
                    //TODO: format subject FORCETAT
                    var oView = this.getView();


                    var aWfData = this.oWorkflowModel.getData(),
                        taskSet = new Set([
                            "WORKFLOW_STARTED",
                            "WORKFLOW_COMPLETED",
                            "WORKFLOW_CANCELED",
                            "USERTASK_CREATED",
                            "USERTASK_COMPLETED",
                            "USERTASK_CANCELED_BY_BOUNDARY_EVENT", //TODO: Change text to TAT triggered
                        ]);

                    console.log(aWfData);
                    aWfData = aWfData.filter(ele => taskSet.has(ele.type));
                    console.log(aWfData);
                    this.oWorkflowModel.setData(aWfData);

                },
                onBeforeNameChangeHistory: function (oEvent) {
                    console.log("method trigerred");
                    var oView = this.getView();
                    var sComplainCode = oView
                        .getModel("oModelControl2")
                        .getProperty("/PainterId");

                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "UpdatedByDetails";
                    var oFilter = new Filter(
                        "PainterId",
                        FilterOperator.EQ,
                        sComplainCode,
                    );

                    oBindingParams.filters.push(oFilter);
                    oBindingParams.sorter.push(new Sorter("UpdatedAt", true));

                },
                onBeforeMobileChangeHistory: function (oEvent) {
                    console.log("method trigerred");
                    var oView = this.getView();
                    var sComplainCode = oView
                        .getModel("oModelControl2")
                        .getProperty("/PainterId");

                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "UpdatedByDetails";
                    var oFilter = new Filter(
                        "PainterId",
                        FilterOperator.EQ,
                        sComplainCode,
                    );

                    oBindingParams.filters.push(oFilter);
                    oBindingParams.sorter.push(new Sorter("UpdatedAt", true));

                },
                onCancelPressNameChange: function () {
                    var oModel = this.getView().getModel("oModelControl2")
                    oModel.setProperty("/NameChange/Edit", false);
                    oModel.setProperty("/NameChange/RequestedName", "");
                },
                onCancelPressMobileChange: function () {
                    var oModel = this.getView().getModel("oModelControl2")
                    oModel.setProperty("/MobileChangeWorkflow/Edit", false);
                    oModel.setProperty("/MobileChangeWorkflow/RequestedField", "");
                },
                onSendApprovalNameChange: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    var sName = oModelControl.getProperty("/NameChange/RequestedName");
                    let pattern1 = /^[A-Za-z]{1}$|^(?:[A-Za-z][ ]?[.]?[ ]?){1,40}[A-Za-z]$/g;
                    let result1 = pattern1.test(sName);
                    if (sName.length < 0 || result1 !== true) {
                        this._showMessageToast("Message9")
                        return false;
                    }
                    var oPayloadInput = {
                        PainterId: parseInt(oModelControl.getProperty("/PainterId")),
                        RequestedName: oModelControl.getProperty("/NameChange/RequestedName"),
                        AssigneUserType: "AGENT",
                        Status: "PENDING",
                        IsWorkFlowApplicable: true,
                        InitiateForceTat: false,
                        Remark: "Request Raised From Portal"
                    };
                    console.log(oPayloadInput);
                    var object = this.getView().getElementBinding().getBoundContext().getObject();
                    var sEdit = "NEW";
                    var sId = null;
                    var sPath = null;

                    if (object["PainterNameChangeRequest"]) {
                        sEdit = "UPDATE"
                        sId = object["PainterNameChangeRequest"]["__ref"];
                        sPath = "/" + sId + "/Status";
                        oPayloadInput["Id"] = parseInt(object["PainterNameChangeRequest"]["__ref"].match(/\d{1,}/)[0]);
                    }
                    //oModelControl.setProperty("/ProfilePageBuzy", true);
                    var c1, c2;
                    var othat = this;

                    if (sEdit === "NEW") {
                        console.log("new")
                        oModel.create("/PainterNameChangeRequestSet", oPayloadInput, {
                            success: function () {
                                this._showMessageToast("Message6");
                                this.getView().getModel().refresh(true);
                                oModelControl.setProperty("/ProfilePageBuzy", false);
                                oModelControl.setProperty("/NameChange/Edit", false);
                                oModelControl.setProperty("/NameChange/RequestedName", "");
                                oModelControl.refresh(true)
                            }.bind(othat),
                            error: function () {
                                oModelControl.setProperty("/ProfilePageBuzy", false)
                            }
                        })
                    } else if (sEdit === "UPDATE") {
                        console.log("update", oPayloadInput);
                        oModel.create("/PainterNameChangeRequestSet", oPayloadInput, {
                            success: function () {
                                this._showMessageToast("Message6");

                                oModelControl.setProperty("/ProfilePageBuzy", false);
                                oModelControl.setProperty("/NameChange/Edit", false);
                                oModelControl.setProperty("/NameChange/RequestedName", "");
                                oModelControl.refresh(true);
                                this.getView().getModel().refresh(true);
                            }.bind(othat),
                            error: function () {
                                oModelControl.setProperty("/ProfilePageBuzy", false)
                            }
                        })
                        // oModel.update(sPath, oPayloadInput, {
                        //     success: function () {
                        //         this._showMessageToast("Message6");
                        //         this.getView().getModel().refresh(true);
                        //         oModelControl.setProperty("/ProfilePageBuzy", false);
                        //         oModelControl.getProperty("/NameChange/Edit",false);
                        //         oModelControl.getProperty("/NameChange/RequestedName","");
                        //         oModelControl.refresh(true)
                        //     }.bind(othat),
                        //     error: function () {
                        //         oModelControl.setProperty("/ProfilePageBuzy", false)
                        //     }
                        // })
                    }




                },
                onSendApprovalMobileChange: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    var sMobile = oModelControl.getProperty("/MobileChangeWorkflow/RequestedField");
                    let pattern1 = /^[0-9]{10}$/g;
                    let result1 = pattern1.test(sMobile);
                    if (result1 !== true) {
                        this._showMessageToast("Message10");
                        return false;
                    }
                    var oPayloadInput = {
                        PainterId: parseInt(oModelControl.getProperty("/PainterId")),
                        RequestedMobileNumber: oModelControl.getProperty("/MobileChangeWorkflow/RequestedField"),
                        AssigneUserType: "AGENT",
                        Status: "PENDING",
                        IsWorkFlowApplicable: true,
                        InitiateForceTat: false,
                        Remark: "Request Raised From Portal"
                    };

                    oModelControl.setProperty("/ProfilePageBuzy", true);
                    var c1, c2;
                    var othat = this;
                    var object = this.getView().getElementBinding().getBoundContext().getObject();
                    var sEdit = "NEW";
                    var sId = null;
                    var sPath = null;

                    if (object["PainterMobileNumberChangeRequest"]) {
                        sEdit = "UPDATE"
                        sId = object["PainterMobileNumberChangeRequest"]["__ref"];
                        sPath = "/" + sId + "/Status";
                        oPayloadInput["Id"] = parseInt(object["PainterMobileNumberChangeRequest"]["__ref"].match(/\d{1,}/)[0]);
                    }

                    oModel.create("/PainterMobileNumberChangeRequestSet", oPayloadInput, {
                        success: function () {
                            this._showMessageToast("Message6");
                            oModelControl.setProperty("/MobileChangeWorkflow/Edit", false);
                            oModelControl.setProperty("/MobileChangeWorkflow/RequestedField", "");
                            this.getView().getModel().refresh(true);
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                        }.bind(othat),
                        error: function (odata) {
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                            if (odata.statusCode == 409) {
                                MessageBox.error(odata["responseText"], {
                                    title: "Error Code: " + odata.statusCode,
                                });
                            }

                        }
                    })



                },
                onApproveNameChange: function (mParam) {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    var oPayloadInput = {
                        Status: mParam,
                        InitiateForceTat: false,
                        Remark:"Approved"
                    };
                    var object = oView.getElementBinding().getBoundContext().getObject();
                    var sId = object["PainterNameChangeRequest"]["__ref"]

                    var c1, c2;
                    var othat = this;
                    var sPath = "/" + sId + "/Status";
                    this._showMessageBox1("confirm", "Message7", null, this._sendNameChangeReqPayload.bind(this, sPath, oPayloadInput));


                },

                onRemarksDialogOpen: function (mParam) {
                    var oView = this.getView();

                    var oModelControl = oView.getModel("oModelControl2");
                    var othat = this;
                    var sType = mParam
                    oModelControl.setProperty("/RejectRemark1", "");
                    if (!this._RemarksDialog1) {
                        Fragment.load({
                            id: oView.getId(),
                            controller: this,
                            name: oModelControl.getProperty("/resourcePath") + ".view.fragments.RemarksDialog1"
                        }).then(function (oDialog) {
                            this._RemarksDialog1 = oDialog;
                            oView.addDependent(this._RemarksDialog1);
                            this._RemarksDialog1.data("Type", sType)
                            this._RemarksDialog1.open();

                        }.bind(this))
                    } else {
                        this._RemarksDialog1.data("Type", sType)
                        this._RemarksDialog1.open();
                    }
                },
                onRejectRequest: function () {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    var sRemark = oModelControl.getProperty("/RejectRemark1")
                    if (sRemark.length <= 0) {
                        this._showMessageToast("Message11");
                        return false;
                    }
                    var oPayloadInput = {
                        Status: "REJECTED",
                        InitiateForceTat: false,
                        Remark: oModelControl.getProperty("/RejectRemark1"),
                    };
                    var object = oView.getElementBinding().getBoundContext().getObject();
                    var sType = this._RemarksDialog1.data()["Type"];
                    this.onDialogCloseNew();
                    if (sType === "NAME") {
                        var sId = object["PainterNameChangeRequest"]["__ref"];
                        var sPath = "/" + sId + "/Status";
                        this._sendNameChangeReqPayload(sPath, oPayloadInput);
                    } else if (sType === "MOBILE") {
                        var sId = object["PainterMobileNumberChangeRequest"]["__ref"];
                        var sPath = "/" + sId + "/Status";
                        this._sendMobileChangeReqPayload(sPath, oPayloadInput);
                    }





                },
                onEscalateNameChange: function (mParam) {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    var oPayloadInput = {
                        InitiateForceTat: true
                    };
                    var object = oView.getElementBinding().getBoundContext().getObject();
                    var sId = object["PainterNameChangeRequest"]["__ref"]
                    var sPath = "/" + sId + "/Status";
                    this._showMessageBox1("confirm", "Message8", null, this._sendNameChangeReqPayload.bind(this, sPath, oPayloadInput));

                },
                onEscalateMobileChange: function (mParam) {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    var oPayloadInput = {
                        InitiateForceTat: true
                    };
                    var object = oView.getElementBinding().getBoundContext().getObject();
                    var sId = object["PainterMobileNumberChangeRequest"]["__ref"]
                    var sPath = "/" + sId + "/Status";

                    this._showMessageBox1("confirm", "Message8", null, this._sendMobileChangeReqPayload.bind(this, sPath, oPayloadInput));

                },
                _sendNameChangeReqPayload: function (sPath, oPayloadInput) {
                     // Approve, Reject And Escalate calls are done from here.
                    var othat = this;
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    oModelControl.setProperty("/ProfilePageBuzy", true);
                    oModel.update(sPath, oPayloadInput, {
                        success: function () {
                            this._showMessageToast("Message6");
                            this.getView().getModel().refresh(true);
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                        }.bind(othat),
                        error: function () {
                            oModelControl.setProperty("/ProfilePageBuzy", false)
                        }
                    })

                },
                _sendMobileChangeReqPayload: function (sPath, oPayloadInput) {
                    // Approve, Reject And Escalate calls are done from here.
                    var othat = this;
                    var oView = this.getView();
                    var oModel = oView.getModel();
                    var oModelControl = oView.getModel("oModelControl2");
                    oModelControl.setProperty("/ProfilePageBuzy", true);
                    console.log(sPath, oPayloadInput)
                    oModel.update(sPath, oPayloadInput, {
                        success: function () {
                            this._showMessageToast("Message6");
                            this.getView().getModel().refresh(true);
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                        }.bind(othat),
                        error: function (odata) {
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                            if (odata.statusCode == 409) {
                                MessageBox.error(odata["responseText"], {
                                    title: "Error Code: " + odata.statusCode,
                                });
                            }
                        }
                    })

                },

                onApproveMobileChange: function (mParam) {
                    var oView = this.getView();
                    var oPayloadInput = {
                        Status: mParam,
                        InitiateForceTat: false,
                        Remark:"Approved"
                    };
                    var object = oView.getElementBinding().getBoundContext().getObject();
                    var sId = object["PainterMobileNumberChangeRequest"]["__ref"]
                    var sPath = "/" + sId + "/Status";
                    this._showMessageBox1("confirm", "Message7", null, this._sendMobileChangeReqPayload.bind(this, sPath, oPayloadInput));
                },
                _LoadPainterJsonData: function (oEvent) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oModelControl2 = oView.getModel("oModelControl2");
                    var sPath = oModelControl2.getProperty("/bindProp");
                    var othat = this;
                    var exPand =
                        "PainterFamily";
                    return new Promise((resolve, reject) => {
                        oView.getModel().read("/" + sPath, {
                            urlParameters: {
                                $expand: exPand,
                            },
                            success: function (data) {
                                resolve(data);
                            },
                            error: function () {
                                reject();
                            },
                        });
                    });

                },
                _SetMutliComboDisplayData: function (oData) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelControl2 = oView.getModel("oModelControl2");
                    var aCombo1 = [];

                    if (oData["PainterFamily"]["results"].length > 0) {
                        for (var x of oData["PainterFamily"]["results"]) {
                            aCombo1.push(x["RelationshipId"]);
                        }
                    }
                    oModelControl2.setProperty("/MultiCombo/Combo1", aCombo1);

                    promise.resolve();
                    return promise;
                },
                onSectionChange: function (oEvent) {
                    var oView = this.getView();
                    var oSection = oEvent.getParameter("section");
                    var sId = oSection.getId();
                    var oModelControl = oView
                        .getModel("oModelControl2")
                    var oPainterId = oModelControl.getProperty("/PainterId");
                    if (sId.match("loyaltysection")) {
                        oView.byId("smrtLoyalty").rebindTable();
                        oView.byId("smrtLoyalty1").rebindTable(); //redeemed table
                        oView.byId("smrtLoyalty2").rebindTable(); //redeemed cash table
                        oView.getModel("oModelControl2").setProperty("/IctabBarLoyalty", "accrued");
                    } else if (sId.match("learnSection")) {
                        oView.byId("smrtLiveTraining").rebindTable();
                        oView.byId("smrtOfflineTraining").rebindTable();
                        oView.byId("smrtVideoTraining").rebindTable();
                    } else if (sId.match("callbacksection")) {
                        oView.byId("smrtCallback").rebindTable();
                    } else if (sId.match("referral")) {
                        oModelControl.setProperty("/Search/Referral", "")
                        var oTable = oView.byId("Referral")
                        var oRefFilter = new Filter(
                            [
                                new Filter({
                                    path: "ReferralStatus",
                                    operator: "EQ",
                                    value1: "PENDING"
                                }),
                                new Filter({
                                    path: "ReferralStatus",
                                    operator: "EQ",
                                    value1: "REGISTERED"
                                }),
                                new Filter({
                                    path: "ReferralStatus",
                                    operator: "EQ",
                                    value1: "PENDINGSCAN"
                                })

                            ],
                            false
                        )
                        oTable.bindItems({
                            path: "/PainterReferralHistorySet",
                            template: oView.byId("ReferralTableDependent"),
                            templateShareable: true,
                            filters: [new Filter("ReferredBy", FilterOperator.EQ, oPainterId), oRefFilter],
                            sorter: new Sorter("CreatedAt", true)
                        })
                    } else if (sId.match("complainSection")) {
                        oModelControl.setProperty("/Search/Complains", "")
                        var oTable = oView.byId("IdTblComplaints")
                        oTable.bindItems({
                            path: "/PainterComplainsSet",
                            template: oView.byId("CompTablDepend"),
                            parameters: {
                                expand: 'ComplaintType,Painter,ComplaintSubtype',
                            },
                            templateShareable: true,
                            filters: [new Filter("PainterId", FilterOperator.EQ, oPainterId), new Filter("IsArchived", FilterOperator.EQ, false), new Filter("ComplaintSubtypeId", FilterOperator.NE, 1)],
                            sorter: new Sorter("CreatedAt", true)
                        })
                    } else if (sId.match("condomationSection")) {
                        var oTable = oView.byId("IdTblCondonations")
                        oTable.bindItems({
                            path: "/PainterComplainsSet",
                            template: oView.byId("TblCondoDepend"),
                            parameters: {
                                expand: 'PainterComplainProducts, PainterComplainProducts/ProductPackDetails, PainterComplainProducts/ProductPackDetails/ProductCategoryDetails',
                            },
                            templateShareable: true,
                            filters: [new Filter("PainterId", FilterOperator.EQ, oPainterId), new Filter("IsArchived", FilterOperator.EQ, false), new Filter("ComplaintSubtypeId", FilterOperator.EQ, 1)],
                            sorter: new Sorter("CreatedAt", true)
                        })
                    } else if (sId.match("tokenSection")) {
                        oModelControl.setProperty("/Search/Tokens", "")
                        var oTable = oView.byId("idTblOffers")
                        oTable.bindItems({
                            path: "/PainterTokenScanHistorySet",
                            template: oView.byId("TblToknHistDepend"),
                            parameters: {
                                expand: 'Painter',
                            },
                            templateShareable: true,
                            filters: [new Filter("PainterId", FilterOperator.EQ, oPainterId), new Filter("ScanStatus", FilterOperator.EQ, "COMPLETED")],
                            sorter: new Sorter("CreatedAt", true)
                        })
                    } else if (sId.match("offerssection")) {
                        var oTable = oView.byId("idTblOffersNew2")
                        oTable.bindItems({
                            path: "/PainterOfferSet",
                            template: oView.byId("idTblOffersNew2Template"),
                            templateShareable: true,
                            parameters: {
                                expand: 'Painter,Offer/OfferType,PainterOfferProgress,PainterOfferRedemption/GiftRedemption',
                                custom: {
                                    PainterId: "" + oPainterId + ""
                                }
                            },
                            filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("ProgressStatus", FilterOperator.NE, 'None'), new Filter("Offer/IsArchived", FilterOperator.EQ, false), new Filter("Offer/IsActive", FilterOperator.EQ, true)],
                            sorter: new Sorter("CreatedAt", true)
                        })
                    } else if (sId.match("additionalrequest")) {
                        var oTable = oView.byId("idTblOffers")
                        oTable.bindItems({
                            path: "/PainterAdditionalBenifitSet",
                            template: oView.byId("idTbladditionalReqNew2Template"),
                            templateShareable: true,
                            parameters: {
                                expand: 'masterAdditionalBenifit',

                            },
                            filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("painterId", FilterOperator.EQ, oPainterId)],
                            sorter: new Sorter("CreatedAt", true)
                        })
                    }


                    // else if (sId.match("complainSection")) {
                    //     var oTableReferral = oView.byId("IdTblComplaints");
                    //     var oRefFilter = new Filter(
                    //     oTableReferral.bindItems({
                    //         path: "/PainterComplainsSet",
                    //         template: oView.byId("CompTablDepend"),
                    //         templateShareable: true,
                    //         filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("ComplaintSubtypeId", FilterOperator.NE, 1),new Filter("PainterId", FilterOperator.EQ, oPainterId)],
                    //         sorter: new Sorter("CreatedAt", true)
                    //     });
                    // }
                },
                handleEditPress: function () {
                    this._toggleButtonsAndView(true);
                    var oView = this.getView();
                    var oCtrl2Model = oView.getModel("oModelControl2");
                    oCtrl2Model.setProperty("/ProfilePageBuzy", true);
                    oCtrl2Model.setProperty("/modeEdit", true);
                    oCtrl2Model.setProperty("/iCtbar", false);
                    var c1, c2, c3, c4, c4A;
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
                                    oCtrl2Model.setProperty("/ProfilePageBuzy", false);
                                });
                            });
                        });
                    });
                    // this._initSaveModel();
                },
                _RefreshSmartables: function () {
                    var oView = this.getView();
                    oView.byId("smrtLoyalty").rebindTable();
                    oView.byId("smrtLoyalty1").rebindTable(); //redeemed table
                    oView.byId("smrtLoyalty2").rebindTable(); //redeemed cash table
                    oView.byId("smrtLiveTraining").rebindTable();
                    oView.byId("smrtOfflineTraining").rebindTable();
                    oView.byId("smrtVideoTraining").rebindTable();
                    oView.byId("smrtCallback").rebindTable();
                },
                _initEditData: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oControlModel2 = oView.getModel("oModelControl2");
                    var sPath = oControlModel2.getProperty("/bindProp");
                    var iPainterId = parseInt(oControlModel2.getProperty("/PainterId"));
                    var oDataCtrl = {
                        TotalMaxRegistrations: null,
                        modeEdit: false,
                        bindProp: sPath,
                        PainterId: iPainterId,
                        EditTb1FDL: false,
                        EditTb2AST: false,
                        AnotherMobField: false,
                        BankExistStatus: "",
                        AddNewBank: false,
                        EditBank: false, //Aditya Chnage
                        EditBankButton: false, //Aditya Chnage
                        AddBankDocButton: false, //Aditya Chnage
                        InitialDocType: "", //Aditya Chnage
                        InitialBankNull: false, //Aditya Chnage
                        AddBankDoc: false, //Aditya Chnage
                        EditField: false, //Aditya Chnage
                        EditKyc: false, //Aditya Chnage
                        EditKycButton: false, //Aditya Chnage
                        EditFieldKyc: false, //Aditya chnages
                        AddKycDoc: false, //Aditya Chnage
                        AddKycDocButton: false, //Aditya chnage
                        InitialKycNull: false, //Aditya Chnage
                        InitialKycDocType: "", //Aditya Chnage
                        InitialKycStatus: "", //Aditya Chnage
                        InitialGovtId: "", //Aditya Chnage
                        InitialIfsc: "",
                        InitialAcTypeId: "",
                        InitialBankHoldName: "",
                        InitialBankId: "",
                        InitialAccNo: "",
                        DocumentType: [{
                            Name: "Passbook",
                            Id: 0
                        }, {
                            Name: "Cheque",
                            Id: 1
                        }], //Aditya Chnage
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
                            Status: "",
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
                        MultiCombo: {
                            Combo1: []
                        }
                    };
                    var oControlModel = new JSONModel(oDataCtrl);
                    oView.setModel(oControlModel, "oModelControl");
                    var oDataValue = oView.getModel().getObject("/" + sPath, {
                        expand: "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,PainterKycDetails,Vehicles,Dealers,PainterExpertise",
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
                    // filtering data for the permanent address fields
                    var oCity2 = oView.byId("cmbCity2"),
                        sStateKey2 = oDataValue["PainterAddress"]["PrStateId"] || "",
                        aFilterCity2 = [],
                        oBindingCity2 = oCity2.getBinding("items");
                    if (sStateKey2 !== "") {
                        aFilterCity2.push(
                            new Filter("StateId", FilterOperator.EQ, sStateKey2)
                        );
                        oBindingCity2.filter(aFilterCity2);
                    }
                    //setting up the filtering data for the Division
                    var sZoneId = oDataValue["ZoneId"];
                    if (sZoneId !== null) {
                        oView
                            .byId("idDivision")
                            .getBinding("items")
                            .filter(new Filter("Zone", FilterOperator.EQ, sZoneId));
                    }
                    //setting up the filtering data for the Depot
                    var sDivisionId = oDataValue["DivisionId"];
                    if (sDivisionId !== null) {
                        oView
                            .byId("idDepot")
                            .getBinding("items")
                            .filter(new Filter("Division", FilterOperator.EQ, sDivisionId));
                    }
                    var sDepotId = oDataValue["DepotId"];
                    // setting data for primary dealer
                    if (oDataValue["DealerId"]) {
                        oView.byId("idMinpPDealers").addToken(
                            new Token({
                                text: "{PrimaryDealerDetails/DealerName} - " +
                                    oDataValue["DealerId"],
                            })
                        );
                    }
                    // setting data for secondry dealers
                    var oSecTokens = oDataValue["Dealers"];
                    oControlModel.setProperty(
                        "/PainterAddDet/SecondryDealer",
                        oSecTokens
                    );
                    // setting up multicombo data for expertise
                    var aExpertise = oDataValue["PainterExpertise"].filter(item1 => item1["IsArchived"] === false).map(elem => elem["ExpertiseId"]);

                    oControlModel.setProperty("/MultiCombo/Combo1", aExpertise);

                    // setting up kyc data
                    //var oKycData = oDataValue["PainterBankDetails"];
                    if (oDataValue.hasOwnProperty("PainterKycDetails")) {
                        var oKycData = oDataValue["PainterKycDetails"];
                        var InitialKycType = oKycData["KycTypeId"];
                        oControlModel.setProperty("/InitialKycDocType", InitialKycType);
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
                        oControlModel.setProperty("/InitialIfsc", oBankData["IfscCode"]);
                        oControlModel.setProperty("/InitialAcTypeId", oBankData["AccountTypeId"]);
                        oControlModel.setProperty("/InitialBankHoldName", oBankData["AccountHolderName"]);
                        oControlModel.setProperty("/InitialBankId", oBankData["BankNameId"]);
                        oControlModel.setProperty("/InitialAccNo", oBankData["AccountNumber"]);
                        /*deepanjali changes start*/
                        oControlModel.setProperty("/PaymentTransactionId", oBankData["PaymentTransactionId"]);
                        oControlModel.setProperty("/PaymentReferenceId", oBankData["PaymentReferenceId"]);
                        oControlModel.setProperty("/PaymentTransactionStatus", oBankData["PaymentTransactionStatus"]);
                        oControlModel.setProperty("/PaymentTransactionMessage", oBankData["PaymentTransactionMessage"]);
                        /*deepanjali changes end*/
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
                    if (oDataValue["PainterBankDetails"] == null) {
                        oControlModel.setProperty("/InitialBankNull", true);
                    }
                    if (oDataValue["PainterKycDetails"] == null) {
                        oControlModel.setProperty("/InitialKycNull", true);
                        oDataValue["PainterKycDetails"] = {
                            GovtId: "",
                            KycTypeId: "",
                            PainterId: oDataValue["Id"],
                            Status: "PENDING"
                        }
                    } else {
                        var initialStatus = oDataValue["PainterKycDetails"]["Status"];
                        oControlModel.setProperty("/InitialKycStatus", initialStatus);
                        var initialGovtId = oDataValue["PainterKycDetails"]["GovtId"];
                        oControlModel.setProperty("/InitialGovtId", initialGovtId);
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
                        //"PainterBankDetails/DocumentType",
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
                _setCopyForFragment: function () {},
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
                    // console.log("Cross Navigate Trigerred");
                    var sPainterId = this.getView().getModel("oModelControl2").getProperty("/PainterId") + "";
                    //console.log(sPainterId);
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
                _CheckExpertise: function () {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl");
                    var aExp = oModelControl.getProperty("/MultiCombo/Combo1");
                    if (aExp.length === 0) {
                        return false;
                    }
                    return true
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
                    var addKycDoc = oModelControl.getProperty("/AddKycDoc");
                    var fValidationExp = this._CheckExpertise();
                    if (addBankDoc) {
                        this.eValidateBank = this._CheckTheBank(); //Aditya chnages
                    }
                    if (addKycDoc) {
                        this.eValidateKyc = this._CheckTheKyc(); //Aditya chnages
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
                    if (!fValidationExp) {
                        this._showMessageToast("Messgae5");
                    }

                    if (addBankDoc && addKycDoc) {
                        if (this.eValidateBank == false && this.eValidateKyc == false) {
                            MessageToast.show("Kindly upload the image of the selected Bank and Kyc Details.In case of Aadhar and Voter Id kindly upload front and back images.");
                        }
                        if (bValidation && dTbleFamily && eTbleAssets && cValidation && this.eValidateBank && this.eValidateKyc && fValidationExp) {
                            this._postDataToSave();
                        }
                    } else
                    if (addBankDoc || addKycDoc) {
                        if (this.eValidateBank == false) {
                            MessageToast.show("Kindly upload the image of the selected Bank Details.");
                        } else if (this.eValidateKyc == false) {
                            MessageToast.show("Kindly upload the image of the selected Kyc Details.In case of Aadhar and Voter Id kindly upload front and back images.");
                        }
                        if (addBankDoc) {
                            if (bValidation && dTbleFamily && eTbleAssets && cValidation && this.eValidateBank && fValidationExp) {
                                this._postDataToSave();
                            }
                        } else
                        if (addKycDoc) {
                            if (bValidation && dTbleFamily && eTbleAssets && cValidation && this.eValidateKyc && fValidationExp) {
                                this._postDataToSave();
                            }
                        }
                    } else if (!addBankDoc && !addKycDoc) {
                        if (bValidation && dTbleFamily && eTbleAssets && cValidation && fValidationExp) {
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
                    // MutlciaExpertisecombo data 
                    var aExpertise = oCtrlModel.getProperty("/MultiCombo/Combo1")
                    oPayload["PainterExpertise"].forEach(element => {
                        element["IsArchived"] = true
                    });
                    var iExpIndex = -1
                    for (var x of aExpertise) {
                        iExpIndex = oPayload["PainterExpertise"].findIndex(item => parseInt(item.ExpertiseId) === parseInt(x))
                        if (iExpIndex >= 0) {
                            oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                        } else {
                            oPayload["PainterExpertise"].push({
                                ExpertiseId: parseInt(x)
                            });
                        }
                    }

                    /*Aditya changes start*/
                    for (var e in oPayload["PainterBankDetails"]) {
                        if (oPayload["PainterBankDetails"][e] === "") {
                            oPayload["PainterBankDetails"][e] = null;
                        }
                    }
                    for (var f in oPayload["PainterKycDetails"]) {
                        if (oPayload["PainterKycDetails"][f] === "") {
                            oPayload["PainterKycDetails"][f] = null;
                        }
                    }

                    var editBank = oCtrlModel.getProperty("/EditBank");
                    var editField = oCtrlModel.getProperty("/EditField");
                    var addBankDoc = oCtrlModel.getProperty("/AddBankDoc");
                    var InitialDocType = oCtrlModel.getProperty("/InitialDocType");
                    var InitialBankNull = oCtrlModel.getProperty("/InitialBankNull");
                    var editKyc = oCtrlModel.getProperty("/EditKyc");
                    var editFieldKyc = oCtrlModel.getProperty("/EditFieldKyc");
                    var addKycDoc = oCtrlModel.getProperty("/AddKycDoc");
                    var InitialKycNull = oCtrlModel.getProperty("/InitialKycNull");
                    var InitialKycStatus = oCtrlModel.getProperty("/InitialKycStatus");
                    // if (editBank) {
                    if (addBankDoc) {
                        // this._checkBankFileUpload(oPayload);
                        oPayload["PainterBankDetails"]["Status"] = "PENDING";
                    }
                    // }
                    if (editField) {
                        oPayload["PainterBankDetails"]["Status"] = "PENDING";
                    } else {
                        if (InitialBankNull) {
                            oPayload["PainterBankDetails"] = null;
                        }
                    }
                    //upload kyc doc
                    if (addKycDoc) {
                        oPayload["PainterKycDetails"]["Status"] = "INPROGRESS";
                    }
                    if (editFieldKyc) {
                        if (addKycDoc) {
                            oPayload["PainterKycDetails"]["Status"] = "INPROGRESS";
                        } else {
                            // if(InitialKycStatus=="APPROVED"||InitialKycStatus=="REJECTED"||InitialKycStatus=="PENDING"){
                            //     oPayload["PainterKycDetails"]["Status"] = "INPROGRESS";
                            // }
                            oPayload["PainterKycDetails"]["Status"] = "PENDING";
                        }
                    } else {
                        if (InitialKycNull) {
                            oPayload["PainterKycDetails"] = null;
                        }
                    }
                    //console.log(oPayload, sPath);
                    var oModel = this.getView().getModel();
                    var c1, c2, c3, c4;
                    var oData = this.getView().getModel();
                    //var othat = this;
                    //console.log(oPayload)
                    c1 = this._UpdateData(oPayload, sPath);
                    c1.then(
                        function (oData) {
                            if (editBank || editKyc) {
                                if (addBankDoc && addKycDoc) {
                                    oView.setBusy(true);
                                    c2 = othat._getUpdatedPainterData(oData);
                                    c2.then(function (oData) {
                                        oView.setBusy(true);
                                        c3 = othat._checkFileUpload(oData);
                                        c3.then(function (data) {
                                            c4 = othat._checkBankFileUpload(oData);
                                            c4.then(function (data) {
                                                //othat.navPressBack();
                                                oView.setBusy(false);
                                                othat.fnCheckProfileCompleted.call(othat, oPayload);
                                                othat.handleCancelPress();
                                            });
                                        })
                                    });
                                } else
                                if (addBankDoc || addKycDoc) {
                                    if (addBankDoc) {
                                        oView.setBusy(true);
                                        c2 = othat._getUpdatedPainterData(oData);
                                        c2.then(function (oData) {
                                            oView.setBusy(true);
                                            c3 = othat._checkBankFileUpload(oData);
                                            c3.then(function (data) {
                                                oView.setBusy(false);
                                                othat.fnCheckProfileCompleted.call(othat, oPayload);
                                                othat.handleCancelPress();
                                            });
                                        });
                                    } else if (addKycDoc) {
                                        oView.setBusy(true);
                                        c2 = othat._getUpdatedPainterData(oData);
                                        c2.then(function (oData) {
                                            oView.setBusy(true);
                                            c3 = othat._checkFileUpload(oData);
                                            c3.then(function (data) {
                                                oView.setBusy(false);
                                                othat.fnCheckProfileCompleted.call(othat, oPayload);
                                                othat.handleCancelPress();
                                            })
                                        });
                                    }
                                } else {
                                    oView.setBusy(false);
                                    othat.fnCheckProfileCompleted.call(othat, oPayload);
                                    othat.handleCancelPress();
                                }
                            } else {
                                oView.setBusy(false);
                                othat.fnCheckProfileCompleted.call(othat, oPayload);
                                othat.handleCancelPress();
                            }
                        })
                },
                _UpdateData: function (oPayload, sPath) {
                    var i = 0;
                    //console.log(i + 1);
                    var promise = jQuery.Deferred();
                    var othat = this;
                    var oModel = this.getView().getModel();
                    oModel.update(sPath, oPayload, {
                        success: function (Data) {
                            MessageToast.show(
                                "Painter " + oPayload["Name"] + " Successfully Updated"
                            );
                            //othat.fnCheckProfileCompleted.call(othat, oPayload);
                            //othat.handleCancelPress();
                            //oData.refresh(true);
                            promise.resolve(Data);
                        },
                        error: function (a) {

                            var sMessage =
                                "Unable to update a painter due to the server issues";
                            if (a.statusCode == 409) {
                                sMessage = a["responseText"]
                            }
                            MessageBox.error(sMessage, {
                                title: "Error Code: " + a.statusCode,
                            });
                            promise.reject(a);
                        },
                    });
                    return promise;
                },
                /*Aditya changes end*/
                _getUpdatedPainterData: function () {
                    var promise = jQuery.Deferred();
                    var oCtrlModel = this.getView().getModel("oModelControl");
                    var sPath = "/" + oCtrlModel.getProperty("/bindProp");
                    var oModel = this.getView().getModel();
                    oModel.read(sPath, {
                        urlParameters: {
                            "$expand": "PainterBankDetails,PainterKycDetails"
                        },
                        success: function (oData) {
                            promise.resolve(oData);
                        },
                        error: function (oError) {
                            promise.reject();
                        }
                    });
                    return promise;
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



                    //View.byId("idLoyaltyPoints").getBinding("items").filter(oFilOffers);
                    //Offers Table

                    //additional request table

                },
                onLoyaltySelChange: function (oEvent) {
                    var sKey = oEvent.getParameter("item").getKey();
                    if (sKey == "0") {} else {}
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
                fmtDocumentType: function (mParam) {
                    if (mParam == 0) {
                        return "Passbook"
                    } else if (mParam == 1) {
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
                        if (!i["mProperties"].hasOwnProperty("value")) {
                            continue;
                        }
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
                onPinCodeSelect2: function (oEvent) {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oObject = oEvent
                        .getParameter("selectedItem")
                        .getBindingContext()
                        .getObject();
                    var iStateId = oObject["StateId"];
                    var iCity = oObject["CityId"];
                    var oCity = oView.byId("cmbCity2");
                    var oState = oView.byId("cmBxState2");
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
                onStateChange2: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oCity = oView.byId("cmbCity2"),
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
                            IsArchived: false
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
                onBankChange: function (oEvent) {
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    oModelCtrl.setProperty("/EditField", true);
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
                    var oObject = oEvent
                        .getSource()
                        .getBindingContext("oModelView")
                        .getObject();
                    if (oObject.hasOwnProperty("Id")) {
                        oObject["IsArchived"] = true;
                    } else {
                        aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
                    }

                    this._setFDLTbleFlag();
                    oModel.refresh(true);
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
                            IsArchived: false
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
                    var oObject = oEvent.getSource().getBindingContext("oModelView").getObject();
                    if (oObject.hasOwnProperty("Id")) {
                        oObject["IsArchived"] = true;
                    } else {
                        var aFamilyDetails = oModel.getProperty("/Vehicles");
                        aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
                    }

                    this._setASTTbleFlag();
                    oModel.refresh(true);
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
                    /*Aditya changes start*/
                    var oView = this.getView();
                    var othat = this;
                    var oModelView = oView.getModel("oModelView");
                    var statusText = oEvent.getSource().getProperty('text');

                    function onYes() {
                        othat.onReject(statusText);
                    }
                    this.showWarning("Do you want to " + " " + statusText + "?", onYes);
                    /*Aditya changes end*/
                },
                onReject: function (statusText) {
                    var oView = this.getView();
                    var othat = this;
                    var oModelView = oView.getModel("oModelView");
                    if (statusText == 'Approve') {
                        oModelView.setProperty("/PainterBankDetails/Status", "APPROVED");
                        var oData = this.getView().getModel("oModelView").getData();
                        var sBankId = oData["PainterBankDetails"]["Id"];
                        var sPath = "/PainterBankDetailsSet(" + sBankId + ")" + "/Status";
                        var sStatus = oModelView.getProperty("/PainterBankDetails/Status");
                        this.getView().getModel().update(sPath, {
                            Status: sStatus
                        }, {
                            success: function () {
                                othat.handleCancelPress();
                            },
                            error: function (a) {},
                        });
                    } else if (statusText == 'Reject' || statusText == 'Reject Forcefully') {
                        oModelView.setProperty("/PainterBankDetails/Status", "REJECTED");
                        var oData = this.getView().getModel("oModelView").getData();
                        var sBankId = oData["PainterBankDetails"]["Id"];
                        var sPath = "/PainterBankDetailsSet(" + sBankId + ")" + "/Status";
                        var sStatus = oModelView.getProperty("/PainterBankDetails/Status");
                        this.getView().getModel().update(sPath, {
                            Status: sStatus
                        }, {
                            success: function () {
                                othat.handleCancelPress();
                            },
                            error: function (a) {},
                        });
                    }
                },
                onRejectKYC: function (statusText) {
                    var oView = this.getView();
                    var othat = this;
                    var oModelView = oView.getModel("oModelView");
                    if (statusText == 'Approve') {
                        oModelView.setProperty("/PainterKycDetails/Status", "APPROVED");
                        var oData = this.getView().getModel("oModelView").getData();
                        var sBankId = oData["PainterKycDetails"]["Id"];
                        var sPath = "/PainterKycDetailsSet(" + sBankId + ")" + "/Status";
                        var sStatus = oModelView.getProperty("/PainterKycDetails/Status");
                        this.getView().getModel().update(sPath, {
                            Status: sStatus
                        }, {
                            success: function () {
                                othat.handleCancelPress();
                            },
                            error: function (a) {},
                        });
                    } else if (statusText == 'Reject' || statusText == 'Reject Forcefully') {
                        oModelView.setProperty("/PainterKycDetails/Status", "REJECTED");
                        var oData = this.getView().getModel("oModelView").getData();
                        var sBankId = oData["PainterKycDetails"]["Id"];
                        var sPath = "/PainterKycDetailsSet(" + sBankId + ")" + "/Status";
                        var sStatus = oModelView.getProperty("/PainterKycDetails/Status");
                        this.getView().getModel().update(sPath, {
                            Status: sStatus
                        }, {
                            success: function () {
                                othat.handleCancelPress();
                            },
                            error: function (a) {},
                        });
                    }
                },
                onRbKycStatus: function (oEvent) {
                    /*Aditya changes start*/
                    var oView = this.getView();
                    var othat = this;
                    var oModelView = oView.getModel("oModelView");
                    var statusText = oEvent.getSource().getProperty('text');

                    function onYes() {
                        othat.onRejectKYC(statusText);
                    }
                    this.showWarning("Do you want to " + " " + statusText + "?", onYes);
                    /*Aditya changes end*/
                },
                onKycView: function (oEvent) {
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelControl");
                    var sSource1 = oModel.getProperty("/KycImage/Image1");
                    var sSource2 = oModel.getProperty("/KycImage/Image2");
                    var oModelView = oView.getModel("oModelView").getData();
                    if (oModelView["PainterKycDetails"]["KycTypeId"] === 2) {
                        sap.m.URLHelper.redirect(sSource1, true);
                    } else {
                        sap.m.URLHelper.redirect(sSource1, true);
                        sap.m.URLHelper.redirect(sSource2, true);
                    }

                    // if (!this._pKycDialog) {
                    //     Fragment.load({
                    //         name: "com.knpl.pragati.ContactPainter.view.fragments.KycDialog",
                    //         controller: this,
                    //     }).then(
                    //         function (oDialog) {
                    //             this._pKycDialog = oDialog;
                    //             oView.addDependent(this._pKycDialog);
                    //             this._pKycDialog.open();
                    //         }.bind(this)
                    //     );
                    // } else {
                    //     oView.addDependent(this._pKycDialog);
                    //     this._pKycDialog.open();
                    // }
                },
                /*Aditya changes start*/
                onBankView: function (oEvent) {

                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    var sSource = oView.getModel("oModelControl").getProperty("/BankImage/Image1")
                    sap.m.URLHelper.redirect(sSource, true);

                    // if (!this._pBankDialog) {
                    //     Fragment.load({
                    //         name: "com.knpl.pragati.ContactPainter.view.fragments.BankDialog",
                    //         controller: this,
                    //     }).then(
                    //         function (oDialog) {
                    //             this._pBankDialog = oDialog;
                    //             oView.addDependent(this._pBankDialog);
                    //             this._pBankDialog.open();
                    //         }.bind(this)
                    //     );
                    // } else {
                    //     oView.addDependent(this._pBankDialog);
                    //     this._pBankDialog.open();
                    // }
                },
                onEditBankingFields: function () {
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    oModelCtrl.setProperty("/EditBank", true);
                    oModelCtrl.setProperty("/EditBankButton", true);
                    oModelCtrl.setProperty("/AddBankDocButton", true);
                    oModelCtrl.setProperty("/PennyDropVisible", false);
                    oModelCtrl.setProperty("/AddNewBank", false);
                    //added by deepanjali //////
                    oModelCtrl.setProperty("/AddBankDoc", true);
                    var oModelView = this.getView().getModel("oModelView");
                    this.docType = oModelView.getProperty("PainterBankDetails/DocumentType");
                    this._setUploadCollectionMethodBank();
                },
                onEditCancelBankingFields: function () {
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    var oValidator = new Validator();
                    var oForm = this.getView().byId("editbanking");
                    // var bFlag = oValidator.validate(oForm,true);
                    // console.log(bFlag);
                    // if(!bFlag){
                    //     return;
                    // }
                    // console.log(oModelCtrl);
                    oModelCtrl.setProperty("/EditBank", false);
                    oModelCtrl.setProperty("/EditBankButton", false);
                    oModelCtrl.setProperty("/EditField", false);
                    oModelCtrl.setProperty("/AddBankDoc", false);
                    oModelCtrl.setProperty("/AddBankDocButton", false);
                    oModelCtrl.setProperty("/PennyDropVisible", true);
                    var InitialDocType = oModelCtrl.getProperty("/InitialDocType");
                    var InitialIfsc = oModelCtrl.getProperty("/InitialIfsc");
                    var InitialAcTypeId = oModelCtrl.getProperty("/InitialAcTypeId");
                    var InitialBankHoldName = oModelCtrl.getProperty("/InitialBankHoldName");
                    var InitialBankId = oModelCtrl.getProperty("/InitialBankId");
                    var InitialAccNo = oModelCtrl.getProperty("/InitialAccNo");
                    oModelView.setProperty("/PainterBankDetails/DocumentType", InitialDocType);
                    oModelView.setProperty("/PainterBankDetails/IfscCode", InitialIfsc);
                    oModelView.setProperty("/PainterBankDetails/AccountHolderName", InitialBankHoldName);
                    oModelView.setProperty("/PainterBankDetails/BankNameId", InitialBankId);
                    oModelView.setProperty("/PainterBankDetails/AccountTypeId", InitialAcTypeId);
                    oModelView.setProperty("/PainterBankDetails/AccountNumber", InitialAccNo);
                    oModelView.refresh(true);
                    //console.log(oModelView.getData())
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
                    var oCtrlModel = this.getView().getModel("oModelControl");
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
                                    var editField = oCtrlModel.setProperty("/EditField", true);
                                },
                                error: function () {},
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
                    this._setUploadCollectionMethodBank();
                },
                onCancelBankDoc: function () {
                    var oView = this.getView();
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    oModelCtrl.setProperty("/AddBankDoc", false);
                    oModelCtrl.setProperty("/AddBankDocButton", true);
                    //oModelCtrl.setProperty("/EditBank", false);
                    oModelCtrl.setProperty("/EditBankButton", true);
                    var InitialDocType = oModelCtrl.getProperty("/InitialDocType");
                    oModelView.setProperty("/PainterBankDetails/DocumentType", InitialDocType);
                    oView.byId("idUploadCollectionBank").removeAllItems();
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
                onKycChange: function (oEvent) {
                    var oModel = this.getView().getModel("oModelView");
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oView = this.getView();
                    if (oEvent.getSource().getSelectedKey() == "") {
                        oView.byId("kycIdNo").setValueState("None");
                        oModel.setProperty("/PainterKycDetails/GovtId", "");
                    }
                    oModelCtrl.setProperty("/EditFieldKyc", true);
                    oModelCtrl.setProperty("/AddKycDocButton", false);
                    oModel.setProperty("/PainterKycDetails/GovtId", "");
                    oModelCtrl.setProperty("/AddKycDoc", true);
                },
                onKycChangeEdit: function (oEvent) {
                    var oModel = this.getView().getModel("oModelView");
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oView = this.getView();
                    var kycId = oView.byId("idKycEditCombo").getSelectedKey();
                    if (kycId == "") {
                        //oView.byId("kycIdNoEdit").setValueState("None");
                        oModel.setProperty("/PainterKycDetails/GovtId", "");
                    } else {
                        //oModel.setProperty("/PainterKycDetails/KycTypeId", parseInt(kycId));
                        oModelCtrl.setProperty("/KycLabel", kycId);
                        oModelCtrl.setProperty("/EditFieldKyc", true);
                        oModelCtrl.setProperty("/AddKycDocButton", false);
                        oModel.setProperty("/PainterKycDetails/GovtId", "");
                        oModelCtrl.setProperty("/AddKycDoc", true);
                    }
                },
                onEditField: function (oEvent) {
                    //var length = oEvent.getParameter("value").length;
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    var sValue = oModelView.getProperty("/PainterBankDetails/DocumentType");
                    if (sValue == undefined) {
                        oModelView.setProperty("/PainterBankDetails/DocumentType", "");
                    }
                    oModelCtrl.setProperty("/EditField", true);
                    // if (length > 1) {
                    //     oModelCtrl.setProperty("/EditField", true);
                    // } else {
                    //     oModelCtrl.setProperty("/EditField", false);
                    // }
                },
                onInpAccNumberChange: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var sBankAccNo = oView.byId("NewAccountNumber").getValue().trim();
                    var sIfscCode = oView.byId("NewIfscCode").getValue().trim();
                    if (!sIfscCode) {
                        oModelView.setProperty("/PainterBankDetails/AccountNumber", "");
                        var sMessage1 = this.geti18nText("Message2");
                        MessageToast.show(sMessage1, {
                            duration: 6000
                        })
                        return;
                    }
                    if (sBankAccNo) {
                        this._CheckBankExistDetails();
                        return
                    }

                },
                _CheckBankExistDetails: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl2 = oView.getModel("oModelControl2");
                    oModelControl2.setProperty("/busy", true);
                    var sBankAccNo = oView.byId("NewAccountNumber").getValue().trim();
                    var sIfscCode = oView.byId("NewIfscCode").getValue().trim();
                    var sPainterId = oModelControl2.getProperty("/PainterId");
                    var oData = oView.getModel();
                    oData.read("/PainterBankDetailsSet", {
                        urlParameters: {
                            $select: "AccountNumber,IfscCode"
                        },
                        filters: [new Filter("PainterId", FilterOperator.NE, sPainterId), new Filter("AccountNumber", FilterOperator.EQ, sBankAccNo), new Filter({
                            path: "IfscCode",
                            operator: FilterOperator.EQ,
                            value1: sIfscCode,
                            caseSensitive: false,
                        })],
                        success: function (oData) {

                            if (oData["results"].length > 0) {
                                var sMessage1 = this.geti18nText("Message1", [sBankAccNo, sIfscCode]);
                                oModelView.setProperty("/PainterBankDetails/AccountNumber", "");
                                MessageToast.show(sMessage1, {
                                    duration: 6000
                                });
                            }
                            oModelControl2.setProperty("/busy", false);
                        }.bind(this),
                        error: function () {
                            oModelControl2.setProperty("/busy", false);
                        }

                    })
                },
                onEditFieldKyc: function (oEvent) {
                    var length = oEvent.getParameter("value").length;
                    var value = oEvent.getParameter("value");
                    var oView = this.getView();
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    if (length > 1) {
                        oModelCtrl.setProperty("/EditFieldKyc", true);
                        //oModelView.setProperty("/PainterKycDetails/GovtId",value);
                    } else {
                        oModelCtrl.setProperty("/EditFieldKyc", false);
                    }
                    // Here 2 diff kinds of fields will be displayed based on if intial kyc value is null or non null


                    var sSouceId = oEvent.getSource().getId();
                    var sGovtTypeId = oModelView.getProperty("/PainterKycDetails/KycTypeId");
                    var sKycId1 = this.createId("kycIdNo");
                    var sKycId2 = this.createId("kycIdNoEdit");

                    if (sSouceId === sKycId1) {
                        var sKyCNumber = oView.byId("kycIdNo").getValue().trim();
                        if (sKyCNumber && sGovtTypeId) {
                            this._CheckKYCExistDetails1();
                        }
                    }
                    // below statement will run when the kyc is null
                    if (sSouceId === sKycId2) {
                        var sKyCNumber = oView.byId("kycIdNoEdit").getValue().trim();
                        if (sKyCNumber && sGovtTypeId) {
                            this._CheckKYCExistDetails1("kycNull");
                        }
                    }



                },
                _CheckKYCExistDetails1: function (mParam1) {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl2");
                    oModelControl.setProperty("/ProfilePageBuzy", true);
                    var sGovtTypeId = oModelView.getProperty("/PainterKycDetails/KycTypeId");
                    var sGovtIdNo = oModelView.getProperty("/PainterKycDetails/GovtId");
                    var sCmBxId = mParam1 === "kycNull" ? "idKycEditCombo" : "idKycEditComboNotNull";
                    var sPainterId = oModelControl.getProperty("/PainterId")
                    var sKycTypeName = oView.byId(sCmBxId).getSelectedItem().getBindingContext().getObject()["KycType"];
                    var oData = oView.getModel();
                    oData.read("/PainterKycDetailsSet", {
                        urlParameters: {
                            $select: "KycTypeId,GovtId"
                        },
                        filters: [new Filter("PainterId", FilterOperator.NE, sPainterId), new Filter("KycTypeId", FilterOperator.EQ, sGovtTypeId), new Filter({
                            path: "GovtId",
                            operator: FilterOperator.EQ,
                            value1: sGovtIdNo,
                            caseSensitive: false,
                        })],
                        success: function (oData) {
                            if (oData["results"].length > 0) {
                                var sMessage1 = this.geti18nText("Message3", [sGovtIdNo, sKycTypeName]);
                                oModelView.setProperty("/PainterKycDetails/GovtId", "");
                                MessageToast.show(sMessage1, {
                                    duration: 6000
                                });
                            }
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                        }.bind(this),
                        error: function () {
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                        }

                    })
                },
                onEditKycFields: function () {
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    var bKycStatus = oModelView.getProperty("/PainterKycDetails/Status");
                    oModelCtrl.setProperty("/EditKyc", true);
                    oModelCtrl.setProperty("/EditKycButton", true);
                    oModelCtrl.setProperty("/AddKycDocButton", true);
                    // if the status if rejected 
                    if (bKycStatus === "REJECTED") {
                        oModelCtrl.setProperty("/AddKycDoc", true);
                        oModelCtrl.setProperty("/AddKycDocButton", false);
                    }

                    oModelCtrl.refresh();
                    this._setUploadCollectionMethod();
                    // oModelCtrl.setProperty("/AddNewBank", false);
                },
                onEditCancelKycFields: function () {
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    var govtId = oModelCtrl.getProperty("/InitialGovtId");
                    var kycTypeId = oModelCtrl.getProperty("/InitialKycDocType");
                    oModelCtrl.setProperty("/EditKyc", false);
                    oModelCtrl.setProperty("/EditKycButton", false);
                    oModelCtrl.setProperty("/AddKycDoc", false);
                    oModelCtrl.setProperty("/AddKycDocButton", false);
                    oModelView.setProperty("/PainterKycDetails/GovtId", govtId);
                    oModelView.setProperty("/PainterKycDetails/KycTypeId", kycTypeId);
                },
                onAddKycDoc: function () {
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    oModelCtrl.setProperty("/AddKycDoc", true);
                    oModelCtrl.setProperty("/AddKycDocButton", false);
                },
                onCancelKycDoc: function () {
                    var oView = this.getView();
                    var oModelCtrl = this.getView().getModel("oModelControl");
                    var oModelView = this.getView().getModel("oModelView");
                    oModelCtrl.setProperty("/AddKycDoc", false);
                    oModelCtrl.setProperty("/AddKycDocButton", true);
                    oModelCtrl.setProperty("/EditKycButton", true);
                    oModelCtrl.setProperty("/EditFieldKyc", false);
                    var InitialDocType = oModelCtrl.getProperty("/InitialKycDocType");
                    var govtId = oModelCtrl.getProperty("/InitialGovtId");
                    if (InitialDocType) {
                        oModelView.setProperty("/PainterKycDetails/KycTypeId", InitialDocType);
                        oModelView.setProperty("/PainterKycDetails/GovtId", govtId);
                    }
                    oView.byId("idUploadCollection").removeAllItems();
                },
                _CheckTheKyc: function () {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelView");
                    var sKYCId = oModel.getProperty("/PainterKycDetails/KycTypeId");
                    var oUpload = oView.byId("idUploadCollection");
                    var iItems = oUpload.getItems().length;
                    if (sKYCId !== "") {
                        if (sKYCId == "1" || sKYCId == "3") {
                            if (iItems < 2) {
                                return false;
                            }
                        }
                        if (iItems == 0) {
                            return false;
                        }
                    }
                    return true;
                },
                _checkFileUpload: function (oData) {
                    var promise = jQuery.Deferred();
                    var UploadCollection = this.getView().byId("idUploadCollection");
                    var oItems = UploadCollection.getItems();
                    var oCtrlModel = this.getView().getModel("oModelControl");
                    var othat = this;
                    var bFlag = false;
                    if (oData.hasOwnProperty("PainterKycDetails")) {
                        var oKycData = oData["PainterKycDetails"];
                        if (oKycData !== null) {
                            if (oKycData.hasOwnProperty("Id")) {
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
                        "PainterKycDetailsSet(" +
                        oKycData["Id"] +
                        ")/$value?image_type=";
                    var sUrl2 = "";
                    var async_request = [];
                    for (var x = 0; x < oItems.length; x++) {
                        var sFile = sap.ui.getCore().byId(oItems[x].getFileUploader())
                            .oFileUpload.files[0];
                        sUrl2 = x == 0 ? "front" : "back";
                        async_request.push(
                            jQuery.ajax({
                                method: "PUT",
                                url: sUrl + sUrl2,
                                cache: false,
                                contentType: false,
                                processData: false,
                                data: sFile,
                                success: function (data) {
                                    // var editField = oCtrlModel.setProperty("/EditFieldKyc", true);
                                },
                                error: function () {},
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
                _setUploadCollectionMethodBank: function () {
                    var oUploadCollection = this.getView().byId("idUploadCollectionBank");
                    var othat = this;
                    oUploadCollection._setNumberOfAttachmentsTitle = function (
                        count
                    ) {
                        var nItems = count || 0;
                        var sText;
                        // When a file is being updated to a new version, there is one more file on the server than in the list so this corrects that mismatch.
                        if (this._oItemToUpdate) {
                            nItems--;
                        }
                        if (this.getNumberOfAttachmentsText()) {
                            sText = this.getNumberOfAttachmentsText();
                        } else {
                            sText = this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [
                                nItems,
                            ]);
                        }
                        if (!this._oNumberOfAttachmentsTitle) {
                            this._oNumberOfAttachmentsTitle = new Title(
                                this.getId() + "-numberOfAttachmentsTitle", {
                                    text: sText,
                                }
                            );
                        } else {
                            this._oNumberOfAttachmentsTitle.setText(sText);
                        }
                        othat._CheckAddBtnForUploadBank.call(othat, nItems);
                    };
                },
                _CheckAddBtnForUploadBank: function (mParam) {
                    var oUploadCol = this.getView().byId("idUploadCollectionBank");
                    if (mParam == 1) {
                        oUploadCol.setUploadButtonInvisible(true);
                    } else if (mParam < 1) {
                        oUploadCol.setUploadButtonInvisible(false);
                    }
                },
                _setUploadCollectionMethod: function () {
                    var oUploadCollection = this.getView().byId("idUploadCollection");
                    var othat = this;
                    oUploadCollection._setNumberOfAttachmentsTitle = function (
                        count
                    ) {
                        var nItems = count || 0;
                        var sText;
                        // When a file is being updated to a new version, there is one more file on the server than in the list so this corrects that mismatch.
                        if (this._oItemToUpdate) {
                            nItems--;
                        }
                        if (this.getNumberOfAttachmentsText()) {
                            sText = this.getNumberOfAttachmentsText();
                        } else {
                            sText = this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [
                                nItems,
                            ]);
                        }
                        if (!this._oNumberOfAttachmentsTitle) {
                            this._oNumberOfAttachmentsTitle = new Title(
                                this.getId() + "-numberOfAttachmentsTitle", {
                                    text: sText,
                                }
                            );
                        } else {
                            this._oNumberOfAttachmentsTitle.setText(sText);
                        }
                        othat._CheckAddBtnForUpload.call(othat, nItems);
                    };
                },
                _CheckAddBtnForUpload: function (mParam) {
                    var oModel = this.getView().getModel("oModelView");
                    var sKycTypeId = oModel.getProperty("/PainterKycDetails/KycTypeId");
                    var oUploadCol = this.getView().byId("idUploadCollection");
                    if (sKycTypeId !== "") {
                        if (sKycTypeId == "1" || sKycTypeId == "3") {
                            if (mParam >= 2) {
                                oUploadCol.setUploadButtonInvisible(true);
                            } else if (mParam < 2) {
                                oUploadCol.setUploadButtonInvisible(false);
                            }
                            // below changes manik
                        } else {
                            if (mParam >= 1) {
                                oUploadCol.setUploadButtonInvisible(true);
                            } else if (mParam < 1) {
                                oUploadCol.setUploadButtonInvisible(false);
                            }
                        }
                    }
                },
                /*Aditya changes end*/
                onPressCloseDialog: function (oEvent) {
                    oEvent.getSource().getParent().close();
                },
                onDialogClose: function (oEvent) {
                    // this._pKycDialog.destroy();
                    // delete this._pKycDialog;
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
                fmtStatusType: function (mParam) {
                    var sStatus = "";
                    if (mParam) {
                        sStatus = mParam;
                        var StatusStr = sStatus.toLowerCase().split('_');
                        for (var i = 0; i < StatusStr.length; i++) {
                            // You do not need to check if i is larger than splitStr length, as your for does that for you
                            // Assign it back to the array
                            StatusStr[i] = StatusStr[i].charAt(0).toUpperCase() + StatusStr[i].substring(1);
                        }
                        // Directly return the joined string
                        return StatusStr.join(' ');
                    }
                    return StatusStr;
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
                    //console.log(sPainterId);
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
                ///// refeeral fragment ///////
                onUpdateFinishedReferralTable: function (oEvent) {
                    var oView = this.getView();
                    // var iTotalMaxReg = this.getView().byId("Referral").getItems()[0].getBindingContext().getObject().TotalMaxRegistrations;
                    var aItems = this.getView().byId("Referral").getItems();
                    if (aItems.length > 0) {

                        var object = aItems[0].getBindingContext().getObject();
                        var smaxReg = object["TotalMaxRegistrations"];
                        var sTotalReg = object["TotalRegistrations"];

                        if (sTotalReg >= smaxReg) {
                            var sString = "You have reached the maximum rewards limit on referrals (" + smaxReg + "). You will not be able to earn points on new referral.";
                            oView.getModel("oModelControl2").setProperty("/ReferralMessage", sString);

                        } else {
                            oView.getModel("oModelControl2").setProperty("/ReferralMessage", "");

                        }

                    } else {
                        oView.getModel("oModelControl2").setProperty("/ReferralMessage", "");
                    }

                },
                onPressOpenTokenDialog: function (oEvent) {
                    var othat = this;
                    var oModelControl = this.getView().getModel("oModelControl2");
                    if (!this.oDefaultDialog) {
                        this.oDefaultDialog = new Dialog({
                            title: "{i18n>ApplyToken}",
                            afterClose: function () {
                                othat.oDefaultDialog.destroy();
                                //console.log("onCloseTrigerred");
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
                                text: "{i18n>Validate}",
                                type: "Emphasized",
                                press: othat._onValidateTokenCode.bind(othat)
                                //press: othat._onApplyLoyalyPoints.bind(othat),
                            }),
                        });
                        // to get access to the controller's model
                        this.getView().addDependent(this.oDefaultDialog);
                    }
                    this.oDefaultDialog.open();
                },
                _onValidateTokenCode: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl2");
                    var that = this;
                    var sTokenCode = oModelControl.getProperty("/ApplyLoyaltyPoints").trim();
                    if (sTokenCode == "") {
                        MessageToast.show("Kindly enter the token code to continue");
                        return;
                    }
                    var oData = oView.getModel();
                    oData.callFunction("/QRCodeDetailsAdmin", {
                        urlParameters: {
                            qrcode: sTokenCode.toString(),
                            painterid: oModelControl.getProperty("/PainterId")
                        },
                        success: function (oData) {
                            if (oData !== null) {
                                if (oData.hasOwnProperty("Status")) {
                                    // if (oData["Status"] == true) {
                                    //     oModelView.setProperty("/RewardPoints",
                                    //         oData["RewardPoints"]
                                    //     );
                                    //     oModelView.setProperty(
                                    //         "/TokenCode",
                                    //         sTokenCode
                                    //     );
                                    // }
                                    that.showQRCodedetails.call(that, oData);
                                }
                            }
                        },
                        error: function () {},
                    });
                },
                showQRCodedetails: function (data) {
                    var oModel = this.getView().getModel("oModelControl2");
                    oModel.setProperty("/QRCodeData", data);
                    var othat = this;
                    if (!this.oQRCodeDtlsDialog) {
                        Fragment.load({
                            type: "XML",
                            controller: othat,
                            name: "com.knpl.pragati.ContactPainter.view.fragments.QRCodeDetails"
                        }).then(function (oDialog) {
                            othat.oQRCodeDtlsDialog = oDialog;
                            othat.getView().addDependent(oDialog);
                            oDialog.open();
                        }.bind(othat));
                    } else {
                        this.oQRCodeDtlsDialog.open();
                    }
                },
                onTokenDlgClose: function () {
                    this.oQRCodeDtlsDialog.close();
                },
                onUpdatedName: function (oEvent) {
                    var oView = this.getView();
                    var oModelControl = oView.getModel("oModelControl2");
                    var object = oView.getElementBinding().getBoundContext().getObject();
                    oModelControl.setProperty("/PainterUpdate/Field1", object["Name"])
                    var othat = this;
                    if (!this._upDatePainterDetailsDialog) {
                        Fragment.load({
                            type: "XML",
                            controller: othat,
                            name: "com.knpl.pragati.ContactPainter.view.fragments.UpdatePainterName"
                        }).then(function (oDialog) {
                            othat._upDatePainterDetailsDialog = oDialog;
                            othat.getView().addDependent(oDialog);
                            oDialog.open();
                        }.bind(othat));
                    } else {
                        this._upDatePainterDetailsDialog.open();
                    }
                },
                onPainterDetailsDialog1Close: function () {
                    this._upDatePainterDetailsDialog.close();
                },
                onUpdateName: function () {
                    var oView = this.getView();
                    var oModel = oView.getModel();
                },
                onApplyLoyalyPoints: function () {
                    this.oQRCodeDtlsDialog.setBusy(true);
                    var oView = this.getView();
                    var othat = this;
                    var oModelControl = oView.getModel("oModelControl2");
                    // oModelControl2>/ProfilePageBuzy

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
                                        othat.oQRCodeDtlsDialog.close();
                                    } else if (oData["Status"] == false) {
                                        MessageToast.show(oData["Message"]);
                                    }
                                    othat.getView().getModel().refresh(true);
                                }
                            }
                            othat.oQRCodeDtlsDialog.setBusy(false);
                        },
                        error: function () {
                            othat.oQRCodeDtlsDialog.setBusy(false);
                        },
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
                    // console.log(oSentPayoad);
                    oData.create("/PainterReferralHistorySet", oSentPayoad, {
                        success: function () {
                            MessageToast.show("Referral Successfuly Added");
                            othat._DialogAddREferal.close();
                            othat.getView().getModel().refresh(true);
                        },
                        error: function (a) {
                            var sMessage =
                                "Unable to update a painter due to the server issues";
                            if (a.statusCode == 409) {
                                sMessage = "Painter already exist with the same mobile number.";
                            }
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
                    oCtrlModel2.setProperty("/ProfilePageBuzy", true);
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
                    setTimeout(function () {
                        oView.getModel().refresh(true);
                        oCtrlModel2.setProperty("/ProfilePageBuzy", false);
                    }, 3000);

                },
                _toggleButtonsAndView: function (bEdit) {
                    var oView = this.getView();
                    var oCtrlModel2 = oView.getModel("oModelControl2");
                    oCtrlModel2.setProperty("/modeEdit", false);
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
                    //console.log("Binding Trigerred for loyalty")
                    var oPainterId = this.getViewModel("oModelControl2").getProperty(
                        "/PainterId"
                    );
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "ProductDetails,Offer";
                    var oFinancialYear = this._getfinanceYear(),
                        aFilters = [],
                        //check if CreatedAt is Passed in filter or Not
                        bApplyCurrentFinancialYear = oBindingParams.filters.every(function (
                            ele
                        ) {
                            return ele.sPath !== "CreatedAt";
                        });
                    aFilters.push(new Filter("PainterId", FilterOperator.EQ, oPainterId));
                    var aFilter1 = new Filter({
                        path: "PointTransactionType",
                        operator: FilterOperator.EQ,
                        value1: "ACCRUED"
                    });
                    var aFilter2 = new Filter([new Filter({
                        path: "PointTransactionType",
                        operator: FilterOperator.EQ,
                        value1: "REDEEMED"
                    }), new Filter({
                        path: "PointType",
                        operator: FilterOperator.EQ,
                        value1: "SETTLEMENT"
                    })], true);
                    var aFinalFilter1 = new Filter([aFilter1, aFilter2], false)
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
                    aFilters.push(
                        aFinalFilter1
                    );
                    oBindingParams.filters.push(
                        new Filter({
                            filters: aFilters,
                            and: true,
                        })
                    );
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                /*Aditya loyalty changes*/
                onBeforeRebindRdmd: function (oEvent) {
                    //console.log("Binding Trigerred for loyalty redeemed")
                    var oPainterId = this.getViewModel("oModelControl2").getProperty(
                        "/PainterId"
                    );
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "Offer,GiftRedemption";
                    var oFinancialYear = this._getfinanceYear(),
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
                    aFilters.push(
                        new Filter({
                            path: "PointTransactionType",
                            operator: FilterOperator.EQ,
                            value1: "REDEEMED"
                        })
                    );
                    aFilters.push(
                        new Filter({
                            path: "PointType",
                            operator: FilterOperator.Contains,
                            value1: "OFFER_GIFT_REDEMPTION"
                        })
                    );
                    oBindingParams.filters.push(
                        new Filter({
                            filters: aFilters,
                            and: true,
                        })
                    );
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));

                },
                onBeforeRebindRdmdCash: function (oEvent) {
                    // console.log("Binding Trigerred for loyalty redeemed cash")
                    var oPainterId = this.getViewModel("oModelControl2").getProperty(
                        "/PainterId"
                    );
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    oBindingParams.parameters["expand"] = "Offer,GiftRedemption,PaymentTransaction,Offer";
                    var oFinancialYear = this._getfinanceYear(),
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
                    aFilters.push(
                        new Filter({
                            path: "PointTransactionType",
                            operator: FilterOperator.EQ,
                            value1: "REDEEMED"
                        })
                    );
                    aFilters.push(
                        new Filter([new Filter({
                                path: "PointType",
                                operator: FilterOperator.Contains,
                                value1: "OFFER_BANK_TRANSFER"
                            }),
                            new Filter({
                                path: "PointType",
                                operator: FilterOperator.Contains,
                                value1: "BANK_TRANSFER"
                            })
                        ], false)
                    );
                    oBindingParams.filters.push(
                        new Filter({
                            filters: aFilters,
                            and: true,
                        })
                    );
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
                },
                /*Aditya loyalty chnages end */
                // knowledge table changes
                fmtVisible: function (mParam) {
                    //console.log(mParam);
                    if (mParam === "") {
                        return true;
                    }
                    return false;
                },
                onBeforeRebindCallbackRequest: function (oEvent) {
                    var oView = this.getView();
                    var oPainterId = oView
                        .getModel("oModelControl2")
                        .getProperty("/PainterId");
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    var aFilter = [];
                    var aFilter1 = new Filter({
                        filters: [
                            new Filter("Status", FilterOperator.EQ, "REGISTERED"),
                            new Filter("Status", FilterOperator.EQ, "INPROGRESS"),
                            new Filter("Status", FilterOperator.EQ, "RESOLVED"),
                            new Filter("Status", FilterOperator.EQ, "REJECTED"),
                        ],
                        and: false,
                    })
                    var aFilter2 = new Filter("PainterId", FilterOperator.EQ, oPainterId)
                    var aFilter3 = new Filter("IsArchived", FilterOperator.EQ, false);
                    aFilter.push(aFilter1);
                    aFilter.push(aFilter2);
                    aFilter.push(aFilter3);
                    oBindingParams.filters.push(
                        new Filter({
                            filters: aFilter,
                            and: true,
                        })
                    );
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                    //console.log(sPath);
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
                    // console.log(oBject);
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
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                    //console.log(oBject);
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
                                            //console.log(mPram1, mPram2, mPram3);
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
                fmtStatus: function (mParam) {
                    var sLetter = "";
                    if (mParam) {
                        sLetter = mParam
                            .toLowerCase()
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
                    }
                    return sLetter;
                },
                onPressRemarks: function (oEvent) {
                    var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                    var sRemarks = oEvent.getSource().getCustomData("remarks")[0].getValue();
                    if (!this.oRemarksMessageDialog) {
                        this.oRemarksMessageDialog = new Dialog({
                            type: DialogType.Message,
                            title: oResourceBundle.getText("remarksDialogTitle"),
                            content: new Text("idRemarksText", {
                                text: sRemarks
                            }),
                            styleClass: ['sapUiSizeCompact'],
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: "OK",
                                press: function () {
                                    this.oRemarksMessageDialog.close();
                                }.bind(this)
                            })
                        });
                    }
                    Core.byId("idRemarksText").setText(sRemarks);
                    this.oRemarksMessageDialog.open();
                },
                //offer table and dialog box code integration
                onOfferReedeme: function (oEvent) {
                    var obj = oEvent.getSource().getBindingContext().getObject();
                    //console.log(obj);
                    var oView = this.getView();
                    // create value help dialog
                    if (!this._DialogOfferRedeem) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.ContactPainter.view.fragments.OfferRedeemDialog",
                            controller: this,
                        }).then(
                            function (oDialog) {
                                this._DialogOfferRedeem = oDialog;
                                this.getView().addDependent(this._DialogOfferRedeem);
                                this._BeforeRedeemOpen(obj);
                                //this._DialogOfferRedeem.open();
                            }.bind(this)
                        );
                    } else {
                        //this._DialogOfferRedeem.open();
                        this._BeforeRedeemOpen(obj);
                    }
                },
                _BeforeRedeemOpen: function (mParam1) {
                    var oProgress = mParam1["PainterOfferProgress"],
                        oSelectedProgress;
                    //console.log(mParam1);
                    var oModelC2 = this.getView().getModel("oModelControl2");
                    var othat = this;
                    // if Offer Type is not slab
                    if (oProgress.hasOwnProperty("__list")) {
                        if (Array.isArray(oProgress["__list"])) {
                            if (oProgress["__list"].length > 0) {
                                for (var i = oProgress["__list"].length; i--;) {
                                    oSelectedProgress = oProgress["__list"][i];
                                    var oGetProgress = this.getView().getModel().getProperty("/" + oSelectedProgress);
                                    if (oGetProgress["ProgressStatus"] === "COMPLETED") {
                                        this._DialogOfferRedeem.bindElement("/OfferRewardRatioSet(" + oGetProgress["OfferRewardRatioId"] + ")", {
                                            expand: "RewardGift"
                                        });
                                        //console.log(oGetProgress)
                                        oModelC2.setProperty("/OfferRedeemDlg/RbtnRedeemType", -1);
                                        oModelC2.setProperty("/OfferRedeemDlg/UUID", oGetProgress["UUID"]);
                                        othat._getAdditionlOfferReward(mParam1["UUID"], oModelC2);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    // if offer type is slab
                },
                _getAdditionlOfferReward: function (mPram1, oModelControl) {
                    var oData = this.getView().getModel();
                    var sPath = "/PainterOfferSet(" + "'" + mPram1 + "'" + ")";
                    oModelControl.setProperty("/ProfilePageBuzy", true);
                    oData.read(sPath, {
                        urlParameters: {
                            "$expand": "Offer"
                        },
                        success: function (m1) {
                            if (m1["AdditionalRewardPoints"]) {
                                oModelControl.setProperty("/OfferRedeemDlg/AddPoints", "+ " + m1["AdditionalRewardPoints"]);
                            } else {
                                oModelControl.setProperty("/OfferRedeemDlg/AddPoints", null);
                            }
                            if (m1["AdditionalRewardCash"]) {
                                oModelControl.setProperty("/OfferRedeemDlg/AddCash", "+ " + m1["AdditionalRewardCash"]);
                            } else {
                                oModelControl.setProperty("/OfferRedeemDlg/AddCash", null);
                            }
                            if (m1["Offer"].hasOwnProperty("IsMultiRewardAllowed")) {
                                //m1["Offer"]["IsMultiRewardAllowed"]=true
                                if (m1["Offer"]["IsMultiRewardAllowed"]) {
                                    oModelControl.setProperty("/OfferRedeemDlg/IsMultiRewardAllowed", true);
                                    oModelControl.setProperty("/OfferRedeemDlg/RbtnRedeemType", 3);
                                } else {
                                    oModelControl.setProperty("/OfferRedeemDlg/IsMultiRewardAllowed", false);
                                    oModelControl.setProperty("/OfferRedeemDlg/RbtnRedeemType", -1);
                                }
                            }
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                            this._DialogOfferRedeem.open();
                        }.bind(this),
                        error: function () {
                            oModelControl.setProperty("/ProfilePageBuzy", false);
                        },
                    });
                },
                onDialogCloseRedeme: function (oEvent) {
                    this._DialogOfferRedeem.close();
                    this._DialogOfferRedeem.destroy();
                    delete this._DialogOfferRedeem;
                },
                onConfirmRedeem: function () {
                    var oView = this.getView();
                    var oModelC2 = oView.getModel("oModelControl2");
                    var iSelctedIndex = oModelC2.getProperty("/OfferRedeemDlg/RbtnRedeemType");
                    if (iSelctedIndex < 0) {
                        MessageToast.show("Kindly Select at least one of the reward to redeem.");
                        return;
                    }
                    this.onConfirmRedeem1();
                },
                onConfirmRedeem1: function () {
                    var oView = this.getView();
                    var oModelC2 = oView.getModel("oModelControl2");
                    oModelC2.setProperty("/ProfilePageBuzy", true);
                    var iSelctedIndex = oModelC2.getProperty("/OfferRedeemDlg/RbtnRedeemType");
                    var oRedemptionType = {
                        0: "POINTS_TRANSFER",
                        1: "BANK_TRANSFER",
                        2: "GIFT_REDEMPTION",
                        3: "MULTI_REWARDS"
                    }
                    var sPainterId = oModelC2.getProperty("/PainterId");
                    var sProgressId = oModelC2.getProperty("/OfferRedeemDlg/UUID");
                    //console.log(sProgressId,  oRedemptionType[iSelctedIndex] ,sPainterId);
                    var oData = oView.getModel();
                    var othat = this;
                    oData.read("/RedeemOffer", {
                        urlParameters: {
                            ProgressId: "'" + sProgressId + "'",
                            RedemptionType: "'" + oRedemptionType[iSelctedIndex] + "'",
                            PainterId: sPainterId,
                        },
                        success: function (m1) {
                            this.onDialogCloseRedeme();
                            this.getView().getModel().refresh(true);
                            oModelC2.setProperty("/ProfilePageBuzy", false);
                            if (m1.hasOwnProperty("Message")) {
                                MessageToast.show(m1["Message"]);
                            }
                        }.bind(this),
                        error: function () {
                            oModelC2.setProperty("/ProfilePageBuzy", false);
                        },
                    });
                },
                onReqListItemPress: function (oEvent) {
                    //console.log(oEvent);
                    // var oRouter = this.getOwnerComponent().getRouter();
                    // oRouter.navTo("RouteAdditionalRequestDetail",
                    // {Id: oEvent.getSource().getBindingContext().getObject().UUID,
                    // Pid:oEvent.getSource().getBindingContext().getObject().painterId});
                    var oView = this.getView();
                    var obj = oEvent.getSource().getBindingContext().getObject();
                    // create value help dialog
                    if (!this._DialogUpdateRequest) {
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.ContactPainter.view.fragments.AdditionalRequestDetail",
                            controller: this,
                        }).then(
                            function (oValueHelpDialog) {
                                this._DialogUpdateRequest = oValueHelpDialog;
                                this.getView().addDependent(this._DialogUpdateRequest);
                                this._BeforeAllReqOpen(obj);
                                this._DialogUpdateRequest.open();
                            }.bind(this)
                        );
                    } else {
                        this._DialogUpdateRequest.open();
                    }
                },
                onDialogCloseAllReq: function (oEvent) {
                    this._DialogUpdateRequest.close();
                    this._DialogUpdateRequest.destroy();
                    delete this._DialogUpdateRequest;
                },
                _BeforeAllReqOpen: function (obj) {
                    var oModelC2 = this.getView().getModel("oModelControl2");
                    oModelC2.setProperty("/AdditionalReqDlg", obj);
                    this.getView().getModel("oModelControl2").setProperty("/AdditionalReqDlg_Remark", obj.Remark);
                    var UUID = obj.UUID;
                    this._DialogUpdateRequest.bindElement("/PainterAdditionalBenifitSet('" + UUID + "')", {
                        expand: "masterAdditionalBenifit"
                    });
                },
                onApproveReject: function (mParam1) {
                    var oModelC2 = this.getView().getModel("oModelControl2");
                    var oPayload = oModelC2.getProperty("/AdditionalReqDlg");
                    var sRemark = oModelC2.getProperty("/AdditionalReqDlg_Remark");
                    // oPayload.Remark = oModelC2.getProperty("/AdditionalReqDlg_Remark");
                    var oNewPayLoad = Object.assign({}, oPayload);
                    //oModelControl.setProperty("/bBusy", true);
                    var othat = this;
                    // if the offer status if
                    if (mParam1 === "APPROVED") {
                        oNewPayLoad.Status = "APPROVED";
                    }
                    if (mParam1 === "REJECTED") {
                        oNewPayLoad.Status = "REJECTED";
                    }
                    if (!sRemark) {
                        var remarkText = "remarkText";
                        othat.showMessageToast(remarkText);
                        return;
                    } else {
                        oNewPayLoad.Remark = sRemark;
                        MessageBox.confirm(
                            "Kindly confirm to change the status.", {
                                actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    if (sAction == "OK") {
                                        var c1;
                                        c1 = othat._UpdateRequest(oNewPayLoad);
                                        ////added by deepanjali////
                                        othat.onDialogCloseAllReq();
                                        // c1.then(function (oNewPayLoad) {
                                        //    // oModelControl.setProperty("/bBusy", false);
                                        //     othat.onPressBreadcrumbLink();
                                        // })
                                    }
                                },
                            }
                        );
                    }
                },
                ///// calling penny drop Api//////////////
                addPennyDrop: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl2");
                    var that = this;
                    var oData = oView.getModel();
                    oData.read("/RetryPennyDropValidation", {
                        urlParameters: {
                            PainterId: oModelControl.getProperty("/PainterId")
                        },
                        success: function (oData) {
                            oView.getModel().refresh(true);
                            that.handleCancelPress();
                        },
                        error: function () {},
                    });
                },
                _UpdateRequest: function (oPayload) {
                    var promise = jQuery.Deferred();
                    var othat = this;
                    var oView = this.getView();
                    var oDataModel = oView.getModel();
                    var oProp = "PainterAdditionalBenifitSet('" + oPayload.UUID + "')";
                    delete oPayload.masterAdditionalBenifit;
                    return new Promise((resolve, reject) => {
                        oDataModel.update("/" + oProp, oPayload, {
                            success: function (data) {
                                MessageToast.show("Status Successfully Updated.");
                                oView.getModel().refresh(true);
                                //othat._navToHome();
                                resolve(data);
                            },
                            error: function (data) {
                                MessageToast.show("Error In Update");
                                reject(data);
                            },
                        });
                    });
                }
            }
        );
    }
);