sap.ui.define(
  [
    "com/knpl/pragati/ComplaintManagement/controller/BaseController",
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
    "com/knpl/pragati/ComplaintManagement/controller/Validator",
    "sap/ui/model/type/Date",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "com/knpl/pragati/ComplaintManagement/model/customInt",
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
      "com.knpl.pragati.ComplaintManagement.controller.AddComplaint",
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
              RewardGiftId:""
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
          console.log(oViewModel);

          var oPayLoad = this._ReturnObjects(
            oViewModel.getProperty("/addComplaint")
          );
          var othat = this;
          var oData = this.getView().getModel();
          console.log(oPayLoad);
          oData.create("/ComplaintSet", oPayLoad, {
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
                "com.knpl.pragati.ComplaintManagement.view.fragments.ValueHelpDialog",
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
            othat._setDataValue.call(othat);
          });
        },
        _setDataValue: function () {
          var oInput = this.getView().byId("idAddAcntNum");
          oInput.addEventDelegate(
            {
              onAfterRendering: function () {
                var oInput = this.$().find(".sapMInputBaseInner");
                var oID = oInput[0].id;
                $("#" + oID).bind("cut copy paste", function (e) {
                  e.preventDefault();
                  return false;
                });
              },
            },
            oInput
          );
        },
        _getFormFragment: function (sFragmentName) {
          var oView = this.getView();
          var othat = this;
          // if (!this._formFragments) {
          this._formFragments = Fragment.load({
            id: oView.getId(),
            name:
              "com.knpl.pragati.ComplaintManagement.view.fragments." +
              sFragmentName,
            controller: othat,
          }).then(function (oFragament) {
            return oFragament;
          });
          // }

          return this._formFragments;
        },
        onSecMobLinkPress: function () {
          this.getView()
            .getModel("oModelView")
            .setProperty("/AnotherMobField", true);
        },
        onPrimaryNoChang: function (oEvent) {
          var oSource = oEvent.getSource();
          if (oSource.getValueState() == "Error") {
            return;
          }
          var bFlag = true;
          var sBindValue = "";
          var oSouceBinding = oSource.getBinding("value").getPath();
          var aFieldGroup = sap.ui.getCore().byFieldGroupId("Mobile");

          var oModelView = this.getView().getModel("oModelView");
          for (var i of aFieldGroup) {
            if (oSource.getValue().trim() === "") {
              break;
            }
            if (oSource.getId() === i.getId()) {
              continue;
            }
            if (i.getValue().trim() === oSource.getValue().trim()) {
              bFlag = false;
              sBindValue = i.getBinding("value").getPath();
            }
          }
          var oJson = {
            "/PainterDetails/Mobile": "Primary Mobile",
            "/PainterAddDet/SMobile1": "Secondry Mobile",
            "/PainterAddDet/SMobile2": "Secondry Mobile",
          };
          if (!bFlag) {
            oSource.setValue("");
            oModelView.setProperty(oSouceBinding, "");
            MessageToast.show(
              "This mobile number is already entered in " +
                oJson[sBindValue] +
                " kindly eneter a new number"
            );
          }
        },
        onPrimaryAcChange: function (oEvent) {
          var oView = this.getView();
          var oSource = oEvent.getSource();
          var oSourceVal = oSource.getValue().trim();
          var oSecAccNo = oView.byId("idCnfAcntNum");
          var sSecAccVal = oSecAccNo.getValue().trim();
          if (sSecAccVal === "") {
            return;
          } else {
            MessageToast.show(
              "Kindly enter the same account number in the 'Confirm Account Number' field."
            );
            oSecAccNo.setValue("");
          }
        },
        onConfAccChng: function (oEvent) {
          var oView = this.getView();
          var oPrimAcNum = oView.byId("idAddAcntNum");
          var oSecNumber = oEvent.getSource().getValue();
          if (oSecNumber.trim() !== oPrimAcNum.getValue().trim()) {
            MessageToast.show(
              "Account Number doesn't match, kindly enter it again."
            );
            oEvent.getSource().setValue("");
          }
          //console.log(oView.getModel("oModelView"));
        },
        onStateChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey();
          var oView = this.getView();
          var oCity = oView.byId("cmbCity"),
            oBindingCity,
            aFilter = [],
            oView = this.getView();
          if (sKey !== null) {
            oCity.clearSelection();
            oCity.setValue("");
            oBindingCity = oCity.getBinding("items");
            aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
            oBindingCity.filter(aFilter);
          }
        },
        onLinkPrimryChange: function (oEvent) {
          var oSource = oEvent.getSource();
          var sSkey = oSource.getSelectedKey();
          var sItem = oSource.getSelectedItem();
          var oView = this.getView();
          var mCmbx = oView.byId("mcmbxDlr").getSelectedKeys();
          var sFlag = true;
          for (var i of mCmbx) {
            if (parseInt(i) == parseInt(sSkey)) {
              sFlag = false;
            }
          }
          if (!sFlag) {
            oSource.clearSelection();
            //oSource.setValue("");
            MessageToast.show(
              "Kindly select a different dealer as its already selected as secondry dealer."
            );
          }
        },
        secDealerChanged: function (oEvent) {
          var oView = this.getView();
          var sPkey = oView.byId("cmbxPDlr").getSelectedKey();
          var mBox = oEvent.getSource();
          var oItem = oEvent.getParameters()["changedItem"];
          var sSKey = oItem.getProperty("key");
          if (sPkey == sSKey) {
            mBox.removeSelectedItem(oItem);
            mBox.removeSelectedItem(sSKey);
            MessageToast.show(
              oItem.getProperty("text") +
                " is already selected in the Primary Dealer"
            );
          }
        },
        onFamilyCmbxChng: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();

          oModel.refresh();
        },
        onPressAddFamliy: function () {
          var oModel = this.getView().getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                MessageToast.show(
                  "Save or delete the existing data in the table before adding a new data."
                );
                break;
              }
            }
          }
          if (bFlag == true) {
            oFamiDtlMdl.push({
              RelationshipId: "",
              Mobile: "",
              Name: "",
              editable: true,
            });
            oModel.setProperty("/EditTb1FDL", true);

            //relvalue and editable properties are added here and will be removed in the postsave function
          }
        },
        onPressEditRel: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          oObject["editable"] = true;

          oModel.refresh();
          this._setFDLTbleFlag();
        },
        onPressFDLSave: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();

          var oTable = oView.byId("idFamilyDetils");
          var oCells = oEvent.getSource().getParent().getParent().getCells();
          var oValidator = new Validator();
          var cFlag = oValidator.validate(oCells);

          var bFlag = true;
          //var cFlag = oValidator.validate();
          var oCheckProp = ["RelationshipId", "Mobile", "Name"];
          for (var abc in oCheckProp) {
            if (oObject[abc] == "") {
              bFlag = false;
              break;
            }
          }

          if (bFlag && cFlag) {
            oObject["editable"] = false;
            oModel.refresh(true);
          } else {
            MessageToast.show(
              "Kindly input 'family details' value in a proper format to continue"
            );
          }
          //oModel.refresh(true);
          this._setFDLTbleFlag();
        },
        onPressRemoveRel: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getPath()
            .split("/");
          var aFamilyDetails = oModel.getProperty("/PainterFamily");
          aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
          this._setFDLTbleFlag();
          oModel.refresh();
        },
        fmtLink: function (mParam) {
          var sPath = "/MasterRelationshipSet(" + mParam + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["Relationship"];
          }
        },
        fmtAsset: function (mParam) {
          var sPath = "/MasterAssetTypeSet(" + mParam + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["AssetType"];
          }
        },
        _setFDLTbleFlag() {
          var oModel = this.getView().getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                break;
              }
            }
          }
          if (bFlag === false) {
            oModel.setProperty("/EditTb1FDL", true);
          } else {
            oModel.setProperty("/EditTb1FDL", false);
          }
        },

        onPressAdAsset: function () {
          var oModel = this.getView().getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/PainterAssets");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                MessageToast.show(
                  "Save or delete the existing data in the 'Asset Details' table before adding a new data."
                );
                break;
              }
            }
          }
          if (bFlag == true) {
            oFamiDtlMdl.push({
              AssetTypeId: "",
              AssetName: "",
              editable: true,
            });
            oModel.setProperty("/EditTb2AST", true);
            oModel.refresh();
          }
        },
        onAssetEdit: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          oObject["editable"] = true;

          oModel.refresh();
          this._setASTTbleFlag();
        },
        onAsetSave: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          var bFlag = true;
          var oCells = oEvent.getSource().getParent().getParent();
          var oValidator = new Validator();
          var cFlag = oValidator.validate(oCells);
          var oCheckProp = ["AssetTypeId", "AssetName"];
          for (var abc in oCheckProp) {
            if (oObject[abc] == "") {
              bFlag = false;
              MessageToast.show(
                "Kindly enter the complete deatils before saving."
              );
              break;
            }
          }

          if (bFlag == true && cFlag == true) {
            oObject["editable"] = false;
          } else {
            MessageToast.show(
              "Kindly input 'asset' values in porper format to save."
            );
          }
          oModel.refresh(true);
          this._setASTTbleFlag();
        },

        onPressRemoveAsset: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getPath()
            .split("/");
          var aFamilyDetails = oModel.getProperty("/PainterAssets");
          aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
          this._setASTTbleFlag();
          oModel.refresh();
        },
        _setASTTbleFlag: function () {
          var oModel = this.getView().getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/PainterAssets");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                break;
              }
            }
          }
          if (bFlag === false) {
            oModel.setProperty("/EditTb2AST", true);
          } else {
            oModel.setProperty("/EditTb2AST", false);
          }
        },

        onKycChange: function (oEvent) {
          var oModel = this.getView().getModel("oModelView");

          var oView = this.getView();
          if (oEvent.getSource().getSelectedKey() == "") {
            oView.byId("kycIdNo").setValueState("None");
            oModel.setProperty("/PainterKycDetails/GovtId", "");
          }
        },
        fmtLabel: function (mParam1) {
          var oData = this.getView().getModel(),
            oPayload = "";
          if (mParam1 == "") {
            return "Select the KYC to enable the below field.";
          } else {
            oPayload = oData.getProperty("/MasterKycTypeSet(" + mParam1 + ")");
            return "Enter the " + oPayload["KycType"] + " Number";
          }
        },
        // myFactory: function (sId, oContext) {
        //   var sEdit = oContext.getModel().getProperty("/mode");
        //   var object = oContext.getObject();
        //
        //   var oSmartControl;
        //   if (object["aggregationType"] == "Input") {
        //     oSmartControl = new FormElement({
        //       label: "{?}",
        //       fields: [
        //         new Input({
        //           required: "{oModelView>required}",
        //           fieldGroupIds: "InpGoup",
        //           type: "{oModelView>type}",

        //           placeholder: "{oModelView>placeholder}",
        //           value:
        //             sEdit == "add"
        //               ? "{oModelView>/addData/" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}"
        //               : "{" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}",
        //         }),
        //       ],
        //     });
        //   } else if (object["aggregationType"] == "Date") {
        //

        //     oSmartControl = new FormElement({
        //       label: "{oModelView>label}",
        //       fields: [
        //         new DatePicker({
        //           required: "{oModelView>required}",
        //           fieldGroupIds: "InpGoup",
        //           placeholder: "{oModelView>placeholder}",
        //           displayFormat: "long",
        //           dateValue:
        //             sEdit == "add"
        //               ? "{oModelView>/addData/" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}"
        //               : "{" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}",
        //         }),
        //       ],
        //     });
        //   }

        //   return oSmartControl;
        // },
        //adding the code for the valuehelp

        // onSuccessPress: function (msg) {
        //   var oMessage = new Message({
        //     message: msg,
        //     type: this._MessageType.Success,
        //     target: "/Dummy",
        //     processor: this.getView().getModel(),
        //   });
        //   sap.ui.getCore().getMessageManager().addMessages(oMessage);
        // },
        // onErrorPress: function () {
        //   var oMessage,
        //     oView = this.getView(),
        //     oViewModel = oView.getModel("oModelView"),
        //     oDataModel = oView.getModel(),
        //     sElementBPath = "";
        //   var othat = this;
        //   var sCheckAdd = oViewModel.getProperty("/mode");
        //   if (sCheckAdd !== "add") {
        //     sElementBPath = oView.getElementBinding().getPath();
        //   }

        //

        //   for (var oProp of this._ErrorMessages) {
        //     oMessage = new sap.ui.core.message.Message({
        //       message: oProp["message"],
        //       type: othat._MessageType.Error,
        //       target:
        //         sCheckAdd == "add"
        //           ? oProp["target"]
        //           : sElementBPath + "/" + oProp["target"],
        //       processor: sCheckAdd == "add" ? oViewModel : oDataModel,
        //     });
        //     othat._oMessageManager.addMessages(oMessage);
        //   }
        // },
        // handleEmptyFields: function (oEvent) {
        //   this.onErrorPress();
        // },
        // validateEventFeedbackForm: function (requiredInputs) {
        //   this._ErrorMessages = [];
        //   var aArray = [];
        //   var othat = this;
        //   var valid = true;
        //   requiredInputs.forEach(function (input) {
        //     var sInput = input;

        //     if (
        //       sInput.getValue().trim() === "" &&
        //       sInput.getRequired() === true
        //     ) {
        //       valid = false;
        //       sInput.setValueState("Error");
        //       othat._ErrorMessages.push({
        //         message:
        //           sInput.getParent().getLabel().getText() +
        //           " is a mandatory field (*)",
        //         target: sInput.getBinding("value").getPath(),
        //       });
        //     } else {
        //       sInput.setProperty("valueState", "None");
        //     }
        //   });
        //

        //   return valid;
        // },
        // _getMessagePopover: function () {
        //   var oView = this.getView();
        //   // create popover lazily (singleton)
        //   if (!this._pMessagePopover) {
        //     this._pMessagePopover = Fragment.load({
        //       id: oView.getId(),
        //       name: "com.knpl.pragati.ContactPainter.view.MessagePopover",
        //     }).then(function (oMessagePopover) {
        //       oView.addDependent(oMessagePopover);
        //       return oMessagePopover;
        //     });
        //   }
        //   return this._pMessagePopover;
        // },
        // onMessagePopoverPress: function (oEvent) {
        //   var oSourceControl = oEvent.getSource();
        //   this._getMessagePopover().then(function (oMessagePopover) {
        //     oMessagePopover.openBy(oSourceControl);
        //   });
        // },
        _onClearMgsClass: function () {
          // does not remove the manually set ValueStateText we set in onValueStatePress():
          //this._clearPress;
          sap.ui.getCore().getMessageManager().removeAllMessages();
        },

        onPressSave1: function () {
          this._onClearMgsClass();
          var requiredInputs = sap.ui.getCore().byFieldGroupId("InpGoup");
          var passedValidation = this.validateEventFeedbackForm(requiredInputs);
          if (passedValidation === false) {
            //show an error message, rest of code will not execute.
            //this.handleEmptyFields();
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
          oModelView.setProperty("/busy", true);
          var sEntityPath = oView.getElementBinding().getPath();
          var oDataValue = oDataModel.getObject(sEntityPath, {
            expand: "PainterAddress",
          });
          var oPrpReq = oModelView.getProperty("/prop2");
          var oPayload = {
            Name: oDataValue["Name"],
            Mobile: oDataValue["Mobile"],
            Email: oDataValue["Email"],
            //State: oDataValue["PainterAddress"]["City"],
            //City: oDataValue["PainterAddress"]["City"],
          };

          oDataModel.update(sEntityPath, oPayload, {
            success: function (data) {
              oModelView.setProperty("/busy", false);
              MessageToast.show("Painter Sucessfully updated.");
            },
            error: function (data) {
              oModelView.setProperty("/busy", false);
              MessageBox.error("Unable to upadte the printer");
            },
          });
        },
        _saveAdd: function () {
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          oModelView.setProperty("/busy", true);
          var oDataModel = oView.getModel();
          var oRouter = this.getOwnerComponent().getRouter();
          var oMdlView = oView.getModel("oModelView");
          var sEntity = "/PainterSet"; //PainterSet";//PainterRegistrationSet
          var aPayload = oMdlView.getProperty("/addData");
          oDataModel.create(sEntity, aPayload, {
            success: function (data) {
              oModelView.setProperty("/busy", false);
              MessageToast.show(
                "Painter " + aPayload["Name"] + " Successfully Created."
              );
              oRouter.navTo("RoutePList");
            },
            error: function () {
              oModelView.setProperty("/busy", false);
              MessageBox.error("Unable to add the printer");
            },
          });
        },
        onExit: function () {},
      }
    );
  }
);
