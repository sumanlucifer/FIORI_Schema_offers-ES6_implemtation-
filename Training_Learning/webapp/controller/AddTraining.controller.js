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
        "sap/ui/core/SeparatorItem",
        "sap/ui/core/util/Export",
        "sap/ui/core/util/ExportTypeCSV",
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
        SeparatorItem,
        Export,
        ExportTypeCSV,
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

                    var oViewModel = this.getModel("oModelView");

                    //FIX: Need pop for changes
                     oViewModel.setProperty("/bChange", false);
                    oViewModel.detachPropertyChange(this.onModelPropertyChange, this);                        
                    //Pop Fix

                    var sArgMode = oEvent.getParameter("arguments").mode;
                    var sTrType = oEvent.getParameter("arguments").trtype;
                    var sArgId = window.decodeURIComponent(
                        oEvent.getParameter("arguments").id
                    );

                    
                    if (sArgMode === "add") {
                        oViewModel.setProperty("/mTrainingKey", sArgId);
                        oViewModel.setProperty("/edit", false);
                        oViewModel.setProperty("/mode", sArgMode);
                        oViewModel.setProperty("/sIctbTitle", "Add");

                        // oViewModel.setProperty("/ZonesDiv", "");
                        oViewModel.setProperty("/TrainingDetails/TrainingSubTypeId", null);
                        oViewModel.setProperty("/TrainingDetails/Title", "");
                        oViewModel.setProperty("/TrainingDetails/RewardPoints", null);
                        oViewModel.setProperty("/TrainingDetails/Duration", null);
                        oViewModel.setProperty("/TrainingDetails/StartDate", null);
                        oViewModel.setProperty("/TrainingDetails/Url", "");
                        oViewModel.setProperty("/TrainingDetails/EndDate", null);
                        oViewModel.setProperty("/TrainingDetails/TrainingZone", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingDivision", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingDepot", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainterTypeDetails", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainterArcheTypeDetails", []);
                        oViewModel.setProperty("/TrainingDetails/Status", 0);
                        oViewModel.setProperty("/TrainingDetails/Description", "");
                        oViewModel.setProperty("/TrainingDetails/TrainingQuestionnaire", []);
                        oViewModel.setProperty("/TrainingDetails/LearningQuestionnaire", []);

                        oViewModel.setProperty("/__metadata", "");
                        oViewModel.setProperty("/oImage", "");

                        var fU = this.getView().byId("idAttendanceFileUploader");
                        fU.setValue("");

                        var AddEditTraining = this.getView().getModel("i18n").getResourceBundle().getText("AddNewTraining");
                        oViewModel.setProperty("/AddEditTraining", AddEditTraining);

                        var AddEditTrainingDetails = this.getView().getModel("i18n").getResourceBundle().getText("AddTrainingDetails");
                        oViewModel.setProperty("/AddEditTrainingDetails", AddEditTrainingDetails);

                        // var trainingType = this.getModel("appView").getProperty("/trainingType");
                        var trainingType = sTrType;
                        if (trainingType === 'ONLINE') {
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "1");
                            this.onTrainingModeChange(1);
                        } else if (trainingType === 'OFFLINE') {
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "2");
                            this.onTrainingModeChange(2);
                        } else {
                            oViewModel.setProperty("/TrainingDetails/TrainingTypeId", "3");
                            this.onTrainingModeChange(3);
                        }
                        this.getView().unbindElement();

                        this.getView().setModel(oViewModel, "oModelView");
                        this.getView().getModel().resetChanges();

                        // To set Non-editable for Div and Depot by default
                        oViewModel.setProperty("/zoneFilled", false);
                        oViewModel.setProperty("/divFilled", false);
                        // To clear filter and field Values of Zone and Division
                        var oDivision = this.getView().byId("idDivision");
                        oDivision.clearSelection();
                        var aDivFilter = [];
                        oDivision.getBinding("items").filter(aDivFilter);

                        var oZone = this.getView().byId("idZone");
                        oZone.clearSelection();

                        var oPainterType = this.getView().byId("idPainterType");
                        oPainterType.clearSelection();

                        var oPainterArcheType = this.getView().byId("idPainterArcheType");
                        oPainterArcheType.clearSelection();

                        //FIX: POP on cancel
                        oViewModel.attachPropertyChange("oModelView", this.onModelPropertyChange, this);                    }
                },

                /*
                 * @function
                 * Cancel current object action
                 */
                onCancel: function () {
                    //this.getRouter().navTo("worklist", true);
                    if(this.getModel("oModelView").getProperty("/bChange"))
                       {  
                          this.showWarning(  "MSG_PENDING_CHANGES" ,this.navToHome);
                        }
                       else{
                            this.navToHome();
                       }     
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
                        oThat.byId("QuestionnaireOptionsDialog").bindElement({
                            path: sPath,
                            model: "oModelView"
                        });
                        oThat.byId("QuestionnaireOptionsDialog").open();
                    }
                },

                updateOptions: function () {
                    var selectCorrectFlag,
                        blankOption,
                        addTr;
                    selectCorrectFlag = false;
                    blankOption = true;
                    var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
                    if (addQsFlag === true) {
                        addTr = this.getModel("oModelView").getProperty("/oAddTraining");
                    } else {
                        var iIndex = this.getModel("oModelView").getProperty("/iIndex");
                        addTr = this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iIndex];
                    }
                    if (addTr.Question === "") {
                        this.showToast.call(this, "MSG_PLS_ENTER_ERR_QUESTION");
                    } else {
                        if (addTr.TrainingQuestionnaireOptions.length >= 2) {
                            if (addTr.TrainingQuestionnaireOptions.length <= 4) {
                                for (var i = 0; i < addTr.TrainingQuestionnaireOptions.length; i++) {
                                    if (addTr.TrainingQuestionnaireOptions[i].IsCorrect === true) {
                                        selectCorrectFlag = true;
                                    }
                                }
                                if (selectCorrectFlag === false) {
                                    this.showToast.call(this, "MSG_PLS_SELECT_ONE_CORRECT_OPTION");
                                } else {
                                    for (var i = 0; i < addTr.TrainingQuestionnaireOptions.length; i++) {
                                        if (addTr.TrainingQuestionnaireOptions[i].Option === "") {
                                            blankOption = false;
                                            this.showToast.call(this, "MSG_DONT_ENTER_BLANK_OPTION");
                                        }
                                    }
                                    if (blankOption === true) {
                                        if (addQsFlag === true) {
                                            this.getModel("oModelView").setProperty("/addQsFlag", false);
                                            this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire.push({
                                                Question: addTr.Question,
                                                TrainingQuestionnaireOptions: addTr.TrainingQuestionnaireOptions,
                                                IsArchived: false
                                            });
                                            this.byId("QuestionnaireOptionsDialog").close();
                                            this.getModel("oModelView").refresh();
                                        } else {
                                            this.byId("QuestionnaireOptionsDialog").close();
                                            this.getModel("oModelView").refresh();
                                        }
                                    }
                                }
                            } else {
                                this.showToast.call(this, "MSG_PLS_ENTER_MAXIMUM_FOUR_OPTIONS");
                            }
                        } else {
                            this.showToast.call(this, "MSG_PLS_ENTER_MINIMUM_TWO_OPTIONS");
                        }
                    }
                },

                closeOptionsDialog: function () {
                    this.byId("QuestionnaireOptionsDialog").close();
                },

                onEditQuestionnaire: function (oEvent) {
                    var addQsFlag = false;
                    this.getModel("oModelView").setProperty("/addQsFlag", addQsFlag);
                    var sPath = oEvent.getSource().getBindingContext("oModelView").getPath(),
                        oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oModelView = this.getModel("oModelView"),
                        oThat = this;
                    var iIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
                    this.getModel("oModelView").setProperty("/iIndex", iIndex);
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

                onDeleteQuestionnaireOptions: function (oEvent) {
                    var oView = this.getView();
                    var iOptionIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
                    var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");

                    if (addQsFlag === true) {
                        var oAddTrain = this.getModel("oModelView").getProperty("/oAddTraining");
                        oAddTrain.TrainingQuestionnaireOptions.splice(iOptionIndex, 1);
                    } else {
                        var iQuestionIndex = this.getModel("oModelView").getProperty("/iIndex");
                        this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iQuestionIndex].TrainingQuestionnaireOptions[iOptionIndex].IsArchived = true;
                        var oAddTrain = this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iQuestionIndex];
                        oAddTrain.TrainingQuestionnaireOptions.splice(iOptionIndex, 1);
                    }
                    this.getModel("oModelView").refresh();
                },

                /* 
                 * @function
                 * Save edit or create Training details 
                 */
                onSaveTraining: function (oEvent) {
                    this._oMessageManager.removeAllMessages();
                    var oViewModel = this.getModel("oModelView");
                    var oPayload = {};
                    $.extend(true, oPayload, oViewModel.getProperty("/TrainingDetails"));
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    var oValid;
                    if (trainingType === 'VIDEO') {
                        oValid = this._fnValidationVideo(oPayload);
                    } else if (trainingType === 'ONLINE') {
                        oValid = this._fnValidationOnline(oPayload);
                    } else {
                        oValid = this._fnValidationOffline(oPayload);
                    }

                    if (oValid.IsNotValid) {
                        this.showError(this._fnMsgConcatinator(oValid.sMsg));
                        return;
                    }
                    // oViewModel.setProperty("/busy", true);

                    if (trainingType === 'VIDEO') {
                        this.CUOperationVideo(oPayload, oEvent);
                    } else if (trainingType === 'ONLINE') {
                        this.CUOperationOnlineTraining(oPayload, oEvent);
                    } else if (trainingType === 'OFFLINE') {
                        this._UploadAttendanceOfflineTr(oPayload.TrainingSubTypeId);
                    }
                },

                onTrainingModeChange: function (trType) {
                    var sKey = parseInt(trType);
                    var oView = this.getView();
                    var oSubType = oView.byId("idTrSubType"),
                        oBindingSubType,
                        aFilter = [],
                        oView = this.getView();
                    if (sKey !== null) {
                        oSubType.clearSelection();
                        oSubType.setValue("");
                        oBindingSubType = oSubType.getBinding("items");
                        aFilter.push(new Filter("TrainingTypeId", FilterOperator.EQ, sKey));
                        oBindingSubType.filter(aFilter);
                    }
                },

                onTrainingTypeChange: function (oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oViewModel.setProperty("/TrainingDetails/RewardPoints", oEvent.getSource().getSelectedItem().getBindingContext().getObject().Points);
                    oViewModel.setProperty("/TrTypeText", oEvent.getSource().getSelectedItem().getBindingContext().getObject().TrainingSubType);
                },

                _fnChangeDivDepot: function (oChgdetl) {
                    var aSource = this.getModel("oModelView").getProperty(oChgdetl.src.path),
                        oSourceSet = new Set(aSource);

                    var aTarget = this.getModel("oModelView").getProperty(oChgdetl.target.localPath),
                        aNewTarget = [];

                    var oModel = this.getModel(), tempPath, tempdata;

                    aTarget.forEach(function (ele) {
                        if (typeof ele === "string") {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                Id: ele
                            });
                        }
                        else {
                            tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                                Id: ele[oChgdetl.target.targetKey]
                            });
                        }
                        tempdata = oModel.getData(tempPath);
                        if (oSourceSet.has(tempdata[oChgdetl.target.key])) {
                            aNewTarget.push(ele)
                        }
                    });

                    this.getModel("oModelView").setProperty(oChgdetl.target.localPath, aNewTarget);
                },

                onMultyZoneChange: function (oEvent) {
                    var sKeys = oEvent.getSource().getSelectedKeys();
                    var oDivision = this.getView().byId("idDivision");

                    this._fnChangeDivDepot({
                        src: { path: "/TrainingDetails/TrainingZone" },
                        target: { localPath: "/TrainingDetails/TrainingDivision", oDataPath: "/MasterDivisionSet", key: "Zone" }
                    });

                    this._fnChangeDivDepot({
                        src: { path: "/TrainingDetails/TrainingDivision" },
                        target: { localPath: "/TrainingDetails/TrainingDepot", oDataPath: "/MasterDepotSet", key: "Division", targetKey: "DepotId" }
                    });

                    var aDivFilter = [];
                    for (var y of sKeys) {
                        aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                    }
                    oDivision.getBinding("items").filter(aDivFilter);
                },

                onMultyDivisionChange: function (oEvent) {

                    this._fnChangeDivDepot({
                        src: { path: "/TrainingDetails/TrainingDivision" },
                        target: { localPath: "/TrainingDetails/TrainingDepot", oDataPath: "/MasterDepotSet", key: "Division", targetKey: "DepotId" }
                    });
                },

                onValueHelpRequestedDepot: function () {
                    this._oMultiInput = this.getView().byId("multiInputDepotAdd");
                    this.oColModel = new JSONModel({
                        cols: [
                            {
                                label: "Depot Id",
                                template: "Id",
                                width: "10rem",
                            },
                            {
                                label: "Depot",
                                template: "Depot",
                            }
                        ],
                    });

                    var aCols = this.oColModel.getData().cols;

                    this._oValueHelpDialog = sap.ui.xmlfragment(
                        "com.knpl.pragati.Training_Learning.view.fragments.DepotValueHelp",
                        this
                    );
                    this.getView().addDependent(this._oValueHelpDialog);

                    this._oValueHelpDialog.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/MasterDepotSet", events:
                                    {
                                        dataReceived: function () {
                                            this._oValueHelpDialog.update();
                                        }.bind(this)
                                    }
                                });
                            }

                            if (oTable.bindItems) {
                                oTable.bindAggregation("items", "/MasterDepotSet", function () {
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
                            path: "Depot",
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

                _getfilterforControl: function () {
                    var sDivision = this.getView().getModel("oModelView").getProperty("/TrainingDetails/TrainingDivision");
                    var aFilters = [];
                    if (sDivision) {
                        for (var y of sDivision) {
                            aFilters.push(new Filter("Division", FilterOperator.EQ, y));
                        }
                    }
                    if (aFilters.length == 0) {
                        return [];
                    }

                    return new Filter({
                        filters: aFilters,
                        and: false,
                    });
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
                                Depot: ele.getText(),
                                DepotId: ele.getKey()
                            });
                            xUnique.add(ele.getKey());
                        }
                    });

                    this.getView()
                        .getModel("oModelView")
                        .setProperty("/TrainingDetails/TrainingDepot", oData);
                    this._oValueHelpDialog.close();
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
                _fnValidationOnline: function (data) {
                    var oReturn = {
                        IsNotValid: false,
                        sMsg: []
                    },
                        url = data.Url,
                        aCtrlMessage = [];
                    var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                    if (data.TrainingSubTypeId === "" || data.TrainingSubTypeId === null) {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_PLS_SELECT_ERR_TRTYPE");
                        aCtrlMessage.push({
                            message: "MSG_PLS_SELECT_ERR_TRTYPE",
                            target: "/TrainingDetails/TrainingSubTypeId"
                        });
                    } else
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
                                                }
                                                else
                                                    if (data.TrainingQuestionnaire.length < 3) {
                                                        oReturn.IsNotValid = true;
                                                        oReturn.sMsg.push("MSG_PLEASE_ENTER_ATLEAST_THREE_QUESTIONS");
                                                        aCtrlMessage.push({
                                                            message: "MSG_PLEASE_ENTER_ATLEAST_THREE_QUESTIONS",
                                                            target: "/TrainingDetails/TrainingQuestionnaire"
                                                        });
                                                    }

                    if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
                    return oReturn;
                },

                _fnValidationOffline: function (data) {
                    var oReturn = {
                        IsNotValid: false,
                        sMsg: []
                    },
                        aCtrlMessage = [];
                    var fU = this.getView().byId("idAttendanceFileUploader");
                    var domRef = fU.getFocusDomRef();
                    var file = domRef.files[0];

                    if (data.TrainingSubTypeId === "" || data.TrainingSubTypeId === null) {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_PLS_SELECT_ERR_TRTYPE");
                        aCtrlMessage.push({
                            message: "MSG_PLS_SELECT_ERR_TRTYPE",
                            target: "/TrainingDetails/TrainingSubTypeId"
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
                                if (!file) {
                                    oReturn.IsNotValid = true;
                                    oReturn.sMsg.push("MSG_SELECT_ATTENDANCE_FILE");
                                    aCtrlMessage.push({
                                        message: "MSG_SELECT_ATTENDANCE_FILE"
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
                    if (data.TrainingSubTypeId === "" || data.TrainingSubTypeId === null) {
                        oReturn.IsNotValid = true;
                        oReturn.sMsg.push("MSG_PLS_SELECT_ERR_TRTYPE");
                        aCtrlMessage.push({
                            message: "MSG_PLS_SELECT_ERR_TRTYPE",
                            target: "/TrainingDetails/TrainingSubTypeId"
                        });
                    } else
                        if (data.Title === "") {
                            oReturn.IsNotValid = true;
                            oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTL");
                            aCtrlMessage.push({
                                message: "MSG_PLS_ENTER_ERR_TTL",
                                target: "/TrainingDetails/Title"
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
                                } else
                                    if (data.Duration === null || data.Duration === "") {
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
                                                }
                                                else
                                                    if (data.TrainingQuestionnaire.length < 3) {
                                                        oReturn.IsNotValid = true;
                                                        oReturn.sMsg.push("MSG_PLEASE_ENTER_ATLEAST_THREE_QUESTIONS");
                                                        aCtrlMessage.push({
                                                            message: "MSG_PLEASE_ENTER_ATLEAST_THREE_QUESTIONS",
                                                            target: "/TrainingDetails/TrainingQuestionnaire"
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

                CUOperationOnlineTraining: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                    oPayload.TrainingSubTypeId = parseInt(oPayload.TrainingSubTypeId);
                    if (oPayload.Url === "") {
                        oPayload.Url = "";
                    }

                    var Array = [];
                    for (var x of oPayload.TrainingZone) {
                        Array.push({
                            ZoneId: x,
                        });
                    }
                    oPayload.TrainingZone = Array;

                    Array = [];
                    for (var x of oPayload.TrainingDivision) {
                        Array.push({
                            DivisionId: x,
                        });
                    }
                    oPayload.TrainingDivision = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterTypeDetails) {
                        Array.push({
                            PainterTypeId: parseInt(x),
                        });
                    }
                    oPayload.TrainingPainterTypeDetails = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterArcheTypeDetails) {
                        Array.push({
                            PainterArcheTypeId: parseInt(x),
                        });
                    }
                    oPayload.TrainingPainterArcheTypeDetails = Array;

                    delete oPayload.Duration;
                    delete oPayload.LearningQuestionnaire;
                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this,
                        sPath = "/TrainingSet";

                    oClonePayload.TrainingDepot = oClonePayload.TrainingDepot.map(ele => ({ DepotId: ele.DepotId }));

                    that.getModel().create("/TrainingSet", oClonePayload, {
                        success: function (createddata) {
                            var newSpath = sPath + "(" + createddata.Id + ")";
                            that._UploadImageTr(newSpath, oViewModel.getProperty("/oImage")).then(that._SuccessAdd.bind(that, oEvent), that._Error
                                .bind(
                                    that))
                        },
                        error: this._Error.bind(this)
                    });
                },

                CUOperationVideo: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                    oPayload.Duration = parseInt(oPayload.Duration);
                    oPayload.TrainingSubTypeId = parseInt(oPayload.TrainingSubTypeId);

                    for (var i = 0; i < oPayload.TrainingQuestionnaire.length; i++) {
                        oPayload.LearningQuestionnaire.push(
                            {
                                Question: oPayload.TrainingQuestionnaire[i].Question,
                                IsArchived: oPayload.TrainingQuestionnaire[i].IsArchived,
                                LearningQuestionnaireOptions: oPayload.TrainingQuestionnaire[i].TrainingQuestionnaireOptions
                            }
                        );
                    }

                    var Array = [];
                    for (var x of oPayload.TrainingZone) {
                        Array.push({
                            ZoneId: x,
                        });
                    }
                    oPayload.TrainingZone = Array;

                    Array = [];
                    for (var x of oPayload.TrainingDivision) {
                        Array.push({
                            DivisionId: x,
                        });
                    }
                    oPayload.TrainingDivision = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterTypeDetails) {
                        Array.push({
                            PainterTypeId: parseInt(x),
                        });
                    }
                    oPayload.TrainingPainterTypeDetails = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterArcheTypeDetails) {
                        Array.push({
                            PainterArcheTypeId: parseInt(x),
                        });
                    }
                    oPayload.TrainingPainterArcheTypeDetails = Array;

                    delete oPayload.StartDate;
                    delete oPayload.EndDate;
                    delete oPayload.TrainingQuestionnaire;
                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this,
                        sPath = "/LearningSet";

                    oClonePayload.TrainingDepot = oClonePayload.TrainingDepot.map(ele => ({ DepotId: ele.DepotId }));

                    that.getModel().create("/LearningSet", oClonePayload, {
                        success: function (createddata) {
                            var newSpath = sPath + "(" + createddata.Id + ")";
                            that._UploadImageTr(newSpath, oViewModel.getProperty("/oImage")).then(that._SuccessAdd.bind(that, oEvent), that._Error
                                .bind(
                                    that))
                        },
                        error: this._Error.bind(this)
                    });
                },

                _UploadImageTr: function (sPath, oImage) {
                    var that = this;
                    return new Promise(function (res, rej) {
                        if (!oImage) {
                            res();
                            return;
                        }

                        var settings = {
                            url: "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value",
                            data: oImage.Image,
                            method: "PUT",
                            headers: that.getModel().getHeaders(),
                            contentType: "image/png",
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

                _UploadAttendanceOfflineTr: function (trSubTypeId) {
                    var that = this;
                    var fU = this.getView().byId("idAttendanceFileUploader");
                    var domRef = fU.getFocusDomRef();
                    var file = domRef.files[0];

                    var settings = {
                        url: "/KNPL_PAINTER_API/api/v2/odata.svc/UploadAttendanceSet(" + trSubTypeId + ")/$value",
                        data: file,
                        method: "PUT",
                        headers: that.getModel().getHeaders(),
                        contentType: "text/csv",
                        processData: false,
                        statusCode: {
                            206: function (result) {
                                that._SuccessOffline(result, 206);
                            },
                            200: function (result) {
                                that._SuccessOffline(result, 200);
                            },
                            202: function (result) {
                                that._SuccessOffline(result, 202);
                            },
                            400: function (result) {
                                that._SuccessOffline(result, 400);
                            }
                        },
                        error: function (error) {
                            that._Error(error);
                        }
                    };

                    $.ajax(settings);
                    // });
                },

                closeAttendanceStatusDialog: function () {
                    this.AttendanceUploadedStatusMsg.close();
                    MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_ATTENDANCE_UPDATED"));
                    this.getRouter().navTo("worklist", true);
                    var oModel = this.getModel();
                    oModel.refresh(true);
                },

                onDataExport: function (oEvent) {
                    var oExport = new Export({
                        // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                        exportType: new ExportTypeCSV({
                            separatorChar: ";"
                        }),

                        // Pass in the model created above
                        models: this.getView().getModel("oModelView"),

                        // binding information for the rows aggregation
                        rows: {
                            path: "/oResult"
                        },

                        // column definitions with column name and binding info for the content

                        columns: [{
                            name: "Row",
                            template: {
                                content: "{Row}"
                            }
                        }, {
                            name: "MobileNumber",
                            template: {
                                content: "{PainterMobile}"
                            }
                        }, {
                            name: "Attendance Date",
                            template: {
                                content: "{AttendedDate}"
                            }
                        }, {
                            name: "Message",
                            template: {
                                content: "{UploadMessage}"
                            }
                        }, {
                            name: "Status",
                            template: {
                                content: {
                                    parts: ["UploadStatus"],
                                    formatter: formatter.UploadStatus
                                }
                            }
                        }
                        ]
                    });

                    // download exported file
                    oExport.saveFile().catch(function (oError) {
                        MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                    }).then(function () {
                        oExport.destroy();
                    });
                },

                _Error: function (error) {
                    MessageToast.show(error.toString());
                },

                _SuccessOffline: function (result, oStatus) {
                    var that = this;
                    if (oStatus === 200 || oStatus === 202 || oStatus === 206) {
                        if (result.length == 0) {
                            that.showToast.call(that, "MSG_NO_RECORD_FOUND_IN_UPLOADED_FILE");
                        } else {
                            var oView = that.getView();
                            var oModelView = that.getModel("oModelView");
                            oModelView.setProperty("/oResult", result);
                            if (!that.AttendanceUploadedStatusMsg) {
                                // load asynchronous XML fragment
                                Fragment.load({
                                    id: oView.getId(),
                                    name: "com.knpl.pragati.Training_Learning.view.fragments.AttendanceUploadedStatusMsg",
                                    controller: that
                                }).then(function (oDialog) {
                                    // connect dialog to the root view 
                                    //of this component (models, lifecycle)
                                    oView.addDependent(oDialog);
                                    that.AttendanceUploadedStatusMsg = oDialog;
                                    oDialog.open();
                                });
                            } else {
                                that.AttendanceUploadedStatusMsg.open();
                            }
                        }
                    } else if (oStatus === 400) {
                        that.showToast.call(that, result.responseText);
                    }
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

                handleTypeMissmatch: function () {

                },

                onImageView: function (oEvent) {
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oThat = this;
                    if (!oThat.ImageDialog) {
                        Fragment.load({
                            name: "com.knpl.pragati.Training_Learning.view.fragments.ImageDialog",
                            controller: oThat,
                        }).then(
                            function (oDialog) {
                                oView.addDependent(oDialog);
                                oThat.ImageDialog = oDialog;
                                oDialog.open();
                            });
                    } else {
                        oThat.ImageDialog.open();
                    }
                },

                onPressCloseImageDialog: function () {
                    this.ImageDialog.close();
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
                }

            }
        );
    }
);