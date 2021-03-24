// @ts-ignore
sap.ui.define(
  [
    "com/knpl/pragati/CallbackRequests/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Text",
    "sap/m/TextArea",
    "sap/ui/core/Core"
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    MessageBox,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    Label,
    MessageToast,
    Text,
    TextArea,
    Core
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
            Remarks: ""
          };
          if (!this.oDialog) {
				this.oDialog = new Dialog({
					title: oResourceBundle.getText("confirmationDailogTitle"),
					type: DialogType.Message,
					content: [
						new Label({
							text: oResourceBundle.getText("updateConfirmationMessage"),
							labelFor: "confirmNote"
						}),
						new TextArea("confirmNote", {
                            width: "100%",
                            maxLength: 512,
							placeholder: oResourceBundle.getText("remarkInputPlaceholder")
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: oResourceBundle.getText("confirmationDailogOkBtnText"),
						press: function () {
                            oPayload.Remarks = Core.byId("confirmNote").getValue();
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
                                }
                            });
							this.oDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: oResourceBundle.getText("confirmationDailogCancelBtnText"),
						press: function () {
							this.oDialog.close();
						}.bind(this)
					})
				});
            }
            Core.byId("confirmNote").setValue("");
			this.oDialog.open();
        },
      }
    );
  }
);
