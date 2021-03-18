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
        "sap/ui/core/routing/History"
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
        History
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Training_Learning.controller.TrainingTab",
            {
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
                        // Search: {
                        //     Referral: "",
                        //     Offers: "",
                        //     Complaints: ""
                        // }
                    };
                    var oModelControl2 = new JSONModel(oData);
                    this.getView().setModel(oModelControl2, "oModelControl2");

                    var sPath = "/" + oProp;
                    that.getModel().read(sPath, {
                        urlParameters: {
                            "$expand": "PainterTypeDetails, Creator, City, State, Depot, Division, PainterArcheType, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
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

                            var dateValue = data.StartDate.toDateString();
                            var timeValue = data.StartDate.toLocaleTimeString();
                            var patternDate = "dd/MM/yyyy hh:mm a";
                            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                                pattern: patternDate
                            });

                            var oDateTime = dateValue + " " + timeValue;
                            var oNow = new Date(oDateTime);
                            data.StartDate = oDateFormat.format(oNow);

                            dateValue = data.EndDate.toDateString();
                            timeValue = data.EndDate.toLocaleTimeString();

                            oDateTime = dateValue + " " + timeValue;
                            oNow = new Date(oDateTime);
                            data.EndDate = oDateFormat.format(oNow);

                            oViewModel.setProperty("/TrainingDetails", data);
                            // var trainingId = data.Id;
                            // this._initFilerForTables(trainingId);

                        }
                    })

                    that._showFormFragment("ViewTraining");
                    var trainingType = this.getModel("appView").getProperty("/trainingType");
                    debugger;
                    if (trainingType === 'ONLINE') {
                        that._showFormFragment("Questionnaire");
                    }
                    // that._showFormFragment("Enrollment");
                    // that._showFormFragment("Attendance");

                    that.getView().unbindElement();

                    that.getView().setModel(oViewModel, "oModelView");
                    that.getView().getModel().resetChanges();
                },

                _initFilerForTables: function (trainingId) {
                    var oView = this.getView();

                    var oFilter = new Filter(
                        "Id",
                        FilterOperator.EQ,
                        trainingId
                    );
                    oView.byId("idTblEnrollment").getBinding("items").filter(oFilter);
                    oView.byId("idTblAttendance").getBinding("items").filter(oFilter);
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

                onCancel: function () {
                    this.getRouter().navTo("worklist", true);
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
                    // oCtrlModel2.setProperty("/iCtbar", true);
                    this._loadEditProfile("Display");
                    this._loadEditQuestion("Display");
                    oView.getModel().refresh(true);
                },

                handleEditPress: function () {
                    this._toggleButtonsAndView(true);
                    var oView = this.getView();
                    var oModelControl2 = oView.getModel("oModelControl2");
                    oModelControl2.setProperty("/modeEdit", true);
                    oModelControl2.setProperty("/iCtbar", false);
                    var c1, c2, c3;
                    var othat = this;
                    c1 = othat._loadEditProfile("Edit");
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

                },

            }
        );
    }
);
