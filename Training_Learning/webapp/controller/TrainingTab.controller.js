sap.ui.define(
    [
        "com/knpl/pragati/Training_Learning/controller/BaseController",
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
        "sap/ui/model/type/Date",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/format/DateFormat",
        "sap/ui/core/routing/History",
        "../model/formatter",
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
        DateType,
        Filter,
        FilterOperator,
        DateFormat,
        History,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Training_Learning.controller.TrainingTab",
            {
                formatter: formatter,
                onInit: function () {

                    var oViewModel = new JSONModel({
                        busy: false,
                        currDate: new Date(),
                        TrainingDetails: {
                        }
                    });
                    this.setModel(oViewModel, "oModelView");

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
                        .getRoute("RouteTrainingTab")
                        .attachMatched(this._onRouteMatched, this);
                },
                _onRouteMatched: function (oEvent) {
                    var oProp = window.decodeURIComponent(
                        oEvent.getParameter("arguments").prop
                    );
                    var that = this;
                    var oViewModel = this.getModel("oModelView");

                    var oData = {
                        modeEdit: false,
                        bindProp: oProp,
                        // iCtbar: true,
                        trainingId: oProp.replace(/[^0-9]/g, ""),
                        ProfilePic: "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value",
                        Search: {
                            Attendance: "",
                            Enrollment: ""
                        }
                    };
                    var oModelControl2 = new JSONModel(oData);
                    this.getView().setModel(oModelControl2, "oModelControl2");

                    this.getModel("appView").setProperty("/EditAttendance", false);
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var sPath = "/" + oProp;
                    oViewModel.setProperty("/sPath", sPath);
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        that.getModel().read(sPath, {
                            urlParameters: {
                                "$expand": "PainterTypeDetails, Creator, City, State, Depot, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
                            },
                            success: function (data) {

                                if (trainingType === 'ONLINE') {
                                    if (data.TrainingQuestionnaire) {
                                        data.TrainingQuestionnaire.results.forEach(function (ele) {
                                            if (ele.TrainingQuestionnaireOptions && ele.TrainingQuestionnaireOptions.results.length) {
                                                ele.TrainingQuestionnaireOptions = ele.TrainingQuestionnaireOptions.results;
                                            } else {
                                                ele.TrainingQuestionnaireOptions = [];
                                            }
                                        })

                                        data.TrainingQuestionnaire = data.TrainingQuestionnaire.results;
                                    } else {
                                        data.TrainingQuestionnaire = [];
                                    }
                                }

                                oViewModel.setProperty("/TrainingDetails", data);

                                var dateValue = data.StartDate.toDateString();
                                var timeValue = data.StartDate.toLocaleTimeString();
                                var patternDate = "dd/MM/yyyy hh:mm a";
                                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                                    pattern: patternDate
                                });
                                var oDateTime = dateValue + " " + timeValue;
                                var oNow = new Date(oDateTime);
                                // data.StartDate = oDateFormat.format(oNow);
                                oViewModel.setProperty("/TrainingDetails/ViewStartDate", oDateFormat.format(oNow));

                                dateValue = data.EndDate.toDateString();
                                timeValue = data.EndDate.toLocaleTimeString();
                                oDateTime = dateValue + " " + timeValue;
                                oNow = new Date(oDateTime);
                                // data.EndDate = oDateFormat.format(oNow);
                                oViewModel.setProperty("/TrainingDetails/ViewEndDate", oDateFormat.format(oNow));
                                var trainingId = data.Id;
                                that._initFilerForTables(trainingId);

                            }
                        })
                    } else {
                        that.getModel().read(sPath, {
                            urlParameters: {
                                "$expand": "Creator, TrainingType"
                            },
                            success: function (data) {
                                oViewModel.setProperty("/TrainingDetails", data);
                            }
                        })
                    }

                    that._loadEditTrainingDetail("Display");

                    if (trainingType === 'ONLINE') {
                        var TrainingVideoDetails = this.getView().getModel("i18n").getResourceBundle().getText("OnlineTrainingDetails");
                        oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);
                        that._loadEditQuestion("Display");
                    } else if (trainingType === 'OFFLINE') {
                        var TrainingVideoDetails = this.getView().getModel("i18n").getResourceBundle().getText("OfflineTrainingDetails");
                        oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);
                    } else {
                        var TrainingVideoDetails = this.getView().getModel("i18n").getResourceBundle().getText("VideoDetails");
                        oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);
                    }
                    that._toggleButtonsAndView(false);
                    that.getView().unbindElement();

                    that.getView().setModel(oViewModel, "oModelView");
                    that.getView().getModel().resetChanges();
                },

                setInitCity: function (sStateId) {
                    this._fnbusyItems({
                        getId: function () {
                            return "dataRequested";
                        }
                    });
                    var sKey = this.getModel().createKey("/MasterStateSet", {
                        Id: sStateId
                    });
                    var that = this;
                    this.getModel().read(sKey, {
                        success: function (data) {
                            that.bindCityCtrl(data.Id);
                        }
                    })
                },

                bindCityCtrl: function (StateId) {

                    var oCtrl = this.getView().byId("cmbCity");

                    oCtrl.bindItems({
                        template: new sap.ui.core.Item({
                            key: "{Id}",
                            text: "{City}"
                        }),
                        path: "/MasterCitySet",
                        events: {
                            dataRequested: this._fnbusyItems.bind(this),
                            dataReceived: this._fnbusyItems.bind(this)
                        },
                        filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("StateId", FilterOperator.EQ, StateId)],
                        templateShareable: true
                    });

                },

                _fnbusyItems: function (oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    if (oEvent.getId() === "dataRequested") {
                        oViewModel.setProperty("/bCityItemsBusy", true);
                    } else {
                        oViewModel.setProperty("/bCityItemsBusy", false);
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

                onStateChange: function (oEvent) {
                    var oSelectedItem = oEvent.getSource().getSelectedItem();
                    var oObject = oSelectedItem.getBindingContext().getObject();
                    this.bindCityCtrl(oObject.Id);
                    this.getModel("oModelView").setProperty("/TrainingDetails/CityId", null);
                },

                onChangeCity: function (oEvent) {
                    if (oEvent.getParameter("itemPressed") === false) {
                        oEvent.getSource().setValue("");
                    }
                },

                onStateChanged: function (oEvent) {
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
                    var oPainterDetail = oModelView.getProperty("/TrainingDetails");
                    var oDivision = oView.byId("idDivision");
                    var oDivItems = oDivision.getBinding("items");
                    var oDivSelItm = oDivision.getSelectedItem();

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
                },

                onCancel: function () {
                    this.getRouter().navTo("worklist", true);
                },

                onAfterRendering: function () {
                    //Init Validation framework
                    this._initMessage();
                },

                _initMessage: function () {
                    //MessageProcessor could be of two type, Model binding based and Control based
                    //we are using Model-binding based here
                    var oMessageProcessor = this.getModel("oModelView");
                    this._oMessageManager = sap.ui.getCore().getMessageManager();
                    this._oMessageManager.registerMessageProcessor(oMessageProcessor);
                },


                onAddQuestionnaire: function (oEvent) {
                    var addQsFlag = true;
                    this.getModel("oModelView").setProperty("/addQsFlag", addQsFlag);

                    var oTrainingQuestionnaire = [];
                    this.getModel("oModelView").setProperty("/oAddTraining", {
                        Question: "",
                        TrainingQuestionnaireOptions: [],
                        IsArchived: false
                    });

                    var sPath = "/oAddTraining";
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oModelView = this.getModel("oModelView"),
                        oThat = this;

                    if (!this.byId("QuestionnaireOptionsDialog")) {
                        // load asynchronous XML fragment
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.Training_Learning.view.fragments.QuestionnaireOptionsDialog",
                            controller: this
                        }).then(function (oDialog) {
                            // connect dialog to the root view 
                            //of this component (models, lifecycle)
                            oView.addDependent(oDialog);
                            oDialog.bindElement({
                                path: sPath,
                                model: "oModelView"
                            });
                            oDialog.open();
                        });
                    } else {
                        oThat.byId("QuestionnaireOptionsDialog").open();
                    }

                },

                updateOptions: function () {
                    var addTr = this.getModel("oModelView").getProperty("/oAddTraining");
                    if (addTr.Question === "") {
                        this.showToast.call(this, "MSG_PLS_ENTER_ERR_QUESTION");
                    } else {
                        var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
                        if (addQsFlag === true) {
                            if (addTr.TrainingQuestionnaireOptions.length) {
                                for (var i = 0; i < addTr.TrainingQuestionnaireOptions.length; i++) {
                                    if (addTr.TrainingQuestionnaireOptions[i].IsCorrect === true) {
                                        this.getModel("oModelView").setProperty("/addQsFlag", false);
                                        this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire.push({
                                            Question: addTr.Question,
                                            TrainingQuestionnaireOptions: addTr.TrainingQuestionnaireOptions,
                                            IsArchived: false
                                        });
                                        this.byId("QuestionnaireOptionsDialog").close();
                                        this.getModel("oModelView").refresh();
                                    } else {
                                        this.showToast.call(this, "MSG_PLS_SELECT_ONE_CORRECT_OPTION");
                                    }
                                }
                            } else {
                                this.showToast.call(this, "MSG_PLS_ENTER_ATLEAST_ONE_OPTION");
                            }
                        }
                    }
                },

                closeOptionsDialog: function () {
                    this.byId("QuestionnaireOptionsDialog").close();
                },

                onEditQuestionnaire: function (oEvent) {
                    var sPath = oEvent.getSource().getBindingContext("oModelView").getPath(),
                        oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oModelView = this.getModel("oModelView"),
                        oThat = this;

                    if (!this.byId("QuestionnaireOptionsDialog")) {
                        // load asynchronous XML fragment
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.Training_Learning.view.fragments.QuestionnaireOptionsDialog",
                            controller: this
                        }).then(function (oDialog) {
                            // connect dialog to the root view 
                            //of this component (models, lifecycle)
                            oView.addDependent(oDialog);
                            oDialog.bindElement({
                                path: sPath,
                                model: "oModelView"
                            });
                            oDialog.open();
                        });
                    } else {
                        oThat.byId("QuestionnaireOptionsDialog").open();
                        oThat.byId("QuestionnaireOptionsDialog").bindElement({
                            path: sPath,
                            model: "oModelView"
                        });
                    }
                },

                onAddQuestionnaireOptions: function () {
                    var sPath = this.getView().byId("QuestionnaireOptionsDialog").getElementBinding("oModelView").getPath();
                    var oObject = this.getModel("oModelView").getProperty(sPath + "/TrainingQuestionnaireOptions");
                    oObject.push({
                        Option: "",
                        IsCorrect: false,
                        IsArchived: false
                    });
                    this.getModel("oModelView").refresh();
                },

                onDeleteQuestionnaire: function (oEvent) {
                    var iIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
                    function onYes() {
                        if (!this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iIndex].Id) {
                            this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire.splice(iIndex, 1);
                        } else {
                            this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iIndex].IsArchived = true;
                        }
                        this.getModel("oModelView").refresh();
                    }
                    this.showWarning("MSG_CONFIRM_QUESTION_DELETE", onYes);
                },

                _onLoadSuccess: function (oData) {
                    this._showSuccessMsg();
                },

                _onLoadError: function (error) {
                    var oViewModel = this.getView().getModel("oModelView");
                    oViewModel.setProperty("/busy", false);
                    var oRespText = JSON.parse(error.responseText);
                    MessageBox.error(oRespText["error"]["message"]["value"]);
                },

                _showSuccessMsg: function () {
                    var oViewModel = this.getView().getModel("oModelView");
                    oViewModel.setProperty("/busy", false);
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        var sMessage = this.getView().getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_TRAINING_UPATE");
                    } else {
                        var sMessage = this.getView().getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_UPDATE");
                    }
                    MessageToast.show(sMessage);

                    this.handleCancelPress();
                },
                /* 
                 * @function
                 * Save edit or create FAQ details 
                 */
                handleSavePress: function (oEvent) {
                    this._oMessageManager.removeAllMessages();
                    var oViewModel = this.getModel("oModelView");
                    var oPayload = oViewModel.getProperty("/TrainingDetails");
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        var oValid = this._fnValidationTraining(oPayload);
                    } else {
                        var oValid = this._fnValidationVideo(oPayload);
                    }

                    if (oValid.IsNotValid) {
                        this.showError(this._fnMsgConcatinator(oValid.sMsg));
                        return;
                    }
                    oViewModel.setProperty("/busy", true);
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        this.CUOperationTraining(oPayload, oEvent);
                    } else {
                        this.CUOperationVideo(oPayload, oEvent);
                    }
                },

                _fnValidationTraining: function (data) {
                    var oReturn = {
                        IsNotValid: false,
                        sMsg: []
                    },
                        url = data.Url,
                        aCtrlMessage = [];
                    var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                    if (data.Title === "") {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTL");
                        aCtrlMessage.push({
                            message: "MSG_PLS_ENTER_ERR_TTL",
                            target: "/TrainingDetails/Title"
                        });
                    } else
                        if (data.StartDate === null) {
                            oReturn.IsNotValid = true;
                            oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TSDATE");
                            aCtrlMessage.push({
                                message: "MSG_PLS_ENTER_ERR_TSDATE",
                                target: "/TrainingDetails/StartDate"
                            });
                        } else
                            if (data.EndDate === null) {
                                oReturn.IsNotValid = true;
                                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TEDATE");
                                aCtrlMessage.push({
                                    message: "MSG_PLS_ENTER_ERR_TEDATE",
                                    target: "/TrainingDetails/EndDate"
                                });
                            } else
                                if (data.EndDate <= data.StartDate) {
                                    oReturn.IsNotValid = true;
                                    oReturn.sMsg.push("MSG_ENDDATE_SHOULD_MORE_THAN_STARTDATE");
                                    aCtrlMessage.push({
                                        message: "MSG_ENDDATE_SHOULD_MORE_THAN_STARTDATE",
                                        target: "/TrainingDetails/EndDate"
                                    });
                                } else
                                    if (data.RewardPoints === "" || data.RewardPoints === null) {
                                        oReturn.IsNotValid = true;
                                        oReturn.sMsg.push("MSG_PLS_ENTER_ERR_REWARD");
                                        aCtrlMessage.push({
                                            message: "MSG_PLS_ENTER_ERR_REWARD",
                                            target: "/TrainingDetails/RewardPoints"
                                        });
                                    } else
                                        if (data.RewardPoints == 0) {
                                            oReturn.IsNotValid = true;
                                            oReturn.sMsg.push("MSG_ENTER_REWARD_MORETHAN_ZERO");
                                            aCtrlMessage.push({
                                                message: "MSG_ENTER_REWARD_MORETHAN_ZERO",
                                                target: "/TrainingDetails/RewardPoints"
                                            });
                                        } else
                                            if (data.Url !== "" && !url.match(regex)) {
                                                oReturn.IsNotValid = true;
                                                oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
                                                aCtrlMessage.push({
                                                    message: "MSG_VALDTN_ERR_URL",
                                                    target: "/TrainingDetails/Url"
                                                });
                                            }

                    if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
                    return oReturn;
                },

                _fnValidationVideo: function (data) {
                    var oReturn = {
                        IsNotValid: false,
                        sMsg: []
                    },
                        url = data.Url,
                        aCtrlMessage = [];
                    var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                    if (data.Title === "") {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTL");
                        aCtrlMessage.push({
                            message: "MSG_PLS_ENTER_ERR_TTL",
                            target: "/TrainingDetails/Title"
                        });
                    } else
                        if (data.RewardPoints === "" || data.RewardPoints === null) {
                            oReturn.IsNotValid = true;
                            oReturn.sMsg.push("MSG_PLS_ENTER_ERR_REWARD");
                            aCtrlMessage.push({
                                message: "MSG_PLS_ENTER_ERR_REWARD",
                                target: "/TrainingDetails/RewardPoints"
                            });
                        } else
                            if (data.RewardPoints == 0) {
                                oReturn.IsNotValid = true;
                                oReturn.sMsg.push("MSG_ENTER_REWARD_MORETHAN_ZERO");
                                aCtrlMessage.push({
                                    message: "MSG_ENTER_REWARD_MORETHAN_ZERO",
                                    target: "/TrainingDetails/RewardPoints"
                                });
                            } else
                                if (data.Url !== "" && !url.match(regex)) {
                                    oReturn.IsNotValid = true;
                                    oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
                                    aCtrlMessage.push({
                                        message: "MSG_VALDTN_ERR_URL",
                                        target: "/TrainingDetails/Url"
                                    });
                                } else
                                    if (data.Duration === null || data.Duration === "" ) {
                                        oReturn.IsNotValid = true;
                                        oReturn.sMsg.push("MSG_VALDTN_ERR_DURATION");
                                        aCtrlMessage.push({
                                            message: "MSG_VALDTN_ERR_DURATION",
                                            target: "/TrainingDetails/Duration"
                                        });
                                    } else
                                        if (data.Duration == 0) {
                                            oReturn.IsNotValid = true;
                                            oReturn.sMsg.push("MSG_ENTER_DURATION_MORETHAN_ZERO");
                                            aCtrlMessage.push({
                                                message: "MSG_ENTER_DURATION_MORETHAN_ZERO",
                                                target: "/TrainingDetails/Duration"
                                            });
                                        }

                    if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
                    return oReturn;
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

                _fnMsgConcatinator: function (aMsgs) {
                    var that = this;
                    return aMsgs.map(function (x) {
                        return that.getResourceBundle().getText(x);
                    }).join("");
                },

                CUOperationTraining: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                    oPayload.CityId = parseInt(oPayload.CityId);
                    oPayload.StateId = parseInt(oPayload.StateId);
                    if (oPayload.PainterArcheId) {
                        oPayload.PainterArcheId = parseInt(oPayload.PainterArcheId);
                    }
                    if (oPayload.PainterType) {
                        oPayload.PainterType = parseInt(oPayload.PainterType);
                    }

                    delete oPayload.City;
                    delete oPayload.State;
                    delete oPayload.Depot;
                    delete oPayload.Duration;

                    var dateValue = oPayload.StartDate.toDateString();
                    var timeValue = oPayload.StartDate.toLocaleTimeString();
                    var patternDate = "dd/MM/yyyy hh:mm a";
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: patternDate
                    });
                    var oDateTime = dateValue + " " + timeValue;
                    var oNow = new Date(oDateTime);
                    // data.StartDate = oDateFormat.format(oNow);
                    oViewModel.setProperty("/TrainingDetails/ViewStartDate", oDateFormat.format(oNow));

                    dateValue = oPayload.EndDate.toDateString();
                    timeValue = oPayload.EndDate.toLocaleTimeString();
                    oDateTime = dateValue + " " + timeValue;
                    oNow = new Date(oDateTime);
                    // data.EndDate = oDateFormat.format(oNow);
                    oViewModel.setProperty("/TrainingDetails/ViewEndDate", oDateFormat.format(oNow));

                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this;

                    delete oClonePayload.ViewStartDate;
                    delete oClonePayload.ViewEndDate;
                    delete oClonePayload.__metadata;
                    console.log(oClonePayload);
                    debugger;
                    var sKey = that.getModel().createKey("/TrainingSet", {
                        Id: oClonePayload.Id
                    });
                    that.getModel().update(sKey, oClonePayload, {
                        // success: that._onLoadSuccess.bind(that),
                        // error: that._onLoadError.bind(that)
                        success: that._UploadImage(sKey, oViewModel.getProperty("/oImage"), oEvent).then(that._Success.bind(that, oEvent), that._Error.bind(
                            that)),
                        error: that._Error.bind(that)
                    });
                },

                CUOperationVideo: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);

                    delete oPayload.PainterArcheId;
                    delete oPayload.PainterType;
                    delete oPayload.CityId;
                    delete oPayload.StateId;
                    delete oPayload.ZoneId;
                    delete oPayload.Division;
                    delete oPayload.Depot;
                    delete oPayload.LearningQuestionnaire;
                    delete oPayload.StartDate;
                    delete oPayload.EndDate;

                    oPayload.Duration = parseInt(oPayload.Duration);
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this;

                    var sKey = that.getModel().createKey("/LearningSet", {
                        Id: oClonePayload.Id
                    });
                    that.getModel().update(sKey, oClonePayload, {
                        // success: that._onLoadSuccess.bind(that),
                        // error: that._onLoadError.bind(that)
                        success: that._UploadImage(sKey, oViewModel.getProperty("/oImage")).then(that._Success.bind(that, oEvent), that._Error.bind(
                            that)),
                        error: that._Error.bind(that)
                    });
                },

                _Error: function (error) {
                    debugger;
                    MessageToast.show(error.toString());
                },

                _Success: function () {
                    this.handleCancelPress();
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_TRAINING_UPATE"));
                    } else {
                        MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_UPDATE"));
                    }
                    var oModel = this.getModel();
                    oModel.refresh(true);
                },

                onUpload: function (oEvent) {
                    var oFile = oEvent.getSource().FUEl.files[0];
                    this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
                },

                getImageBinary: function (oFile) {
                    var oFileReader = new FileReader();
                    var sFileName = oFile.name;
                    return new Promise(function (res, rej) {

                        if (!(oFile instanceof File)) {
                            res(oFile);
                            return;
                        }

                        oFileReader.onload = function () {
                            res({
                                Image: oFileReader.result,
                                name: sFileName
                            });
                        };
                        res({
                            Image: oFile,
                            name: sFileName
                        });
                    });
                },

                _fnAddFile: function (oItem) {
                    this.getModel("oModelView").setProperty("/oImage", {
                        Image: oItem.Image, //.slice(iIndex),
                        FileName: oItem.name,
                        IsArchived: false
                    });

                    this.getModel("oModelView").refresh();
                },

                _UploadImage: function (sPath, oImage) {
                    var that = this;

                    return new Promise(function (res, rej) {
                        if (!oImage) {
                            res();
                            return;
                        }

                        var settings = {
                            url: "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value",
                            //	data : fd,
                            data: oImage.Image,
                            method: "PUT",
                            headers: that.getModel().getHeaders(),
                            contentType: "multipart/form-data",
                            processData: false,
                            success: function () {
                                debugger;
                                res.apply(that);
                            },
                            error: function () {
                                debugger;
                                rej.apply(that);
                            }
                        };

                        $.ajax(settings);
                    });
                },

                onUploadAttendance: function (e) {
                    var t = this;
                    var fU = this.getView().byId("idAttendanceFileUploader");
                    var domRef = fU.getFocusDomRef();
                    var file = domRef.files[0];
                    var dublicateValue = [];
                    var sPath = this.getModel("oModelView").getProperty("/sPath");
                    // try {
                    if (file) {
                        var that = this;
                        // that._oBusyDialog.open();

                        /*******************To Upload File************************/
                        var oView = that.getView();
                        var oURL = "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value";
                        $.ajax({
                            type: 'PUT',
                            url: oURL,
                            cache: false,
                            contentType: "text/csv",
                            processData: false,
                            data: file,
                            success: function (data) {
                                /******* Error  *********/
                                oView.getModel().refresh(true);
                                MessageToast.show(that.getResourceBundle().getText("MSG_SUCCESS_ATTENDANCE_UPATE"));
                                // that._oBusyDialog.close();
                            },
                            error: function (error) {
                                MessageToast.show(error.toString());
                                // that._oBusyDialog.close();
                            }
                        });
                    }
                },

                _initFilerForTables: function (trainingId) {
                    var oView = this.getView();
                    var aFilters = new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                            new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                        ],
                        and: true
                    });
                    oView.byId("idTblEnrollment").getBinding("items").filter(aFilters);
                    oView.byId("idTblAttendance").getBinding("items").filter(aFilters);
                },

                _toggleButtonsAndView: function (bEdit) {
                    var oView = this.getView();
                    // Show the appropriate action buttons
                    oView.byId("edit").setVisible(!bEdit);
                    oView.byId("save").setVisible(bEdit);
                    oView.byId("cancel").setVisible(bEdit);
                },

                handleCancelPress: function () {
                    var oView = this.getView();
                    this.getModel("appView").setProperty("/EditAttendance", false);
                    var oCtrlModel2 = oView.getModel("oModelControl2");
                    oCtrlModel2.setProperty("/modeEdit", false);
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var othat = this;
                    var c1, c2, c3;
                    var oControlModel2 = oView.getModel("oModelControl2");
                    var oViewModel = this.getModel("oModelView");
                    var sPath = oControlModel2.getProperty("/bindProp");
                    if (trainingType === 'ONLINE') {
                        c1 = othat._loadEditTrainingDetail("Display");
                        c1.then(function () {
                            c2 = othat._loadEditQuestion("Display");
                            c2.then(function () {
                                othat.getModel().read("/" + sPath, {
                                    urlParameters: {
                                        "$expand": "PainterTypeDetails, Creator, Depot, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
                                    },
                                    success: function (oDataValue) {
                                        oViewModel.setProperty("/TrainingDetails/Depot", oDataValue.Depot);
                                        oViewModel.setProperty("/TrainingDetails/PainterTypeDetails", oDataValue.PainterTypeDetails);
                                        oViewModel.setProperty("/TrainingDetails/PainterArcheType", oDataValue.PainterArcheType);
                                        othat.getView().getModel("oModelView").refresh(true);
                                        othat._setCopyForFragment();
                                        othat._toggleButtonsAndView(false);
                                    }
                                })
                            });
                        });
                    } else if (trainingType === 'OFFLINE') {
                        c1 = othat._loadEditTrainingDetail("Display");
                        c1.then(function () {
                            othat.getModel().read("/" + sPath, {
                                urlParameters: {
                                    "$expand": "PainterTypeDetails, Creator, City, State, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
                                },
                                success: function (oDataValue) {
                                    oViewModel.setProperty("/TrainingDetails/City", oDataValue.City);
                                    oViewModel.setProperty("/TrainingDetails/State", oDataValue.State);
                                    othat.getView().getModel("oModelView").refresh(true);
                                    othat._setCopyForFragment();
                                    othat._toggleButtonsAndView(false);
                                }
                            })
                        });
                    } else {
                        c1 = othat._loadEditTrainingDetail("Display");
                        c1.then(function () {
                            othat.getView().getModel("oModelView").refresh(true);
                            othat._setCopyForFragment();
                            othat._toggleButtonsAndView(false);
                        });
                    }
                },

                handleEditPress: function () {
                    this.getModel("appView").setProperty("/EditAttendance", true);
                    var oViewModel = this.getModel("oModelView");
                    this._toggleButtonsAndView(true);
                    var oView = this.getView();
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var TrainingDetails = this.getModel("oModelView").getProperty("/TrainingDetails");
                    var oModelControl2 = oView.getModel("oModelControl2");
                    oModelControl2.setProperty("/modeEdit", true);
                    oModelControl2.setProperty("/iCtbar", false);
                    var othat = this;
                    var c1, c2, c3;
                    if (trainingType === 'ONLINE') {
                        c1 = othat._loadEditTrainingDetail("Edit");
                        c1.then(function () {
                            c2 = othat._loadEditQuestion("Edit");
                            c2.then(function () {
                                c3 = othat._initEditData();
                                c3.then(function () {
                                    othat.getView().getModel("oModelView").refresh(true);
                                    othat._setCopyForFragment();
                                });
                            });
                        });
                    } else if (trainingType === 'OFFLINE') {
                        c1 = othat._loadEditTrainingDetail("Edit");
                        c1.then(function () {
                            c2 = othat._initEditData();
                            c2.then(function () {
                                othat.getView().getModel("oModelView").refresh(true);
                                othat._setCopyForFragment();
                            });
                        });
                    } else {
                        c1 = othat._loadEditTrainingDetail("Edit");
                        c1.then(function () {
                            c2 = othat._initEditData();
                            c2.then(function () {
                                othat.getView().getModel("oModelView").refresh(true);
                                othat._setCopyForFragment();
                            });
                        });
                    }
                },

                _setCopyForFragment: function () { },

                _initEditData: function () {
                    var fU = this.getView().byId("idAttendanceFileUploader");
                    fU.setValue("");
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var TrainingDetails = this.getModel("oModelView").getProperty("/TrainingDetails");
                    if (trainingType === 'ONLINE') {
                        //setting up the filtering data for the Depot, Division
                        if (TrainingDetails.ZoneId) {
                            oView.byId("idDivision").getBinding("items").filter(new Filter("Zone", FilterOperator.EQ, TrainingDetails.ZoneId))
                        }
                        if (TrainingDetails.DivisionId) {
                            oView.byId("idDepot").getBinding("items").filter(new Filter("Division", FilterOperator.EQ, TrainingDetails.DivisionId))
                        }
                    }
                    if (trainingType === 'OFFLINE') {
                        if (TrainingDetails.StateId) {
                            oView.byId("cmbCity").getBinding("items").filter(new Filter("StateId", FilterOperator.EQ, TrainingDetails.StateId))
                        }
                    }
                    promise.resolve();
                    return promise;

                },

                _initDisplayData: function () {
                    var that = this;
                    var promise = jQuery.Deferred();
                    var oView = this.getView();

                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    // var TrainingDetails = this.getModel("oModelView").getProperty("/TrainingDetails");
                    var oControlModel2 = oView.getModel("oModelControl2");
                    var oViewModel = this.getModel("oModelView");
                    var sPath = oControlModel2.getProperty("/bindProp");

                    if (trainingType === 'ONLINE') {
                        that.getModel().read("/" + sPath, {
                            urlParameters: {
                                "$expand": "PainterTypeDetails, Creator, Depot, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
                            },
                            success: function (oDataValue) {
                                oViewModel.setProperty("/TrainingDetails/Depot/Depot", oDataValue.Depot.Depot);

                                promise.resolve();
                                return promise;
                            }
                        })
                    }
                    else if (trainingType === 'OFFLINE') {

                        that.getModel().read("/" + sPath, {
                            urlParameters: {
                                "$expand": "PainterTypeDetails, Creator, City, State, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
                            },
                            success: function (oDataValue) {
                                oViewModel.setProperty("/TrainingDetails/City/City", oDataValue.City.City);
                                oViewModel.setProperty("/TrainingDetails/State/State", oDataValue.State.State);

                                promise.resolve();
                                return promise;
                            }
                        })

                    } else {
                        promise.resolve();
                        return promise;
                    }

                },

                _loadEditTrainingDetail: function (mParam) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oVboxProfile = oView.byId("idVbTrDetails");
                    var sFragName = mParam == "Edit" ? "EditTraining" : "ViewTraining";
                    oVboxProfile.destroyItems();
                    return Fragment.load({
                        id: oView.getId(),
                        controller: othat,
                        name: "com.knpl.pragati.Training_Learning.view.fragments." + sFragName,
                    }).then(function (oControlProfile) {
                        oView.addDependent(oControlProfile);
                        oVboxProfile.addItem(oControlProfile);
                        promise.resolve();
                        return promise;
                    });
                },

                _loadEditQuestion: function (mParam) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oVboxProfile = oView.byId("idVbQuestionnaire");
                    var sFragName = mParam == "Edit" ? "EditQuestionnaire" : "Questionnaire";
                    oVboxProfile.destroyItems();
                    return Fragment.load({
                        id: oView.getId(),
                        controller: othat,
                        name: "com.knpl.pragati.Training_Learning.view.fragments." + sFragName,
                    }).then(function (oControlProfile) {
                        oView.addDependent(oControlProfile);
                        oVboxProfile.addItem(oControlProfile);
                        promise.resolve();
                        return promise;
                    });
                }

            }
        );
    }
);
