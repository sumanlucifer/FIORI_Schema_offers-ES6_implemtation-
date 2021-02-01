sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/layout/form/FormElement",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    Fragment,
    JSONModel,
    GroupElement,
    SmartField,
    FormElement,
    MessageBox,
    MessageToast,
    library,
    Message
  ) {
    "use strict";

    return Controller.extend(
      "com.knpl.pragati.MasterDataManagement.controller.EditTable",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          this._formFragments = {};
          this._ValueState = library.ValueState;
          this._MessageType = library.MessageType;
          var oMessageManager = sap.ui.getCore().getMessageManager();
          var oView = this.getView();
          oView.setModel(oMessageManager.getMessageModel(), "message");
          oMessageManager.registerObject(oView, true);
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
          this.onClearPress();
          this.getView().bindElement("/" + sArgesProp);
          this._initData(sArgsFields, sArgesMode, sArgName, sArgesProp,sArgKey);
          this._showFormFragment("EditDepo");
        },
        _initData: function (sArgsType, sArgesMode, sArgName, sArgesProp,sArgKey) {
          var oData = {
            edit: sArgesMode == "edit" ? true : false,
            modelProp: sArgesProp,
            prop1: "Group Title",
            prop2: [],
            titleP1: sArgesMode == "edit" ? "Edit" : "Add New",
            titleP2: sArgName,
            addData: {},
            navBackKey:sArgKey
          };

          var aArray = sArgsType.split(",");
          for (var prop in aArray) {
            oData["prop2"].push({
              value: aArray[prop],
            });
            oData["addData"][aArray[prop]] = "";
          }
          console.log(oData);
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelView");
        },
        navPressBack: function () {
          console.log(this.getView().getModel("oModelView").getProperty("/navBackKey"))
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteMaster",{
              "?query":{
                tab:this.getView().getModel("oModelView").getProperty("/navBackKey")
              }
          })
        },
        onSuccessPress: function (msg) {
          var oMessage = new Message({
            message: msg,
            type: this._MessageType.Success,
            target: "/Dummy",
            processor: this.getView().getModel(),
          });
          sap.ui.getCore().getMessageManager().addMessages(oMessage);
        },
        onErrorPress: function () {
          var oMessage = new Message({
            message: "Mandatory Fields Are Empty!",
            type: this._MessageType.Error,
            target: "/Dummy",
            processor: this.getView().getModel(),
          });
          sap.ui.getCore().getMessageManager().addMessages(oMessage);
        },
        handleEmptyFields: function (oEvent) {
          this.onErrorPress();
        },

        myFactory: function (sId, oContext) {
          var sEdit = oContext.getModel().getProperty("/edit");
          console.log(sId);
          var oSmartControl = new FormElement({
            label: oContext.getObject()["value"],
            fields: [
              new sap.m.Input({
                required: true,

                fieldGroupIds: "InpGoup",
                value:
                  sEdit == true
                    ? "{" + oContext.getObject()["value"] + "}"
                    : "{oModelView>/addData/" +
                      oContext.getObject()["value"] +
                      "}",
              }),
            ],
          });

          return oSmartControl;
        },
        returnIdListOfRequiredFields: function () {
          let requiredInputs = sap.ui.getCore().byFieldGroupId("InpGoup");
          return requiredInputs;
        },
        validateEventFeedbackForm: function (requiredInputs) {
          var _self = this;
          var valid = true;
          requiredInputs.forEach(function (input) {
            var sInput = input;
            if (sInput.getValue() == "" || sInput.getValue() == undefined) {
              valid = false;
              sInput.setValueState("Error");
            } else {
              sInput.setValueState("None");
            }
          });
          return valid;
        },
        onPressSave: function () {
          var requiredInputs = sap.ui.getCore().byFieldGroupId("InpGoup");
          var passedValidation = this.validateEventFeedbackForm(requiredInputs);
          if (passedValidation === false) {
            //show an error message, rest of code will not execute.
            this.handleEmptyFields();
            return false;
          }

          if (this.getView().getModel("oModelView").getProperty("/edit")) {
            //this._saveEdit();
          } else {
            //this._saveAdd();
          }
        },
        _saveEdit: function () {
          var oDataModel = this.getView().getModel();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var sTitle = oModelView.getProperty("/titleP2");
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
              MessageToast.show(sTitle + " Successfully Updated.");
            },
            error: function (data) {
              var oRespText = JSON.parse(data.responseText);
              MessageBox.error(oRespText["error"]["message"]["value"]);
            },
          });
        },
        _saveAdd: function () {
          var oView = this.getView();
          var oDataModel = oView.getModel();
          var oMdlView = oView.getModel("oModelView");
          var sEntity = "/" + oMdlView.getProperty("/modelProp");
          var aPayload = oMdlView.getProperty("/addData");
          var sTitle = oMdlView.getProperty("/titleP2");
          oDataModel.create(sEntity, aPayload, {
            success: function (data) {
              MessageToast.show(sTitle + " Successfully Created.");
            },
            error: function (data) {
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
        }
      }
    );
  }
);
