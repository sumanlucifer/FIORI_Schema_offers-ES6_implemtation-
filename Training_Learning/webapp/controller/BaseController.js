sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, UIComponent, mobileLibrary, MessageToast, MessageBox, Fragment) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.knpl.pragati.Training_Learning.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onShareEmailPress: function () {
            var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },

        /*
         * Common function for showing warning dialogs
         * @param sMsgTxt : i18n Key string
         * @param _fnYes : Optional: function to be called for Yes response
         */
        showWarning: function (sMsgTxt, _fnYes) {
            var that = this;
            MessageBox.warning(this.getResourceBundle().getText(sMsgTxt), {
                actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        _fnYes && _fnYes.apply(that);
                    }
                }
            });
        },
        onModelPropertyChange: function (oEvent, sModel) {
            this.getModel(sModel).setProperty("/bChange", true);
        },

        navToHome: function () {
            this.getRouter().navTo("worklist", true);
        },

        showError: function (sMsg) {
            var that = this;
            MessageBox.error(sMsg, {
                title: that.getResourceBundle().getText("TtlError")
            });

        },
        // upload painter Data by @manik 
        onFileUploadPainter: function (oEvent) {
            //console.log(oEvent);
            var oFileUploder = oEvent.getSource();
            if (oEvent.getParameter("newValue")) {
                this.getView().getModel("oModelView").setProperty("/busy", true)
                this._uploadPainterFile(oEvent.mParameters.files[0]);
            }
        },
        _uploadPainterFile: function (mParam1) {
            //console.log(mParam1);

            var oModelView = this.getView().getModel("oModelView");
            var sUrl = "/KNPL_PAINTER_API/api/v2/odata.svc/UploadPainterSet(1)/$value";
            jQuery.ajax({
                method: "PUT",
                url: sUrl,
                cache: false,
                contentType: "text/csv",
                processData: false,
                data: mParam1,
                success: function (result) {
                    console.log(result);
                    if (result.ValidPainter.length > 0) {
                        var selectedItems = result.ValidPainter;
                        var itemModel = selectedItems.map(function (item) {
                            return {
                                Name: item.PainterName,
                                PainterId: item.Id,
                                Id: item.Id,
                                PainterMobile: item.PainterMobile
                            };
                        });
                        MessageToast.show("Painter Data succesfully uploaded");

                        this._onpressfrag(itemModel);
                    }

                }.bind(this),
                error: function (data) {
                    console.log(data)
                },
            });


        },
        _onpressfrag: function (itemModel) {
            this._PainterMultiDialoge = this.getView().byId("Painters1");
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            if (!this._CsvDialoge) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.pragati.Training_Learning.view.fragments.UploadPainterData",
                    controller: this,
                }).then(
                    function (oDialog) {
                        this._CsvDialoge = oDialog;
                        oView.addDependent(this._CsvDialoge);

                        oModelView.setProperty("/TrainingDetails/TrainingPainters", itemModel);
                        oView.byId("idUploadedPainterTbl").selectAll();
                        this._CsvDialoge.open();
                        oModelView.setProperty("/busy", false);

                    }.bind(this)
                );
            } else {
                this._CsvDialoge.open();
                oModelView.setProperty("/TrainingDetails/TrainingPainters", itemModel);
                oView.byId("idUploadedPainterTbl").selectAll();
                oModelView.setProperty("/busy", false);

            }


        },
        onSaveUploadPainter: function () {
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            var oTable = oView.byId("idUploadedPainterTbl");
            var aSelections = oTable.getSelectedIndices();
            var oRows = oTable.getRows();
            var aSetPainter = [];
            var oBindingContext, obj;
            for (var x of aSelections) {
                oBindingContext = oRows[x].getBindingContext("oModelView");
                if (oBindingContext) {
                    obj = oBindingContext.getObject();
                    aSetPainter.push(obj)

                }
            }
            oModelView.setProperty("/TrainingDetails/TrainingPainters", aSetPainter);

            this._CsvDialoge.close();
        },
        onSaveUploadPainterClose: function () {
            if (this._CsvDialoge) {
                this._CsvDialoge.close();
                this._CsvDialoge.destroy();
                delete this._CsvDialoge;
            }
        },


        /*
         * Common function for showing toast messages
         * @param sMsgTxt: i18n Key string
         */
        showToast: function (sMsgTxt) {
            MessageToast.show(this.getResourceBundle().getText(sMsgTxt));
        },

        onAddQuestionnaire: function (oEvent) {
            var addQsFlag = true;
            this.getModel("oModelView").setProperty("/addQsFlag", addQsFlag);

            var oTrainingQuestionnaire = [];
            var clientQuestionId = this.generateId();
            this.getModel("oModelView").setProperty("/oAddTraining", [{
                QuestionId: null,
                ClientQuestionId: clientQuestionId,
                LanguageCode: "EN",
                Question: null,
                QuestionLocalizedId: null,
                Options: [],
                IsArchived: false
            }]);

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
                oThat.byId("QuestionnaireOptionsDialog").bindElement({
                    path: sPath,
                    model: "oModelView"
                });
                oThat.byId("QuestionnaireOptionsDialog").open();
            }
        },

        onEditQuestionnaire: function (oEvent) {
            var addQsFlag = false;
            this.getModel("oModelView").setProperty("/addQsFlag", addQsFlag);
            var sPath = oEvent.getSource().getBindingContext("oModelView").getPath(),
                oButton = oEvent.getSource();
            var oView = this.getView();
            var oModelView = this.getModel("oModelView"),
                oThat = this;
            var questionnaireIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            this.getModel("oModelView").setProperty("/questionnaireIndex", questionnaireIndex);

            var Questionnaire = oEvent.getSource().getBindingContext("oModelView").getObject();
            // var TrainingQuestionnaire = this.getModel("oModelView").getProperty("/TrainingDetails/TrainingQuestionnaire");
            var clientObject = this.convertToClientObject(Questionnaire);
            // var addTr = this.getModel("oModelView").getProperty("/oAddTraining");
            this.getModel("oModelView").setProperty("/oAddTraining", clientObject);

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
        onEditQuestionnaire2: function (oEvent) {
            var addQsFlag = false;
            this.getModel("oModelView").setProperty("/addQsFlag", addQsFlag);
            var sPath = oEvent.getSource().getBindingContext("oModelView").getPath(),
                oButton = oEvent.getSource();
            var oView = this.getView();
            var oModelView = this.getModel("oModelView"),
                oThat = this;
            var questionnaireIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            this.getModel("oModelView").setProperty("/questionnaireIndex", questionnaireIndex);

            var Questionnaire = oEvent.getSource().getBindingContext("oModelView").getObject();
            // var TrainingQuestionnaire = this.getModel("oModelView").getProperty("/TrainingDetails/TrainingQuestionnaire");
            var clientObject = this.convertToClientObject(Questionnaire);
            // var addTr = this.getModel("oModelView").getProperty("/oAddTraining");
            this.getModel("oModelView").setProperty("/oAddTraining", clientObject);

            if (!this.byId("QuestionnaireOptionsDialog2")) {
                // load asynchronous XML fragment
                Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.pragati.Training_Learning.view.fragments.DisplayQuestionDetails",
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
                oThat.byId("QuestionnaireOptionsDialog2").open();
                oThat.byId("QuestionnaireOptionsDialog2").bindElement({
                    path: sPath,
                    model: "oModelView"
                });
            }
        },

        onDeleteQuestionnaire: function (oEvent) {
            var questionnaireIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);

            function onYes() {
                this.deleteQuestionnaire(questionnaireIndex);
            }
            this.showWarning("MSG_CONFIRM_QUESTION_DELETE", onYes);
        },

        deleteQuestionnaire: function (questionnaireIndex) {
            if (!this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[questionnaireIndex].Id) {
                this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire.splice(questionnaireIndex, 1);
            } else {
                this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[questionnaireIndex].IsArchived = true;
            }
            this.getModel("oModelView").refresh();
        },

        updateOptions: function () {

            var addTr;
            var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
            addTr = this.getModel("oModelView").getProperty("/oAddTraining");

            // To check Blank Language Code
            var LanguageCodeBlank = false;
            for (var i = 0; i < addTr.length; i++) {
                var optionLength = addTr[i].Options.length; //To check length of Options
                if (addTr[i].LanguageCode === "") {
                    LanguageCodeBlank = true;
                }
            }

            // To check Blank Question
            var QuestionBlank = false;
            for (var i = 0; i < addTr.length; i++) {
                if (addTr[i].Question === null) {
                    QuestionBlank = true;
                }
            }

            // To check whether at least one option is selected or not
            var selectCorrectFlag = false;
            for (var i = 0; i < addTr[0].Options.length; i++) {
                if (addTr[0].Options[i].IsCorrect === true) {
                    selectCorrectFlag = true;
                }
            }

            // To check blank option
            var blankOption = false;
            for (var i = 0; i < addTr.length; i++) {
                for (var j = 0; j < addTr[i].Options.length; j++) {
                    if (addTr[i].Options[j].Option === null) {
                        blankOption = true;
                    }
                }
            }

            if (LanguageCodeBlank) {
                this.showToast.call(this, "MSG_PLS_SELECT_LANGUAGE");
            } else {
                if (QuestionBlank) {
                    this.showToast.call(this, "MSG_PLS_ENTER_ERR_QUESTION");
                } else {
                    if (optionLength >= 2) {
                        if (optionLength <= 4) {
                            if (selectCorrectFlag === false) {
                                this.showToast.call(this, "MSG_PLS_SELECT_ONE_CORRECT_OPTION");
                            } else {
                                if (blankOption) {
                                    this.showToast.call(this, "MSG_DONT_ENTER_BLANK_OPTION");
                                } else {
                                    if (addQsFlag === true) {
                                        this.getModel("oModelView").setProperty("/addQsFlag", false);
                                    } else {
                                        var questionnaireIndex = this.getModel("oModelView").getProperty("/questionnaireIndex");
                                        this.deleteQuestionnaire(questionnaireIndex);
                                    }
                                    var addTr = this.getModel("oModelView").getProperty("/oAddTraining");
                                    var TrainingQuestionnaire = this.getModel("oModelView").getProperty("/TrainingDetails/TrainingQuestionnaire");
                                    var serviceObject = this.convertToServiceObject(addTr);
                                    console.log(serviceObject)
                                    TrainingQuestionnaire.push(serviceObject);

                                    this.getModel("oModelView").setProperty("/TrainingDetails/TrainingQuestionnaire", TrainingQuestionnaire);
                                    this.byId("QuestionnaireOptionsDialog").close();
                                    this.getModel("oModelView").refresh();
                                }
                            }
                        } else {
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
        closeOptionsDialog2: function () {
            var oDialog = this.byId("QuestionnaireOptionsDialog2");
            oDialog.close();
            oDialog.destroy();
        },

        onLanguageCodeChange: function (oEvent) {

            var selectedLanguageCode = oEvent.getSource().getSelectedKey();
            var selectedLanguageCodeIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            var selectedObject = oEvent.getSource().getBindingContext("oModelView").getObject();
            var aleadySelected = false;
            var oModel = this.getView().getModel("oModelView");
            var clientObject = this.getModel("oModelView").getProperty("/oAddTraining");

            var sPath = oEvent.getSource().getBindingContext("oModelView").getPath()
            for (var i = 0; i < clientObject.length; i++) {
                if (i !== parseInt(selectedLanguageCodeIndex)) {
                    if (clientObject[i].LanguageCode === selectedLanguageCode) {
                        aleadySelected = true;
                        selectedObject.LanguageCode = "";
                        clientObject[selectedLanguageCodeIndex].LanguageCode = "";
                        this.showToast.call(this, "ALREADY_LANGUAGE_SELECTED");
                        break;

                    }
                }
            }

            if (!aleadySelected) {
                clientObject[selectedLanguageCodeIndex].Options.forEach(op => {
                    op.LanguageCode = selectedLanguageCode;
                });
            }

        },
        fmtCheckLanguage: function (mParam1, mParam2) {

            for (var x in mParam2) {
                if (mParam2[x]["LanguageCode"] === mParam1) {

                    return false
                }
            }
        },
        addMoreLanguage: function (oEvent) {
            var languageCode = "";
            var clientObject = this.getModel("oModelView").getProperty("/oAddTraining");
            var lang = Object.assign({}, clientObject[0], true);
            lang.Question = null;
            lang.IsArchived = false;
            lang.LanguageCode = languageCode;
            lang.QuestionLocalizedId = null;
            lang.Options = clientObject[0].Options.map(option => {
                var op = Object.assign({}, option, true);
                op.Option = null;
                op.IsArchived = false;
                op.LanguageCode = languageCode;
                op.OptionLocalizedId = null;
                return op;
            });
            clientObject.push(lang);
            this.getModel("oModelView").setProperty("/oAddTraining", clientObject);
            this.getModel("oModelView").refresh();
            return lang;

            // var sPath = this.getView().byId("QuestionnaireOptionsDialog").getElementBinding("oModelView").getPath();
            // var oObjectLocal = this.getModel("oModelView").getProperty(sPath + "/TrainingQuestionnaireLocalized");
            // var oObjectOption = this.getModel("oModelView").getProperty(sPath + "/TrainingQuestionnaireOptions");

            // oObjectLocal.push({
            //     LanguageCode: "",
            //     Question: "",
            //     IsArchived: false
            // });

            // oObjectOption.push({
            //     isCorrect: false,
            //     IsArchived: false,
            //     TrainingQuestionnaireOptionsLocalized: []
            // });
        },

        generateId: function () {
            var nounce = Math.ceil(1000 * Math.random() * Date.now()).toPrecision(16).toString().replace(".", "");
            return parseInt(nounce.substring(0, 4)).toString(16) + "-" + parseInt(nounce.substring(4, 8)).toString(16) + "-" + parseInt(nounce.substring(8, 16)).toString(16);
        },

        onAddQuestionnaireOptions: function (oEvent) {
            var clientOptionId = this.generateId();
            var clientObject = this.getModel("oModelView").getProperty("/oAddTraining");
            clientObject.forEach(translation => {
                var Option = {
                    OptionId: null,
                    ClientOptionId: clientOptionId,
                    LanguageCode: translation.LanguageCode,
                    Option: null,
                    QuestionId: translation.QuestionId,
                    OptionLocalizedId: null,
                    IsArchived: false,
                    IsCorrect: false,
                    QuestionnaireId: translation.Id
                };

                translation.Options.push(Option);
            });
            this.getModel("oModelView").refresh();
            // var sPath = this.getView().byId("QuestionnaireOptionsDialog").getElementBinding("oModelView").getPath();
            // var oObject = this.getModel("oModelView").getProperty(sPath + "/TrainingQuestionnaireOptions/TrainingQuestionnaireOptionsLocalized");
            // oObject.push({
            //     Option: "",
            //     IsArchived: false
            // });
        },

        onDeleteTranslation: function (oEvent) {
            var translationIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            var clientObject = this.getModel("oModelView").getProperty("/oAddTraining");
            if (clientObject[translationIndex].QuestionId) {
                clientObject[translationIndex].IsArchived = true;
            } else {
                clientObject.splice(translationIndex, 1);
            }
            this.getModel("oModelView").refresh(true);

        },

        onDeleteQuestionnaireOptions: function (oEvent) {
            // var oView = this.getView();
            var iOptionIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            console.log(iOptionIndex)
            // var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
            var clientObject = this.getModel("oModelView").getProperty("/oAddTraining");

            // clientObject.forEach(translation => {
            //     if (translation.Options[iOptionIndex].OptionId) {
            //         translation.Options[iOptionIndex].IsArchived = true;
            //     } else {
            //         translation.Options.splice(iOptionIndex, 1);
            //     }
            // });
            for (var i in clientObject) {
                clientObject[i]["Options"].splice(parseInt(iOptionIndex), 1)
            }
            this.getModel("oModelView").refresh(true);

            // if (addQsFlag === true) {
            //     var oAddTrain = this.getModel("oModelView").getProperty("/oAddTraining");
            //     oAddTrain.TrainingQuestionnaireOptions.splice(iOptionIndex, 1);
            // } else {
            //     var iQuestionIndex = this.getModel("oModelView").getProperty("/iIndex");
            //     this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iQuestionIndex].TrainingQuestionnaireOptions[iOptionIndex].IsArchived = true;
            //     var oAddTrain = this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iQuestionIndex];
            //     oAddTrain.TrainingQuestionnaireOptions.splice(iOptionIndex, 1);
            // }
        },
        select1: function () {
            console.log("Manik")
        },
        onSelectOption: function (oEvent) {
            var clientObject = this.getModel("oModelView").getProperty("/oAddTraining");
            var iOptionIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            console.log(oEvent.getSource().getBindingContext("oModelView").getObject(), iOptionIndex);

            // clientObject.forEach(translation => {
            //     translation.Options.forEach(op => {
            //         op.IsCorrect = false;
            //     });
            //     translation.Options[iOptionIndex].IsCorrect = true;
            // });
            for (var i in clientObject) {
                for (var x in clientObject[i]["Options"]) {
                    if (x == iOptionIndex) {
                        clientObject[i]["Options"][x]["IsCorrect"] = true;
                    } else {
                        clientObject[i]["Options"][x]["IsCorrect"] = false;
                    }
                }
            }
            //this.getView().getModel("oModelView").refresh(true);
            this.getModel("oModelView").setProperty("/oAddTraining", clientObject);
            this.getView().getModel("oModelView").refresh();

            console.log(clientObject);
        },

        convertToClientObject: function (serviceObject) {
            var sTrainingType = this.getView().getModel("appView").getProperty("/trainingType");
            console.log(sTrainingType)
            if (sTrainingType === "ONLINE") {
                return this._converToClientObjOnlineT(serviceObject);
            } else if (sTrainingType === "VIDEO") {
                return this._converToClientObjVideoT(serviceObject);
            }


        },
        _converToClientObjOnlineT: function (serviceObject) {
            console.log("object online")
            var clientObject = [];

            var question = {
                Id: serviceObject.Id,
                ClientQuestionId: this.generateId(),
                IsArchived: serviceObject.IsArchived,
                CreatedAt: serviceObject.CreatedAt,
                CreatedBy: serviceObject.CreatedBy,
                UpdatedAt: serviceObject.UpdatedAt,
                UpdatedBy: serviceObject.UpdatedBy,
                TrainingId: serviceObject.TrainingId,
            };

            clientObject = serviceObject.TrainingQuestionnaireLocalized.map(o => {
                var que = Object.assign({}, question);
                que.QuestionLocalizedId = o.Id;
                que.LanguageCode = o.LanguageCode;
                que.Question = o.Question;
                que.QuestionId = o.TrainingQuestionnaireId;
                return que;
            });

            serviceObject.TrainingQuestionnaireOptions.forEach(o => {
                o.ClientOptionId = this.generateId();
            });

            clientObject.forEach(que => {
                que.Options = [];

                for (var i = 0; i < serviceObject.TrainingQuestionnaireOptions.length; i++) {

                    var optionServiceObject = serviceObject.TrainingQuestionnaireOptions[i];
                    var option = {
                        Id: optionServiceObject.Id,
                        ClientOptionId: optionServiceObject.ClientOptionId,
                        IsCorrect: optionServiceObject.IsCorrect,
                        IsArchived: optionServiceObject.IsArchived,
                        CreatedAt: optionServiceObject.CreatedAt,
                        CreatedBy: optionServiceObject.CreatedBy,
                        UpdatedAt: optionServiceObject.UpdatedAt,
                        UpdatedBy: optionServiceObject.UpdatedBy,
                        QuestionnaireId: optionServiceObject.QuestionnaireId,
                    };

                    optionServiceObject.TrainingQuestionnaireOptionsLocalized.forEach(o => {
                        if (que.LanguageCode == o.LanguageCode) {
                            var op = Object.assign({}, option);
                            op.OptionLocalizedId = o.Id;
                            op.LanguageCode = o.LanguageCode;
                            op.Option = o.Option;
                            op.OptionId = o.TrainingOptionId;
                            que.Options.push(op);
                        }
                    });
                }
            });
            console.log(clientObject)
            return clientObject;
        },

        convertToServiceObject: function (clientObject) {
            var sTrainingType = this.getView().getModel("appView").getProperty("/trainingType");
            if (sTrainingType === "ONLINE") {
                return this._converToServiceObjOnlineT(clientObject);
            } else if (sTrainingType === "VIDEO") {
                return this._converToServiceObjVideoT(clientObject);
            }
        },
        _converToServiceObjOnlineT: function (clientObject) {
           
            var serviceObject = {};
            var que = clientObject[0];
            serviceObject.Id = que.QuestionId;
            serviceObject.Index = que.Index || null;
            serviceObject.CreatedAt = que.CreatedAt || null;
            serviceObject.CreatedBy = que.CreatedBy || null;
            serviceObject.UpdatedAt = que.UpdatedAt || null;
            serviceObject.UpdatedBy = que.UpdatedBy || null;
            serviceObject.IsArchived = que.IsArchived || false;
            // serviceObject.ClientQuestionId = que.ClientQuestionId;
            serviceObject.TrainingId = que.TrainingId || null;
            serviceObject.Question = que.Question;
            serviceObject.TrainingQuestionnaireLocalized = clientObject.map(o => {
                return {
                    Id: o.QuestionLocalizedId,
                    LanguageCode: o.LanguageCode,
                    Question: o.Question,
                    TrainingQuestionnaireId: o.QuestionId
                    // ClientTrainingQuestionnaireId: o.ClientQuestionId
                };
            });

            var options = {};
            for (var i = 0; i < que.Options.length; i++) {
                var option = que.Options[i];
                options[option.ClientOptionId] = {
                    Id: option.OptionId,
                    Index: option.Index || null,
                    CreatedAt: option.CreatedAt || null,
                    CreatedBy: option.CreatedBy || null,
                    UpdatedAt: option.UpdatedAt || null,
                    UpdatedBy: option.UpdatedBy || null,
                    IsArchived: option.IsArchived || false,
                    ClientOptionId: option.ClientOptionId,
                    QuestionnaireId: option.QuestionnaireId || null,
                    Option: option.Option,
                    IsCorrect: option.IsCorrect,
                    TrainingQuestionnaireOptionsLocalized: []
                };
            }

            serviceObject.TrainingQuestionnaireOptions = Object.values(options);

            for (var i = 0; i < clientObject.length; i++) {
                var que = clientObject[i];
                serviceObject.TrainingQuestionnaireOptions.forEach(op => {
                    for (var i = 0; i < que.Options.length; i++) {
                        var option = que.Options[i];
                        if (op.ClientOptionId == option.ClientOptionId) {
                            var opLocalized = {
                                Id: option.OptionLocalizedId,
                                LanguageCode: option.LanguageCode,
                                Option: option.Option,
                                TrainingOptionId: option.OptionId,
                                // ClientTrainingOptionId: option.ClientOptionId
                            };
                            op.TrainingQuestionnaireOptionsLocalized.push(opLocalized);
                            // delete op.ClientOptionId;
                        }
                    }
                });
            }

            for (var i = 0; i < clientObject.length; i++) {
                var que = clientObject[i];
                serviceObject.TrainingQuestionnaireOptions.forEach(op => {
                    for (var i = 0; i < que.Options.length; i++) {
                        delete op.ClientOptionId;
                    }
                });
            }


            return serviceObject;

        }

    });

});