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
        "sap/ui/core/SeparatorItem",
        "sap/m/Token",
        'sap/ui/model/type/String',
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
        DateType,
        Filter,
        FilterOperator,
        DateFormat,
        History,
        SeparatorItem,
        Token,
        typeString,
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
                        Search: {
                            Attendance: "",
                            Enrollment: ""
                        },
                        TrainingDetails: {
                        }
                    });
                    this.setModel(oViewModel, "oModelView");

                    var oRouter = this.getOwnerComponent().getRouter(this);
                    oRouter
                        .getRoute("RouteTrainingTab")
                        .attachMatched(this._onRouteMatched, this);
                },
                _onRouteMatched: function (oEvent) {
                    var oProp = oEvent.getParameter("arguments").prop;
                    var mode = oEvent.getParameter("arguments").mode;
                    var trainingType = oEvent.getParameter("arguments").trtype;

                    var that = this;
                    var oViewModel = this.getModel("oModelView");
                    var oView = this.getView();

                    //FIX: Need pop for changes
                    oViewModel.setProperty("/bChange", false);
                    oViewModel.detachPropertyChange(this.onModelPropertyChange, this);

                    var oData = {
                        modeEdit: false,
                        bindProp: oProp,
                        trainingId: oProp.replace(/[^0-9]/g, ""),
                        ProfilePic: "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value",
                        Search: {
                            Attendance: "",
                            Enrollment: ""
                        }
                    };

                    var aArray = [];

                    oViewModel.setProperty("/ProfilePic", oData.ProfilePic);
                    oViewModel.setProperty("/ProfilePicHeader", oData.ProfilePic);

                    oViewModel.setProperty("/trainingId", oData.trainingId);
                    oViewModel.setProperty("/Search/Attendance", "");
                    oViewModel.setProperty("/Search/Enrollment", "");

                    this.getModel("appView").setProperty("/trainingType", trainingType);
                    var sPath = "/" + oProp;
                    var params;
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        params = "Creator, TrainingZone, TrainingDivision, TrainingDepot, TrainingPainterTypeDetails, TrainingPainterArcheTypeDetails, TrainingType, TrainingSubTypeDetails, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions";
                    } else {
                        params = "Creator, TrainingZone, TrainingDivision, TrainingDepot, TrainingPainterTypeDetails, TrainingPainterArcheTypeDetails, TrainingType, TrainingSubTypeDetails, LearningQuestionnaire, LearningQuestionnaire/LearningQuestionnaireOptions";
                    }
                    oViewModel.setProperty("/sPath", sPath);
                    that.getModel().read(sPath, {
                        urlParameters: {
                            "$expand": params
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

                                var dateValue = data.StartDate.toDateString();
                                var timeValue = data.StartDate.toLocaleTimeString();
                                var patternDate = "dd/MM/yyyy hh:mm a";
                                var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                                    pattern: patternDate
                                });
                                var oDateTime = dateValue + " " + timeValue;
                                var oNow = new Date(oDateTime);
                                data.ViewStartDate = oDateFormat.format(oNow);

                                dateValue = data.EndDate.toDateString();
                                timeValue = data.EndDate.toLocaleTimeString();
                                oDateTime = dateValue + " " + timeValue;
                                oNow = new Date(oDateTime);
                                data.ViewEndDate = oDateFormat.format(oNow);

                                that._initFilerForTablesEnrollment(data.Id);
                                var TrainingVideoDetails = that.getView().getModel("i18n").getResourceBundle().getText("OnlineTrainingDetails");
                            }

                            if (trainingType === 'VIDEO') {
                                if (data.LearningQuestionnaire) {
                                    data.LearningQuestionnaire.results.forEach(function (ele) {
                                        if (ele.LearningQuestionnaireOptions && ele.LearningQuestionnaireOptions.results.length) {
                                            ele.TrainingQuestionnaireOptions = ele.LearningQuestionnaireOptions.results;
                                        } else {
                                            ele.TrainingQuestionnaireOptions = [];
                                        }
                                    })

                                    data.TrainingQuestionnaire = data.LearningQuestionnaire.results;
                                } else {
                                    data.TrainingQuestionnaire = [];
                                }
                                data.LearningQuestionnaire = [];

                                oViewModel.setProperty("/TrainingDetails/LearningQuestionnaire", []);
                                that._initFilerForTablesVideoEnrollment(data.Id);
                                var TrainingVideoDetails = that.getView().getModel("i18n").getResourceBundle().getText("VideoTrainingDetails");
                            }

                            aArray = [];
                            if (data.TrainingZone && data.TrainingZone.results) {
                                for (var x of data["TrainingZone"]["results"]) {
                                    aArray.push(x["ZoneId"]);
                                }
                            }
                            data.TrainingZone = aArray;

                            aArray = [];
                            if (data.TrainingDivision && data.TrainingDivision.results) {
                                for (var y of data["TrainingDivision"]["results"]) {
                                    aArray.push(y["DivisionId"]);
                                }
                            }
                            data.TrainingDivision = aArray;

                            aArray = [];
                            if (data.TrainingDepot && data.TrainingDepot.results) {
                                for (var z of data["TrainingDepot"]["results"]) {
                                    aArray.push(z["DepotId"]);
                                }
                                data.TrainingDepot = data.TrainingDepot.results;
                            } else {
                                data.TrainingDepot = aArray;  // for edit in Edit Training and will be used in payload
                            }
                            oViewModel.setProperty("/displayDepots", aArray); // to display in view training

                            aArray = [];
                            if (data.TrainingPainterTypeDetails && data.TrainingPainterTypeDetails.results) {
                                for (var p of data["TrainingPainterTypeDetails"]["results"]) {
                                    aArray.push(p["PainterTypeId"]);
                                }
                            }
                            data.TrainingPainterTypeDetails = aArray;

                            aArray = [];
                            if (data.TrainingPainterArcheTypeDetails && data.TrainingPainterArcheTypeDetails.results) {
                                for (var q of data["TrainingPainterArcheTypeDetails"]["results"]) {
                                    aArray.push(q["PainterArcheTypeId"]);
                                }
                            }
                            data.TrainingPainterArcheTypeDetails = aArray;

                            if (trainingType === 'OFFLINE') {
                                that._initFilerForTablesAttendance(data.Id);
                                var TrainingVideoDetails = that.getView().getModel("i18n").getResourceBundle().getText("OfflineTrainingDetails");
                            }
                            oViewModel.setProperty("/TrainingVideoDetails", TrainingVideoDetails);

                            oViewModel.setProperty("/TrainingDetails", data);
                            oViewModel.setProperty("/__metadata", data.__metadata);

                            if (mode === 'edit') {
                                that.handleEditPress(mode);
                            } else {
                                if (trainingType === 'ONLINE' || trainingType === 'VIDEO') {
                                    that._loadEditTrainingDetail(mode);
                                    that._loadEditQuestion(mode);
                                }
                            }
                        }
                    })
                },

                onTablesSearch: function (oEvent) {
                    var oView = this.getView();
                    var sPath = oEvent.getSource().getBinding("value").getPath();
                    var sValue = oEvent.getSource().getValue();
                    var sTrainingId = oView
                        .getModel("oModelView")
                        .getProperty("/trainingId");
                    if (sPath.match("Attendance")) {
                        this._SearchAttendance(sValue, sTrainingId);
                    } else if (sPath.match("Enrollment")) {
                        this._SearchEnrollment(sValue, sTrainingId);
                    }
                },

                _SearchAttendance: function (sValue, sTrainingId) {
                    var oView = this.getView();
                    var aCurrentFilter = [];

                    var oTable = oView.byId("idTblAttendance");
                    if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                        aCurrentFilter.push(
                            new Filter(
                                [
                                    new Filter(
                                        "PainterDetails/Mobile",
                                        FilterOperator.Contains,
                                        sValue.trim().substring(0, 8)
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
                                        "tolower(PainterDetails/Name)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/MembershipCard)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),

                                ],
                                false
                            )
                        );
                    }
                    aCurrentFilter.push(
                        new Filter("TrainingId", FilterOperator.EQ, parseInt(sTrainingId))
                    );
                    var endFilter = new Filter({
                        filters: aCurrentFilter,
                        and: true,
                    });

                    oTable.getBinding("items").filter(endFilter);
                },

                _SearchEnrollment: function (sValue, sTrainingId) {
                    var oView = this.getView();
                    var aCurrentFilter = [];

                    var oTable = oView.byId("idTblEnrollment");
                    if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                        aCurrentFilter.push(
                            new Filter(
                                [
                                    new Filter(
                                        "PainterDetails/Mobile",
                                        FilterOperator.Contains,
                                        sValue.trim().substring(0, 8)
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
                                        "tolower(PainterDetails/Name)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/MembershipCard)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),

                                ],
                                false
                            )
                        );
                    }
                    aCurrentFilter.push(
                        new Filter("TrainingId", FilterOperator.EQ, parseInt(sTrainingId))
                    );
                    var endFilter = new Filter({
                        filters: aCurrentFilter,
                        and: true,
                    });

                    oTable.getBinding("items").filter(endFilter);
                },

                // fmtStatus: function (mParam) {
                //     var sLetter = "";
                //     if (mParam) {
                //         sLetter = mParam
                //             .toLowerCase()
                //             .split(" ")
                //             .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                //             .join(" ");
                //     }
                //     return sLetter;
                // },

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
                    this._oMultiInput = this.getView().byId("multiInputDepotEdit");
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
                                // Depot: ele.getText(),
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

                onCancel: function () {
                    debugger;
                    if (this.getModel("oModelView").getProperty("/bChange")) {
                        this.showWarning("MSG_PENDING_CHANGES", this.navToHome);
                    }
                    else {
                        this.navToHome();
                    }
                },

                onAfterRendering: function () {
                    //Init Validation framework
                    this._initMessage();
                },

                onActiveInActive: function (oEvent) {
                    var sPath = this.getModel("oModelView").getProperty("/sPath");
                    var sData = this.getModel("oModelView").getProperty("/TrainingDetails");
                    var data = sPath + "/Status";
                    var that = this;
                    var oModel = that.getModel();
                    if (sData.Status === 0) {
                        if (sData.Url === "") {
                            that.showToast.call(that, "MSG_PLEASE_ADD_URL_BEFORE_ACTIVATING_TRAINING");
                        } else if (sData.TrainingZone.length == 0) {
                            that.showToast.call(that, "MSG_PLEASE_ADD_ZONE_BEFORE_ACTIVATING_TRAINING");
                        } else if (sData.TrainingDivision.length == 0) {
                            that.showToast.call(that, "MSG_PLEASE_ADD_DIVISION_BEFORE_ACTIVATING_TRAINING");
                        } else if (sData.TrainingDepot.length == 0) {
                            that.showToast.call(that, "MSG_PLEASE_ADD_DEPOT_BEFORE_ACTIVATING_TRAINING");
                        } else if (sData.TrainingPainterTypeDetails.length == 0) {
                            that.showToast.call(that, "MSG_PLEASE_ADD_PAINTER_TYPE_BEFORE_ACTIVATING_TRAINING");
                        } else if (sData.TrainingPainterArcheTypeDetails.length == 0) {
                            that.showToast.call(that, "MSG_PLEASE_ADD_PAINTER_ARCHETYPE_BEFORE_ACTIVATING_TRAINING");
                        } else {
                            that.getModel().update(data, {
                                Status: 1
                            }, {
                                success: function () {
                                    that.showToast.bind(that, "MSG_SUCCESS_ACTIVATED_SUCCESSFULLY");
                                    oModel.refresh(true);
                                    that.getRouter().navTo("worklist", true);
                                }
                            });
                        }
                    }
                    if (sData.Status === 1) {
                        that.getModel().update(data, {
                            Status: 0
                        }, {
                            success: function () {
                                that.showToast.bind(that, "MSG_SUCCESS_DEACTIVATED_SUCCESSFULLY");
                                oModel.refresh(true);
                                that.getRouter().navTo("worklist", true);
                            }
                        });
                    }
                    if (sData.Status === 2) {
                        that.showToast.call(that, "MSG_EXPIRED_TRAININGS_CANT_BE_CHANGED");
                    }
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
                 * Save edit or create FAQ details 
                 */
                handleSavePress: function (oEvent) {
                    this._oMessageManager.removeAllMessages();
                    var oViewModel = this.getModel("oModelView");
                    var oPayload = {};
                    $.extend(true, oPayload, oViewModel.getProperty("/TrainingDetails"));
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    if (trainingType === 'ONLINE') {
                        var oValid = this._fnValidationOnline(oPayload);
                    } else if (trainingType === 'VIDEO') {
                        var oValid = this._fnValidationVideo(oPayload);
                    }

                    if (oValid.IsNotValid) {
                        this.showError(this._fnMsgConcatinator(oValid.sMsg));
                        return;
                    }
                    oViewModel.setProperty("/busy", true);
                    if (trainingType === 'ONLINE') {
                        this.CUOperationOnlineTraining(oPayload, oEvent);
                    } else if (trainingType === 'VIDEO') {
                        this.CUOperationVideo(oPayload, oEvent);
                    }
                },

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
                                            // if (data.RewardPoints === "" || data.RewardPoints === null) {
                                            //     oReturn.IsNotValid = true;
                                            //     oReturn.sMsg.push("MSG_PLS_ENTER_ERR_REWARD");
                                            //     aCtrlMessage.push({
                                            //         message: "MSG_PLS_ENTER_ERR_REWARD",
                                            //         target: "/TrainingDetails/RewardPoints"
                                            //     });
                                            // } else
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
                                            // if (data.RewardPoints === "" || data.RewardPoints === null) {
                                            //     oReturn.IsNotValid = true;
                                            //     oReturn.sMsg.push("MSG_PLS_ENTER_ERR_REWARD");
                                            //     aCtrlMessage.push({
                                            //         message: "MSG_PLS_ENTER_ERR_REWARD",
                                            //         target: "/TrainingDetails/RewardPoints"
                                            //     });
                                            // } else
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
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.Status = parseInt(oPayload.Status);
                    oPayload.TrainingSubTypeId = parseInt(oPayload.TrainingSubTypeId);
                    if (oPayload.RewardPoints === null) {
                        oPayload.RewardPoints = 0;
                    }
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);

                    delete oPayload.Duration;
                    delete oPayload.ViewStartDate;
                    delete oPayload.ViewEndDate;

                    var Array = [];
                    for (var x of oPayload.TrainingZone) {
                        Array.push({
                            ZoneId: x,
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingZone = Array;

                    Array = [];
                    for (var x of oPayload.TrainingDivision) {
                        Array.push({
                            DivisionId: x,
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingDivision = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterTypeDetails) {
                        Array.push({
                            PainterTypeId: parseInt(x),
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingPainterTypeDetails = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterArcheTypeDetails) {
                        Array.push({
                            PainterArcheTypeId: parseInt(x),
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingPainterArcheTypeDetails = Array;

                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this;

                    // Quick fix Training zone depot PainterType PainterArcheType
                    if (oClonePayload.TrainingDepot && oClonePayload.TrainingDepot.results) {
                        oClonePayload.TrainingDepot = oClonePayload.TrainingDepot.results;
                    }

                    var sKey = that.getModel().createKey("/TrainingSet", {
                        Id: oClonePayload.Id
                    });

                    that.getModel().update(sKey, oClonePayload, {
                        success: that._UploadImageforVideo(sKey, oViewModel.getProperty("/ProfilePic")).then(that._Success.bind(that, oEvent), that._Error.bind(
                            that)),
                        error: that._Error.bind(that)
                    });
                },

                CUOperationVideo: function (oPayload, oEvent) {
                    var oViewModel = this.getModel("oModelView");
                    oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                    oPayload.Status = parseInt(oPayload.Status);
                    oPayload.TrainingSubTypeId = parseInt(oPayload.TrainingSubTypeId);
                    oPayload.Duration = parseInt(oPayload.Duration);
                    if (oPayload.RewardPoints === null) {
                        oPayload.RewardPoints = 0;
                    }
                    oPayload.RewardPoints = parseInt(oPayload.RewardPoints);

                    for (var i = 0; i < oPayload.TrainingQuestionnaire.length; i++) {
                        oPayload.LearningQuestionnaire.push(
                            {
                                Question: oPayload.TrainingQuestionnaire[i].Question,
                                IsArchived: oPayload.TrainingQuestionnaire[i].IsArchived,
                                LearningQuestionnaireOptions: oPayload.TrainingQuestionnaire[i].TrainingQuestionnaireOptions
                            }
                        );
                    }

                    delete oPayload.StartDate;
                    delete oPayload.EndDate;
                    delete oPayload.TrainingQuestionnaire;

                    var Array = [];
                    for (var x of oPayload.TrainingZone) {
                        Array.push({
                            ZoneId: x,
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingZone = Array;

                    Array = [];
                    for (var x of oPayload.TrainingDivision) {
                        Array.push({
                            DivisionId: x,
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingDivision = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterTypeDetails) {
                        Array.push({
                            PainterTypeId: parseInt(x),
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingPainterTypeDetails = Array;

                    Array = [];
                    for (var x of oPayload.TrainingPainterArcheTypeDetails) {
                        Array.push({
                            PainterArcheTypeId: parseInt(x),
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingPainterArcheTypeDetails = Array;

                    var oClonePayload = $.extend(true, {}, oPayload),
                        that = this;

                    debugger;
                    //Quick fix Training zone depot PainterType PainterArchType
                    if (oClonePayload.TrainingDepot && oClonePayload.TrainingDepot.results) {
                        oClonePayload.TrainingDepot = oClonePayload.TrainingDepot.results;
                    }

                    var sKey = that.getModel().createKey("/LearningSet", {
                        Id: oClonePayload.Id
                    });
                    that.getModel().update(sKey, oClonePayload, {
                        success: that._UploadImageforVideo(sKey, oViewModel.getProperty("/ProfilePic")).then(that._Success.bind(that, oEvent), that._Error.bind(
                            that)),
                        error: that._Error.bind(that)
                    });
                },

                _Error: function (error) {
                    MessageToast.show(error.toString());
                },

                _Success: function () {
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                        MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_TRAINING_UPATE"));
                    } else {
                        MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_UPDATE"));
                    }
                    var oModel = this.getModel();
                    oModel.refresh(true);
                    this.getRouter().navTo("worklist", true);
                    this.getModel().setProperty("/busy", false);
                },

                onUpload: function (oEvent) {
                    this.getModel("oModelView").setProperty("/bChange", true);
                    var oFile = oEvent.getSource().FUEl.files[0];
                    this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
                },

                onImageView: function (oEvent) {
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oThat = this;
                    if (!oThat.EditImageDialog) {
                        Fragment.load({
                            name: "com.knpl.pragati.Training_Learning.view.fragments.EditImageDialog",
                            controller: oThat,
                        }).then(
                            function (oDialog) {
                                oView.addDependent(oDialog);
                                oThat.EditImageDialog = oDialog;
                                oDialog.open();
                            });
                    } else {
                        oThat.EditImageDialog.open();
                    }
                },

                onPressCloseImageDialog: function () {
                    this.EditImageDialog.close();
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
                    this.getModel("oModelView").setProperty("/ProfilePic", {
                        Image: oItem.Image,
                        FileName: oItem.name,
                        IsArchived: false
                    });

                    this.getModel("oModelView").refresh();
                },

                _UploadImageforVideo: function (sPath, oImage, oEvent) {
                    var that = this;
                    if (oImage.Image) {
                        var url = "/KNPL_PAINTER_API/api/v2/odata.svc" + sPath + "/$value";
                    }
                    return new Promise(function (res, rej) {
                        if (!oImage.Image) {
                            res();
                            return;
                        }

                        var settings = {
                            url: url,
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

                _initFilerForTablesEnrollment: function (trainingId) {
                    debugger;
                    var oView = this.getView();
                    var aFilters = new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                            new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                        ],
                        and: true
                    });
                    oView.byId("idTblEnrollment").getBinding("items").filter(aFilters);
                },

                _initFilerForTablesVideoEnrollment: function (trainingId) {
                    debugger;
                    var oView = this.getView();
                    var aFilters = new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                            new sap.ui.model.Filter('LearningId', sap.ui.model.FilterOperator.EQ, trainingId)
                        ],
                        and: true
                    });
                    oView.byId("idVdTblEnrollment").getBinding("items").filter(aFilters);
                },

                _initFilerForTablesAttendance: function (trainingId) {
                    var oView = this.getView();
                    var aFilters = new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                            new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                        ],
                        and: true
                    });
                    oView.byId("idTblAttendance").getBinding("items").filter(aFilters);
                },

                handleEditPress: function (mode) {
                    var othat = this;
                    // othat.getView().getModel("oModelView").refresh(true);
                    Promise.all([othat._loadEditTrainingDetail(mode), othat._loadEditQuestion(mode)]).then(function () {
                        //FIX: POP on cancel
                        // debugger;
                        // othat.getModel("oModelView").attachPropertyChange("oModelView", othat.onModelPropertyChange, othat);
                    })
                },

                _loadEditTrainingDetail: function (mode) {
                    // var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oVboxProfile = oView.byId("idVbTrDetails");
                    var sFragName = mode == "edit" ? "EditTraining" : "ViewTraining";
                    oVboxProfile.destroyItems();
                    debugger;
                    return new Promise(function (res, rej) {
                        Fragment.load({
                            id: oView.getId(),
                            controller: othat,
                            name: "com.knpl.pragati.Training_Learning.view.fragments." + sFragName,
                        }).then(function (oControlProfile) {
                            oView.addDependent(oControlProfile);
                            oVboxProfile.addItem(oControlProfile);
                            var trainingType = othat.getModel("appView").getProperty("/trainingType");
                            var TrainingDetails = othat.getModel("oModelView").getProperty("/TrainingDetails");
                            if (mode === 'edit') {
                                if (trainingType === 'ONLINE' || trainingType === 'VIDEO') {
                                    var oDivision = oView.byId("idDivision");
                                    var aDivFilter = [];
                                    for (var y of TrainingDetails.TrainingZone) {
                                        aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                                    }
                                    oDivision.getBinding("items").filter(aDivFilter);
                                }
                            }

                            res();
                            // promise.resolve();
                            // return promise;
                        });

                    })
                },

                _loadEditQuestion: function (mode) {
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var othat = this;
                    var oVboxProfile = oView.byId("idVbQuestionnaire");
                    var sFragName = mode == "edit" ? "EditQuestionnaire" : "Questionnaire";
                    oVboxProfile.destroyItems();
                    return new Promise(function (res, rej) {
                        Fragment.load({
                            id: oView.getId(),
                            controller: othat,
                            name: "com.knpl.pragati.Training_Learning.view.fragments." + sFragName,
                        }).then(function (oControlProfile) {
                            oView.addDependent(oControlProfile);
                            oVboxProfile.addItem(oControlProfile);
                            // promise.resolve();
                            res();
                        });
                    })
                }

            }
        );
    }
);
