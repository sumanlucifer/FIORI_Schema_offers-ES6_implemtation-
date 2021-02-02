sap.ui.define(
  [
    "com/knpl/pragati/ContactPainter/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
    "sap/m/DatePicker",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    MessageBox,
    MessageToast,
    Fragment,
    FormElement,
    Input,
    Label,
    library,
    Message,
    DatePicker
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.AddEditPainter",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();

          oRouter
            .getRoute("RouteAddEditP")
            .attachMatched(this._onRouteMatched, this);
          this._ValueState = library.ValueState;
          this._MessageType = library.MessageType;
        },
        _onRouteMatched: function (oEvent) {
          var sArgMode = oEvent.getParameter("arguments").mode;
          var sArgId = window.decodeURIComponent(
            oEvent.getParameter("arguments").id
          );
          console.log(sArgMode, sArgId);
          this.getView().bindElement("/" + sArgId);
          this._initData(sArgMode, sArgId);
        },
        _initData: function (mParMode, mKey) {
          var oViewModel = new JSONModel({
            sIctbTitle: mParMode == "add" ? "Add" : "Edit",
            mPainterKey: mKey,
            mode: mParMode,
            edit: mParMode == "add" ? false : true,
            prop2: [
              {
                value: "Name",
                label: "Name",
                required: true,
                type: "Text",
                placeholder: "Enter the Painter's Name",
                aggregationType: "Input",
              },
              {
                value: "Mobile",
                label: "Mobile Number",
                required: true,
                type: "Number",
                placeholder: "Enter the Painter's Mobile Number",
                aggregationType: "Input",
              },
              {
                value: "DOB",
                label: "Date of Birth",
                required: true,
                type: "Number",
                placeholder: "Format DDMMYY",
                aggregationType: "Date",
              },
              {
                value: "Email",
                label: "Email",
                required: false,
                type: "Email",
                placeholder: "Enter the Painter's Email",
                aggregationType: "Input",
              },
            ],
            addData: {
              Name: "",
              Mobile: "",
              DOB: "",
              Email: "",
            },
            addProps: ["Name", "Mobile", "DOB", "Email"],
          });
          var oViewModel2 = new JSONModel({
            busy: true,
            delay: 0,
          });
          this._showFormFragment("EditPainter");
          this._formFragments;
          //add data validation
          this.onClearPress();
          var oMessageManager = sap.ui.getCore().getMessageManager();
          var oView = this.getView();
          oView.setModel(oMessageManager.getMessageModel(), "message");
          oMessageManager.registerObject(oView, true);
          //setting model
          this.setModel(oViewModel2, "oModel2");
          this.setModel(oViewModel, "oModelView");
        },

        navPressBack: function () {
          this.getOwnerComponent().getRouter().navTo("RoutePList");
        },
        _showFormFragment: function (sFragmentName) {
          var objSection = this.getView().byId("oVbxSmtTbl");
          var oView = this.getView();
          objSection.removeAllItems();
          this._getFormFragment(sFragmentName).then(function (oVBox) {
            oView.addDependent(oVBox);
            objSection.addItem(oVBox);
          });
        },
        _getFormFragment: function (sFragmentName) {
          var oView = this.getView();
          var othat = this;
          if (!this._formFragments) {
            this._formFragments = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.ContactPainter.view." + sFragmentName,
              controller: othat,
            }).then(function (oFragament) {
              return oFragament;
            });
          }

          return this._formFragments;
        },
        myFactory: function (sId, oContext) {
          var sEdit = oContext.getModel().getProperty("/mode");
          var object = oContext.getObject();
          console.log(
            "1{oModelView>" +
              oContext.getModel().getProperty(oContext.getPath())["value"] +
              "}"
          );
          var oSmartControl;
          if (object["aggregationType"] == "Input") {
            oSmartControl = new FormElement({
              label: "{oModelView>label}",
              fields: [
                new Input({
                  required: "{oModelView>required}",
                  fieldGroupIds: "InpGoup",
                  type: "{oModelView>type}",
                  placeholder: "{oModelView>placeholder}",
                  value:
                    sEdit == "add"
                      ? "{oModelView>/addData/" +
                        oContext.getModel().getProperty(oContext.getPath())[
                          "value"
                        ] +
                        "}"
                      : "{" +
                        oContext.getModel().getProperty(oContext.getPath())[
                          "value"
                        ] +
                        "}",
                }),
              ],
            });
          } else if (object["aggregationType"] == "Date") {
            oSmartControl = new FormElement({
              label: "{oModelView>label}",
              fields: [
                new DatePicker({
                  required: "{oModelView>required}",
                  fieldGroupIds: "InpGoup",
                  placeholder: "{oModelView>placeholder}",
                  displayFormat: "long",
                  dateValue:
                    sEdit == "add"
                      ? "{oModelView>/addData/" +
                        oContext.getModel().getProperty(oContext.getPath())[
                          "value"
                        ] +
                        "}"
                      : "{" +
                        oContext.getModel().getProperty(oContext.getPath())[
                          "value"
                        ] +
                        "}",
                }),
              ],
            });
          }

          return oSmartControl;
        },
        //adding the code for the valuehelp

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
        validateEventFeedbackForm: function (requiredInputs) {
          var _self = this;
          var valid = true;
          requiredInputs.forEach(function (input) {
            var sInput = input;
            try {
              if (
                (sInput.getValue() == "" || sInput.getValue() == undefined) &&
                sInput.getRequired()
              ) {
                valid = false;
                sInput.setValueState("Error");
              } else {
                sInput.setValueState("None");
              }
            } catch (error) {
               
            }
          });
          return valid;
        },
        _getMessagePopover: function () {
          var oView = this.getView();
          // create popover lazily (singleton)
          if (!this._pMessagePopover) {
            this._pMessagePopover = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.ContactPainter.view.MessagePopover",
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
        onPressSave: function () {
          var requiredInputs = sap.ui.getCore().byFieldGroupId("InpGoup");
          var passedValidation = this.validateEventFeedbackForm(requiredInputs);
          if (passedValidation === false) {
            //show an error message, rest of code will not execute.
            this.handleEmptyFields();
            return false;
          }
          if (this.getView().getModel("oModelView").getProperty("/edit")) {
            this._saveEdit();
          } else {
            this._saveAdd();
          }
        },
        _saveEdit: function () {
          var oDataModel = this.getView().getModel();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var sEntityPath = oView.getElementBinding().getPath();
          var oDataValue = oDataModel.getProperty(sEntityPath);
          var oPrpReq = oModelView.getProperty("/prop2");
          var oPayload = {};
          for (var x in oPrpReq) {
            oPayload[oPrpReq[x]["value"]] = oDataValue[oPrpReq[x]["value"]];
          }

          oDataModel.update(sEntityPath, oPayload, {
            success: function (data) {
              MessageToast.show(
                "Painter " + oPayload["Name"] + " Successfully Updated."
              );
            },
            error: function (data) {
              var oRespText = data["message"];
              MessageBox.error(oRespText);
            },
          });
        },
        _saveAdd: function () {
          var oView = this.getView();
          var oDataModel = oView.getModel();
          var oMdlView = oView.getModel("oModelView");
          var sEntity = "/PainterRegistrationSet";
          var aPayload = oMdlView.getProperty("/addData");
          oDataModel.create(sEntity, aPayload, {
            success: function (data) {
              MessageToast.show(
                "Painter " + aPayload["Name"] + " Successfully Created."
              );
            },
            error: function (data) {},
          });
        },
      }
    );
  }
);
