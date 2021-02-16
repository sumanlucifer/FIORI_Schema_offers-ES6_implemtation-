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
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.ProfilePainter",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter(this);
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
                  "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,Assets",
              },
            });
          }
          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: oProp,
            EditTb1FDL: false,
            EditTb2AST: false,
            AnotherMobField: false,
            PainterAddDet: {
              DOB: "",
              StateKey: "",
              Citykey: "",
            },
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl");
          this._loadEditProfile("Display");
          this._loadEditBanking("Display");
          this._toggleButtonsAndView(false);
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
          console.log(oEvent.getSource().getSelectedKey());
          var sKey = oEvent.getSource().getSelectedKey() + "";
          var oCity,
            aFilter = [],
            oView = this.getView();
          if (sKey !== "") {
            oView
              .getModel("oModelView")
              .setProperty("/PainterAddress/City", "");
            oCity = oView.byId("cmbCity").getBinding("items");
            aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
            oCity.filter(aFilter);
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
          for (var abc in oObject) {
            if (oObject[abc] == "") {
              bFlag = false;
              MessageToast.show(
                "Kindly enter the complete deatils before saving."
              );
              break;
            }
          }

          if (bFlag == true) {
            oObject["editable"] = false;
            oModel.refresh();
          }
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
          for (var abc in oObject) {
            if (oObject[abc] == "") {
              bFlag = false;
              MessageToast.show(
                "Kindly enter the complete deatils before saving."
              );
              break;
            }
          }

          if (bFlag == true) {
            oObject["editable"] = false;
            oModel.refresh();
          }
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
          var oModelControl = oView.getModel("oModelControl")
          var oModel = oView.getModel("oModelView");
          var oValidator = new Validator();
          var oVbox = oView.byId("idVbx");
          var bValidation = oValidator.validate(oVbox);
          var cTbleFamily = !oModel.getProperty("/EditTb1FDL");
          var dTbleAssets = !oModel.getProperty("/EditTb2AST");

          if (cTbleFamily == false) {
            MessageToast.show(
              "Kindly save the details in the 'Family Details' table to continue."
            );
          }
          if (dTbleAssets == false) {
            MessageToast.show(
              "Kindly save the details in the 'Asset Details' table to continue."
            );
          }
          if (bValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue."
            );
          }
          if (bValidation && cTbleFamily && dTbleAssets) {
            this._postDataToSave();
          }
          console.log(bValidation);
        },
       
        handleSavePress: function () {
          //this._toggleButtonsAndView(false);
          var oView = this.getView();
          //oView.getModel("oModelControl").setProperty("/modeEdit", false);
          //this._save();
          this._postDataToSave();
        },
         _postDataToSave: function () {
          var oView = this.getView();
          var oCtrlModel = oView.getModel("oModelControl");
          var oViewModel = this.getView().getModel("oModelView");
          var oViewData = oViewModel.getData();
          var oPayload =  Object.assign({},oViewData);
          for(var prop of oPayload["PainterFamily"]){
              if(prop.hasOwnProperty("editable")){
                delete prop["editable"];
              }
              

          }
           for(var prop of oPayload["Assets"]){
             if(prop.hasOwnProperty("editable")){
                delete prop["editable"]
              }
          }
          console.log(oPayload)
          
          var oData = this.getView().getModel();
          var sPath = "/"+oCtrlModel.getProperty("/bindProp");
          console.log(oPayload,sPath);
        //   oData.update(spath, oPayload, {
        //     success: function () {
        //       MessageToast.show("Painter Sucessfully Updated");
        //     },
        //     error: function (a) {
        //       MessageBox.error(
        //         "Unable to create a painter due to the server issues",
        //         {
        //           title: "Error Code: " + a.statusCode,
        //         }
        //       );
        //     },
        //   });
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
          oView.getModel("oModelControl").setProperty("/modeEdit", true);
          this._loadEditProfile("Edit");
          this._loadEditBanking("Edit");
          this._initEditData();
          //this._initSaveModel();
        },
        _initEditData: function () {
          var oView = this.getView();
          var sPath = oView.getModel("oModelControl").getProperty("/bindProp");
          console.log(sPath);
          var oDataValue = oView.getModel().getObject("/" + sPath, {
            expand:
              "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,Assets",
          });
          console.log(oDataValue);
          var oNewData = Object.assign({}, oDataValue);
          console.log(oDataValue);
          var oModel = new JSONModel(oDataValue);
          oView.setModel(oModel, "oModelView");
        },
        _loadEditProfile: function (mParam) {
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
            oVboxProfile.addItem(oControlProfile);
          });
        },
        _loadEditBanking: function (mParam) {
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
            oVboxProfile.addItem(oControlProfile);
          });
        },

        handleCancelPress: function () {
          this._toggleButtonsAndView(false);
          var oView = this.getView();
          oView.getModel("oModelControl").setProperty("/modeEdit", false);
          //oView.getModel().refresh(true);
          //bindingchange changes false
          this._loadEditProfile("Display");
          this._loadEditBanking("Display");
        },

        _toggleButtonsAndView: function (bEdit) {
          var oView = this.getView();

          // Show the appropriate action buttons
          oView.byId("edit").setVisible(!bEdit);
          oView.byId("save").setVisible(bEdit);
          oView.byId("cancel").setVisible(bEdit);

          // Set the right form type
          this._showFormFragment(bEdit ? "Change" : "Display");
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
          var oRouter = this.getOwnerComponent().getRouter(this);
          oRouter.navTo("RoutePList");
        },
      }
    );
  }
);
