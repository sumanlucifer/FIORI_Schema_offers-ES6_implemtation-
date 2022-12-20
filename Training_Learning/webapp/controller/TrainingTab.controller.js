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
        "sap/ui/model/type/String",
        "sap/m/ObjectStatus",
        "sap/ui/core/util/Export",
        "sap/ui/core/util/ExportTypeCSV",
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
        ObjectStatus,
        Export,
        ExportTypeCSV,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Training_Learning.controller.TrainingTab", {
            formatter: formatter,
            onInit: function () {

                var oViewModel = new JSONModel({
                    busy: false,
                    currDate: new Date(),
                    Search: {
                        Attendance: "",
                        Enrollment: "",
                        AttendanceLive: ""
                    },
                    TrainingDetails: {}
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
                oViewModel.setProperty("/matched", true);

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
                    params = "Creator, TrainingZone, TrainingDivision, TrainingDepot, TrainingPainters/PainterDetails, TrainingPainterTypeDetails, TrainingPainterArcheTypeDetails, TrainingType, TrainingSubTypeDetails, TrainingQuestionnaire/TrainingQuestionnaireLocalized,TrainingQuestionnaire/TrainingQuestionnaireOptions/TrainingQuestionnaireOptionsLocalized,UpdatedByDetails";
                } else {
                    params = "Creator, TrainingZone, TrainingDivision, TrainingDepot, TrainingPainters/PainterDetails, TrainingPainterTypeDetails, TrainingPainterArcheTypeDetails, TrainingType, TrainingSubTypeDetails, LearningQuestionnaire/LearningQuestionnaireLocalized,LearningQuestionnaire/LearningQuestionnaireOptions/LearningQuestionnaireOptionsLocalized,UpdatedByDetails";
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

                                        ele.TrainingQuestionnaireOptions.results.forEach(function (ele) {
                                            if (ele.TrainingQuestionnaireOptionsLocalized.results && ele.TrainingQuestionnaireOptionsLocalized.results.length) {

                                                ele.TrainingQuestionnaireOptionsLocalized = ele.TrainingQuestionnaireOptionsLocalized.results;
                                            } else {
                                                ele.TrainingQuestionnaireOptionsLocalized = [];
                                            }
                                        })

                                        ele.TrainingQuestionnaireOptions = ele.TrainingQuestionnaireOptions.results;
                                    } else {
                                        ele.TrainingQuestionnaireOptions = [];
                                    }
                                    if (ele.TrainingQuestionnaireLocalized && ele.TrainingQuestionnaireLocalized.results.length) {
                                        ele.TrainingQuestionnaireLocalized = ele.TrainingQuestionnaireLocalized.results;
                                    } else {
                                        ele.TrainingQuestionnaireLocalized = [];
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
                            that._initFilerForTablesLiveAttendance(data.Id);
                        }

                        if (trainingType === 'VIDEO') {
                            if (data.LearningQuestionnaire) {
                                data.LearningQuestionnaire.results.forEach(function (ele) {
                                    if (ele.LearningQuestionnaireOptions && ele.LearningQuestionnaireOptions.results.length) {

                                        ele.LearningQuestionnaireOptions.results.forEach(function (ele) {
                                            if (ele.LearningQuestionnaireOptionsLocalized.results && ele.LearningQuestionnaireOptionsLocalized.results.length) {

                                                ele.TrainingQuestionnaireOptionsLocalized = ele.LearningQuestionnaireOptionsLocalized.results;
                                            } else {
                                                ele.TrainingQuestionnaireOptionsLocalized = [];
                                            }
                                        })

                                        ele.TrainingQuestionnaireOptions = ele.LearningQuestionnaireOptions.results;
                                    } else {
                                        ele.TrainingQuestionnaireOptions = [];
                                    }
                                    if (ele.LearningQuestionnaireLocalized && ele.LearningQuestionnaireLocalized.results.length) {
                                        ele.TrainingQuestionnaireLocalized = ele.LearningQuestionnaireLocalized.results;
                                    } else {
                                        ele.TrainingQuestionnaireLocalized = [];
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
                            data.TrainingDepot = aArray; // for edit in Edit Training and will be used in payload
                        }
                        oViewModel.setProperty("/displayDepots", aArray); // to display in view training

                        aArray = [];
                        var editPainters = [];
                        if (data.TrainingPainters && data.TrainingPainters.results) {
                            // for (var r of data["TrainingPainters"]["results"]) {
                            //     aArray.push(r["PainterId"]);
                            // }
                            for (var r of data.TrainingPainters.results) {
                                editPainters.push({
                                    PainterId: r.PainterId,
                                    Name: r.PainterDetails.Name
                                });
                                aArray.push(r["PainterId"]);
                            }
                            data.TrainingPainters = editPainters;
                        } else {
                            data.TrainingPainters = aArray; // for edit in Edit Training and will be used in payload
                        }
                        oViewModel.setProperty("/displayPainters", aArray); // to display in view training

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

            onExportEnrollment: function (oEvent) {
                var that = this;
                var trainingId = this.getModel("oModelView").getProperty("/TrainingDetails/Id");
                var aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                    ],
                    and: true
                });
                that.getModel().read("/PainterTrainingSet", {
                    urlParameters: {
                        "$expand": "PainterDetails/PrimaryDealerDetails"
                    },
                    filters: [aFilters],
                    success: function (data) {
                        that.getModel("oModelView").setProperty("/TrainingEnrollments", data.results);

                        var oExport = new Export({
                            // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                            exportType: new ExportTypeCSV({
                                separatorChar: "\t",
                                mimeType: "application/vnd.ms-excel",
                                charset: "utf-8",
                                fileExtension: "xls",

                            }),
                            // Pass in the model created above
                            models: that.getView().getModel("oModelView"),

                            // binding information for the rows aggregation
                            rows: {
                                path: "/TrainingEnrollments"
                            },

                            // column definitions with column name and binding info for the content

                            columns: [{
                                name: "Name",
                                template: {
                                    content: "{PainterDetails/Name}"
                                }
                            }, {
                                name: "Membership Id",
                                template: {
                                    content: "{PainterDetails/MembershipCard}"
                                }
                            }, {
                                name: "Mobile Number",
                                template: {
                                    content: "{PainterDetails/Mobile}"
                                }
                            }, {
                                name: "Zone",
                                template: {
                                    content: "{PainterDetails/ZoneId}"
                                }
                            }, {
                                name: "Division",
                                template: {
                                    content: "{PainterDetails/DivisionId}"
                                }
                            }, {
                                name: "Depot",
                                template: {
                                    content: "{PainterDetails/DepotId}"
                                }
                            }, {
                                name: "Primary Dealer",
                                template: {
                                    content: "{PainterDetails/PrimaryDealerDetails/DealerName}"
                                }
                            }, {
                                name: "Enrollment Date",
                                template: {
                                    content: {
                                        parts: ["CreatedAt"],
                                        formatter: formatter.formatDate,
                                    }
                                }
                            }, {
                                name: "Earned Points",
                                template: {
                                    content: "{EarnedPoints}"
                                }
                            }]
                        });

                        // download exported file
                        var createdAt = new Date();
                        createdAt = formatter.formatDate(createdAt);
                        var fileName = "Live Enrollment_" + that.getModel("oModelView").getProperty("/TrainingDetails/Title") + "_" + createdAt;
                        oExport.saveFile(fileName).catch(function (oError) {
                            MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                        }).then(function () {
                            oExport.destroy();
                        });
                    }
                });

            },

            onExportAttendenceLive: function () {
                var that = this;
                var trainingId = this.getModel("oModelView").getProperty("/TrainingDetails/Id");
                var aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                    ],
                    and: true
                });
                that.getModel().read("/PainterTrainingSet", {
                    urlParameters: {
                        "$expand": "PainterDetails/PrimaryDealerDetails"
                    },
                    filters: [aFilters],
                    success: function (data) {
                        that.getModel("oModelView").setProperty("/AttendenceLive", data.results);

                        var oExport = new Export({
                            // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                            exportType: new ExportTypeCSV({
                                separatorChar: "\t",
                                mimeType: "application/vnd.ms-excel",
                                charset: "utf-8",
                                fileExtension: "xls"

                            }),
                            // Pass in the model created above
                            models: that.getView().getModel("oModelView"),

                            // binding information for the rows aggregation
                            rows: {
                                path: "/AttendenceLive"
                            },

                            // column definitions with column name and binding info for the content

                            columns: [{
                                name: "Name",
                                template: {
                                    content: "{PainterDetails/Name}"
                                }
                            }, {
                                name: "Membership Id",
                                template: {
                                    content: "{PainterDetails/MembershipCard}"
                                }
                            }, {
                                name: "Mobile Number",
                                template: {
                                    content: "{PainterDetails/Mobile}"
                                }
                            }, {
                                name: "Zone",
                                template: {
                                    content: "{PainterDetails/ZoneId}"
                                }
                            }, {
                                name: "Division",
                                template: {
                                    content: "{PainterDetails/DivisionId}"
                                }
                            }, {
                                name: "Depot",
                                template: {
                                    content: "{PainterDetails/DepotId}"
                                }
                            }, {
                                name: "Primary Dealer",
                                template: {
                                    content: "{PainterDetails/PrimaryDealerDetails/DealerName}"
                                }
                            }, {
                                name: "Attendance Date",
                                template: {
                                    content: {
                                        parts: ["AttendedAt"],
                                        formatter: formatter.formatDate,
                                    }
                                }
                            }, {
                                name: "Earned Points",
                                template: {
                                    content: "{EarnedPoints}"
                                }
                            }]
                        });

                        var createdAt = new Date();
                        createdAt = formatter.formatDate(createdAt);
                        var fileName = "Live Attendance_" + that.getModel("oModelView").getProperty("/TrainingDetails/Title") + "_" + createdAt;
                        // download exported file
                        oExport.saveFile(fileName).catch(function (oError) {
                            MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                        }).then(function () {
                            oExport.destroy();
                        });
                    }
                });
            },

            onExportViews: function (oEvent) {
                var that = this;
                var trainingId = this.getModel("oModelView").getProperty("/TrainingDetails/Id");
                var aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('LearningId', sap.ui.model.FilterOperator.EQ, trainingId)
                    ],
                    and: true
                });
                that.getModel().read("/PainterLearningSet", {
                    urlParameters: {
                        "$expand": "PainterDetails/PrimaryDealerDetails"
                    },
                    filters: [aFilters],
                    success: function (data) {
                        that.getModel("oModelView").setProperty("/TrainingEnrollments", data.results);

                        var oExport = new Export({
                            // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                            exportType: new ExportTypeCSV({
                                separatorChar: ";"
                            }),
                            // Pass in the model created above
                            models: that.getView().getModel("oModelView"),

                            // binding information for the rows aggregation
                            rows: {
                                path: "/TrainingEnrollments"
                            },

                            // column definitions with column name and binding info for the content

                            columns: [{
                                name: "Name",
                                template: {
                                    content: "{PainterDetails/Name}"
                                }
                            }, {
                                name: "Membership Id",
                                template: {
                                    content: "{PainterDetails/MembershipCard}"
                                }
                            }, {
                                name: "Mobile Number",
                                template: {
                                    content: "{PainterDetails/Mobile}"
                                }
                            }, {
                                name: "Zone",
                                template: {
                                    content: "{PainterDetails/ZoneId}"
                                }
                            }, {
                                name: "Division",
                                template: {
                                    content: "{PainterDetails/DivisionId}"
                                }
                            }, {
                                name: "Depot",
                                template: {
                                    content: "{PainterDetails/DepotId}"
                                }
                            }, {
                                name: "Primary Dealer",
                                template: {
                                    content: "{PainterDetails/PrimaryDealerDetails/DealerName}"
                                }
                            }, {
                                name: "View Date",
                                template: {
                                    content: {
                                        parts: ["CreatedAt"],
                                        formatter: formatter.formatDate,
                                    }
                                }
                            }, {
                                name: "Earned Points",
                                template: {
                                    content: "{EarnedPoints}"
                                }
                            }]
                        });

                        var createdAt = new Date();
                        createdAt = formatter.formatDate(createdAt);
                        var fileName = "Video Views_" + that.getModel("oModelView").getProperty("/TrainingDetails/Title") + "_" + createdAt;
                        // download exported file
                        oExport.saveFile(fileName).catch(function (oError) {
                            MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                        }).then(function () {
                            oExport.destroy();
                        });
                    }
                });

            },

            onExportAttendance: function (oEvent) {
                var that = this;
                var trainingId = this.getModel("oModelView").getProperty("/TrainingDetails/Id");
                var aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                    ],
                    and: true
                });
                that.getModel().read("/PainterTrainingSet", {
                    urlParameters: {
                        "$expand": "PainterDetails/PrimaryDealerDetails"
                    },
                    filters: [aFilters],
                    success: function (data) {
                        that.getModel("oModelView").setProperty("/TrainingEnrollments", data.results);

                        var oExport = new Export({
                            // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                            exportType: new ExportTypeCSV({
                                separatorChar: "\t",
                                mimeType: "application/vnd.ms-excel",
                                charset: "utf-8",
                                fileExtension: "xls"

                            }),
                            // Pass in the model created above
                            models: that.getView().getModel("oModelView"),

                            // binding information for the rows aggregation
                            rows: {
                                path: "/TrainingEnrollments"
                            },

                            // column definitions with column name and binding info for the content

                            columns: [{
                                name: "Name",
                                template: {
                                    content: "{PainterDetails/Name}"
                                }
                            }, {
                                name: "Membership Id",
                                template: {
                                    content: "{PainterDetails/MembershipCard}"
                                }
                            }, {
                                name: "Mobile Number",
                                template: {
                                    content: "{PainterDetails/Mobile}"
                                }
                            }, {
                                name: "Zone",
                                template: {
                                    content: "{PainterDetails/ZoneId}"
                                }
                            }, {
                                name: "Division",
                                template: {
                                    content: "{PainterDetails/DivisionId}"
                                }
                            }, {
                                name: "Depot",
                                template: {
                                    content: "{PainterDetails/DepotId}"
                                }
                            }, {
                                name: "Primary Dealer",
                                template: {
                                    content: "{PainterDetails/PrimaryDealerDetails/DealerName}"
                                }
                            }, {
                                name: "Attendance Date",
                                template: {
                                    content: {
                                        parts: ["AttendedAt"],
                                        formatter: formatter.formatDate,
                                    }
                                }
                            }, {
                                name: "Earned Points",
                                template: {
                                    content: "{EarnedPoints}"
                                }
                            }]
                        });

                        var createdAt = new Date();
                        createdAt = formatter.formatDate(createdAt);
                        var fileName = "Offline Attendance_" + that.getModel("oModelView").getProperty("/TrainingDetails/Title") + "_" + createdAt;
                        // download exported file
                        oExport.saveFile(fileName).catch(function (oError) {
                            MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                        }).then(function () {
                            oExport.destroy();
                        });
                    }
                });
            },

            onClearPainterSearch: function () {
                var aCurrentFilterValues = [];
                var oDataFilter = {
                    ZoneId: "",
                    DivisionId: "",
                    DepotId: "",
                    PainterType: "",
                    ArcheType: "",
                    MembershipCard: "",
                    Name: "",
                    MobileNo: ""
                };
                var oModel = new JSONModel(oDataFilter);
                this.getView().setModel(oModel, "PainterFilter");

                aCurrentFilterValues.push(new Filter({
                    path: "IsArchived",
                    operator: FilterOperator.EQ,
                    value1: false
                }))
                aCurrentFilterValues.push(new Filter({
                    path: "RegistrationStatus",
                    operator: FilterOperator.NotContains,
                    value1: "DEREGISTERED"
                }))
                aCurrentFilterValues.push(new Filter({
                    path: "ActivationStatus",
                    operator: FilterOperator.NotContains,
                    value1: "DEACTIVATED"
                }))

                this._filterTableP(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    })
                );
            },

            onClearDepotSearch: function () {
                var aCurrentFilterValues = [];
                var oDataFilter = {
                    Id: "",
                    Depot: "",
                };
                var oModel = new JSONModel(oDataFilter);
                this.getView().setModel(oModel, "DepotFilter");

                var sDivision = this.getView().getModel("oModelView").getProperty("/TrainingDetails/TrainingDivision");
                if (sDivision) {
                    for (var y of sDivision) {
                        aCurrentFilterValues.push(new Filter("Division", FilterOperator.EQ, y));
                    }
                }

                this._filterTable(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: false,
                    })
                );
            },

            onRadioBtnChange: function (oEvent) {
                var selectedIndex = oEvent.mParameters.selectedIndex;
                var oViewModel = this.getModel("oModelView");
                switch (selectedIndex) {
                    case 0:
                        this.getModel("oModelView").setProperty("/TrainingDetails/TrainingFilterType", "ALL");
                        oViewModel.setProperty("/TrainingDetails/TrainingZone", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingDivision", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingDepot", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainters", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainterTypeDetails", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainterArcheTypeDetails", []);
                        if (this._oValueHelpDialogP) {
                            this._oValueHelpDialogP.destroy();
                            delete this._oValueHelpDialogP;
                        }
                        break;
                    case 1:
                        this.getModel("oModelView").setProperty("/TrainingDetails/TrainingFilterType", "GROUP");
                        oViewModel.setProperty("/TrainingDetails/TrainingPainters", []);
                        if (this._oValueHelpDialogP) {
                            this._oValueHelpDialogP.destroy();
                            delete this._oValueHelpDialogP;
                        }
                        break;
                    case 2:
                        this.getModel("oModelView").setProperty("/TrainingDetails/TrainingFilterType", "PAINTER");
                        oViewModel.setProperty("/TrainingDetails/TrainingZone", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingDivision", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingDepot", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainterTypeDetails", []);
                        oViewModel.setProperty("/TrainingDetails/TrainingPainterArcheTypeDetails", []);
                        break;
                }
            },

            onTablesSearch: function (oEvent) {
                var oView = this.getView();
                var sPath = oEvent.getSource().getBinding("value").getPath();
                var sValue = oEvent.getSource().getValue();
                var sTrainingId = oView.getModel("oModelView").getProperty("/trainingId");
                var oTable;
                if (sPath.match("Attendance")) {
                    oTable = oView.byId("idTblAttendance");
                    this._SearchAttendance(oTable, sValue, sTrainingId);
                } else if (sPath.match("Enrollment")) {
                    this._SearchEnrollment(sValue, sTrainingId);
                } else if (sPath.match("AttendLive")) {
                    oTable = oView.byId("idTblAttendanceLiveVid");
                    this._SearchAttendance(oTable, sValue, sTrainingId);
                }
            },
            onTablesSearchlivAttend: function (oEvent) {
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

            onViewsSearch: function (oEvent) {
                var oView = this.getView();
                var sValue = oEvent.getSource().getValue();
                var sTrainingId = oView
                    .getModel("oModelView")
                    .getProperty("/trainingId");
                this._SearchView(sValue, sTrainingId);
            },

            _SearchAttendance: function (oTable, sValue, sTrainingId) {
                var oView = this.getView();
                var aCurrentFilter = [];

                if (sValue) {
                    if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                        aCurrentFilter.push(
                            new Filter(
                                [
                                    new Filter(
                                        "PainterDetails/Mobile",
                                        FilterOperator.Contains,
                                        sValue.trim().substring(0, 10)
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
                                    new Filter(
                                        "tolower(PainterDetails/ZoneId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/DivisionId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/DepotId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    )
                                    // new Filter(
                                    //     "tolower(PainterDetails/PrimaryDealerDetails/DealerName)",
                                    //     FilterOperator.Contains,
                                    //     "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    // )

                                ],
                                false
                            )
                        );
                    }
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
                if (sValue) {
                    if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                        aCurrentFilter.push(
                            new Filter(
                                [
                                    new Filter(
                                        "PainterDetails/Mobile",
                                        FilterOperator.Contains,
                                        sValue.trim().substring(0, 10)
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
                                    new Filter(
                                        "tolower(PainterDetails/ZoneId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/DivisionId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/DepotId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    )
                                    // new Filter(
                                    //     "tolower(PainterDetails/PrimaryDealerDetails/DealerName)",
                                    //     FilterOperator.Contains,
                                    //     "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    // )

                                ],
                                false
                            )
                        );
                    }
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

            _SearchView: function (sValue, sTrainingId) {
                var oView = this.getView();
                var aCurrentFilter = [];

                var oTable = oView.byId("idVdTblEnrollment");
                if (sValue) {
                    if (/^\+?(0|[1-9]\d*)$/.test(sValue)) {
                        aCurrentFilter.push(
                            new Filter(
                                [
                                    new Filter(
                                        "PainterDetails/Mobile",
                                        FilterOperator.Contains,
                                        sValue.trim().substring(0, 10)
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
                                    new Filter(
                                        "tolower(PainterDetails/ZoneId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/DivisionId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    ),
                                    new Filter(
                                        "tolower(PainterDetails/DepotId)",
                                        FilterOperator.Contains,
                                        "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    )
                                    // new Filter(
                                    //     "tolower(PainterDetails/PrimaryDealerDetails/DealerName)",
                                    //     FilterOperator.Contains,
                                    //     "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
                                    // )

                                ],
                                false
                            )
                        );
                    }
                }
                aCurrentFilter.push(
                    new Filter("LearningId", FilterOperator.EQ, parseInt(sTrainingId))
                );
                var endFilter = new Filter({
                    filters: aCurrentFilter,
                    and: true,
                });

                oTable.getBinding("items").filter(endFilter);
            },

            _fnChangeDivDepot: function (oChgdetl) {
                var aSource = this.getModel("oModelView").getProperty(oChgdetl.src.path),
                    oSourceSet = new Set(aSource);

                var aTarget = this.getModel("oModelView").getProperty(oChgdetl.target.localPath),
                    aNewTarget = [];

                var oModel = this.getModel(),
                    tempPath, tempdata;

                aTarget.forEach(function (ele) {
                    if (typeof ele === "string") {
                        tempPath = oModel.createKey(oChgdetl.target.oDataPath, {
                            Id: ele
                        });
                    } else {
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
                    src: {
                        path: "/TrainingDetails/TrainingZone"
                    },
                    target: {
                        localPath: "/TrainingDetails/TrainingDivision",
                        oDataPath: "/MasterDivisionSet",
                        key: "Zone"
                    }
                });

                this._fnChangeDivDepot({
                    src: {
                        path: "/TrainingDetails/TrainingDivision"
                    },
                    target: {
                        localPath: "/TrainingDetails/TrainingDepot",
                        oDataPath: "/MasterDepotSet",
                        key: "Division",
                        targetKey: "DepotId"
                    }
                });

                var aDivFilter = [];
                for (var y of sKeys) {
                    aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y))
                }

                oDivision.getBinding("items").filter(aDivFilter);
            },

            onMultyDivisionChange: function (oEvent) {
                this._fnChangeDivDepot({
                    src: {
                        path: "/TrainingDetails/TrainingDivision"
                    },
                    target: {
                        localPath: "/TrainingDetails/TrainingDepot",
                        oDataPath: "/MasterDepotSet",
                        key: "Division",
                        targetKey: "DepotId"
                    }
                });

            },

            onValueHelpRequestedDepot: function () {
                this._oMultiInput = this.getView().byId("multiInputDepotEdit");
                this.oColModel = new JSONModel({
                    cols: [{
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
                var oDataFilter = {
                    Id: "",
                    Depot: "",
                }
                var oModel = new JSONModel(oDataFilter);
                this.getView().setModel(oModel, "DepotFilter");
                this.getView().addDependent(this._oValueHelpDialog);

                this._oValueHelpDialog.getTableAsync().then(
                    function (oTable) {
                        oTable.setModel(this.oColModel, "columns");

                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", {
                                path: "/MasterDepotSet",
                                events: {
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

            _filterTableP: function (oFilter, sType) {
                var oValueHelpDialogP = this._oValueHelpDialogP;

                oValueHelpDialogP.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter, sType || "Application");
                    }

                    if (oTable.bindItems) {
                        oTable
                            .getBinding("items")
                            .filter(oFilter, sType || "Application");
                    }

                    oValueHelpDialogP.update();
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

            onZoneChange: function (oEvent) {
                var sId = oEvent.getSource().getSelectedKey();
                var oDivision = sap.ui.getCore().byId("idSingleDivision");
                var oDivItems = oDivision.getBinding("items");
                oDivision.clearSelection();
                oDivision.setValue("");
                oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
                //setting the data for depot;
                var oDepot = sap.ui.getCore().byId("idSingleDepot");
                oDepot.clearSelection();
                oDepot.setValue("");
            },

            onDivisionChange: function (oEvent) {
                var sKey = oEvent.getSource().getSelectedKey();
                var oDepot = sap.ui.getCore().byId("idSingleDepot");
                var oDepBindItems = oDepot.getBinding("items");
                oDepot.clearSelection();
                oDepot.setValue("");
                oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
            },

            onValueHelpRequestedPainter: function () {
                this._oMultiInput = this.getView().byId("multiInputPainterEdit");
                this.oColModel = new JSONModel({
                    cols: [{
                        label: "Membership ID",
                        template: "MembershipCard",
                    },
                    {
                        label: "Name",
                        template: "Name",
                    },
                    {
                        label: "Mobile Number",
                        template: "Mobile",
                    },
                    {
                        label: "Zone",
                        template: "ZoneId",
                    },
                    {
                        label: "Division",
                        template: "DivisionId",
                    },
                    {
                        label: "Depot",
                        template: "Depot/Depot",
                    },
                    {
                        label: "Painter Type",
                        template: "PainterType/PainterType",
                    },
                    {
                        label: "Painter ArcheType",
                        template: "ArcheType/ArcheType",
                    }
                    ]
                });

                var aCols = this.oColModel.getData().cols;
                var oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('RegistrationStatus', sap.ui.model.FilterOperator.NotContains, "DEREGISTERED"),
                        new sap.ui.model.Filter('ActivationStatus', sap.ui.model.FilterOperator.NotContains, "DEACTIVATED"),
                    ],
                    and: true
                });

                if (!this._oValueHelpDialogP) {
                    this._oValueHelpDialogP = sap.ui.xmlfragment(
                        "com.knpl.pragati.Training_Learning.view.fragments.PainterValueHelp",
                        this
                    );
                    var oDataFilter = {
                        ZoneId: "",
                        DivisionId: "",
                        DepotId: "",
                        PainterType: "",
                        ArcheType: "",
                        MembershipCard: "",
                        Name: "",
                        MobileNo: ""
                    }
                    var oModel = new JSONModel(oDataFilter);
                    this.getView().setModel(oModel, "PainterFilter")
                    this.getView().addDependent(this._oValueHelpDialogP);

                    this._oValueHelpDialogP.getTableAsync().then(
                        function (oTable) {
                            oTable.setModel(this.oColModel, "columns");

                            if (oTable.bindRows) {
                                oTable.bindAggregation("rows", {
                                    path: "/PainterSet",
                                    filters: [oFilter],
                                    parameters: {
                                        expand: "Depot,PainterType,ArcheType"
                                    },
                                    events: {
                                        dataReceived: function () {
                                            this._oValueHelpDialogP.update();
                                        }.bind(this)
                                    }
                                });
                            }

                            if (oTable.bindItems) {
                                oTable.bindAggregation("items", "/PainterSet", function () {
                                    return new sap.m.ColumnListItem({
                                        cells: aCols.map(function (column) {
                                            return new sap.m.Label({
                                                text: "{" + column.template + "}",
                                            });
                                        }),
                                    });
                                });
                            }

                            this._oValueHelpDialogP.update();
                        }.bind(this)
                    );

                    this._oValueHelpDialogP.setTokens(this._oMultiInput.getTokens());
                }
                this._oValueHelpDialogP.open();
            },

            onFilterBarSearchPainter: function (oEvent) {
                var afilterBar = oEvent.getParameter("selectionSet"),
                    aCurrentFilterValues = [];
                var oViewFilter = this.getView().getModel("PainterFilter").getData();
                var aFlaEmpty = true;
                for (let prop in oViewFilter) {
                    if (oViewFilter[prop]) {
                        if (prop === "ZoneId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
                            );
                        } else if (prop === "DivisionId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
                            );
                        } else if (prop === "DepotId") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter("DepotId", FilterOperator.EQ, oViewFilter[prop])
                            );
                        } else if (prop === "PainterType") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "PainterTypeId",
                                    operator: FilterOperator.EQ,
                                    value1: oViewFilter[prop]
                                })
                            );
                        } else if (prop === "ArcheType") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "ArcheTypeId",
                                    operator: FilterOperator.EQ,
                                    value1: oViewFilter[prop]
                                })
                            );
                        } else if (prop === "MembershipCard") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "MembershipCard",
                                    operator: FilterOperator.Contains,
                                    value1: oViewFilter[prop],
                                    caseSensitive: false
                                })
                            );
                        } else if (prop === "Name") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "Name",
                                    operator: FilterOperator.Contains,
                                    value1: oViewFilter[prop],
                                    caseSensitive: false
                                })
                            );
                        } else if (prop === "Mobile") {
                            aFlaEmpty = false;
                            aCurrentFilterValues.push(
                                new Filter({
                                    path: "Mobile",
                                    operator: FilterOperator.Contains,
                                    value1: oViewFilter[prop]
                                })
                            );
                        }
                    }
                }

                aCurrentFilterValues.push(new Filter({
                    path: "IsArchived",
                    operator: FilterOperator.EQ,
                    value1: false,
                }));
                aCurrentFilterValues.push(new Filter({
                    path: "RegistrationStatus",
                    operator: FilterOperator.NotContains,
                    value1: "DEREGISTERED"
                }));
                aCurrentFilterValues.push(new Filter({
                    path: "ActivationStatus",
                    operator: FilterOperator.NotContains,
                    value1: "DEACTIVATED"
                }));

                this._filterTableP(
                    new Filter({
                        filters: aCurrentFilterValues,
                        and: true,
                    })
                );
            },

            onValueHelpCancelPressPainter: function () {
                this._oValueHelpDialogP.close();
                this._oValueHelpDialogP.destroy();
                delete this._oValueHelpDialogP;
            },

            onValueHelpOkPressPainter: function (oEvent) {
                var oData = [];
                var xUnique = new Set();
                var aTokens = oEvent.getParameter("tokens");

                aTokens.forEach(function (ele) {
                    if (xUnique.has(ele.getKey()) == false) {
                        oData.push({
                            Name: ele.getText(),
                            PainterId: ele.getKey(),
                            Id: ele.getKey()
                        });
                        xUnique.add(ele.getKey());
                    }
                });

                this.getView().getModel("oModelView").setProperty("/TrainingDetails/TrainingPainters", oData);
                this._oValueHelpDialogP.close();
            },

            onCancel: function () {
                if (this._oValueHelpDialogP) {
                    this._oValueHelpDialogP.destroy();
                    delete this._oValueHelpDialogP;
                }
                if (this.getModel("oModelView").getProperty("/bChange")) {
                    this.showWarning("MSG_PENDING_CHANGES", this.navToHome);
                } else {
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
                var filtertype = this.getModel("oModelView").getProperty("/TrainingDetails/TrainingFilterType");
                if (sData.Status === 0) {
                    if (sData.Url === "") {
                            that.showToast.call(that, "MSG_PLEASE_ADD_URL_BEFORE_ACTIVATING_TRAINING");
                    } else if (sData.TrainingZone.length == 0 && filtertype === "GROUP") {
                        that.showToast.call(that, "MSG_PLEASE_ADD_ZONE_BEFORE_ACTIVATING_TRAINING");
                    } else if (sData.TrainingDivision.length == 0 && filtertype === "GROUP") {
                        that.showToast.call(that, "MSG_PLEASE_ADD_DIVISION_BEFORE_ACTIVATING_TRAINING");
                    } else if (sData.TrainingDepot.length == 0 && filtertype === "GROUP") {
                        that.showToast.call(that, "MSG_PLEASE_ADD_DEPOT_BEFORE_ACTIVATING_TRAINING");
                    } else if (sData.TrainingPainterTypeDetails.length == 0 && filtertype === "GROUP") {
                        that.showToast.call(that, "MSG_PLEASE_ADD_PAINTER_TYPE_BEFORE_ACTIVATING_TRAINING");
                    } else if (sData.TrainingPainterArcheTypeDetails.length == 0 && filtertype === "GROUP") {
                        that.showToast.call(that, "MSG_PLEASE_ADD_PAINTER_ARCHETYPE_BEFORE_ACTIVATING_TRAINING");
                    } else if (sData.TrainingPainters.length == 0 && filtertype === "PAINTER") {
                        that.showToast.call(that, "MSG_PLEASE_ADD_PAINTER_BEFORE_ACTIVATING_TRAINING");
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

            // onAddQuestionnaire: function (oEvent) {
            //     var addQsFlag = true;
            //     this.getModel("oModelView").setProperty("/addQsFlag", addQsFlag);

            //     var oTrainingQuestionnaire = [];
            //     this.getModel("oModelView").setProperty("/oAddTraining", {
            //         Question: "",
            //         TrainingQuestionnaireOptions: [],
            //         IsArchived: false
            //     });

            //     var sPath = "/oAddTraining";
            //     var oButton = oEvent.getSource();
            //     var oView = this.getView();
            //     var oModelView = this.getModel("oModelView"),
            //         oThat = this;

            //     if (!this.byId("QuestionnaireOptionsDialog")) {
            //         // load asynchronous XML fragment
            //         Fragment.load({
            //             id: oView.getId(),
            //             name: "com.knpl.pragati.Training_Learning.view.fragments.QuestionnaireOptionsDialog",
            //             controller: this
            //         }).then(function (oDialog) {
            //             // connect dialog to the root view 
            //             //of this component (models, lifecycle)
            //             oView.addDependent(oDialog);
            //             oDialog.bindElement({
            //                 path: sPath,
            //                 model: "oModelView"
            //             });
            //             oDialog.open();
            //         });
            //     } else {
            //         oThat.byId("QuestionnaireOptionsDialog").bindElement({
            //             path: sPath,
            //             model: "oModelView"
            //         });
            //         oThat.byId("QuestionnaireOptionsDialog").open();
            //     }

            // },

            // updateOptions: function () {
            //     var selectCorrectFlag,
            //         blankOption,
            //         addTr;
            //     selectCorrectFlag = false;
            //     blankOption = true;
            //     var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");
            //     if (addQsFlag === true) {
            //         addTr = this.getModel("oModelView").getProperty("/oAddTraining");
            //     } else {
            //         var iIndex = this.getModel("oModelView").getProperty("/iIndex");
            //         addTr = this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iIndex];
            //     }
            //     if (addTr.Question === "") {
            //         this.showToast.call(this, "MSG_PLS_ENTER_ERR_QUESTION");
            //     } else {
            //         if (addTr.TrainingQuestionnaireOptions.length >= 2) {
            //             if (addTr.TrainingQuestionnaireOptions.length <= 4) {
            //                 for (var i = 0; i < addTr.TrainingQuestionnaireOptions.length; i++) {
            //                     if (addTr.TrainingQuestionnaireOptions[i].IsCorrect === true) {
            //                         selectCorrectFlag = true;
            //                     }
            //                 }
            //                 if (selectCorrectFlag === false) {
            //                     this.showToast.call(this, "MSG_PLS_SELECT_ONE_CORRECT_OPTION");
            //                 } else {
            //                     for (var i = 0; i < addTr.TrainingQuestionnaireOptions.length; i++) {
            //                         if (addTr.TrainingQuestionnaireOptions[i].Option === "") {
            //                             blankOption = false;
            //                             this.showToast.call(this, "MSG_DONT_ENTER_BLANK_OPTION");
            //                         }
            //                     }
            //                     if (blankOption === true) {
            //                         if (addQsFlag === true) {
            //                             this.getModel("oModelView").setProperty("/addQsFlag", false);
            //                             this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire.push({
            //                                 Question: addTr.Question,
            //                                 TrainingQuestionnaireOptions: addTr.TrainingQuestionnaireOptions,
            //                                 IsArchived: false
            //                             });
            //                             this.byId("QuestionnaireOptionsDialog").close();
            //                             this.getModel("oModelView").refresh();
            //                         } else {
            //                             this.byId("QuestionnaireOptionsDialog").close();
            //                             this.getModel("oModelView").refresh();
            //                         }
            //                     }
            //                 }
            //             } else {
            //                 this.showToast.call(this, "MSG_PLS_ENTER_MAXIMUM_FOUR_OPTIONS");
            //             }
            //         } else {
            //             this.showToast.call(this, "MSG_PLS_ENTER_MINIMUM_TWO_OPTIONS");
            //         }
            //     }
            // },

            // closeOptionsDialog: function () {
            //     this.byId("QuestionnaireOptionsDialog").close();
            // },

            // onAddQuestionnaireOptions: function () {
            //     var sPath = this.getView().byId("QuestionnaireOptionsDialog").getElementBinding("oModelView").getPath();
            //     var oObject = this.getModel("oModelView").getProperty(sPath + "/TrainingQuestionnaireOptions");
            //     oObject.push({
            //         Option: "",
            //         IsCorrect: false,
            //         IsArchived: false
            //     });
            //     this.getModel("oModelView").refresh();
            // },

            // onDeleteQuestionnaireOptions: function (oEvent) {
            //     var oView = this.getView();
            //     var iOptionIndex = oEvent.getSource().getBindingContext("oModelView").getPath().match(/\d$/g);
            //     var addQsFlag = this.getModel("oModelView").getProperty("/addQsFlag");

            //     if (addQsFlag === true) {
            //         var oAddTrain = this.getModel("oModelView").getProperty("/oAddTraining");
            //         oAddTrain.TrainingQuestionnaireOptions.splice(iOptionIndex, 1);
            //     } else {
            //         var iQuestionIndex = this.getModel("oModelView").getProperty("/iIndex");
            //         this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iQuestionIndex].TrainingQuestionnaireOptions[iOptionIndex].IsArchived = true;
            //         var oAddTrain = this.getModel("oModelView").getData().TrainingDetails.TrainingQuestionnaire[iQuestionIndex];
            //         oAddTrain.TrainingQuestionnaireOptions.splice(iOptionIndex, 1);
            //     }
            //     this.getModel("oModelView").refresh();
            // },

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
                                        // if (data.RewardPoints < 0) {
                                        //     oReturn.IsNotValid = true;
                                        //     oReturn.sMsg.push("MSG_ENTER_REWARD_MORETHAN_ZERO");
                                        //     aCtrlMessage.push({
                                        //         message: "MSG_ENTER_REWARD_MORETHAN_ZERO",
                                        //         target: "/TrainingDetails/RewardPoints"
                                        //     });
                                        // }
                                        // else
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
                                        if (data.RewardPoints < 0) {
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
                delete oPayload.Duration;
                delete oPayload.ViewStartDate;
                delete oPayload.ViewEndDate;

                oPayload = this.trainingFilter(oPayload);

                if (oPayload.TrainingFilterType === "PAINTER") {
                    var Array = [];
                    for (var x of oPayload.TrainingPainters) {
                        Array.push({
                            PainterId: parseInt(x.PainterId),
                            TrainingId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingPainters = Array;
                }

                var oClonePayload = $.extend(true, {}, oPayload),
                    that = this;

                var sKey = that.getModel().createKey("/TrainingSet", {
                    Id: oClonePayload.Id
                });
                console.log(oClonePayload)
                that.getModel().update(sKey, oClonePayload, {
                    success: that._UploadImageforVideo(sKey, oViewModel.getProperty("/ProfilePic")).then(that._Success.bind(that, oEvent), that._Error.bind(
                        that)),
                    error: that._Error.bind(that)
                });
            },

            CUOperationVideo: function (oPayload, oEvent) {
                var oViewModel = this.getModel("oModelView");
                oPayload.Duration = parseInt(oPayload.Duration);
                // for (var i = 0; i < oPayload.TrainingQuestionnaire.length; i++) {
                //     oPayload.LearningQuestionnaire.push({
                //         Question: oPayload.TrainingQuestionnaire[i].Question,
                //         IsArchived: oPayload.TrainingQuestionnaire[i].IsArchived,
                //         LearningQuestionnaireOptions: oPayload.TrainingQuestionnaire[i].TrainingQuestionnaireOptions
                //     });
                // }

                console.log(oPayload.TrainingQuestionnaire);
                for (var i = 0; i < oPayload.TrainingQuestionnaire.length; i++) {
                    oPayload = this.convertToLearningQuestionnairePayload(oPayload.TrainingQuestionnaire[i], oPayload);
                }
                console.log(oPayload.LearningQuestionnaire);

                delete oPayload.StartDate;
                delete oPayload.EndDate;
                delete oPayload.TrainingQuestionnaire;

                oPayload = this.trainingFilter(oPayload);

                if (oPayload.TrainingFilterType === "PAINTER") {
                    var Array = [];
                    for (var x of oPayload.TrainingPainters) {
                        Array.push({
                            PainterId: parseInt(x.PainterId),
                            LearningId: parseInt(oPayload.Id)
                        });
                    }
                    oPayload.TrainingPainters = Array;
                }

                var oClonePayload = $.extend(true, {}, oPayload),
                    that = this;

                var sKey = that.getModel().createKey("/LearningSet", {
                    Id: oClonePayload.Id
                });
                console.log(oClonePayload);
                that.getModel().update(sKey, oClonePayload, {
                    success: that._UploadImageforVideo(sKey, oViewModel.getProperty("/ProfilePic")).then(that._Success.bind(that, oEvent), that._Error.bind(
                        that)),
                    error: that._Error.bind(that)
                });
            },

            trainingFilter: function (oPayload) {
                var Array = [];
                oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
                oPayload.TrainingSubTypeId = parseInt(oPayload.TrainingSubTypeId);
                oPayload.Status = parseInt(oPayload.Status);
                if (oPayload.RewardPoints === null || oPayload.RewardPoints === "") {
                    oPayload.RewardPoints = 0;
                }
                oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
                switch (oPayload.TrainingFilterType) {
                    case "ALL":
                        delete oPayload.TrainingZone;
                        delete oPayload.TrainingDivision;
                        delete oPayload.TrainingDepot;
                        delete oPayload.TrainingPainterTypeDetails;
                        delete oPayload.TrainingPainterArcheTypeDetails;
                        delete oPayload.TrainingPainters;
                        break;
                    case "GROUP":
                        delete oPayload.TrainingPainters;
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

                        if (oPayload.TrainingDepot && oPayload.TrainingDepot.results) {
                            oPayload.TrainingDepot = oPayload.TrainingDepot.results;
                        }
                        break;
                    case "PAINTER":
                        delete oPayload.TrainingZone;
                        delete oPayload.TrainingDivision;
                        delete oPayload.TrainingDepot;
                        delete oPayload.TrainingPainterTypeDetails;
                        delete oPayload.TrainingPainterArcheTypeDetails;
                        break;
                }
                return oPayload;
            },

            _Error: function (error) {
                this.getModel("oModelView").setProperty("/busy", false);
                MessageToast.show(error.toString());
            },

            _Success: function () {
                this.getModel("oModelView").setProperty("/busy", false);

                var trainingType = this.getModel("appView").getProperty("/trainingType");
                if (trainingType === 'ONLINE' || trainingType === 'OFFLINE') {
                    MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_TRAINING_UPATE"));
                } else {
                    MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_UPDATE"));
                }
                var oModel = this.getModel();
                oModel.refresh(true);
                this.getRouter().navTo("worklist", true);

                if (this._oValueHelpDialogP) {
                    this._oValueHelpDialogP.destroy();
                    delete this._oValueHelpDialogP;
                }
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
                console.log("method triferred")
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
                    // ;
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
            },
            //CR changes
            onPressUpload: function () {
                console.log("Hit!");
                var oViewModel = this.getModel("oModelView");
                var oPayload = {};
                $.extend(true, oPayload, oViewModel.getProperty("/TrainingDetails"));
                var trainingType = this.getModel("appView").getProperty("/trainingType");
                this._UploadAttendanceLiveVidTr(oPayload);

            },
            _UploadAttendanceLiveVidTr: function (oPayload) {

                var that = this;
                var fU = this.getView().byId("idAttendanceLiveFileUploader");
                // var domRef = fU.getFocusDomRef();
                // var file = domRef.files[0];
                    var domRef = fU.oFileUpload;
                    var file = domRef.files[0];
                var oViewModel = this.getModel("oModelView");

                // if (oPayload.RewardPoints === null || oPayload.RewardPoints === "") {
                //     oPayload.RewardPoints = 0;
                // }
                console.log(oPayload)
                var settings = {
                    url: "/KNPL_PAINTER_API/api/v2/odata.svc/UploadAttendanceSet(" + oPayload.TrainingSubTypeId + ")/$value?Points=" + oPayload.RewardPoints + "&trainingId=" + oPayload["Id"],
                    data: file,
                    method: "PUT",
                    headers: that.getModel().getHeaders(),
                    contentType: "text/csv",
                    processData: false,
                    statusCode: {
                        206: function (result) {
                            that._SuccessUpload(result, 206);
                        },
                        200: function (result) {
                            that._SuccessUpload(result, 200);
                        },
                        202: function (result) {
                            that._SuccessUpload(result, 202);
                        },
                        400: function (result) {
                            that._SuccessUpload(result, 400);
                        }
                    },
                    error: function (error) {
                        that._Error(error);
                    }
                };

                $.ajax(settings);
                // });
            },
            _SuccessUpload: function (result, oStatus) {
                var that = this;
                var oModelView = that.getModel("oModelView");
                var TrainingId = oModelView.getProperty("/TrainingDetails/Id");
                this._initFilerForTablesLiveAttendance(TrainingId);
                oModelView.setProperty("/busy", false);
                if (oStatus === 200 || oStatus === 202 || oStatus === 206) {
                    if (result.length == 0) {
                        that.showToast.call(that, "MSG_NO_RECORD_FOUND_IN_UPLOADED_FILE");
                    } else {
                        var oView = that.getView();

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
            closeAttendanceStatusDialog: function () {
                this.AttendanceUploadedStatusMsg.close();
                //MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_ATTENDANCE_UPDATED"));
                // this.getRouter().navTo("worklist", true);
                var fU = this.getView().byId("idAttendanceLiveFileUploader");
                fU.setValue("");

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
                    }]
                });

                // download exported file
                oExport.saveFile().catch(function (oError) {
                    MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                }).then(function () {
                    oExport.destroy();
                });
            },

            _Error: function (error) {
                this.getModel("oModelView").setProperty("/busy", false);
                MessageToast.show(error.toString());
            },
            _initFilerForTablesLiveAttendance: function (trainingId) {
                console.log(trainingId);
                var oView = this.getView();
                var aFilters = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
                        new sap.ui.model.Filter('TrainingId', sap.ui.model.FilterOperator.EQ, trainingId)
                    ],
                    and: true
                });
                oView.byId("idTblAttendanceLiveVid").getBinding("items").filter(aFilters);
            },
            onFileUploadChange: function (oEvent) {
                //console.log(oEvent);
                var oFileUploder = oEvent.getSource();
                if (oEvent.getParameter("newValue")) {
                    this.onPressUpload();
                }
            },

        }
        );
    }
);