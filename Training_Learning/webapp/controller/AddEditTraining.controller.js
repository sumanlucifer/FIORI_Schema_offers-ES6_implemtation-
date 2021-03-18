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
        "sap/m/MessageBox"
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
        MessageBox
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Training_Learning.controller.AddEditTraining",
            {
                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    var oViewModel = new JSONModel({
                        busy: false,
                        mTrainingKey: "",
                        edit: false,
                        mode: "",
                        sIctbTitle: "",
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
                        .getRoute("RouteAddEditT")
                        .attachMatched(this._onRouteMatched, this);
                    this._ValueState = library.ValueState;
                    this._MessageType = library.MessageType;
                },

                _onRouteMatched: function (oEvent) {

                    // var oPreviewImage = sap.ui.core.Fragment.byId(sFragmentId, "idPreviewImageAdd");
                    var sArgMode = oEvent.getParameter("arguments").mode;
                    this._property = oEvent.getParameter("arguments").property;
                    this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;
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
                        oViewModel.setProperty("/TrainingDetails/DepotId", "");
                        oViewModel.setProperty("/TrainingDetails/DivisionId", "");
                        oViewModel.setProperty("/TrainingDetails/PainterType", null);
                        oViewModel.setProperty("/TrainingDetails/PainterArcheId", null);
                        oViewModel.setProperty("/TrainingDetails/CityId", null);
                        oViewModel.setProperty("/TrainingDetails/StateId", null);
                        oViewModel.setProperty("/TrainingDetails/Description", "");
                        oViewModel.setProperty("/TrainingDetails/TrainingQuestionnaire", []);

                        var AddEditTraining = this.getView().getModel("i18n").getResourceBundle().getText("AddNewTraining");
                        oViewModel.setProperty("/AddEditTraining", AddEditTraining);

                        var AddEditTrainingDetails = this.getView().getModel("i18n").getResourceBundle().getText("AddTrainingDetails");
                        oViewModel.setProperty("/AddEditTrainingDetails", AddEditTrainingDetails);

                        var trainingType = this.getModel("appView").getProperty("/trainingType");
                        debugger;
                        if (trainingType === 'ONLINE') {
                            this._showFormFragment("OnlineTraining");
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "1");
                        } else {
                            this._showFormFragment("OfflineTraining");
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "2");
                        }
                        this.getView().unbindElement();

                        this._formFragments; //used for the fragments of the add and edit forms

                        // this.oPreviewImage = this.getView().byId("idPreviewImageAdd");
                        // this.oFileUploader = this.getView().byId("idFormTrainingImgUploaderAdd");
                        // this.oPreviewImage.setVisible(false);

                        this.getView().setModel(oViewModel, "oModelView");
                        this.getView().getModel().resetChanges();

                    } else {
                        var that = this;
                        oViewModel.setProperty("/mTrainingKey", sArgId);
                        oViewModel.setProperty("/edit", true);
                        oViewModel.setProperty("/mode", sArgMode);
                        oViewModel.setProperty("/sIctbTitle", "Edit");

                        var AddEditTraining = this.getView().getModel("i18n").getResourceBundle().getText("EditNewTraining");
                        oViewModel.setProperty("/AddEditTraining", AddEditTraining);

                        var AddEditTrainingDetails = this.getView().getModel("i18n").getResourceBundle().getText("EditTrainingDetails");
                        oViewModel.setProperty("/AddEditTrainingDetails", AddEditTrainingDetails);

                        debugger;
                        var trainingType = this.getModel("appView").getProperty("/trainingType");

                        var sPath = "/" + sArgId;
                        that.getModel().read(sPath, {
                            urlParameters: {
                                "$expand": "City, State, Depot, Division, PainterArcheType, PainterTypeDetails, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
                            },
                            success: function (data) {

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

                                oViewModel.setProperty("/TrainingDetails", data);
                                // that._showFormFragment("EditTraining");
                                if (trainingType === 'ONLINE') {
                                    that._showFormFragment("OnlineTraining");
                                } else {
                                    that._showFormFragment("OfflineTraining");
                                }

                                that.getView().unbindElement();

                                that._formFragments; //used for the fragments of the add and edit forms

                                that.getView().setModel(oViewModel, "oModelView");
                                that.getView().getModel().resetChanges();
                            }
                        });
                    }
                },

                _showFormFragment: function (sFragmentName) {
                    var objSection = this.getView().byId("oVbxSmtTbl");
                    var oView = this.getView();
                    objSection.destroyItems();
                    var othat = this;
                    this._getFormFragment(sFragmentName).then(function (oVBox) {
                        oView.addDependent(oVBox);
                        objSection.addItem(oVBox);
                        // othat._setDataValue.call(othat);
                    });
                },
                // _setDataValue: function () {
                //   var oInput = this.getView().byId("idAddAcntNum");
                //   oInput.addEventDelegate(
                //     {
                //       onAfterRendering: function () {
                //         var oInput = this.$().find(".sapMInputBaseInner");
                //         var oID = oInput[0].id;
                //         $("#" + oID).bind("cut copy paste", function (e) {
                //           e.preventDefault();
                //           return false;
                //         });
                //       },
                //     },
                //     oInput
                //   );
                // },

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

                    console.log(oModelView);
                    if (!this.byId("QuestionnaireOptionsDialog")) {
                        // load asynchronous XML fragment
                        Fragment.load({
                            id: oView.getId(),
                            name: "com.knpl.pragati.Training_Learning.view.QuestionnaireOptionsDialog",
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
                    console.log(addQsFlag);
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
                            name: "com.knpl.pragati.Training_Learning.view.QuestionnaireOptionsDialog",
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
                        if (this.getModel("oModelView").getData().sMode === "C" || !this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iIndex].Id) {
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
                    // var oModel = this.getComponentModel();
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
                 * Save edit or create FAQ details 
                 */
                onSaveTraining: function () {
                    this._oMessageManager.removeAllMessages();

                    var oViewModel = this.getModel("oModelView");
                    var oPayload = oViewModel.getProperty("/TrainingDetails");
                    var oValid = this._fnValidation(oPayload);

                    if (oValid.IsNotValid) {
                        this.showError(this._fnMsgConcatinator(oValid.sMsg));
                        return;
                    }
                    oViewModel.setProperty("/busy", true);
                    this.CUOperation(oPayload);
                },

                onStateChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oCity = oView.byId("cmbCity"),
                        oBindingCity,
                        aFilter = [];
                    if (sKey !== "") {
                        oCity.clearSelection();
                        oCity.setValue("");
                        oBindingCity = oCity.getBinding("items");
                        aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
                        oBindingCity.filter(aFilter);
                    }
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
                    // if (data.TrainingTypeId === "") {
                    //     oReturn.IsNotValid = true;
                    //     oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTYPE");
                    //     aCtrlMessage.push({
                    //         message: "MSG_PLS_ENTER_ERR_TTYPE",
                    //         target: "/TrainingDetails/TrainingTypeId"
                    //     });
                    // } else
                    if (data.Title === "") {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTL");
                        aCtrlMessage.push({
                            message: "MSG_PLS_ENTER_ERR_TTL",
                            target: "/TrainingDetails/Title"
                        });
                    } else
                        if (data.StartDate === "") {
                            oReturn.IsNotValid = true;
                            oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TSDATE");
                            aCtrlMessage.push({
                                message: "MSG_PLS_ENTER_ERR_TSDATE",
                                target: "/TrainingDetails/StartDate"
                            });
                        } else
                            if (data.EndDate === "") {
                                oReturn.IsNotValid = true;
                                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TEDATE");
                                aCtrlMessage.push({
                                    message: "MSG_PLS_ENTER_ERR_TEDATE",
                                    target: "/TrainingDetails/EndDate"
                                });
                            } else
                                if (data.EndDate && data.EndDate < data.StartDate) {
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

                CUOperation: function (oPayload) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                    // oPayload.DivisionTypeId = parseInt(oPayload.DivisionTypeId);
                    // oPayload.DepotTypeId = parseInt(oPayload.DepotTypeId);
                    oPayload.PainterArcheId = parseInt(oPayload.PainterArcheId);
                    oPayload.PainterType = parseInt(oPayload.PainterType);
                    oPayload.CityId = parseInt(oPayload.CityId);
                    oPayload.StateId = parseInt(oPayload.StateId);
                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this;

                    if (oViewModel.getProperty("/mode") === "edit") {
                        var sKey = that.getModel().createKey("/TrainingSet", {
                            Id: oClonePayload.Id
                        });
                        that.getModel().update(sKey, oClonePayload, {
                            // success: function () {
                            //     oViewModel.setProperty("/busy", false);
                            //     that.getRouter().navTo("worklist", true);
                            //     that.showToast.call(that, "MSG_SUCCESS_UPDATE");
                            //     res(oClonePayload);
                            // },
                            // error: function () {
                            //     oViewModel.setProperty("/busy", false);
                            //     rej();
                            // }i18n
                            success: that._onLoadSuccess.bind(that),
                            error: that._onLoadError.bind(that)
                        });
                    } else {
                        that.getModel().create("/TrainingSet", oClonePayload, {
                            // success: function (data) {
                            //     oViewModel.setProperty("/busy", false);
                            //     that.getRouter().navTo("worklist", true);
                            //     that.showToast.call(that, "MSG_SUCCESS_TRAINING_CREATE");
                            //     res(data);
                            // },
                            // error: function () {
                            //     oViewModel.setProperty("/busy", false);
                            //     rej();
                            // }
                            success: that._onLoadSuccess.bind(that),
                            error: that._onLoadError.bind(that)
                        });
                    }

                    // });
                }

            }
        );
    }
);