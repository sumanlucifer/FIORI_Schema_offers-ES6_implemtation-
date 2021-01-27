sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/m/MessageToast"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend(
      "com.knpl.pragati.Training.controller.ListMaster",
      {
        onInit: function () {
          console.log("Controller Run");
          this.initView = true;
        },
        onBeforeRebindTable: function (oEvent) {
          var mBindingParams = oEvent.getParameter("bindingParams");
          console.log(mBindingParams);
          if (this.initView) {
            // to apply the sort
            mBindingParams.sorter = [
              new sap.ui.model.Sorter({
                path: "TrainingType",
                descending: false,
              }),
            ];
            // to short the sorted column in P13N dialog
            var oSmartTable = oEvent.getSource();
            oSmartTable.applyVariant({
              sort: {
                sortItems: [
                  {
                    columnKey: "TrainingType",
                    operation: "Descending",
                  },
                ],
              },
            });
            // to prevent applying the initial sort all times
            this.initView = false;
          }
        },
        onPressRemove: function (oEvent) {
          var oView = this.getView();

          var oBject = oEvent.getSource().getBindingContext().getObject();
          var sPath = oEvent.getSource().getBindingContext().getPath();
          var oData = oView.getModel();
          oData.update(
            sPath,
            {
              TrainingType: oBject["TrainingType"],
              IsArchived: "true",
            },
            {
              success: function (mData) {
                MessageToast.show(
                  oBject["TrainingType"] + " Sucessfully Removed."
                );
              },
              error: function (data) {
                var oRespText = JSON.parse(data.responseText);
                MessageBox.error(oRespText["error"]["message"]["value"]);
              },
            }
          );
        },
      }
    );
  }
);
