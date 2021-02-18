// @ts-ignore
sap.ui.define([
    "./BaseController",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/layout/form/FormElement",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
    "sap/m/Input",
    "com/knpl/pragati/MDM/controller/Validator",
], function (BaseController, JSONModel, Fragment, GroupElement, SmartField, FormElement, MessageBox, MessageToast, library, Message, Input, Validator) {
	"use strict";

	return BaseController.extend("com.knpl.pragati.MDM.controller.DetailDetail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

            this._formFragments = {};
            this._ValueState = library.ValueState;
            this._MessageType = library.MessageType;
			this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel("layout");
            var oViewModel = new JSONModel({
                busy: true
            });
            this.getView().setModel(oViewModel, "oModelView");

			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onItemMatched, this);

			/* [oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this); */
		},
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            this.oRouter.navTo("detailDetail",
                {
                    name: this._name,
                    prop: this._prop,
                    fields: this._fields,
                    mode: this._mode,
                    tab: this._tab,
                    layout: sNextLayout
                }
            );
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            this.oRouter.navTo("detailDetail",
                {
                    name: this._name,
                    prop: this._prop,
                    fields: this._fields,
                    mode: this._mode,
                    tab: this._tab,
                    layout: sNextLayout
                }
            );
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
			this.oRouter.navTo("detail", {layout: sNextLayout, tab: this._tab});
		},
		_onItemMatched: function (oEvent) {
            this._fields = window.decodeURIComponent(oEvent.getParameter("arguments").fields);
            this._prop = window.decodeURIComponent(oEvent.getParameter("arguments").prop);
            this._mode = oEvent.getParameter("arguments").mode;
            this._tab = oEvent.getParameter("arguments").tab || this._tab || "0";
            this._name = window.decodeURIComponent(oEvent.getParameter("arguments").name);

            if (this._mode == "edit") {
                this.getView().bindElement("/" + this._prop);
            } else if (this._mode === "add") {
                this.getView().unbindElement();
            }
            this._initData();
            this._showFormFragment("EditDepo");
        },
        _initData: function () {
            var oData = {
                edit: this._mode === "edit" ? true : false,
                mode: this._mode,
                modelProp: this._prop,
                prop1: "Group Title",
                prop2: [],
                titleP1: this._mode === "edit" ? "Edit" : "Add New",
                titleP2: this._name,
                addData: {},
                navBackKey: this._tab,
                busy: false
            };

            var aArray = this._fields.split(",");
            for (var prop in aArray) {
            oData["prop2"].push({
                value: aArray[prop],
                InpVal: "",
            });
            oData["addData"][aArray[prop]] = "";
            }
            var oModel = this.getView().getModel("oModelView");
            oModel.setData(oData);
            this._initMessage();
        },

        _initMessage: function () {
            this.onClearPress();
            // @ts-ignore
            this._oMessageManager = sap.ui.getCore().getMessageManager();
            var oView = this.getView();
            oView.setModel(this._oMessageManager.getMessageModel(), "message");
            this._oMessageManager.registerObject(oView, true);
        },
        onSuccessPress: function (msg) {
            var oMessage = new Message({
                message: msg,
                type: this._MessageType.Success,
                target: "/Dummy",
                processor: this.getView().getModel(),
            });
            // @ts-ignore
            sap.ui.getCore().getMessageManager().addMessages(oMessage);
            //new commit
        },
        onErrorPress: function () {
            var oView = this.getView();
            var oMessage,
            oViewModel = oView.getModel("oModelView"),
            oDataModel = oView.getModel(),
            sElementBPath = "";
            var othat = this;
            var sCheckAdd = oViewModel.getProperty("/mode");
            var oElementBinding = oView.getElementBinding().getPath();
            if (sCheckAdd !== "add") {
                sElementBPath = oView.getElementBinding().getPath();
            }
            for (var oProp of this._ErrorMessages) {
                // @ts-ignore
                oMessage = new sap.ui.core.message.Message({
                    message: oProp["message"],
                    type: othat._MessageType.Error,
                    target: sCheckAdd == "add" ? oProp["target"] : oElementBinding + "/" + oProp["target"],
                    processor: sCheckAdd == "add" ? oViewModel : oDataModel,
                });
                othat._oMessageManager.addMessages(oMessage);
            }
        },
        handleEmptyFields: function (oEvent) {
            this.onErrorPress();
        },

        myFactory: function (sId, oContext) {
            var sEdit = oContext.getModel().getProperty("/edit");
            var oObject = oContext.getObject();
            var sPath, oSmartControl;
            if (sEdit == true) {
                sPath = oObject["value"];
            } else {
                sPath = "oModelView>InpVal";
            }
            var atextFileds = [
                "Title",
                "Description",
                "Depot",
                "KycType",
                "Religion",
                "TrainingType",
                "BusinessGroup",
                "BusinessCategory",
                "ArcheType",
                "MaritalStatus",
                "Language",
                "LanguageCode",
                "ComplaintType",
            ];
            var aUrlFields = ["Url"];
            var aNumberFields = [];
            var aSpecialCharFields = ["LanguageDescription"];

            if (atextFileds.indexOf(oObject["value"]) > -1) {
                oSmartControl = this._CtrlTxtFld(oObject, sPath);
            } else if (aUrlFields.indexOf(oObject["value"]) > -1) {
                oSmartControl = this._CtrlUrlFld(oObject, sPath);
            } else if (aSpecialCharFields.indexOf(oObject["value"]) > -1) {
                oSmartControl = this._CtrlSplChrFld(oObject, sPath);
            }

            return oSmartControl;
        },
        _CtrlTxtFld: function (oObject, sPath) {
            var oSmartControl = new FormElement({
                label: oObject["value"].match(/[A-Z][a-z]+|[0-9]+/g).join(" "),
                fields: [
                    new Input({
                    required: true,
                    value: {
                        path: sPath,
                        type: "sap.ui.model.type.String",
                        constraints: {
                        minLength: "1",
                        maxLength: "50",
                        search: "^[a-zA-Z0-9]{1}[wW]*",
                        },
                    },
                    }), //iput
                ],
            });
            return oSmartControl;
        },
        _CtrlUrlFld: function (oObject, sPath) {
            var oSmartControl = new FormElement({
                label: oObject["value"].match(/[A-Z][a-z]+|[0-9]+/g).join(" "),
                fields: [
                    new Input({
                    required: true,
                    value: {
                        path: sPath,
                        type: "sap.ui.model.type.String",
                        constraints: {
                        search:
                            "^(http://www.|https://www.|http://|https://|www.){1}[a-zA-Z0-9]",
                        },
                    },
                    }), //iput
                ],
            });
            return oSmartControl;
        },
        _CtrlSplChrFld: function (oObject, sPath) {
            var oSmartControl = new FormElement({
                label: oObject["value"].match(/[A-Z][a-z]+|[0-9]+/g).join(" "),
                fields: [
                    new Input({
                    required: true,
                    value: {
                        path: sPath,
                        type: "sap.ui.model.type.String",
                        constraints: {
                        minLength: "1",
                        },
                    },
                    }), //iput
                ],
            });
            return oSmartControl;
        },
        returnIdListOfRequiredFields: function () {
          // @ts-ignore
          let requiredInputs = sap.ui.getCore().byFieldGroupId("InpGoup");
          return requiredInputs;
        },
        validateEventFeedbackForm: function (requiredInputs) {
            this._ErrorMessages = [];
            var aArray = [];
            var othat = this;
            var valid = true;
            requiredInputs.forEach(function (input) {
                var sInput = input;
                if (sInput.getValue().trim() === "" &&
                    sInput.getRequired() === true &&
                    sInput.getVisible() === true) {
                    valid = false;
                    sInput.setValueState("Error");
                    othat._ErrorMessages.push({
                        message:
                            sInput.getParent().getLabel() + " is a mandatory field (*)",
                        target: sInput.getBinding("value").getPath(),
                    });
                } else {
                    sInput.setProperty("valueState", "None");
                }
            });
            return valid;
        },
        onPressSave: function () {
            this.onClearPress();
            var validator = new Validator();
            var passedValidation = validator.validate(this.getView().byId("FormChange354"));
            if (passedValidation === false) {
                return false;
            }

            if (this.getView().getModel("oModelView").getProperty("/edit")) {
                this._saveEdit();
            } else {
                this._saveAdd();
            }
        },
        _saveEdit: function () {
            var that = this,
                oView = this.getView(),
                oModelView = oView.getModel("oModelView"),
                oDataModel = oView.getModel(),
                sTitle = oModelView.getProperty("/titleP2"),
                oDataValue = oDataModel.getProperty(
                    oView.getElementBinding().getPath()
                ),
                oPrpReq = oModelView.getProperty("/prop2"),
                oPayload = {};
            
            oModelView.setProperty("/busy", true);
            for (var x in oPrpReq) {
                oPayload[oPrpReq[x]["value"]] = oDataValue[oPrpReq[x]["value"]];
            }

            oDataModel.update(oView.getElementBinding().getPath(), oPayload, {
                success: function (data) {
                    oModelView.setProperty("/busy", false);
                    MessageToast.show(sTitle + " Successfully Updated.");
                    that.handleClose();
                },
                error: function (data) {
                    oModelView.setProperty("/busy", false);
                    var oRespText = JSON.parse(data.responseText);
                    MessageBox.error(oRespText["error"]["message"]["value"]);
                }
            });
        },
        _saveAdd: function () {
            var that = this,
                oView = this.getView(),
                oDataModel = oView.getModel(),
                oMdlView = oView.getModel("oModelView"),
                sTitle = oMdlView.getProperty("/titleP2"),
                aProp2 = oMdlView.getProperty("/prop2"),
                sEntity = "/" + oMdlView.getProperty("/modelProp"),
                aPayload = {};
            
            oMdlView.setProperty("/busy", true);
            for (var prop of aProp2) {
                aPayload[prop["value"]] = prop["InpVal"];
            }
            
            oDataModel.create(sEntity, aPayload, {
                success: function (data) {
                    oMdlView.setProperty("/busy", false);
                    MessageToast.show(sTitle + " Successfully Created.");
                    that.handleClose();
                },
                error: function (data) {
                    oMdlView.setProperty("/busy", false);
                    var oRespText = JSON.parse(data.responseText);
                    MessageBox.error(oRespText["error"]["message"]["value"]);
                }
            });
        },
        _getFormFragment: function (sFragmentName) {
            var pFormFragment = this._formFragments[sFragmentName],
            oView = this.getView();
            var othat = this;
            if (!pFormFragment) {
                pFormFragment = Fragment.load({
                    id: oView.getId(),
                    name:
                    "com.knpl.pragati.MDM.view.fragment." + sFragmentName,
                    controller: othat,
                });
                this._formFragments[sFragmentName] = pFormFragment;
            }

            return pFormFragment;
        },

        _showFormFragment: function (sFragmentName, mType, mId) {
            var objSection = this.getView().byId("oVbxSmtTbl");
            var oView = this.getView();
            objSection.removeAllItems();
            this._getFormFragment(sFragmentName).then(function (oVBox) {
                oView.addDependent(oVBox);
                objSection.addItem(oVBox);
            });
        },
        _getMessagePopover: function () {
            var oView = this.getView();
            // create popover lazily (singleton)
            if (!this._pMessagePopover) {
                this._pMessagePopover = Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.pragati.MDM.view.fragment.MessagePopover",
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
        onClearPress: function () {
            // does not remove the manually set ValueStateText we set in onValueStatePress():
            // @ts-ignore
            sap.ui.getCore().getMessageManager().removeAllMessages();
        }
	});
});
