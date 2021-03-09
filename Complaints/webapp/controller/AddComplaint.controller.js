sap.ui.define(
  [
    "com/knpl/pragati/Complaints/controller/BaseController",
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
    "sap/ui/core/ValueState",
    "com/knpl/pragati/Complaints/controller/Validator",
    "sap/ui/model/type/Date",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "com/knpl/pragati/Complaints/model/customInt",
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
    DatePicker,
    ValueState,
    Validator,
    DateType,
    Filter,
    FilterOperator,
    DateFormat,
    History
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Complaints.controller.AddComplaint",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          sap.ui.getCore().attachValidationError(function (oEvent) {
            if (oEvent.getParameter("element").getRequired()) {
              oEvent.getParameter("element").setValueState(ValueState.Error);
            } else {
              oEvent.getParameter("element").setValueState(ValueState.None);
            }
          });
          sap.ui.getCore().attachValidationSuccess(function (oEvent) {
            oEvent.getParameter("element").setValueState(ValueState.None);
          });

          oRouter
            .getRoute("RouteAddCmp")
            .attachMatched(this._onRouteMatched, this);
          this._ValueState = library.ValueState;
          this._MessageType = library.MessageType;
        },
        _onRouteMatched: function (oEvent) {
          this._GetServiceData();
          this._initData("add", "");
        },
        _GetServiceData: function () {},
        _initData: function (mParMode, mKey) {
          var oViewModel = new JSONModel({
            sIctbTitle: mParMode == "add" ? "Add" : "Edit",
            busy: false,
            mPainterKey: mKey,
            addComplaint: {
              PainterId: "",
              ComplaintTypeId: "",
              ComplaintSubtypeId: "",
              Resolution: "",
              TokenCode: "",
              RewardPoints: "",
              RewardGiftId: "",
            },
            addCompAddData: {
              MembershipCard: "",
              Mobile: "",
              Name: "",
            },
          });

          if (mParMode == "add") {
            this._showFormFragment("AddComplaint");
            this.getView().unbindElement();
          } else {
          }

          this._formFragments; //used for the fragments of the add and edit forms
          this.getView().setModel(oViewModel, "oModelView");
          //this._initMessage(oViewModel);
          this.getView().getModel().resetChanges();
          //used to intialize the message class for displaying the messages
        },
        onPressSave: function () {
          var oModel = this.getView().getModel("oModelView");
          var oValidator = new Validator();
          var oVbox = this.getView().byId("idVbx");
          var bValidation = oValidator.validate(oVbox, true);
          var cTbleFamily = !oModel.getProperty("/EditTb1FDL");
          var dTbleAssets = !oModel.getProperty("/EditTb2AST");

          if (bValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue."
            );
          }
          if (bValidation) {
            this._postDataToSave();
          }
        },
        _postDataToSave: function () {
          var oViewModel = this.getView().getModel("oModelView");
          var oPayLoad = this._ReturnObjects(
            oViewModel.getProperty("/addComplaint")
          );
          var othat = this;
          var oData = this.getView().getModel();
          console.log(oPayLoad);
          oData.create("/PainterComplainsSet", oPayLoad, {
            success: function (oData) {
              MessageToast.show("Complaint Sucessfully Created");
              othat.navPressBack();
            },
            error: function (a) {
              MessageBox.error(
                "Unable to create a complaint due to the server issues",
                {
                  title: "Error Code: " + a.statusCode,
                }
              );
            },
          });
        },
        _ReturnObjects: function (mParam) {
          var obj = Object.assign({}, mParam);
          var oNew = Object.entries(obj).reduce(
            (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)),
            {}
          );

          var patt1 = /Id/g;

          for (var i in oNew) {
            if (i.match(patt1) !== null) {
              oNew[i] = parseInt(oNew[i]);
            }
            if (i === "RewardPoints") {
              oNew[i] = parseInt(oNew[i]);
            }
          }
          return oNew;
        },
        onCmpTypChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey();
          var oView = this.getView();
          var oViewModel = oView.getModel("oModelView");
          if (sKey.toString() !== "8") {
            oViewModel.setProperty("/addComplaint/TokenCode", "");
            oViewModel.setProperty("/addComplaint/RewardPoints", "");
            var aArray1 = ["idTokenCode", "idPoints"];
            aArray1.forEach(function (sId) {
              oView.byId(sId).setValue("");
              oView.byId(sId).setValueState("None");
            });
          }
          if (sKey.toString() !== "14") {
            oViewModel.setProperty("/addComplaint/RewardGiftId", "");
            oViewModel.setProperty("/addComplaint/RewardPoints", "");
            var aArray1 = ["idGifts", "idPoints"];
            aArray1.forEach(function (sId) {
              oView.byId(sId).setValue("");
              oView.byId(sId).setValueState("None");
            });
          }
        },
        onValueHelpRequest: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue(),
            oView = this.getView();

          if (!this._pValueHelpDialog) {
            this._pValueHelpDialog = Fragment.load({
              id: oView.getId(),
              name:
                "com.knpl.pragati.Complaints.view.fragments.ValueHelpDialog",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          this._pValueHelpDialog.then(function (oDialog) {
            // Create a filter for the binding
            oDialog
              .getBinding("items")
              .filter([
                new Filter("Name", FilterOperator.Contains, sInputValue),
              ]);
            // Open ValueHelpDialog filtered by the input's value
            oDialog.open(sInputValue);
          });
        },
        onValueHelpSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter(
            [
              new Filter(
                "tolower(Name)",
                FilterOperator.Contains,
                "'" + sValue.trim().toLowerCase().replace("'", "''") + "'"
              ),
              new Filter("Mobile", FilterOperator.Contains, sValue.trim()),
            ],
            false
          );

          oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        onValueHelpClose: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
          var oViewModel = this.getView().getModel("oModelView");
          if (!oSelectedItem) {
            return;
          }
          var obj = oSelectedItem.getBindingContext().getObject();
          oViewModel.setProperty(
            "/addCompAddData/MembershipCard",
            obj["MembershipCard"]
          );
          oViewModel.setProperty("/addCompAddData/Mobile", obj["Mobile"]);
          oViewModel.setProperty("/addCompAddData/Name", obj["Name"]);
          oViewModel.setProperty("/addComplaint/PainterId", obj["Id"]);
        },
        onAfterRendering: function () {
          //var oModel = this.getView().getModel("oModelView");
          //this._initMessage(oModel);
        },
        _initMessage: function (oViewModel) {
          this._onClearMgsClass();
          this._oMessageManager = sap.ui.getCore().getMessageManager();
          var oView = this.getView();

          oView.setModel(this._oMessageManager.getMessageModel(), "message");
          this._oMessageManager.registerObject(oView, true);
        },
        navPressBack: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("worklist", {}, true);
          }
        },
        _showFormFragment: function (sFragmentName) {
          var objSection = this.getView().byId("oVbxSmtTbl");
          var oView = this.getView();
          objSection.destroyItems();
          var othat = this;
          this._getFormFragment(sFragmentName).then(function (oVBox) {
            oView.addDependent(oVBox);
            objSection.addItem(oVBox);
            
          });
        },

        _getFormFragment: function (sFragmentName) {
          var oView = this.getView();
          var othat = this;
          // if (!this._formFragments) {
          this._formFragments = Fragment.load({
            id: oView.getId(),
            name:
              "com.knpl.pragati.Complaints.view.fragments." +
              sFragmentName,
            controller: othat,
          }).then(function (oFragament) {
            return oFragament;
          });
          // }

          return this._formFragments;
        },

        onExit: function () {},
      }
    );
  }
);
