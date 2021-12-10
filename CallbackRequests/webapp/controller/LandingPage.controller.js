// @ts-ignore
sap.ui.define(
    [
        "com/knpl/pragati/CallbackRequests/controller/BaseController",
        "sap/ui/model/Sorter",
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
        Sorter,
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
            "com.knpl.pragati.CallbackRequests.controller.LandingPage", {
                onInit: function () {
                    var oModel = new JSONModel({
                        busy: false,
                        sRemarks: ""
                    });
                    this.getView().setModel(oModel, "ViewModel");

                    this.getComponentModel().metadataLoaded().
                    then(this._fnLoginAdminData.bind(this));

                },

                _fnLoginAdminData: function () {
                    var oViewModel = this.getViewModel("ViewModel");
                    oViewModel.setProperty("/busy", true);
                    this.getComponentModel().callFunction("/GetLoggedInAdmin", {
                        method: "GET",
                        success: function (data) {
                            oViewModel.setProperty("/loggedUserId", data.results[0].Id);
                            oViewModel.setProperty("/busy", false);
                        }
                    });
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
                    oBindingParams.filters.push(new Filter("IsArchived", FilterOperator.EQ, false));
                    oBindingParams.sorter.push(new Sorter("CreatedAt", true));
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
                        Remarks: "",
                        UpdatedBy: oViewModel.getProperty("/loggedUserId")
                    };
                    if (!this.oDialog) {
                        this.oDialog = new Dialog({
                            title: oResourceBundle.getText("confirmationDailogTitle"),
                            type: DialogType.Message,
                            content: [
                                new Label({
                                    text: oResourceBundle.getText("updateConfirmationMessage")

                                }),
                                new TextArea({
                                    width: "100%",
                                    value: "{ViewModel>/sRemarks}",
                                    maxLength: 200,
                                    placeholder: oResourceBundle.getText("remarkInputPlaceholder")
                                })
                            ],
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: oResourceBundle.getText("confirmationDailogOkBtnText"),
                                press: function (oEvent) {
                                    oPayload.Remarks = oViewModel.getProperty("/sRemarks")
                                    oViewModel.setProperty("/busy", true);

                                    oModel.update(oEvent.getSource().getBindingContext().getPath(), oPayload, {
                                        success: function () {
                                            MessageToast.show(
                                                oResourceBundle.getText(
                                                    "messageBoxUpdateStatusSuccessMsg"
                                                )
                                            );
                                            oViewModel.setProperty("/busy", false);
                                            oView.byId("idPendingSmartTable").getModel().refresh(true);
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
                        this.getView().addDependent(this.oDialog);
                    }
                    oViewModel.setProperty("/sRemarks", "");
                    this.oDialog.bindElement(sPath);
                    // oViewModel.setProperty("/PainterId", "");
                    this.oDialog.open();
                },

                onPressDisplayPainter: function (oEvent) {
                    var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
                    var that = this;
                    this.getComponentModel().read("/" + sPath, {
                        success: function (data) {
                            that.Navigate({
                                target: {
                                    semanticObject: "Manage",
                                    action: "CP",
                                    params: {
                                        PainterId: data.PainterId
                                    }
                                }
                            });
                        }
                    })
                },

                Navigate: function (oSemAct) {
                    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                        var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
                        oCrossAppNav.toExternal({
                            target: {
                                semanticObject: oSemAct.target.semanticObject,
                                action: oSemAct.target.action
                            },
                            params: oSemAct.target.params
                        })
                    }
                },
                onIconTabChange: function (oEvent) {
                    var oView = this.getView();
                    var sKey = oEvent.getSource().getSelectedKey();
                    console.log(sKey);
                    if (sKey === "completed") {
                        oView.byId("idCompletedSmartTable").rebindTable();
                    }
                },
                onPressCallPainter: function (oEvent) {
                    var sPath = oEvent.getSource().getBindingContext().getPath().substr(1);
                    var that = this;
                    var mobileHyperLink;
                    this.getComponentModel().read("/" + sPath, {
                        success: function (data) {
                            mobileHyperLink = "tel://+91" + data.PainterMobile;
                            window.open(mobileHyperLink);
                        }
                    })
                },

                onPressRemarks: function (oEvent) {
                    var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                    var sRemarks = oEvent.getSource().getCustomData("remarks")[0].getValue();
                    if (!this.oRemarksMessageDialog) {
                        this.oRemarksMessageDialog = new Dialog({
                            type: DialogType.Message,
                            title: oResourceBundle.getText("remarksDialogTitle"),
                            content: new Text("idRemarksText", {
                                text: sRemarks
                            }),
                            styleClass: ['sapUiSizeCompact'],
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: "OK",
                                press: function () {
                                    this.oRemarksMessageDialog.close();
                                }.bind(this)
                            })
                        });
                    }
                    Core.byId("idRemarksText").setText(sRemarks);
                    this.oRemarksMessageDialog.open();
                }
            }
        );
    }
);