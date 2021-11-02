sap.ui.define(
    [
        "com/knpl/pragati/Complaints/controller/BaseController",
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
        "com/knpl/pragati/Complaints/controller/Validator",
        "sap/ui/model/type/Date",
        "sap/ui/model/Sorter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/format/DateFormat",
        "sap/ui/core/routing/History",
        "../model/formatter",
        "sap/m/Dialog",
        "sap/m/Button",
        "sap/m/VBox",
        "com/knpl/pragati/Complaints/model/customInt",
        "com/knpl/pragati/Complaints/model/cmbxDtype2",
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
        formatter,
        Dialog,
        Button,
        VBox,
        customInt,
        cmbxDtype2
    ) {
        "use strict";
        return BaseController.extend(
            "com.knpl.pragati.Complaints.controller.EditComplaint",
            {
                formatter: formatter,
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter(this);
                    /*
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
                     */
                    //Himank: Workflow interaction model
                    this.oWorkflowModel = new JSONModel();
                    this.oWorkflowModel.attachRequestCompleted(this._setWfData, this);
                    this.getView().setModel(this.oWorkflowModel, "wfmodel");
                    var oModelView = new JSONModel();
                    this.getView().setModel(oModelView, "oModelView");
                    //End
                    oRouter
                        .getRoute("RouteEditCmp")
                        .attachMatched(this._onRouteMatched, this);
                },
                onAfterRendering: function () {
                    //Init Validation framework
                    this._initMessage();
                },
                _onRouteMatched: function (oEvent) {
                    var oProp = window.decodeURIComponent(
                        oEvent.getParameter("arguments").prop
                    );
                    var oView = this.getView();
                    var sExpandParam =
                        "ComplaintType,Painter,ComplaintSubtype,PainterComplainsHistory";
                    this._initData(oProp);
                },
                _initData: function (oProp) {
                    this._oMessageManager.removeAllMessages();
                    var oData = {
                        modeEdit: false,
                        aQuantity: [{ value: "1", key: 1 }, { value: "2", key: 2 }, { value: "3", key: 3 }, { value: "4", key: 4 }, { value: "5", key: 5 }, { value: "6", key: 6 }, { value: "7", key: 7 }, { value: "8", key: 8 }, { value: "9", key: 9 }, { value: "10", key: 10 }],
                        bindProp: "PainterComplainsSet(" + oProp + ")",
                        ResolutionData: {
                            PointsThrough: 0 //
                        },
                        TokenCode: "",
                        // tokenCodeValue: "",
                        ImageLoaded: false,
                        ComplainResolved: false,
                        ProbingSteps: "",
                        ComplainCode: "",
                        ComplainId: oProp,
                        IcnTabKey: "0",
                        workFlowFlag: {
                            Button1: false,
                            Button2: true,
                        },
                        //Resolution 
                        PointsThrough: 0,
                        //data for Product fields
                        ProductCode: "",
                        CategoryCode: "",
                        QRCodeData2: {},
                        TokenCode2: "",
                        ComplainReopenDialoge: {
                            ComplainReopenReasonId: "",///added by deepanjali
                            ComplainReopenReason: ""    ///added by deepanjali
                        }
                        // ComplainReopenReasonId: null ///added by deepanjali
                    };
                    /* Fields required for Post with PainterComplainProducts array index 0
                        PainterId: 182
                        Points: 35
                        ProductQuantity: 6
                        ProductSKUCode: "D9"
                        So,maintaining     CategoryCode, ProductCode in oModelControl 
                    */
                    var oDataModel;
                    var oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "oModelControl");
                    var othat = this;
                    this._sErrorText = this.getOwnerComponent()
                        .getModel("i18n")
                        .getResourceBundle()
                        .getText("errorText");
                    var oBindProp = oData["bindProp"];
                    var c1, c2, c2A, c3, c4, c5, c6;
                    c1 = othat._loadEditProfile("Display");
                    c1.then(function () {
                        //Himank: TODO: Load Workflow data, will have to pass workflow instanceId in future
                        c2A = othat._CheckLoginData();
                        c2A.then(function () {
                            c2 = othat._setDisplayData(oBindProp);
                            c2.then(function () {
                                c3 = othat._initEditData(oBindProp);
                                c3.then(function () {
                                    c4 = othat._CheckImage(oBindProp);
                                    c4.then(function () {
                                        c5 = othat._setWorkFlowFlag();
                                        c5.then(function () {
                                            c6 = othat._getExecLogData();
                                        })
                                    })
                                });
                            });
                        })
                    });
                },
                _getExecLogData: function () {
                    var promise = jQuery.Deferred();
                    //for Test case scenerios delete as needed
                    var oView = this.getView();
                    var oData = oView.getModel("oModelView").getData();
                    var sWorkFlowInstanceId = oData["WorkflowInstanceId"];
                    // console.log(sWorkFlowInstanceId);
                    if (sWorkFlowInstanceId) {
                        var sUrl =
                            "/comknplpragatiComplaints/bpmworkflowruntime/v1/workflow-instances/" +
                            sWorkFlowInstanceId +
                            "/execution-logs";
                        this.oWorkflowModel.loadData(sUrl);
                    } else {
                        this.oWorkflowModel.setData([]);
                    }
                    promise.resolve();
                    return promise;
                },
                _setWfData: function () {
                    //TODO: format subject FORCETAT
                    var aWfData = this.oWorkflowModel.getData(),
                        taskSet = new Set([
                            "WORKFLOW_STARTED",
                            "WORKFLOW_COMPLETED",
                            "WORKFLOW_CANCELED",
                            "USERTASK_CREATED",
                            "USERTASK_COMPLETED",
                            "USERTASK_CANCELED_BY_BOUNDARY_EVENT",//TODO: Change text to TAT triggered
                        ]);
                    aWfData = aWfData.filter(ele => taskSet.has(ele.type));
                    this.oWorkflowModel.setData(aWfData);
                },
                _CheckLoginData: function () {
                    var promise = jQuery.Deferred();
                    var oData = this.getModel();
                    var oLoginModel = this.getView().getModel("LoginInfo");
                    var oLoginData = oLoginModel.getData()
                    if (Object.keys(oLoginData).length === 0) {
                        return new Promise((resolve, reject) => {
                            oData.callFunction("/GetLoggedInAdmin", {
                                method: "GET",
                                urlParameters: {
                                    $expand: "UserType",
                                },
                                success: function (data) {
                                    if (data.hasOwnProperty("results")) {
                                        if (data["results"].length > 0) {
                                            oLoginModel.setData(data["results"][0]);
                                        }
                                    }
                                    resolve();
                                },
                            });
                        })
                    } else {
                        promise.resolve();
                        return promise;
                    }
                },
                _setWorkFlowFlag: function () {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oLoginInfo = oView.getModel("LoginInfo").getData();
                    var oData = oView.getModel("oModelView").getData();
                    var oModelControl = oView.getModel("oModelControl");
                    if (oData["ComplaintTypeId"] === 1 || oData["ComplaintTypeId"] === 2 || oData["ComplaintTypeId"] === 3) {
                        this._SetEscalationFlag();
                    }
                    promise.resolve();
                    return promise;
                },
                _SetEscalationFlag: function () {
                    var oView = this.getView();
                    var oLoginInfo = oView.getModel("LoginInfo").getData();
                    var oModelControl = oView.getModel("oModelControl");
                    var oData = oView.getModel("oModelView").getData();
                    if (oData["ComplaintStatus"] !== "INREVIEW") {
                        oModelControl.setProperty("/workFlowFlag/Button1", false);
                        //oModelControl.setProperty("/workFlowFlag/Button2", false);
                        return;
                    }
                    if (oData["AssigneUserType"] === oLoginInfo["UserType"]["UserType"]) {
                        if (oLoginInfo["UserTypeId"] === 5) {
                            oModelControl.setProperty("/workFlowFlag/Button1", false);
                            //oModelControl.setProperty("/workFlowFlag/Button2", true);
                            return;
                            // only escalate to be hidden
                        } else {
                            oModelControl.setProperty("/workFlowFlag/Button1", true);
                            //oModelControl.setProperty("/workFlowFlag/Button2", true);
                            return;
                        }
                    } else {
                        oModelControl.setProperty("/workFlowFlag/Button1", false);
                        //oModelControl.setProperty("/workFlowFlag/Button2", false);
                        return;
                    }
                },
                _setDisplayData: function (oProp) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var sExpandParam =
                        "ComplaintType,Painter,Painter/Depot,ComplaintSubtype,PainterComplainsHistory";
                    var othat = this;
                    if (oProp.trim() !== "") {
                        oView.bindElement({
                            path: "/" + oProp,
                            parameters: {
                                expand: sExpandParam,
                            },
                            events: {
                                dataRequested: function (oEvent) {
                                    oView.setBusy(true);
                                },
                                dataReceived: function (oEvent) {
                                    oView.setBusy(false);
                                },
                            },
                        });
                    }
                    promise.resolve();
                    return promise;
                },
                _initEditData: function (oProp) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oDataValue = "";
                    var othat = this;
                    var exPand = "PainterComplainProducts,PainterComplainProducts/ProductPackDetails,AssigneUserTypeDetails";
                    return new Promise((resolve, reject) => {
                        oView.getModel().read("/" + oProp, {
                            urlParameters: {
                                $expand: exPand,
                            },
                            success: function (data) {
                                //Modding Product data for UI, Should have been a object from backend
                                if (data.PainterComplainProducts.results.length > 0) {
                                    data.PainterComplainProducts = data.PainterComplainProducts.results[0]
                                    oView.getModel("oModelControl").setProperty("/ProductCode", data.PainterComplainProducts.ProductPackDetails.ProductCode);
                                    oView.getModel("oModelControl").setProperty("/CategoryCode", data.PainterComplainProducts.ProductPackDetails.CategoryCode);
                                } else {
                                    data.PainterComplainProducts = {
                                        PainterId: data.PainterId,
                                        Points: "",
                                        ProductQuantity: "",
                                        ProductSKUCode: ""
                                    };
                                }
                                //Put previous escalate flag to false
                                data.InitiateForceTat = false;
                                //Caution: Cloning to save initial state of payload for withdraw and escalate scenerios
                                othat.oClonePayload = {};
                                jQuery.extend(true, othat.oClonePayload, data);
                                var oViewModel = new JSONModel(data);
                                oView.setModel(oViewModel, "oModelView");
                                othat._setInitData();
                                resolve();
                            },
                            error: function () { },
                        });
                    });
                },
                _setInitData: function () {
                    //var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    // setting the resolved flag if we have the value from backend;
                    if (
                        oModelView.getProperty("/ComplaintStatus") === "RESOLVED" ||
                        oModelView.getProperty("/ComplaintStatus") === "WITHDRAWN"
                    ) {
                        oModelControl.setProperty("/ComplainResolved", true);
                        // oModelControl.setProperty("/TokenCode", "");
                    } else {
                        //Complaint not resolved then empty remark
                        oModelView.setProperty("/Remark", "");
                    }
                    //Setting remark
                    //setting the filtering for the scenario and Type Id
                    var sComplainSubType = oModelView.getProperty("/ComplaintSubtypeId");
                    var sComplaintStatus = oModelView.getProperty("/ComplaintStatus");
                    var aResolutionFilter = [];
                    if (sComplainSubType !== "") {
                        aResolutionFilter.push(
                            new Filter("TypeId", FilterOperator.EQ, sComplainSubType)
                        );
                        oView
                            .byId("FormattedText")
                            .bindElement(
                                "/MasterComplaintSubtypeSet(" + sComplainSubType + ")"
                            );
                    }
                    oView
                        .byId("resolution")
                        .getBinding("items")
                        .filter(aResolutionFilter);
                    var sReqFields = ["TokenCode", "RewardPoints"];
                    var sValue = "",
                        sPlit;
                    for (var k of sReqFields) {
                        sValue = oModelView.getProperty("/" + k);
                        sPlit = k.split("/");
                        if (sPlit.length > 1) {
                            if (
                                toString.call(oModelView.getProperty("/" + sPlit[0])) !==
                                "[object Object]"
                            ) {
                                oModelView.setProperty("/" + sPlit[0], {});
                            }
                        }
                        if (sValue == undefined) {
                            oModelView.setProperty("/" + k, "");
                        }
                    }
                    // //setting token code scenario
                    // if (oModelView.getProperty("/TokenCode") !== "") {
                    //     oModelControl.setProperty(
                    //         "/tokenCodeValue",
                    //         oModelView.getProperty("/TokenCode")
                    //     );
                    //     oModelControl.setProperty("/TokenCode", "");
                    // }
                    //set data for the smart table
                    oModelControl.setProperty("/ComplainCode", oModelView.getProperty("/ComplaintCode"));
                    // //// added by deepanjali for painterComplianHistorySet///////////
                    // oModelControl.setProperty("/ComplainReopenReasonId", oModelView.getProperty("/ComplainReopenReasonId"));
                    var oHistoryTable = oView.byId("smartHistory")
                    if (oHistoryTable) {
                        oHistoryTable.rebindTable();
                    }
                    //set Complain level
                    oModelControl.setProperty("/iComplaintLevel", this._getRoleLevel(oModelView.getProperty("/AssigneUserType")));
                    // promise.resolve();
                    // return promise;
                },
                /*
                onChangeStatus: function () {
                    var currObject = this.getView().getBindingContext().getObject();
                    if (currObject.ComplaintStatus == "INREVIEW" || currObject.ComplaintStatus == "REGISTERED") {
                        var oModelView = this.getView().getModel("oModelView");
                        oModelView.setProperty("/TokenCode", "");
                        oModelView.setProperty("/RewardPoints", "");
                    }
                },
                */
                filterProducts: function () {
                    var oModelControl = this.getModel("oModelControl");
                    oModelControl.setProperty("/ProductCode", "");
                    this._resetAndfilter("idProduct", "CategoryCode", "ProductCategory/Id");
                },
                filterPacks: function () {
                    this._resetAndfilter("idPacks", "ProductCode", "ProductCode");
                },
                _resetAndfilter: function (sCtrlId, sPropertyKey, sFilterKey) {
                    var oModelControl = this.getModel("oModelControl"),
                        oModelView = this.getModel("oModelView");
                    //Reset data fields
                    oModelView.setProperty("/PainterComplainProducts/ProductSKUCode", "");
                    oModelView.setProperty("/PainterComplainProducts/Points", "");
                    oModelView.setProperty("/PainterComplainProducts/ProductQuantity", "");
                    oModelView.setProperty("/TokenCode", "");
                    oModelView.setProperty("/RewardPoints", "");
                    //if arguments not passed then return without filtering
                    if (!sCtrlId)
                        return;
                    var oCtrl = this.getView().byId(sCtrlId),
                        sKey = oModelControl.getProperty("/" + sPropertyKey);
                    oCtrl.getBinding("items").filter([new Filter(sFilterKey, FilterOperator.EQ, sKey)]);
                },
                onPackChange: function (oEvent) {
                    var oSelectedItem = oEvent.getSource().getSelectedItem().getBindingContext().getObject(),
                        oModelView = this.getModel("oModelView");
                    oModelView.setProperty("/PainterComplainProducts/Points", oSelectedItem.Points);
                },
                _CheckImage: function (oProp) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oModelControl = this.getView().getModel("oModelControl");
                    var sImageUrl =
                        "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
                    jQuery.get(sImageUrl)
                        .done(function () {
                            oModelControl.setProperty("/ImageLoaded", true);
                        })
                        .fail(function () {
                            oModelControl.setProperty("/ImageLoaded", false);
                        });
                    promise.resolve();
                    return promise;
                },
                _loadEditProfile: function (mParam) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oVboxProfile = oView.byId("idVbx");
                    var sFragName = mParam == "Edit" ? "EditProfile" : "DisplayComplaint";
                    oVboxProfile.destroyItems();
                    return Fragment.load({
                        id: oView.getId(),
                        controller: othat,
                        name: "com.knpl.pragati.Complaints.view.fragments." + sFragName,
                    }).then(function (oControlProfile) {
                        oView.addDependent(oControlProfile);
                        oVboxProfile.addItem(oControlProfile);
                        promise.resolve();
                        return promise;
                    });
                },
                onPressTokenCode: function (oEvent) {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var that = this;
                    var sTokenCode = oModelView.getProperty("/TokenCode").trim();
                    if (sTokenCode == "") {
                        MessageToast.show("Kindly enter the token code to continue");
                        return;
                    }
                    var oData = oView.getModel();
                    oData.callFunction("/QRCodeDetailsAdmin",
                        {
                            urlParameters: {
                                qrcode: sTokenCode.toString(),
                                painterid: oModelView.getProperty("/PainterId")
                            },
                            success: function (oData) {
                                if (oData !== null) {
                                    if (oData.hasOwnProperty("Status")) {
                                        if (oData["Status"] == true) {
                                            oModelView.setProperty("/RewardPoints",
                                                oData["RewardPoints"]
                                            );
                                            oModelView.setProperty(
                                                "/TokenCode",
                                                sTokenCode
                                            );
                                            // oModelControl.setProperty("/TokenCode", false);
                                        }
                                        that.showQRCodedetails.call(that, oData);
                                        // else if (oData["Status"] == false) {
                                        //     oModelView.setProperty("/addComplaint/RewardPoints", "");
                                        //     oModelView.setProperty("/addComplaint/TokenCode", "");
                                        //     MessageToast.show(oData["Message"]);
                                        // }
                                    }
                                }
                            },
                            error: function () { },
                        });
                },
                showQRCodedetails: function (data) {
                    var oModel = this.getView().getModel("oModelControl");
                    oModel.setProperty("/QRCodeData", data);
                    if (!this.oQRCodeDialog) {
                        Fragment.load({ type: "XML", controller: this, name: "com.knpl.pragati.Complaints.view.fragments.QRCodeDetails" }).then(function (oDialog) {
                            this.oQRCodeDialog = oDialog;
                            this.getView().addDependent(oDialog);
                            oDialog.open();
                        }.bind(this));
                    } else {
                        this.oQRCodeDialog.open();
                    }
                },
                onTokenDlgClose: function () {
                    this.oQRCodeDialog.close();
                },
                // Begin of Debasisa changes for Token Code
                onPressOpenTokenDialog: function (oEvent) {
                    var othat = this;
                    var oModelControl = this.getView().getModel("oModelControl");
                    if (!this.oDefaultDialog) {
                        this.oDefaultDialog = new Dialog({
                            title: "{i18n>btnValidateToken}",
                            afterClose: function () {
                                othat.oDefaultDialog.destroy();
                                delete othat.oDefaultDialog;
                                oModelControl.setProperty("/TokenCode2", "");
                            },
                            content: [
                                new VBox({
                                    alignItems: "Center",
                                    items: [
                                        new Input({
                                            width: "120%",
                                            placeholder: "Enter Token Code",
                                            value: "{oModelControl>/TokenCode2}",
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
                                press: othat.onValidateTokenCode.bind(othat)
                            }),
                        });
                        // to get access to the controller's model
                        this.getView().addDependent(this.oDefaultDialog);
                    }
                    this.oDefaultDialog.open();
                },
                onValidateTokenCode: function (oEvent) {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var that = this;
                    if (oModelControl.getProperty("/TokenCode2") == "") {
                        MessageToast.show("Kindly enter the token code to continue");
                        return;
                    }
                    var sTokenCode = oModelControl.getProperty("/TokenCode2").trim();
                    var oData = oView.getModel();
                    oData.callFunction("/QRCodeDetailsAdmin",
                        {
                            urlParameters: {
                                qrcode: sTokenCode.toString(),
                                painterid: oModelView.getProperty("/PainterId")
                            },
                            success: function (oData) {
                                if (oData !== null) {
                                    if (oData.hasOwnProperty("Status")) {
                                        that.showQRCodedetails2.call(that, oData);
                                    }
                                }
                            },
                            error: function () { },
                        });
                },
                showQRCodedetails2: function (data) {
                    var oModel = this.getView().getModel("oModelControl");
                    oModel.setProperty("/QRCodeData2", data);
                    if (!this.oQRCodeDialog2) {
                        Fragment.load({ type: "XML", controller: this, name: "com.knpl.pragati.Complaints.view.fragments.QRCodeDetails2" }).then(function (oDialog) {
                            this.oQRCodeDialog2 = oDialog;
                            this.getView().addDependent(oDialog);
                            oDialog.open();
                        }.bind(this));
                    } else {
                        this.oQRCodeDialog2.open();
                    }
                },
                onTokenDlgClose2: function () {
                    this.oQRCodeDialog2.close();
                },
                // End of Debasisa changes for Token code 
                onViewAttachment: function (oEvent) {
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    if (!this._pKycDialog) {
                        Fragment.load({
                            name:
                                "com.knpl.pragati.Complaints.view.fragments.AttachmentDialog",
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
                onPressCloseDialog: function (oEvent) {
                    oEvent.getSource().getParent().close();
                },
                onDialogClose: function (oEvent) {
                    this._pKycDialog.open().destroy();
                    delete this._pKycDialog;
                },
                onResetToken: function () {
                    var oModelView = this.getView().getModel("oModelView");
                    var oModelControl = this.getView().getModel("oModelControl");
                    oModelView.setProperty("/RewardPoints", "");
                    oModelView.setProperty("/TokenCode", "");
                    oModelControl.setProperty("/TokenCode", "");
                },
                onWithdraw: function () {
                    var oModelView = this.getModel("oModelView"),
                        bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;;
                    //Min Validations
                    var validation = this._minValidation(oModelView.getData());
                    if (validation.length > 0) {
                        MessageToast.show(validation);
                        return;
                    }
                    MessageBox.confirm(
                        this.getResourceBundle().getText("MSG_WITHDRAW_CONFIRMATION",
                            [oModelView.getProperty("/ComplaintCode")]),
                        {
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            styleClass: bCompact ? "sapUiSizeCompact" : "",
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    //TODO: Property wise update required 
                                    var oPayload = this.oClonePayload;
                                    oPayload.Remark = oModelView.getProperty("/Remark");
                                    oPayload.ComplaintStatus = "WITHDRAWN";
                                    oModelView.setData(oPayload);
                                    this._postDataToSave();
                                }
                            }.bind(this),
                        }
                    );
                },
                _minValidation: function (data) {
                    var sMsg = "",
                        aCtrlMessage = [];
                    if (!(data.Remark)) {
                        sMsg = this.getResourceBundle().getText("MSG_REQUIRED")
                        aCtrlMessage.push({
                            message: "MSG_CTRL_REMARK",
                            target: "/Remark"
                        });
                    }
                    if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
                    return sMsg;
                },
                _validation: function (data) {
                    this._oMessageManager.removeAllMessages();
                    var aCtrlMessage = [],
                        sMsg = "";
                    //Required Field Validations
                    if (!(data.ResolutionId)) {
                        sMsg = this.getResourceBundle().getText("MSG_REQUIRED")
                        aCtrlMessage.push({
                            message: "MSG_CTRL_RESOLUTION",
                            target: "/ResolutionId"
                        });
                    } else if (+(data.ResolutionId) == 90 && !(data.ResolutionOthers)) {
                        sMsg = this.getResourceBundle().getText("MSG_REQUIRED")
                        aCtrlMessage.push({
                            message: "MSG_CTRL_RESOLUTIONOTHERS",
                            target: "/ResolutionOthers"
                        });
                    }
                    if (!(data.Remark)) {
                        sMsg = this.getResourceBundle().getText("MSG_REQUIRED")
                        aCtrlMessage.push({
                            message: "MSG_CTRL_REMARK",
                            target: "/Remark"
                        });
                    }
                    //Bussiness Logic 
                    if (data.ResolutionType == 1) {
                        if (!(data.TokenCode)) {
                            sMsg = this.getResourceBundle().getText("MSG_REQUIRED")
                            aCtrlMessage.push({
                                message: "MSG_CTRL_TOKEN",
                                target: "/TokenCode"
                            });
                        } else {
                            if (data.RewardPoints == "") {
                                sMsg = this.getResourceBundle().getText("MSG_TOKEN_VERIFY");
                            }
                        }
                    }
                    if (data.ResolutionType == 2) {
                        if (!(data.PainterComplainProducts.ProductSKUCode)) {
                            sMsg = this.getResourceBundle().getText("MSG_REQUIRED");
                            aCtrlMessage.push({
                                message: "MSG_CTRL_PRODUCT",
                                target: "/PainterComplainProducts/ProductSKUCode"
                            });
                        }
                        if (!(data.PainterComplainProducts.ProductQuantity)) {
                            sMsg = this.getResourceBundle().getText("MSG_REQUIRED");
                            aCtrlMessage.push({
                                message: "MSG_CTRL_QUANTITY",
                                target: "/PainterComplainProducts/ProductQuantity"
                            });
                        }
                    }
                    if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
                    return sMsg;
                },
                handleSavePress: function () {
                    /*
                     var oValidator = new Validator();
                     var oVbox = this.getView().byId("idVbx");
                     var bValidation = oValidator.validate(oVbox, true);
                     if (bValidation == false) {
                         MessageToast.show(
                             "Kindly input the fields in proper format to continue. "
                         );
                     }
                     */
                    var oModelView = this.getView().getModel("oModelView"),
                        validation = this._validation(oModelView.getData());
                    //Validations
                    if (validation.length > 0) {
                        MessageToast.show(validation);
                        return;
                    }
                    //Sending for approval message
                    if (oModelView.getProperty("/ResolutionType") == 2 && this.getModel("appView").getProperty("/iUserLevel") < 2) {
                        var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                        MessageBox.confirm(
                            this.getResourceBundle().getText("MSG_APPROVAL_CONFIRMATION", [oModelView.getProperty("/ComplaintCode")]),
                            {
                                styleClass: bCompact ? "sapUiSizeCompact" : "",
                                actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (sAction) {
                                    if (sAction == "OK") {
                                        this._modStatus();
                                    }
                                }.bind(this)
                            });
                        return;
                    }
                    this._modStatus();
                },
                _modStatus: function () {
                    var oModel = this.getView().getModel("oModelView"),
                        //For Roles
                        appViewModel = this.getView().getModel("appView");
                    if (oModel.getProperty("/ResolutionType") == 2) {
                        oModel.setProperty("/ComplaintStatus",
                            appViewModel.getProperty("/iUserLevel") > 1 ? "RESOLVED" : "INREVIEW");
                        oModel.setProperty("/ApprovalStatus",
                            appViewModel.getProperty("/iUserLevel") > 1 ? "APPROVED" : "PENDING");
                    } else {
                        oModel.setProperty("/ComplaintStatus", "RESOLVED")
                    }
                    this._postDataToSave();
                },
                _postDataToSave: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var oData = oView.getModel();
                    var sPath = oView.getElementBinding().getPath();
                    var oViewData = oView.getModel("oModelView").getData();
                    // oViewData.Remark = oViewData.Remark.replace(/(\n|\r|\t)/g, ' ');
                    var oPayload = {};
                    //cloning
                    jQuery.extend(true, oPayload, oViewData);
                    //Modify payload
                    this._modPayload(oPayload);
                    var othat = this;
                    oData.update(sPath, oPayload, {
                        success: function () {
                            /*  
                            //Handled by backend
                              if (+(oPayload.RewardPoints) > 0 && (oPayload.ComplaintSubtypeId === 2 || oPayload.ComplaintSubtypeId === 3))
                                  othat._postQRCode.call(othat, oPayload);
                              */
                            MessageToast.show("Complain Successfully Updated.");
                            oData.refresh(true);
                            othat.onNavBack();
                        },
                        error: function (a) {
                            MessageBox.error(othat._sErrorText, {
                                title: "Error Code: " + a.statusCode,
                            });
                        },
                    });
                },
                _modPayload: function (data) {
                    for (var a in data) {
                        if (data[a] === "") {
                            data[a] = null;
                        }
                    }
                    data.ResolutionId = !!(data.ResolutionId) ? +data.ResolutionId : data.ResolutionId;
                    //mod Products data into array format
                    if (data.ResolutionType == 2) {
                        data.PainterComplainProducts.Points = +data.PainterComplainProducts.Points;
                        data.PainterComplainProducts.ProductQuantity = +data.PainterComplainProducts.ProductQuantity;
                    }
                    data.PainterComplainProducts = data.ResolutionType == 2 ? [data.PainterComplainProducts] : [];
                    //Parse RewardPoints
                    data.RewardPoints = !!(data.RewardPoints) ? +data.RewardPoints : null;
                },
                _postQRCode: function (oData) {
                    this.getView().getModel().callFunction("/QRCodeValidationAdmin", {
                        urlParameters: {
                            qrcode: oData.TokenCode,
                            painterid: oData.PainterId,
                            channel: "Complains"
                        }
                    });
                },
                onApproval: function (bAccept) {
                    var oModelView = this.getModel("oModelView"),
                        validation = this._minValidation(oModelView.getData());
                    if (validation.length > 0) {
                        MessageToast.show(validation);
                        return;
                    }
                    oModelView.setProperty("/ApprovalStatus", bAccept ? "APPROVED" : "REJECTED");
                    oModelView.setProperty("/ComplaintStatus", "RESOLVED");
                    this._postDataToSave();
                },
                onChangeResolution: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelView"),
                        oModelControl = this.getModel("oModelControl");
                    var sKey = oEvent.getSource().getSelectedKey();
                    if (+sKey !== 90) {
                        oModel.setProperty("/ResolutionOthers", "");
                    }
                    var oSelectedItem = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
                    oModel.setProperty("/ResolutionType", oSelectedItem.PointsThrough);
                    // Demo - MOM : 20210618: Add default remark for Product/Token scenerios
                    oModel.setProperty("/Remark", +(oSelectedItem.PointsThrough) !== 2 ? oSelectedItem.Resolution : "");
                    this._resetAndfilter();
                    oModelControl.setProperty("/ProductCode", "");
                    oModelControl.setProperty("/CategoryCode", "");
                },
                /*
                 onScenarioChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var sSuTypeId = oView
                        .getModel("oModelView")
                        .getProperty("/ComplaintSubtypeId");
                    var oResolution = oView.byId("resolution");
                    //clearning the serction for the resolution
                    var aFilter = [];
                    if (sKey) {
                        aFilter.push(new Filter("Scenario", FilterOperator.EQ, sKey));
                    }
                    if (sSuTypeId !== "") {
                        aFilter.push(new Filter("TypeId", FilterOperator.EQ, sSuTypeId));
                    }
                    oResolution.setSelectedKey("");
                    oResolution.getBinding("items").filter(aFilter);
                },
                */
                handleCancelPress: function () {
                    this.onNavBack();
                },
                onNavBack: function (oEvent) {
                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();
                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("worklist", {}, true);
                    }
                },
                onBeforeRebindHistoryTable: function (oEvent) {
                    var oView = this.getView();
                    var sComplainCode = oView
                        .getModel("oModelControl")
                        .getProperty("/ComplainCode");
                    ///// added by deepanjali for painterComplianHistorySet///
                    // var sComplainReopenReasonId = oView
                    //     .getModel("oModelControl")
                    //     .getProperty("/ComplainReopenReasonId");
                    var oBindingParams = oEvent.getParameter("bindingParams");
                    var oFilter = new Filter(
                        "ComplaintCode",
                        FilterOperator.EQ,
                        sComplainCode,
                    );
                    // added by deepanjali for painterComplianHistorySet///
                    //   var oFilter1 = new Filter(
                    //     "ComplainReopenReasonId",
                    //     FilterOperator.EQ,
                    //     sComplainReopenReasonId,
                    // );
                    // oBindingParams.filters.push(oFilter, oFilter1);
                    oBindingParams.filters.push(oFilter);
                    oBindingParams.sorter.push(new Sorter("UpdatedAt", true));
                },
                onPressEscalate: function (oEvent) {
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelView");
                    var validation = this._minValidation(oModel.getData());
                    if (validation.length > 0) {
                        MessageToast.show(validation);
                        return;
                    }
                    var oBject = oModel.getData();
                    var oData = oView.getModel();
                    var othat = this;
                    var sPath = oView.getElementBinding().getPath();
                    var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
                    MessageBox.confirm(
                        "Kindly confirm to escalate the complain - " +
                        oBject["ComplaintCode"],
                        {
                            styleClass: bCompact ? "sapUiSizeCompact" : "",
                            actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                if (sAction == "OK") {
                                    //flush Resolution related fields  
                                    //  oModel.setProperty("/ResolutionId", this.getView().getBindingContext().getProperty("ResolutionId") );
                                    // this._resetAndfilter();
                                    // oModel.setProperty("/InitiateForceTat", true);
                                    //var sPath = this.getView().getBindingContext().getPath();
                                    var oPayload = this.oClonePayload;
                                    oPayload.Remark = oModel.getProperty("/Remark");
                                    oPayload.InitiateForceTat = true;
                                    oModel.setData(oPayload);
                                    this._postDataToSave();
                                    //  this._postdataWithPayload(sPath, oPayload);
                                }
                            }.bind(this),
                        }
                    );
                },
                _postdataWithPayload: function (sPath, data) {
                    //  var sPath = this.getView().getBindingContext().getPath() + "/InitiateForceTat",
                    var othat = this;
                    this.getModel().update(sPath, data, {
                        success: function () {
                            MessageToast.show("Complain Successfully Updated.");
                            othat.getModel().refresh(true);
                            othat.onNavBack();
                        }
                    })
                },
                _Deactivate: function (oData, sPath, oBject) {
                    var oPayload = {
                        InitiateForceTat: true,
                    };
                    var othat = this;
                    oData.update(sPath + "/InitiateForceTat", oPayload, {
                        success: function (mData) {
                            MessageToast.show(
                                oBject["ComplaintCode"] + " Sucessfully Escalated."
                            );
                            oData.refresh();
                            othat.onNavBack();
                        },
                        error: function (data) {
                            var oRespText = JSON.parse(data.responseText);
                            MessageBox.error(oRespText["error"]["message"]["value"]);
                        },
                    });
                },
                fmtStatus: function (sStatus) {
                    var newStatus = "";
                    if (sStatus === "REGISTERED") {
                        newStatus = "Registered";
                    } else if (sStatus === "INREVIEW") {
                        newStatus = "In Review";
                    } else if (sStatus === "RESOLVED") {
                        newStatus = "Resolved";
                    } else if (sStatus === "WITHDRAWN") {
                        newStatus = "Withdrawn";
                    }///// added by deepanjali for History table////
                    else if (sStatus === "REOPEN") {
                        newStatus = "ReOpen";
                    }
                    return newStatus;
                },
                fmtDate: function (mDate) {
                    var date = new Date(mDate);
                    var oDateFormat = DateFormat.getDateTimeInstance({
                        pattern: "dd/MM/YYYY h:mm a",
                        UTC: true,
                        strictParsing: true,
                    });
                    oDateFormat.format(date);
                },
                fmtProbingSteps: function (mParam) {
                    if (mParam === null) {
                        return "NA";
                    }
                    return mParam;
                },
                _genCtrlMessages: function (aCtrlMsgs) {
                    var that = this,
                        oViewModel = that.getModel("oModelView");
                    aCtrlMsgs.forEach(function (ele) {
                        that._oMessageManager.addMessages(
                            new sap.ui.core.message.Message({
                                message: that.getResourceBundle().getText(ele.message),
                                type: sap.ui.core.MessageType.Error,
                                target: ele.target,
                                processor: oViewModel,
                                persistent: true
                            }));
                    });
                },
                onReopeFrag: function (oEvent) {
                    this.onOpenDialog();
                },
                ///// Reopen functinality /////////////////
                onOpenDialog: function () {
                    var oView = this.getView();
                    return new Promise(function (resolve, reject) {
                        if (!this._ReopenDialoge) {
                            Fragment.load({
                                id: oView.getId(),
                                name: "com.knpl.pragati.Complaints.view.fragments.openReopn",
                                controller: this,
                            }).then(
                                function (oDialog) {
                                    this._ReopenDialoge = oDialog;
                                    oView.addDependent(this._ReopenDialoge);
                                    this._ReopenDialoge.open();
                                    resolve();
                                }.bind(this)
                            );
                        } else {
                            this._ReopenDialoge.open();
                            resolve();
                        }
                    }.bind(this));
                },
                //// reopen complains added by deepanjali ////////////
                onReopenSave: function () {
                    // var validation = this.onReopenValiadtion(this.getModel("oModelControl").getData());
                    // //Validations
                    // if (validation.length > 0) {
                    //     MessageToast.show(validation);
                    //     return;
                    // }
                    var oModelView = this.getModel("oModelView");
                    var sResonId = this.getModel("oModelControl").getProperty("/ComplainReopenDialoge/ComplainReopenReasonId");
                    var sReson = this.getModel("oModelControl").getProperty("/ComplainReopenDialoge/ComplainReopenReason");
                    oModelView.setProperty("/ComplainReopenDialoge/ComplainReopenReasonId", parseInt(sResonId));
                    oModelView.setProperty("/Remark", sReson);
                    oModelView.setProperty("/ComplaintStatus", "REOPEN");
                    if (!sResonId) {
                        var remarkText = "reopenText";
                        this.showMessageToast(remarkText);
                        return;
                    } else {
                        this._postDataToSave();
                        this._ReopenDialoge.close();
                    }
                },
                onReopenClose: function () {
                    this._ReopenDialoge.close();
                },
                _initMessage: function () {
                    //MessageProcessor could be of two type, Model binding based and Control based
                    //we are using Model-binding based here
                    var oMessageProcessor = this.getModel("oModelView");
                    this._oMessageManager = sap.ui.getCore().getMessageManager();
                    this._oMessageManager.registerMessageProcessor(oMessageProcessor);
                }
            }
        );
    }
);