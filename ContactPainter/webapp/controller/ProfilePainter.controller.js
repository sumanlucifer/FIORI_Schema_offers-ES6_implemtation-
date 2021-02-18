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
    "sap/ui/core/ValueState",
    "com/knpl/pragati/ContactPainter/controller/Validator",
    "sap/ui/model/type/Date",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "com/knpl/pragati/ContactPainter/model/customInt",
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
      "com.knpl.pragati.ContactPainter.controller.ProfilePainter",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter(this);
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
            .getRoute("RouteProfile")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );
          var oView = this.getView();
          console.log(oProp);
          if (oProp.trim() !== "") {
            oView.bindElement({
              path: "/" + oProp,
              parameters: {
                expand:
                  "AgeGroup,Preference,Preference/Language,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,Assets,Dealers,Preference/SecurityQuestion",
              },
            });
          }
          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: oProp,
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl2");
          this._loadEditProfile("Display");
          this._loadEditBanking("Display");
          this._toggleButtonsAndView(false);
          var oDataValue = this.getView()
            .getModel()
            .getObject("/" + oProp, {
              expand:
                "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,Assets",
            });
          console.log(oDataValue);
        },
        onSecMobLinkPress: function () {
          this.getView()
            .getModel("oModelControl")
            .setProperty("/AnotherMobField", true);
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
          console.log(oSource.getSelectedKey());
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
        onStateChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey() + "";
          var oView = this.getView();
          var oCity = oView.byId("cmbCity"),
            oBindingCity,
            aFilter = [],
            oView = this.getView();
          if (sKey !== "") {
            oCity.clearSelection();
            oCity.setValue("");
            oBindingCity = oCity.getBinding("items");
            aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
            oBindingCity.filter(aFilter);
          }
        },
        onPressAddFamliy: function () {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop.hasOwnProperty("editable")) {
                if (prop["editable"] == true) {
                  bFlag = false;
                  MessageToast.show(
                    "Save or delete the existing data in the table before adding a new data."
                  );
                  break;
                }
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
            oView.getModel("oModelControl").setProperty("/EditTb1FDL", true);
            oModel.refresh();
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
          var bFlag = true;
          console.log(oObject);
          for (var abc in oObject) {
            if (
              oObject["RelationshipId"] == "" ||
              oObject["Name"] == "" ||
              oObject["Mobile"] == ""
            ) {
              bFlag = false;
              MessageToast.show(
                "Kindly enter the complete deatils before saving."
              );
              break;
            }
          }

          if (bFlag == true) {
            oObject["editable"] = false;
          }
          this._setFDLTbleFlag();
          oModel.refresh(true);
        },
        fmtLink: function (mParam) {
          var sPath = "/MasterRelationshipSet(" + mParam + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          return mParam;
          if (oData !== undefined && oData !== null) {
            return oData["Relationship"];
          } else {
            return mParam;
          }
          
        },
        fmtAsset: function (mParam) {
          var sPath = "/MasterAssetTypeSet(" + mParam + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          return mParam;
          if (oData !== undefined && oData !== null) {
            return oData["AssetType"];
          } else {
            return mParam;
          }
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
        _setFDLTbleFlag() {
          var oView = this.getView();
          var oModel = this.getView().getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
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
            oModelControl.setProperty("/EditTb1FDL", true);
          } else {
            oModelControl.setProperty("/EditTb1FDL", false);
          }
        },
        onPressAdAsset: function () {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var oFamiDtlMdl = oModel.getProperty("/Assets");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop.hasOwnProperty("editable")) {
                if (prop["editable"] == true) {
                  bFlag = false;
                  MessageToast.show(
                    "Save or delete the existing data in the 'Asset Details' table before adding a new data."
                  );
                  break;
                }
              }
            }
          }
          if (bFlag == true) {
            oFamiDtlMdl.push({
              AssetType: "",
              AssetName: "",
              editable: true,
            });
            oModelControl.setProperty("/EditTb2AST", true);
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
          console.log(Object);
          for (var abc in oObject) {
            if (oObject["AssetType"] == "" || oObject["AssetName"] == "") {
              bFlag = false;
              MessageToast.show(
                "Kindly enter the complete deatils before saving."
              );
              break;
            }
          }

          if (bFlag == true) {
            oObject["editable"] = false;
          }
          this._setASTTbleFlag();
          oModel.refresh(true);
        },

        onPressRemoveAsset: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getPath()
            .split("/");
          var aFamilyDetails = oModel.getProperty("/Assets");
          aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
          this._setASTTbleFlag();
          oModel.refresh();
        },
        _setASTTbleFlag: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oModel = this.getView().getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/Assets");
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
            oModelControl.setProperty("/EditTb2AST", true);
          } else {
            oModelControl.setProperty("/EditTb2AST", false);
          }
        },
        onPressSave: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oModel = oView.getModel("oModelView");
          var oValidator = new Validator();
          var oVbox1 = oView.byId("ObjectPageLayout");
          //var oVbox2 = oView.byId("idVbBanking");
          var bValidation = oValidator.validate(oVbox1);
          var cValidation = true; //oValidator.validate(oVbox2);
          var dTbleFamily = !oModelControl.getProperty("/EditTb1FDL");
          var eTbleAssets = !oModelControl.getProperty("/EditTb2AST");

          if (dTbleFamily == false) {
            MessageToast.show(
              "Kindly save the details in the 'Family Details' table to continue."
            );
          }
          if (eTbleAssets == false) {
            MessageToast.show(
              "Kindly save the details in the 'Asset Details' table to continue."
            );
          }
          if (bValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue."
            );
          }
          if (cValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue."
            );
          }

          if (bValidation && dTbleFamily && eTbleAssets && cValidation) {
            this._postDataToSave();
          }
          console.log(bValidation);
        },

        handleSavePress: function () {
          //this._toggleButtonsAndView(false);
          var oView = this.getView();
          //oView.getModel("oModelControl").setProperty("/modeEdit", false);
          this.onPressSave();
          //this._postDataToSave();
        },
        _postDataToSave: function () {
          var oView = this.getView();
          var oCtrlModel = oView.getModel("oModelControl");
          var oViewModel = this.getView().getModel("oModelView");
          var oViewData = oViewModel.getData();
          var oPayload = Object.assign({}, oViewData);
          for (var prop of oPayload["PainterFamily"]) {
            if (prop.hasOwnProperty("editable")) {
              delete prop["editable"];
            }
          }
          for (var prop of oPayload["Assets"]) {
            if (prop.hasOwnProperty("editable")) {
              delete prop["editable"];
            }
          }
          //setting up contactnumber data
          var aPainterSecContact = [];
          var SMobile1 = JSON.parse(
            JSON.stringify(oCtrlModel.getProperty("/PainterAddDet/SMobile1"))
          );
          var SMobile2 = JSON.parse(
            JSON.stringify(oCtrlModel.getProperty("/PainterAddDet/SMobile2"))
          );
          var aPainterSecContact = [];
          if (SMobile1.trim() !== "") {
            aPainterSecContact.push({ Mobile: SMobile1 });
          }
          if (SMobile2.trim() !== "") {
            aPainterSecContact.push({ Mobile: SMobile2 });
          }
          oPayload["PainterContact"] = aPainterSecContact;

          // dealer data save
          var oSecondryDealer = oCtrlModel.getProperty(
            "/PainterAddDet/SecondryDealer"
          );
          var oPrimaryDealer = oCtrlModel.getProperty(
            "/PainterAddDet/DealerId"
          );
          var oDealers = [];
          for (var i of oSecondryDealer) {
            oDealers.push({
              Id: parseInt(i),
            });
          }
          if (oPrimaryDealer !== "") {
            oDealers.push({ Id: parseInt(oPrimaryDealer) });
          }

          oPayload["Dealers"] = oDealers;

          var oData = this.getView().getModel();
          var sPath = "/" + oCtrlModel.getProperty("/bindProp");
          for (var a in oPayload) {
            if (oPayload[a] === "") {
              oPayload[a] = null;
            }
          }
          for (var b in oPayload["Preference"]) {
            if (oPayload["Preference"][b] === "") {
              oPayload["Preference"][b] = null;
            }
          }
          for (var c in oPayload["PainterSegmentation"]) {
            if (oPayload["PainterSegmentation"][c] === "") {
              oPayload["PainterSegmentation"][c] = null;
            }
          }
          console.log(oPayload, sPath);
          oData.update(sPath, oPayload, {
            success: function () {
              MessageToast.show(
                "Painter " + oPayload["Name"] + " Sucessfully Updated"
              );
              oData.refresh();
            },
            error: function (a) {
              MessageBox.error(
                "Unable to update a painter due to the server issues",
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
          return oNew;
        },
        _save: function () {
          var oModel = this.getView().getModel("oModelView");
          console.log(oModel.getData());
        },
        handleEditPress: function () {
          this._toggleButtonsAndView(true);
          var oView = this.getView();
          oView.getModel("oModelControl2").setProperty("/modeEdit", true);
          var c1, c2, c3;
          var othat = this;
          c1 = othat._loadEditProfile("Edit");
          c1.then(function () {
            c2 = othat._loadEditBanking("Edit");
            c2.then(function () {
              c3 = othat._initEditData();
              c3.then(function () {
                othat.getView().getModel("oModelView").refresh(true);
              });
            });
          });

          // this._initEditData();
          //this._initSaveModel();
        },
        _initEditData: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oControlModel2 = oView.getModel("oModelControl2");
          var sPath = oControlModel2.getProperty("/bindProp");
          var oDataCtrl = {
            modeEdit: false,
            bindProp: sPath,
            EditTb1FDL: false,
            EditTb2AST: false,
            AnotherMobField: false,
            PainterAddDet: {
              DOB: "",
              StateKey: "",
              Citykey: "",
              DealerId: "",
              SecondryDealer: [],
              SMobile1: "",
              SMobile2: "",
            },
          };
          var oControlModel = new JSONModel(oDataCtrl);

          oView.setModel(oControlModel, "oModelControl");

          var oDataValue = oView.getModel().getObject("/" + sPath, {
            expand:
              "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,Assets,Dealers",
          });
          //setting the value property for the date this will help in resolving the

          var oDate = oDataValue["DOB"];
          var oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "dd/MM/yyyy",
          });
          oControlModel.setProperty(
            "/PainterAddDet/DOB",
            oDateFormat.format(oDate)
          );
          //setting up secondry mobile number data
          var iCountContact = 0;
          for (var j of oDataValue["PainterContact"]) {
            if (iCountContact == 0) {
              oControlModel.setProperty("/PainterAddDet/SMobile1", j["Mobile"]);
            } else if (iCountContact == 1) {
              oControlModel.setProperty("/PainterAddDet/SMobile2", j["Mobile"]);
              oControlModel.setProperty("/AnotherMobField", true);
            }
            iCountContact++;
          }

          //setting up dealers data
          var oDealer = oDataValue["Dealers"];
          var oDealerArray = [];
          for (var i of oDealer) {
            oDealerArray.push(i["Id"]);
          }
          oControlModel.setProperty(
            "/PainterAddDet/SecondryDealer",
            oDealerArray
          );

          var oNewData = Object.assign({}, oDataValue);

          console.log(oDataValue);
          var oModel = new JSONModel(oDataValue);
          oView.setModel(oModel, "oModelView");
          oModel.refresh(true);
          promise.resolve();
          return promise;
        },
        onPressDealerLink: function (oEvent) {
          var oSource = oEvent.getSource();
          var oView = this.getView();
          if (!this._pPopover) {
            this._pPopover = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.ContactPainter.view.fragments.Popover",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              return oPopover;
            });
          }
          this._pPopover.then(function (oPopover) {
            oPopover.openBy(oSource);
          });
        },
        dealerName: function (mParam) {
          return mParam.length;
        },
        _loadEditProfile: function (mParam) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var othat = this;
          var oVboxProfile = oView.byId("idVbProfile");
          var sFragName = mParam == "Edit" ? "EditProfile" : "Profile";
          oVboxProfile.destroyItems();
          var oFragProf = Fragment.load({
            id: oView.getId(),
            controller: othat,
            name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
          });
          promise.resolve();
          return promise;
        },
        _loadEditBanking: function (mParam) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var othat = this;
          var oVboxProfile = oView.byId("idVbBanking");
          var sFragName = mParam == "Edit" ? "EditBanking" : "Banking";
          oVboxProfile.destroyItems();
          var oFragProf = Fragment.load({
            id: oView.getId(),
            controller: othat,
            name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
          });
          promise.resolve();
          return promise;
        },

        handleCancelPress: function () {
          this._toggleButtonsAndView(false);
          var oView = this.getView();
          oView.getModel("oModelControl2").setProperty("/modeEdit", false);
          //bindingchange changes false
          this._loadEditProfile("Display");
          this._loadEditBanking("Display");
          oView.getModel().refresh(true);
        },

        _toggleButtonsAndView: function (bEdit) {
          var oView = this.getView();

          // Show the appropriate action buttons
          oView.byId("edit").setVisible(!bEdit);
          oView.byId("save").setVisible(bEdit);
          oView.byId("cancel").setVisible(bEdit);

          // Set the right form type
          //this._showFormFragment(bEdit ? "Change" : "Display");
        },
        _showFormFragment: function (sFragmentName) {
          //   var oPage = this.byId("page");
          //   oPage.removeAllContent();
          //   this._getFormFragment(sFragmentName).then(function (oVBox) {
          //     oPage.insertContent(oVBox);
          //   });
        },
        _getFormFragment: function (sFragmentName) {
          var pFormFragment = this._formFragments[sFragmentName],
            oView = this.getView();

          if (!pFormFragment) {
            pFormFragment = Fragment.load({
              id: oView.getId(),
              name:
                "sap.ui.layout.sample.SimpleForm354wideDual." + sFragmentName,
            });
            this._formFragments[sFragmentName] = pFormFragment;
          }

          return pFormFragment;
        },
        onNavBack: function (oEvent) {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RoutePList", {}, true);
          }
        },
      }
    );
  }
);
