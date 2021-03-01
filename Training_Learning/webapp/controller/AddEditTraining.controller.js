sap.ui.define(
  [
    "com/knpl/pragati/ContactPainter/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/core/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
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
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Training_Learning.controller.AddEditTraining",
      {
      }
    );
  }
);