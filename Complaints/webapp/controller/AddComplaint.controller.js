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
    "com/knpl/pragati/Complaints/model/cmbxDtype2"
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
    History,
    customInt,
    cmbxDtype2
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
              ResolutionId: "",
              TokenCode: "",
              RewardPoints: "",
              RewardGiftId: "",
              ResolutionOthers:""
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

           var oDataControl = {
            TokenCode: true,
            tokenCodeValue: "",
          };
         
          var oModelControl = new JSONModel(oDataControl);
          this.getView().setModel(oModelControl, "oModelControl");

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
          var oAddCompData = oViewModel.getProperty("/addComplaint");
          var oModelContrl = this.getView().getModel("oModelControl");

          // if tokecode property is set to true, we have make the string empty
          if(oModelContrl.getProperty("/TokenCode")==true){
            oAddCompData["RewardPoints"]="";
            oAddCompData["TokenCode"]="";
          }
          var oPayLoad = this._ReturnObjects(oAddCompData);
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
         var oModelControl = oView.getModel("oModelControl");
          var oCmbxSubType = oView.byId("idCompainSubType");
          var oFilter = new Filter("ComplaintTypeId", FilterOperator.EQ, sKey);
          oCmbxSubType.clearSelection();
          oCmbxSubType.setValue("");
          oCmbxSubType.getBinding("items").filter(oFilter);
          if(sKey=="1" || sKey=="2"){
            oViewModel.setProperty("/addComplaint/RewardPoints", "");
            oViewModel.setProperty("/addComplaint/TokenCode", "");
            oModelControl.setProperty("/tokenCodeValue", "");
            oModelControl.setProperty("/TokenCode", true);
          }
        },
        onPressTokenCode:function(){
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            var oModelControl = oView.getModel("oModelControl");
            var oData = oView.getModel();
            var sPainterId=oModelView.getProperty("/addComplaint/PainterId");
            var sTokenCode = oModelControl.getProperty("/tokenCodeValue");

            if(sPainterId==""){
                MessageToast.show("Kindly select a valid painter")
                return                
            }
            if(sTokenCode==""){
                MessageToast.show("Kindly Input the token code.");
                return;    
            }
            oData.read("/QRCodeValidationAdmin", {
            urlParameters: {
              qrcode: "'" + sTokenCode + "'",
              painterid: sPainterId,
            },
            success: function (oData) {
              if (oData !== null) {
                if (oData.hasOwnProperty("Status")) {
                  if (oData["Status"] == true) {
                    oModelView.setProperty(
                      "/addComplaint/RewardPoints",
                      oData["RewardPoints"]
                    );
                     oModelView.setProperty("/addComplaint/TokenCode", sTokenCode);
                    oModelControl.setProperty("/TokenCode", false);
                    MessageToast.show(oData["Message"]);
                  } else if (oData["Status"] == false) {
                    oModelView.setProperty("/addComplaint/RewardPoints", "");
                    oModelView.setProperty("/addComplaint/TokenCode", "");
                    oModelControl.setProperty("/tokenCodeValue", "");
                    oModelControl.setProperty("/TokenCode", true);
                    MessageToast.show(oData["Message"]);
                  }
                }
              }
            },
            error: function () {
              
            },
          });

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
                new Filter(
                  [
                    new Filter(
                      "tolower(Name)",
                      FilterOperator.Contains,
                      "'" +
                        sInputValue.trim().toLowerCase().replace("'", "''") +
                        "'"
                    ),
                    new Filter(
                      "Mobile",
                      FilterOperator.Contains,
                      sInputValue.trim()
                    ),
                  ],
                  false
                ),
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
        onChangeResolution:function(oEvent){
            var oView = this.getView();
            var oModel = oView.getModel("oModelView");
            var sKey = oEvent.getSource().getSelectedKey();
            if(sKey!==22){
                oModel.setProperty("/addComplaint/ResolutionOthers","");
            }
            console.log(oModel);
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
            name: "com.knpl.pragati.Complaints.view.fragments." + sFragmentName,
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
