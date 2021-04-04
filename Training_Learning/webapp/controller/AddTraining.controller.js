sap.ui.define(
    [
        "com/knpl/pragati/Training_Learning/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment",
        "sap/ui/layout/form/FormElement",
        "sap/m/Input",
        "sap/m/Label",
        "sap/ui/core/library",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/ValueState",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "../model/formatter",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        BaseController,
        JSONModel,
        Fragment,
        FormElement,
        Input,
        Label,
        library,
        Filter,
        FilterOperator,
        ValueState,
        MessageToast,
        MessageBox,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Training_Learning.controller.AddTraining",
            {
                formatter: formatter,
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var oViewModel = new JSONModel({
                        busy: false,
                        mTrainingKey: "",
                        edit: false,
                        mode: "",
                        sIctbTitle: "",
                        currDate: new Date(),
                        TrainingDetails: {
                        }
                    });
                    this.setModel(oViewModel, "oModelView");

                    oViewModel.setProperty("/onlineTrType", "1");
                    oViewModel.setProperty("/offlineTrType", "2");

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
                        .getRoute("RouteAddT")
                        .attachMatched(this._onRouteMatched, this);
                    this._ValueState = library.ValueState;
                    this._MessageType = library.MessageType;

                    var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
                    this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                        // Restore original busy indicator delay for the object view
                        oViewModel.setProperty("/delay", iOriginalBusyDelay);
                    }
                    );
                },

                _onRouteMatched: function (oEvent) {

                    // var oPreviewImage = sap.ui.core.Fragment.byId(sFragmentId, "idPreviewImageAdd");
                    var sArgMode = oEvent.getParameter("arguments").mode;
                    // this._property = oEvent.getParameter("arguments").property;
                    // this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;
                    var sArgId = window.decodeURIComponent(
                        oEvent.getParameter("arguments").id
                    );
                    // this._initData(sArgMode, sArgId);
                    // },

                    // _initData: function (mParMode, mKey) {
                    var oViewModel = this.getModel("oModelView");
                    if (sArgMode === "add") {
                        oViewModel.setProperty("/mTrainingKey", sArgId);
                        oViewModel.setProperty("/edit", false);
                        oViewModel.setProperty("/mode", sArgMode);
                        oViewModel.setProperty("/sIctbTitle", "Add");

                        oViewModel.setProperty("/TrainingDetails/Title", "");
                        oViewModel.setProperty("/TrainingDetails/RewardPoints", null);
                        oViewModel.setProperty("/TrainingDetails/StartDate", null);
                        oViewModel.setProperty("/TrainingDetails/Url", "");
                        oViewModel.setProperty("/TrainingDetails/EndDate", null);
                        oViewModel.setProperty("/TrainingDetails/ZoneId", "");
                        oViewModel.setProperty("/TrainingDetails/DepotId", "");
                        oViewModel.setProperty("/TrainingDetails/DivisionId", "");
                        oViewModel.setProperty("/TrainingDetails/PainterType", null);
                        oViewModel.setProperty("/TrainingDetails/PainterArcheId", null);
                        oViewModel.setProperty("/TrainingDetails/CityId", null);
                        oViewModel.setProperty("/TrainingDetails/StateId", null);
                        oViewModel.setProperty("/TrainingDetails/Address", "");
                        oViewModel.setProperty("/TrainingDetails/Description", "");
                        oViewModel.setProperty("/TrainingDetails/TrainingQuestionnaire", []);

                        oViewModel.setProperty("/__metadata", "");
                        oViewModel.setProperty("/oImage", "");

                        var fU = this.getView().byId("idAttendanceFileUploader");
                        fU.setValue("");

                        var AddEditTraining = this.getView().getModel("i18n").getResourceBundle().getText("AddNewTraining");
                        oViewModel.setProperty("/AddEditTraining", AddEditTraining);

                        var AddEditTrainingDetails = this.getView().getModel("i18n").getResourceBundle().getText("AddTrainingDetails");
                        oViewModel.setProperty("/AddEditTrainingDetails", AddEditTrainingDetails);

                        var trainingType = this.getModel("appView").getProperty("/trainingType");
                        if (trainingType === 'ONLINE') {
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "1");
                        } else {
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "2");
                        }
                        this.getView().unbindElement();

                        // this.oPreviewImage = this.getView().byId("idPreviewImageAdd");
                        // this.oFileUploader = this.getView().byId("idFormTrainingImgUploaderAdd");
                        // this.oPreviewImage.setVisible(false);

                        this.getView().setModel(oViewModel, "oModelView");
                        this.getView().getModel().resetChanges();
                    }
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

                /*
                 * @function
                 * Cancel current object action
                 */
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
                    var selectCorrectFlag;
                    selectCorrectFlag = false;
                    var addTr = this.getModel("oModelView").getProperty("/oAddTraining");
                    if (addTr.Question === "") {
                        this.showToast.call(this, "MSG_PLS_ENTER_ERR_QUESTION");
                    } else {
                        var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
                        if (addQsFlag === true) {
                            if (addTr.TrainingQuestionnaireOptions.length >= 2) {
                                if (addTr.TrainingQuestionnaireOptions.length > 4) {
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
                                            selectCorrectFlag = true;
                                        }
                                    }
                                    if (selectCorrectFlag === false) {
                                        this.showToast.call(this, "MSG_PLS_SELECT_ONE_CORRECT_OPTION");
                                    }
                                }
                                else {
                                    this.showToast.call(this, "MSG_PLS_ENTER_MAXIMUM_FOUR_OPTIONS");
                                }
                            } else {
                                this.showToast.call(this, "MSG_PLS_ENTER_MINIMUM_TWO_OPTIONS");
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

                onChangeFile: function (oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    if (oEvent.getSource().oFileUpload.files.length > 0) {
                        var file = oEvent.getSource().oFileUpload.files[0];
                        var path = URL.createObjectURL(file);
                        if (oViewModel.getProperty("/mode") === "add") {

                            this.oPreviewImage = this.getView().byId("idPreviewImageAdd");
                            this.oFileUploader = this.getView().byId("idFormTrainingImgUploaderAdd");

                            this.oPreviewImage.setSrc(path);
                            this.oPreviewImage.setVisible(true);
                        } else {

                            this.oPreviewImage = this.getView().byId("idPreviewImageEdit");
                            this.oFileUploader = this.getView().byId("idFormTrainingImgUploaderEdit");

                            this.oPreviewImage.setSrc(path);
                            this.oPreviewImage.setVisible(true);

                        }
                    } else {
                        if (oViewModel.getProperty("/mode") === "add") {

                            this.oPreviewImage = this.getView().byId("idPreviewImageAdd");
                            this.oFileUploader = this.getView().byId("idFormTrainingImgUploaderAdd");

                            this.oPreviewImage.setSrc(path);
                            this.oPreviewImage.setVisible(false);
                        } else {

                            this.oPreviewImage = this.getView().byId("idPreviewImageEdit");
                            this.oFileUploader = this.getView().byId("idFormTrainingImgUploaderEdit");

                            this.oPreviewImage.setSrc(this.sServiceURI + this._property + "/$value");
                            this.oFileUploader.setUploadUrl(this.sServiceURI + this._property + "/$value");

                        }
                    }
                },

                _uploadTrainingImage: function (oData) {
                    var oViewModel = this.getModel("oModelView");
                    if (oViewModel.getProperty("/mode") === "add") {
                        this.oFileUploader.setUploadUrl(this.sServiceURI + "TrainingSet(" + oData.Id + ")/$value");
                    }
                    if (!this.oFileUploader.getValue()) {
                        MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("fileUploaderChooseFirstValidationTxt"));
                        return;
                    }
                    this.oFileUploader.checkFileReadable().then(function () {
                        // @ts-ignore
                        this.oFileUploader.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({ name: "slug", value: this.oFileUploader.getValue() }));
                        this.oFileUploader.setHttpRequestMethod("PUT");
                        this.getView().getModel("oModelView").setProperty("/busy", true);
                        this.oFileUploader.upload();
                    }.bind(this), function (error) {
                        MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("fileUploaderNotReadableTxt"));
                    }.bind(this)).then(function () {
                        this.oFileUploader.clear();
                    }.bind(this));
                },

                handleUploadComplete: function () {
                    this._showSuccessMsg();
                },

                _onLoadSuccess: function (oData) {
                    // if (this.oFileUploader.getValue()) {
                    //     this._uploadTrainingImage(oData);
                    // } else {
                    this._showSuccessMsg();
                    // }
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
                    var sMessage = (oViewModel.getProperty("/mode") === "add") ? this.getView().getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_TRAINING_CREATE") : this.getView().getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_TRAINING_UPATE");
                    MessageToast.show(sMessage);
                    // this._navToHome();
                    this.getRouter().navTo("worklist", true);
                },
                /* 
                 * @function
                 * Save edit or create Training details 
                 */
                onSaveTraining: function (oEvent) {
                    this._oMessageManager.removeAllMessages();

                    var oViewModel = this.getModel("oModelView");
                    var oPayload = oViewModel.getProperty("/TrainingDetails");
                    var oValid = this._fnValidation(oPayload);

                    if (oValid.IsNotValid) {
                        this.showError(this._fnMsgConcatinator(oValid.sMsg));
                        return;
                    }
                    oViewModel.setProperty("/busy", true);
                    this.CUOperation(oPayload, oEvent);
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
                    if (sKey !== null) {
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


                /*
                 * To validate values of payload
                 * @constructor  
                 * @param data : data to be tested upon
                 * @returns Object
                 * @param IsNotValid : true for failed validation cases
                 * @param sMsg : Warning message to be shown for validation error
                 * 
                 * 
                 */
                _fnValidation: function (data) {
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
                                        if (data.Url === "") {
                                            oReturn.IsNotValid = true;
                                            oReturn.sMsg.push("MSG_PLS_ENTER_ERR_URL");
                                            aCtrlMessage.push({
                                                message: "MSG_PLS_ENTER_ERR_URL",
                                                target: "/TrainingDetails/Url"
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

                CUOperation: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                    oPayload.PainterArcheId = parseInt(oPayload.PainterArcheId);
                    oPayload.PainterType = parseInt(oPayload.PainterType);
                    oPayload.CityId = parseInt(oPayload.CityId);
                    oPayload.StateId = parseInt(oPayload.StateId);
                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this,
                        sPath = "/TrainingSet";

                    if (oViewModel.getProperty("/mode") === "edit") {
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
                    } else {
                        that.getModel().create("/TrainingSet", oClonePayload, {
                            // success: that._onLoadSuccess.bind(that),
                            // error: that._onLoadError.bind(that)
                            success: function (createddata) {
                                debugger;
                                var newSpath = sPath + "(" + createddata.Id + ")";
                                that._UploadImage(newSpath, oViewModel.getProperty("/oImage")).then(that._SuccessAdd.bind(that, oEvent), that._Error
                                    .bind(
                                        that))
                            },
                            error: this._Error.bind(this)
                        });
                    }
                },

                _Error: function (error) {
                    MessageToast.show(error.toString());
                },

                _Success: function () {
                    this.getRouter().navTo("worklist", true);
                    MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_TRAINING_UPATE"));
                    var oModel = this.getModel();
                    oModel.refresh(true);
                },

                _SuccessAdd: function () {
                    this.getRouter().navTo("worklist", true);
                    MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_TRAINING_CREATE"));
                    var oModel = this.getModel();
                    oModel.refresh(true);
                },

                onUpload: function (oEvent) {
                    var oFile = oEvent.getSource().FUEl.files[0];
                    this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
                },

                getImageBinary: function (oFile) {
                    debugger;
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
                    debugger;
                    this.getModel("oModelView").setProperty("/oImage", {
                        Image: oItem.Image, //.slice(iIndex),
                        FileName: oItem.name,
                        IsArchived: false
                    });

                    this.getModel("oModelView").refresh();
                },

                _UploadImage: function (sPath, oImage, oEvent) {
                    var that = this;
                    // if (!oImage) {
                    //     return;
                    // }
                    if (oImage) {
                        $.ajax({
                            url: "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value",
                            //	data : fd,
                            data: oImage.Image,
                            method: "PUT",
                            headers: that.getModel().getHeaders(),
                            contentType: false,
                            processData: false,
                            success: that.onUploadAttendance(sPath, oEvent).then(that._SuccessAdd.bind(that, oEvent), that._Error.bind(
                                that)),
                            error: that._Error.bind(that)
                        });
                    } else {
                        that.onUploadAttendance(sPath, oEvent).then(that._SuccessAdd.bind(that, oEvent), that._Error.bind(that))
                    }
                },

                onUploadAttendance: function (sPath, oEvent) {
                    var that = this;
                    var fU = this.getView().byId("idAttendanceFileUploader");
                    var domRef = fU.getFocusDomRef();
                    var file = domRef.files[0];

                    return new Promise(function (res, rej) {
                        if (!file) {
                            res();
                            return;
                        }

                        var settings = {
                            url: "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value",
                            data: file,
                            method: "PUT",
                            cache: false,
                            // headers: that.getModel().getHeaders(),
                            contentType: "text/csv",
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
                }

            }
        );
    }
);