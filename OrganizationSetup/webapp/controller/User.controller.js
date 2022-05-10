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
        "sap/m/Text",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast, BindingMode, Message, library, Fragment,
        ValueState, Validator, JSONModel, Dialog, DialogType, Button, ButtonType, Text,Filter,FilterOperator) {
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
                oRouter.getRoute("AddUser").attachPatternMatched(this._onObjectMatched2, this);



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
                var c1, c2, c3, c4, c5, c6;
                var othat = this;
                c1 = othat._CreateControlModel(userSet);
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function (oPayLoad) {
                        c3 = othat._setEditMultiComboData(oPayLoad)
                    })
                })
                this.onUserTypeFilter(userSet);


            },
            _onObjectMatched2: function () {
                var c1, c2, c3, c4, c5, c6;
                var othat = this;
                var oData = {
                    AdminZone: [],
                    AdminDivision: []
                }
                var oViewModel = new JSONModel(oData)
                this.getView().setModel(oViewModel, "oModelView");
                c1 = othat._CreateControlModel(null);


            },
            _setEditMultiComboData: function (oPayLoad) {
                var promise = $.Deferred();
                // set the data for pin code poper
                var oView = this.getView();
                var oModelControl = oView.getModel("oModelControl");
                var aArra1 = [];
                if (oPayLoad["AdminZone"]["results"].length > 0) {
                    for (var x of oPayLoad["AdminZone"]["results"]) {
                        aArra1.push(x["ZoneId"]);
                    }
                }
                oModelControl.setProperty("/MultiCombo/Zone", aArra1);
                var aArra2 = [];
                if (oPayLoad["AdminDivision"]["results"].length > 0) {
                    for (var x of oPayLoad["AdminDivision"]["results"]) {
                        aArra2.push(x["DivisionId"]);
                    }
                }
                oModelControl.setProperty("/MultiCombo/Division", aArra2);
                console.log(oModelControl)
                promise.resolve(oPayLoad);
                return promise;
            },

            _setInitViewModel: function () {
                var promise = jQuery.Deferred();
                var oView = this.getView();
                var othat = this;

                var oModelControl = this.getView().getModel("oModelControl")
                var oProp = oModelControl.getProperty("/bindProp");
                var exPand = "AdminZone,AdminDivision";
                return new Promise((resolve, reject) => {
                    oView.getModel("data").read("/" + oProp, {
                        urlParameters: {
                            $expand: exPand,
                        },
                        success: function (data) {

                            var oModel = new JSONModel(data);


                            oView.setModel(oModel, "oModelView");


                            resolve(data);
                        },
                        error: function () {},
                    });
                });

            },
            _CreateControlModel: function (userSet) {
                var promise = $.Deferred();
                var oView = this.getView();
                var oData = {
                    bindProp: userSet !== null ? window.decodeURIComponent(userSet) : null,
                    MultiCombo: {
                        Zone: [],
                        Division: []
                    }
                }
                var oModel = new JSONModel(oData);
                oView.setModel(oModel, "oModelControl");
                promise.resolve();
                return promise;
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
                        /* do something */
                    }
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
            onChangeZone:function(oEvent){
                console.log("zone changed")
                var oView = this.getView();
                var oDivision = oView.byId("division");
                var sKeys = oEvent.getSource().getSelectedKeys();
                var aDivFilter = [];
                for (var y of sKeys) {
                    aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y));
                }
                if(aDivFilter.length>0){
                    oDivision.getBinding("items").filter(aDivFilter);
                    
                }
                this.getView().getModel("oModelControl").setProperty("/MultiCombo/Division",[]);
              
            },

            add: function () {


                var oView = this.getView();
                var name = this.getView().byId("name").getValue();
                var email = this.getView().byId("email").getValue();

                var mobile = this.getView().byId("mobile").getValue();
                var countrycode = this.getView().byId("countrycode").getValue();
                var role = this.getView().byId("role").getSelectedKey();
                var userType = this.getView().byId("iduserType").getSelectedKey();
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
                    UserTypeId: userType,
                    IsBankUpdateAllowed: bBank,
                    IsKYCUpdateAllowed: bKyc,
                    AdminDivision: [],
                    AdminZone: []
                }

                var c1, c2;
                var othat = this;
                c1 = othat._AddMultiComboDataEdit(oData, "Add");
                c1.then(function (oPayload) {
                    c2 = othat._CreateMethod(oPayload);
                })




            },
            _CreateMethod: function (oPayload) {
                var othat = this;
                var oModel = this.getView().getModel("data");
                oModel.create("/AdminSet", oPayload, {
                    success: othat.onSuccessPress("Successfully created!")
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
                    IsKYCUpdateAllowed: bKyc,
                    AdminDivision: [],
                    AdminZone: []
                }


                var editSet = this.getView().getBindingContext("data").getPath();
                var c1, c2;
                var othat = this;
                c1 = othat._AddMultiComboDataEdit(oData, "Edit");
                c1.then(function (oPayload) {
                    c2 = othat._UpdateRequest(oPayload);
                })

                // oModel.update(editSet, oData, {
                //     success: this.onSuccessPress("Successfully Updated!")
                // });
            },
            _UpdateRequest: function (oPayload) {
                var othat = this;
                var editSet = this.getView().getBindingContext("data").getPath();
                var oModel = this.getView().getModel("data");
                oModel.update(editSet, oPayload, {
                    success: othat.onSuccessPress("Successfully Updated!")
                });
            },
            _AddMultiComboDataEdit: function (oPayload, sMode) {
                var promise = $.Deferred();
                var oView = this.getView();
                var oModelView = oView.getModel("oModelView");
                var oModelControl = oView.getModel("oModelControl");
                var sResults = ""
                if (sMode === "Edit") {
                    sResults = "/results"
                }
                //zone
                var aExistingData = oModelView.getProperty("/AdminZone" + sResults);
                var aSelectedData = oModelControl.getProperty("/MultiCombo/Zone")
                var iData = -1;
                var aDataFinal = [];
                for (var x of aSelectedData) {
                    iData = aExistingData.findIndex(item => item["ZoneId"] === x)
                    if (iData >= 0) {
                        //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                        aDataFinal.push(aExistingData[iData]);
                    } else {
                        aDataFinal.push({
                            ZoneId: x
                        });
                    }
                }
                oPayload["AdminZone"] = aDataFinal;
                //Division
                var aExistingData = oModelView.getProperty("/AdminDivision" + sResults);
                var aSelectedData = oModelControl.getProperty("/MultiCombo/Division")
                var iData = -1;
                var aDataFinal = [];
                for (var x of aSelectedData) {
                    iData = aExistingData.findIndex(item => item["DivisionId"] === x)
                    if (iData >= 0) {
                        //oPayload["PainterExpertise"][iExpIndex]["IsArchived"] = false;
                        aDataFinal.push(aExistingData[iData]);
                    } else {
                        aDataFinal.push({
                            DivisionId: x
                        });
                    }
                }
                oPayload["AdminDivision"] = aDataFinal;
                console.log(oPayload);
                promise.resolve(oPayload);
                return promise

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