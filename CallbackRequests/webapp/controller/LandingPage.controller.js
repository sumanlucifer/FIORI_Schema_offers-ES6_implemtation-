// @ts-ignore
sap.ui.define(
  [
    "com/knpl/pragati/CallbackRequests/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.CallbackRequests.controller.LandingPage",
      {
        onInit: function () {
          var oModel = new JSONModel({
            busy: false,
          });
          this.getView().setModel(oModel, "ViewModel");
        },

        onBeforeRebind: function (oEvent) {
          var sTableId = oEvent.getSource().getId().split("--")[2];
          var oBindingParams = oEvent.getParameter("bindingParams");
          if (sTableId === "idPendingSmartTable") {
            oBindingParams.filters.push(
              new Filter({
                filters: [
                  new Filter("Status", FilterOperator.EQ, "REGISTERED"),
                  new Filter("Status", FilterOperator.EQ, "INPROGRESS"),
                ],
                and: false,
              })
            );
          } else {
            oBindingParams.filters.push(
              new Filter({
                filters: [
                  new Filter("Status", FilterOperator.EQ, "RESOLVED"),
                  new Filter("Status", FilterOperator.EQ, "REJECTED"),
                ],
                and: false,
              })
            );
          }
          oBindingParams.filters.push(
            new Filter("IsArchived", FilterOperator.EQ, false)
          );
        },

        onPressComplete: function (oEvent) {
          var oView = this.getView();
          var sPath = oEvent.getSource().getBindingContext().getPath();
          var oModel = this.getComponentModel();
          var oViewModel = this.getView().getModel("ViewModel");
          var oResourceBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();
          var oPayload = {
            Status: "RESOLVED",
          };
          MessageBox.confirm(
            oResourceBundle.getText("updateConfirmationMessage"),
            {
              actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
              emphasizedAction: MessageBox.Action.OK,
              styleClass: "sapUiSizeCompact",
              onClose: function (sAction) {
                if (sAction == MessageBox.Action.OK) {
                  oViewModel.setProperty("/busy", true);
                  oModel.update(sPath, oPayload, {
                    success: function () {
                      MessageToast.show(
                        oResourceBundle.getText(
                          "messageBoxUpdateStatusSuccessMsg"
                        )
                      );
                      oViewModel.setProperty("/busy", false);
                      oView.byId("idPendingSmartTable").getModel().refresh();
                    },
                    error: function () {
                      oViewModel.setProperty("/busy", false);
                      MessageBox.error(
                        oResourceBundle.getText(
                          "messageBoxUpdateStatusErrorMsg-"
                        )
                      );
                    },
                  });
                }
              },
            }
          );
        },
      }
    );
  }
);
