sap.ui.define(
  [
    "com/knpl/pragati/MasterDataManagement/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/layout/form/FormElement",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
    "sap/m/Input",
    "com/knpl/pragati/MasterDataManagement/controller/Validator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    Fragment,
    JSONModel,
    GroupElement,
    SmartField,
    FormElement,
    MessageBox,
    MessageToast,
    library,
    Message,
    Input,
    Validator
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.MasterDataManagement.controller.EditTable",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          this._formFragments = {};
          this._ValueState = library.ValueState;
          this._MessageType = library.MessageType;

          oRouter
            .getRoute("RouteEditTable")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var sArgsFields = window.decodeURIComponent(
            oEvent.getParameter("arguments").fields
          );
          var sArgesProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          ); //popperty
          var sArgesMode = oEvent.getParameter("arguments").mode;
          var sArgKey = oEvent.getParameter("arguments").key;
          var sArgName = window.decodeURIComponent(
            oEvent.getParameter("arguments").name
          );
          console.log(sArgsFields, sArgesProp, sArgesMode, sArgName);

          if (sArgesMode == "edit") {
            this.getView().bindElement("/" + sArgesProp);
          } else if (sArgesMode === "add") {
            this.getView().unbindElement();
          }
          this._initData(
            sArgsFields,
            sArgesMode,
            sArgName,
            sArgesProp,
            sArgKey
          );
          this._showFormFragment("EditDepo");
        },
        _initData: function (
          sArgsType,
          sArgesMode,
          sArgName,
          sArgesProp,
          sArgKey
        ) {
          var oData = {
            edit: sArgesMode == "edit" ? true : false,
            mode: sArgesMode,
            modelProp: sArgesProp,
            prop1: "Group Title",
            prop2: [],
            titleP1: sArgesMode == "edit" ? "Edit" : "Add New",
            titleP2: sArgName,
            addData: {},
            navBackKey: sArgKey,
            busy: false,
          };

          var aArray = sArgsType.split(",");
          for (var prop in aArray) {
            oData["prop2"].push({
              value: aArray[prop],
              InpVal: "",
            });
            oData["addData"][aArray[prop]] = "";
          }
          console.log(oData);
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelView");
          this._initMessage();
        },

        _initMessage: function () {
          this.onClearPress();
          this._oMessageManager = sap.ui.getCore().getMessageManager();
          var oView = this.getView();
          oView.setModel(this._oMessageManager.getMessageModel(), "message");
          this._oMessageManager.registerObject(oView, true);
        },
        navPressBack: function () {
          console.log(
            this.getView().getModel("oModelView").getProperty("/navBackKey")
          );
          var oRouter = this.getOwnerComponent().getRouter();

          oRouter.navTo("RouteMaster", {
            "?query": {
              tab: this.getView()
                .getModel("oModelView")
                .getProperty("/navBackKey"),
            },
          });
          //this.getView().getModel().resetChanges();
        },
        onSuccessPress: function (msg) {
          var oMessage = new Message({
            message: msg,
            type: this._MessageType.Success,
            target: "/Dummy",
            processor: this.getView().getModel(),
          });
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
          console.log(this._ErrorMessages, sCheckAdd);
          for (var oProp of this._ErrorMessages) {
            oMessage = new sap.ui.core.message.Message({
              message: oProp["message"],
              type: othat._MessageType.Error,
              target:
                sCheckAdd == "add"
                  ? oProp["target"]
                  : oElementBinding + "/" + oProp["target"],
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
          console.log(sPath);
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
            "FAQCategory"
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

            if (
              sInput.getValue().trim() === "" &&
              sInput.getRequired() === true &&
              sInput.getVisible() === true
            ) {
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
          console.log(this._ErrorMessages);
          return valid;
        },
        onPressSave: function () {
          this.onClearPress();
          var validator = new Validator();
          var passedValidation = validator.validate(
            this.getView().byId("FormChange354")
          );
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
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          oModelView.setProperty("/busy", true);
          var oDataModel = oView.getModel();
          var sTitle = oModelView.getProperty("/titleP2");
          var oRouter = this.getOwnerComponent().getRouter();
          var navKey = oModelView.getProperty("/navBackKey");
          var oDataValue = oDataModel.getProperty(
            oView.getElementBinding().getPath()
          );
          var oPrpReq = oModelView.getProperty("/prop2");
          var oPayload = {};
          for (var x in oPrpReq) {
            oPayload[oPrpReq[x]["value"]] = oDataValue[oPrpReq[x]["value"]];
          }

          oDataModel.update(oView.getElementBinding().getPath(), oPayload, {
            success: function (data) {
              oModelView.setProperty("/busy", false);
              MessageToast.show(sTitle + " Successfully Updated.");
              oRouter.navTo("RouteMaster", {
                "?query": {
                  tab: navKey,
                },
              });
            },
            error: function (data) {
              oModelView.setProperty("/busy", false);
              var oRespText = JSON.parse(data.responseText);

              MessageBox.error(oRespText["error"]["message"]["value"]);
            },
          });
        },
        _saveAdd: function () {
          var oView = this.getView();
          var oDataModel = oView.getModel();
          var oMdlView = oView.getModel("oModelView");
          oMdlView.setProperty("/busy", true);
          var sEntity = "/" + oMdlView.getProperty("/modelProp");
          var aPayload = {},
            aProp2 = oMdlView.getProperty("/prop2");
          for (var prop of aProp2) {
            aPayload[prop["value"]] = prop["InpVal"];
          }
          console.log(aPayload);
          var sTitle = oMdlView.getProperty("/titleP2");
          var oRouter = this.getOwnerComponent().getRouter();
          var navKey = oMdlView.getProperty("/navBackKey");
          oDataModel.create(sEntity, aPayload, {
            success: function (data) {
              oMdlView.setProperty("/busy", false);
              MessageToast.show(sTitle + " Successfully Created.");
              oRouter.navTo("RouteMaster", {
                "?query": {
                  tab: navKey,
                },
              });
            },
            error: function (data) {
              oMdlView.setProperty("/busy", false);
              var oRespText = JSON.parse(data.responseText);
              MessageBox.error(oRespText["error"]["message"]["value"]);
            },
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
                "com.knpl.pragati.MasterDataManagement.view." + sFragmentName,
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
              name: "com.knpl.pragati.MasterDataManagement.view.MessagePopover",
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
          sap.ui.getCore().getMessageManager().removeAllMessages();
        },
      }
    );
  }
);
