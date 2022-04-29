sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/ui/core/UIComponent",
        'sap/m/MessageToast',
        "sap/ui/model/BindingMode",
        "sap/ui/core/message/Message",
        "sap/ui/core/library",
        "sap/ui/core/Fragment",
        "sap/ui/core/ValueState",
        "../utils/Validator",
        "sap/ui/model/json/JSONModel",
        "sap/m/Dialog",
        "sap/m/DialogType",
        "sap/m/Button",
        "sap/m/ButtonType",
        "sap/m/Text"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast, BindingMode, Message, library, Fragment,
        ValueState, Validator, JSONModel, Dialog, DialogType, Button, ButtonType, Text) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.User", {
            onInit: function () {


                // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });
                // JSON dummy data
                var oData = {
                    name: null,
                    email: null,
                    mobile: null,
                    countrycode: "IN",
                    role: null
                };

                var oModel = new JSONModel();
                oModel.setData(oData);

                this.getView().setModel(oModel);



                // var oMessageManager, oView;

                // oView = this.getView();
                // // set message model
                // oMessageManager = sap.ui.getCore().getMessageManager();
                // oView.setModel(oMessageManager.getMessageModel(), "message");

                // oMessageManager.registerObject(oView, true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditUser").attachPatternMatched(this._onObjectMatched, this);



            },
            onAfterRendering: function () {
                this.onClearPress();

            },
            _onObjectMatched: function (oEvent) {

                sap.ui.getCore().getMessageManager().removeAllMessages();
                var oView = this.getView();
                var userSet = oEvent.getParameter("arguments").userId
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(userSet),
                    model: "data",
                    events: {
                        dataRequested: function (oEvent) {
                            // oView.setBusy(true);
                        },
                        dataReceived: function (oEvent) {
                            //oView.getModel("data").refresh(true);
                            //console.log(oEvent)
                        },
                    },
                });
                this.onUserTypeFilter(userSet);

            },
            onUserTypeFilter: function (userSet) {
                var oModel = this.getView().getModel("data");
                var that = this;
                var AdminRoleId;
                oModel.read("/" + userSet, {
                    urlParameters: {
                        "$expand": "UserType"
                    },
                    success: function (oRetrievedResult) {
                        if (oRetrievedResult.UserType !== null) {
                            AdminRoleId = oRetrievedResult.RoleId
                            var binding = that.getView().byId("iduserType").getBinding("items");
                            var filters = [new sap.ui.model.Filter("AdminRoleId", sap.ui.model.FilterOperator.EQ, parseInt(AdminRoleId))];
                            var oFilter1 = new sap.ui.model.Filter({
                                aFilters: filters
                            });
                            binding.filter(oFilter1);
                            that.getView().byId("iduserType").getModel().updateBindings(true);
                        }
                    },
                    error: function (oError) {
                        /* do something */ }
                });

            },

            _getMessagePopover: function () {
                var oView = this.getView();

                // create popover lazily (singleton)
                if (!this._pMessagePopover) {
                    this._pMessagePopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.OrganizationSetup.view.MessagePopover"
                    }).then(function (oMessagePopover) {
                        oView.addDependent(oMessagePopover);
                        return oMessagePopover;
                    });
                }
                return this._pMessagePopover;
            },
            onMessagePopoverPress: function (oEvent) {
                var oSourceControl = oEvent.getSource();
                this._getMessagePopover().then(function (oMessagePopover) {
                    oMessagePopover.openBy(oSourceControl);
                });
            },

            onSuccessPress: function (msg) {

                this.onClearPress();

                if (msg == "Successfully created!") {
                    this.onClearInputFields();
                }


                // var msg = 'Saved Successfully!';
                MessageToast.show(msg);

                var oModel = this.getView().getModel("data");
                oModel.refresh(true);



                setTimeout(function () {
                    this.onCancelPress();
                }.bind(this), 1000);


            },
            onErrorPress: function () {
                var oMessage = new Message({
                    message: "Mandatory Fields Empty!",
                    type: MessageType.Error,
                    target: "/Dummy",
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            },
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteHome", {}, true);
                }
            },
            handleSuccess: function (oEvent) {
                var msg = 'Updated Successfully!';
                MessageToast.show(msg);
                var oModel = this.getView().getModel("data");
                oModel.refresh();

                // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                // oRouter.navTo("RouteHome");
            },
            handleEmptyFields: function (oEvent) {

                this.onDialogPress();
            },

            add: function () {



                var name = this.getView().byId("name").getValue();
                var email = this.getView().byId("email").getValue();

                var mobile = this.getView().byId("mobile").getValue();
                var countrycode = this.getView().byId("countrycode").getValue();
                var role = this.getView().byId("role").getSelectedKey();
                var userType = this.getView().byId("iduserType").getSelectedKey();

                var passedValidation = this.onValidateAdd();

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }


                var oModel = this.getView().getModel("data");

                var oData = {
                    Name: name,
                    Email: email,
                    Mobile: mobile,
                    CountryCode: countrycode,
                    RoleId: role,
                    UserTypeId: userType
                }


                oModel.create("/AdminSet", oData, {
                    success: this.onSuccessPress("Successfully created!")
                });


            },
            update: function () {
                var oView = this.getView();
                var name = this.getView().byId("name").getValue();
                var email = this.getView().byId("email").getValue();

                var mobile = this.getView().byId("mobile").getValue();
                var countrycode = this.getView().byId("countrycode").getValue();
                var role = this.getView().byId("role").getSelectedKey();
                var userType = this.getView().byId("iduserType").getSelectedKey();
                var passedValidation = this.onValidateEdit();
                var sBankUpdate = oView.byId("rb1").getSelectedIndex();
                var bBank = false;
                if (sBankUpdate == "1") {
                    bBank = true
                }
                var sKyc = oView.byId("rb2").getSelectedIndex();
                var bKyc = false;
                if (sKyc == "1") {
                    bKyc = true
                }
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }



                var oModel = this.getView().getModel("data");

                var oData = {
                    Name: name,
                    Email: email,
                    Mobile: mobile,
                    CountryCode: countrycode,
                    RoleId: role,
                    UserTypeId: userType,
                    IsBankUpdateAllowed: bBank,
                    IsKYCUpdateAllowed: bKyc
                }
                console.log(oData);

                var editSet = this.getView().getBindingContext("data").getPath();

                oModel.update(editSet, oData, {
                    success: this.onSuccessPress("Successfully Updated!")
                });
            },

            onClearPress: function () {
                // does not remove the manually set ValueStateText we set in onValueStatePress():
                sap.ui.getCore().getMessageManager().removeAllMessages();

            },
            onCancelPress: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
                var oModel = this.getView().getModel("data");
                oModel.refresh(true);

            },
            onCancelPressForAdd: function (oEvent) {

                this.onClearInputFields();


                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("RouteHome");

                var oModel = this.getView().getModel("data");
                oModel.refresh(true);

            },
            onValidateEdit: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("editUser"));
            },
            onValidateAdd: function () {
                // Create new validator instance
                var validator = new Validator();

                // Validate input fields against root page with id 'somePage'
                return validator.validate(this.byId("addUser"));
            },
            onDialogPress: function () {
                if (!this.oEscapePreventDialog) {
                    this.oEscapePreventDialog = new Dialog({
                        title: "Error",
                        content: new Text({
                            text: "Mandatory Fields Are Empty! or Wrong Values Entered!"
                        }),
                        type: DialogType.Message,
                        buttons: [
                            new Button({
                                text: "Close",
                                press: function () {
                                    this.oEscapePreventDialog.close();
                                }.bind(this)
                            })
                        ]

                    });
                }

                this.oEscapePreventDialog.open();
            },
            onRoleChange: function (oEvent) {
                var roleId = oEvent.getParameter("selectedItem").getKey();
                var binding = this.getView().byId("iduserType").getBinding("items");
                //binding.aFilters = null;
                var filters = [new sap.ui.model.Filter("AdminRoleId", sap.ui.model.FilterOperator.EQ, parseInt(roleId))];
                var oFilter1 = new sap.ui.model.Filter({
                    aFilters: filters
                });
                binding.filter(oFilter1);
                this.getView().byId("iduserType").getModel().updateBindings(true);

                // var tfilter = new sap.ui.model.Filter("UserTypeId",sap.ui.model.FilterOperator.EQ,roleId);
                // var userTypeDropdown=this.getView().byId("iduserType");
                // userTypeDropdown.bindAggregation("items",tfilter);

            },
            onLiveChangeInputValidate: function (oEvent) {
                var blockSpecialRegex = /[0-9~`!@#$%^&()_={}[\]:;,.<>+\/?-]/;
                // var inputValue = oEvent.getParameter('value').trim();
                //console.log(inputValue);
                if (oEvent.getParameter("value").match(blockSpecialRegex)) {
                    this.getView().byId("name").setValueState(sap.ui.core.ValueState.Error);
                    // this.setValueState(sap.ui.core.ValueState.Error);
                }
                // else {
                //     this.setValueState(sap.ui.core.ValueState.Success);
                // }
            },
            onClearInputFields: function () {
                var inputName = this.getView().byId("name");
                inputName.setValue("");
                inputName.setValueState(sap.ui.core.ValueState.None);

                var inputEmail = this.getView().byId("email");
                inputEmail.setValue("");
                inputEmail.setValueState(sap.ui.core.ValueState.None);

                var inputMobile = this.getView().byId("mobile");
                inputMobile.setValue("");
                inputMobile.setValueState(sap.ui.core.ValueState.None);

                var inputRole = this.getView().byId("role");
                inputRole.setSelectedKey(null);
                inputRole.setValueState(sap.ui.core.ValueState.None);

                var inputUserType = this.getView().byId("iduserType");
                inputUserType.setSelectedKey(null);
                inputUserType.setValueState(sap.ui.core.ValueState.None);

            }



        });
    });