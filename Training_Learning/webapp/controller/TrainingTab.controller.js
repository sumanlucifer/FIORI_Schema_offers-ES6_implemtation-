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

                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var sPath = "/" + oProp;
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        that.getModel().read(sPath, {
                            urlParameters: {
                                "$expand": "PainterTypeDetails, Creator, City, State, Depot, Division, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
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
                                if (trainingType === 'OFFLINE') {
                                    if (data.StateId) {
                                        that.setInitCity(data.StateId);
                                    }
                                }

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

                    // that._showFormFragment("ViewTraining");
                    this._loadEditTrainingDetail("Display");

                    if (trainingType === 'ONLINE') {
                        var TrainingVideoDetails = this.getView().getModel("i18n").getResourceBundle().getText("OnlineTrainingDetails");
                        oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);
                        // that._showFormFragment("Questionnaire");
                        this._loadEditQuestion("Display");
                    } else if (trainingType === 'OFFLINE') {
                        var TrainingVideoDetails = this.getView().getModel("i18n").getResourceBundle().getText("OfflineTrainingDetails");
                        oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);
                    } else {
                        var TrainingVideoDetails = this.getView().getModel("i18n").getResourceBundle().getText("VideoDetails");
                        oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);
                    }
                    this._toggleButtonsAndView(false);
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
                    // this.getModel("oModelView").setProperty("/TrainingDetails/CityId", null);
                },

                onChangeCity: function (oEvent) {
                    if (oEvent.getParameter("itemPressed") === false) {
                        oEvent.getSource().setValue("");
                    }
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

                    console.log(oModelView);
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
                    var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
                    if (addQsFlag === true) {
                        this.getModel("oModelView").setProperty("/addQsFlag", false);
                        var addTr = this.getModel("oModelView").getProperty("/oAddTraining");

                        this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire.push({
                            Question: addTr.Question,
                            TrainingQuestionnaireOptions: addTr.TrainingQuestionnaireOptions,
                            IsArchived: false
                        });
                    }

                    this.byId("QuestionnaireOptionsDialog").close();
                    this.getModel("oModelView").refresh();
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
                    var iIndex = +(oEvent.getParameter("listItem").getBindingContextPath().match(/\d+/g));
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
                    delete oPayload.ViewStartDate;
                    delete oPayload.ViewEndDate;
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
                    // }
                    oPayload.PainterArcheId = parseInt(oPayload.PainterArcheId);
                    oPayload.PainterType = parseInt(oPayload.PainterType);

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

                    var sKey = that.getModel().createKey("/TrainingSet", {
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

                CUOperationVideo: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);

                    delete oPayload.RewardPoints;
                    delete oPayload.PainterArcheId;
                    delete oPayload.PainterType;
                    delete oPayload.CityId;
                    delete oPayload.StateId;
                    delete oPayload.Division;
                    delete oPayload.Depot;
                    delete oPayload.LearningQuestionnaire;
                    delete oPayload.StartDate;
                    delete oPayload.EndDate;

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
                    MessageToast.show(error.toString());
                },

                _Success: function () {
                    this.getRouter().navTo("worklist", true);
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
                                res.apply(that);
                            },
                            error: function () {
                                rej.apply(that);
                            }
                        };

                        $.ajax(settings);
                    });
                },

                onUploadAttendance: function (oEvent) {
                    debugger;
                    var oFile = oEvent.getSource().FUEl.files[0];
                    this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
                    // }
                    // var file = jQuery.sap.domById("idFileUpload").files[0];
                    // try {
                    // if () {
                    //         this._bUploading = true;
                    //         var that = this;
                    //         /****************To Fetch CSRF Token*******************/
                    //         //var a = "/Yourservice URL or Metadata URL ";
                    //         var a = "/sap/opu/odata/sap/YNGWBPS_SRV";
                    //         var f = {
                    //             headers: {
                    //                 "X-Requested-With": "XMLHttpRequest",
                    //                 "Content-Type": "application/atom+xml",
                    //                 DataServiceVersion: "2.0",
                    //                 "X-CSRF-Token": "Fetch",
                    //             },
                    //             requestUri: a,
                    //             method: "GET"
                    //         };

                    //         var oHeaders;
                    //         var sUrl = a + "/FileSet";
                    //         var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
                    //         sap.ui.getCore().setModel(oModel);
                    //         OData.request(f, function (data, oSuccess) {
                    //             var oToken = oSuccess.headers['x-csrf-token'];
                    //             oHeaders = {
                    //                 "x-csrf-token": oToken,
                    //                 "slug": "QF",
                    //             };
                    //             // /****************To Fetch CSRF Token*******************/
                    //             // /*******************To Upload File************************/
                    //             //var filetype = "text/csv";           
                    //             var filetype = file.type;
                    //             var oURL = a + "/FileSet";
                    //             jQuery.ajax({
                    //                 type: 'POST',
                    //                 url: oURL,
                    //                 headers: oHeaders,
                    //                 cache: false,
                    //                 contentType: filetype,
                    //                 processData: false,
                    //                 data: file,
                    //                 success: function (data) {
                    //                     var rec = data.getElementsByTagName("entry")[0].children[5].getAttribute("src");
                    //                     sap.m.MessageToast.show("File Uploaded Successfully" + rec);
                    //                 },
                    //                 error: function (data) {
                    //                     sap.m.MessageToast.show("File Uploaded Successfully  111");
                    //                 }
                    //             });
                    //         });
                    // }
                    // } catch (oException) {
                    //     jQuery.sap.log.error("File upload failed:\n" + oException.message);
                    // }
                },

                _initFilerForTables: function (trainingId) {
                    var oView = this.getView();
                    // var oFilter = new Filter(
                    //     "TrainingId",
                    //     FilterOperator.EQ,
                    //     trainingId
                    // );
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

                _showFormFragment: function (sFragmentName) {
                    var objSection = this.getView().byId("idVbTrDetails");
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
                    // if (!this._formFragments) {
                    this._formFragments = Fragment.load({
                        id: oView.getId(),
                        name:
                            "com.knpl.pragati.Training_Learning.view.fragments." + sFragmentName,
                        controller: othat,
                    }).then(function (oFragament) {
                        return oFragament;
                    });
                    // }

                    return this._formFragments;
                },

                _toggleButtonsAndView: function (bEdit) {
                    var oView = this.getView();
                    // Show the appropriate action buttons
                    oView.byId("edit").setVisible(!bEdit);
                    oView.byId("save").setVisible(bEdit);
                    oView.byId("cancel").setVisible(bEdit);
                },

                handleCancelPress: function () {
                    this._toggleButtonsAndView(false);
                    var oView = this.getView();
                    var oCtrlModel2 = oView.getModel("oModelControl2");
                    oCtrlModel2.setProperty("/modeEdit", false);
                    this._loadEditTrainingDetail("Display");
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    if (trainingType === 'ONLINE') {
                        this._loadEditQuestion("Display");
                    }
                    oView.getModel().refresh(true);
                },

                handleEditPress: function () {
                    var oViewModel = this.getModel("oModelView");
                    this._toggleButtonsAndView(true);
                    var oView = this.getView();
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var StateId = this.getModel("oModelView").getProperty("/TrainingDetails/StateId");
                    var oModelControl2 = oView.getModel("oModelControl2");
                    oModelControl2.setProperty("/modeEdit", true);
                    oModelControl2.setProperty("/iCtbar", false);
                    var othat = this;
                    if (trainingType === 'ONLINE') {
                        othat._loadEditTrainingDetail("Edit");
                        othat._loadEditQuestion("Edit");
                        othat.getView().getModel("oModelView").refresh(true);
                    } else {
                        othat._loadEditTrainingDetail("Edit");
                        if (trainingType === 'OFFLINE') {
                            if (StateId) {
                                othat.setInitCity(StateId);
                            }
                        }
                        othat.getView().getModel("oModelView").refresh(true);
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
