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

                    var sPath = "/" + oProp;
                    that.getModel().read(sPath, {
                        urlParameters: {
                            "$expand": "DepotId, DivisionId, PainterArcheTypeId, PainterTypeId, TrainingType, TrainingQuestionnaire, TrainingQuestionnaire/TrainingQuestionnaireOptions"
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
                        }
                    })

                    that._showFormFragment("ViewTraining");
                    that._showFormFragment("Questionnaire");
                    // that._showFormFragment("Enrollment");
                    // that._showFormFragment("Attendance");
                    that.getView().unbindElement();

                    that.getView().setModel(oViewModel, "oModelView");
                    that.getView().getModel().resetChanges();
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
            }
        );
    }
);
