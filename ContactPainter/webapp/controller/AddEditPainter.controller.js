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
    "sap/m/UploadCollectionParameter",
    "sap/m/Title",
    "com/knpl/pragati/ContactPainter/model/customInt",
    "com/knpl/pragati/ContactPainter/model/cmbxDtype2",
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
    UploadCollectionParameter,
    Title,
    custDatatype1,
    custDatatype2
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.AddEditPainter",
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
          this._GetServiceData();
          this._initData("add");
        },
        _GetServiceData: function () {},
        _initData: function (mParMode) {
          var oView = this.getView();
          var oViewModel = new JSONModel({
            sIctbTitle: "Add",
            busy: false,
            mPainterKey: "",
            mode: "Add",
            edit: false,
            EditTb1FDL: false,
            EditTb2AST: false,
            AnotherMobField: false,
            painterList: this.getResourceBundle().getText("tablePainterList"),
            PainterDetails: {
              Mobile: "",
              AgeGroupId: "",
              Name: "",
              Email: "",
              JoiningDate: new Date(),
              DealerId: "",
              PainterTypeId: "",
              MaritalStatusId: "",
              ReligionId: "",
              BusinessCategoryId: "",
              BusinessGroupId: "",
              ArcheTypeId: "",
              DivisionId:"",
              DepotId:"",
              ZoneId:"",
              HouseType:""
            },
            Preference: {
              LanguageId: "",
              SecurityQuestionId: "",
              SecurityAnswer: "",
            },
            PainterAddDet: {
              SecondryDealer: [],
              DealerId: "",
              StateKey: "",
              Citykey: "",
              TeamSizeKey: "",
              SMobile1: "",
              SMobile2: "",
              JoiningDate: "",
              AccountTypeKey: "",
              BankNameKey: "",
              ConfrmAccNum: "",
            },
            PainterAddress: {
              AddressLine1: "",
             // AddressLine2: "",
              CityId: "",
              StateId: "",
              PinCode:"",
              Town:""
            },
            PainterSegmentation: {
              TeamSizeId: "",
              PainterExperience: "",
              SitesPerMonth: "",
              PotentialId: "",
            },
            SegmentationDetails: {
              TimeSize: "",
              Experiences: "",
              SitesPerMonth: "",
              Potential: "",
            },
            PainterFamily: [],
            PainterAssets: [],
            PainterBankDetails: {
              AccountHolderName: "",
              AccountTypeId: "",
              BankNameId: "",
              AccountNumber: "",
              IfscCode: "",
              Status: "PENDING",
            },
            PainterKycDetails: {
              KycTypeId: "",
              GovtId: "",
              Status: "PENDING",
            },
          });
          var oControlData = {
            AddNewBank: false,
          };
          var oContrModel = new JSONModel(oControlData);

          if (mParMode == "add") {
            this._showFormFragment("AddPainter");
            this.getView().unbindElement();
          } else {
          }

          this._formFragments; //used for the fragments of the add and edit forms
          oView.setModel(oViewModel, "oModelView");
          oView.setModel(oContrModel, "oModelControl");
          //this._initMessage(oViewModel);
          this.getView().getModel().resetChanges();
          //used to intialize the message class for displaying the messages
        },
        _CheckTheKyc: function () {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sKYCId = oModel.getProperty("/PainterKycDetails/KycTypeId");
          var oUpload = oView.byId("idUploadCollection");
          var iItems = oUpload.getItems().length;
          if (sKYCId !== "") {
            if (sKYCId == "1") {
              if (iItems < 2) {
                return [
                  false,
                  "Kinldy Upload front and back image of Aadhaar Card",
                ];
              }
            }
            if (iItems == 0) {
              return [false, "Kindly upload the image of the selected KYC."];
            }
          }
          return [true, ""];
        },
        onStartUpload: function () {
          var oUploadCollection = this.byId("UploadCollection");
          //var oTextArea = this.byId("TextArea");
          var cFiles = oUploadCollection.getItems().length;
          var uploadInfo = cFiles + " file(s)";
          oUploadCollection.upload();
        },
        onUploadComplete: function (oEvent) {},
        onBeforeUploadStarts: function (oEvent) {
          // Header Slug
          var oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: oEvent.getParameter("fileName"),
          });
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
          setTimeout(function () {
            MessageToast.show("Event beforeUploadStarts triggered");
          }, 4000);
        },

        onPressSave: function () {
          this.sServiceURI = this.getOwnerComponent(this)
            .getManifestObject()
            .getEntry("/sap.app").dataSources.mainService.uri;

          var oModel = this.getView().getModel("oModelView");
          var oValidator = new Validator();
          var oVbox = this.getView().byId("idVbx");
          var bValidation = oValidator.validate(oVbox, true);
          var cTbleFamily = !oModel.getProperty("/EditTb1FDL");
          var dTbleAssets = !oModel.getProperty("/EditTb2AST");
          var eValidation = this._CheckTheKyc();

          if (cTbleFamily == false) {
            MessageToast.show(
              "Kindly save the details in the 'Family Details' table to continue registration."
            );
            return;
          }
          if (dTbleAssets == false) {
            MessageToast.show(
              "Kindly save the details in the 'Vehicle Details' table to continue registration."
            );
            return;
          }
          if (bValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue registration."
            );
            return;
          }
          if (!eValidation[0]) {
            MessageToast.show(eValidation[1]);
            return;
          }
          if (bValidation && cTbleFamily && dTbleAssets && eValidation[0]) {
            this._postDataToSave();
          }
        },

        _postDataToSave: function () {
          var oView = this.getView();
          oView.setBusy(true);
          var oViewModel = oView.getModel("oModelView");
          var oModelCtrl = oView.getModel("oModelControl");
          var oPainterData = this._ReturnObjects(
            oViewModel.getProperty("/PainterDetails")
          );

          //Getting the Data for Preferrences
          var oPreferrence = this._ReturnObjects(
            oViewModel.getProperty("/Preference")
          );

          //Getting the additional contact information of the painter
          var SMobile1 = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAddDet/SMobile1"))
          );
          var SMobile2 = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAddDet/SMobile2"))
          );
          var aPainterSecContact = [];
          if (SMobile1.trim() !== "") {
            aPainterSecContact.push({ Mobile: SMobile1 });
          }
          if (SMobile2.trim() !== "") {
            aPainterSecContact.push({ Mobile: SMobile2 });
          }

          //Getting the data for the PainterAddress
          var oPainterAddress = this._ReturnObjects(
            oViewModel.getProperty("/PainterAddress")
          );

          var oPainterSeg = this._ReturnObjects(
            oViewModel.getProperty("/PainterSegmentation")
          );

          // Getting the Family Details
          var oPtrFamily = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterFamily"))
          ).map((item) => {
            //delete item.RelValue;
            delete item.editable;
            return item;
          });

          //Getting the Assets Data
          var oPayloadDevice = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAssets"))
          ).map((item) => {
            delete item.editable;
            return item;
          });

          //Getting the Dealer's Data
          var oSecMainDealers = JSON.parse(
            JSON.stringify(
              oViewModel.getProperty("/PainterAddDet/SecondryDealer")
            )
          );
          var oDealers = [];
          for (var i of oSecMainDealers) {
            oDealers.push({
              Id: i.toString(),
            });
          }

          //**** creating the set for the banking details ****//
          var bAddNewBank = oModelCtrl.getProperty("/AddNewBank");
          var oBankingPayload = null;
          if (bAddNewBank) {
            oBankingPayload = JSON.parse(
              JSON.stringify(oViewModel.getProperty("/PainterBankDetails"))
            );
          }

          //Painter KYC Details

          var oNewKYCObj = this._ReturnObjects(
            oViewModel.getProperty("/PainterKycDetails")
          );
          var oKycPayload;
          if (Object.keys(oNewKYCObj).length === 3) {
            oNewKYCObj["KycTypeId"] = parseInt(oNewKYCObj["KycTypeId"]);
            oKycPayload = oNewKYCObj;
          } else {
            oKycPayload = null;
          }
          // settting the username of the painter same as the mobile number
          //oPainterData["Username"] = oPainterData["Mobile"];

          var oPayload = Object.assign(
            {
              PainterAddress: oPainterAddress,
              PainterContact: aPainterSecContact,
              Preference: oPreferrence,
              Dealers: oDealers,
              PainterSegmentation: oPainterSeg,
              PainterFamily: oPtrFamily,
              Vehicles: oPayloadDevice,
              PainterBankDetails: oBankingPayload,
              PainterKycDetails: oKycPayload,
            },
            oPainterData
          );
          console.log(oPayload);
          var c1, c2, c3, c4;
          var oData = this.getView().getModel();
          var othat = this;
          c1 = this._postCreateData(oPayload);

          c1.then(
            function (oData) {
              oView.setBusy(true);
              c2 = othat._getCreatedPainterData(oData);
              c2.then(function (oData) {
                oView.setBusy(true);
                c3 = othat._checkFileUpload(oData);
                c3.then(function (data) {
                  othat.navPressBack();
                  oView.setBusy(false);
                }, othat._RejectCall.bind(othat));
              }, othat._RejectCall.bind(othat));
            },
            function (a) {
              oView.setBusy(false);
              var sMessage = "";
              if (a.statusCode == 409) {
                sMessage = "Painter already exist with the same mobile number";
              } else {
                sMessage = "Unable to create a painter due to server issues.";
              }
              MessageBox.error(sMessage, {
                title: "Error Code: " + a.statusCode,
                onClose: function () {},
              });
            }
          );
        },
        _RejectCall: function () {
          var oView = this.getView();

          oView.setBusy(false);
          this.navPressBack();
        },
        _postCreateData: function (oPayload) {
          var promise = jQuery.Deferred();
          var oData = this.getView().getModel();
          oData.create("/PainterSet", oPayload, {
            success: function (Data) {
              MessageToast.show("Painter Sucessfully Created", {
                duration: 5000,
              });
              promise.resolve(Data);
              //othat.navPressBack();
            },
            error: function (a) {
              promise.reject(a);
            },
          });
          return promise;
        },
        _getCreatedPainterData: function (mParam) {
          var promise = jQuery.Deferred();
          var oData = this.getView().getModel();
          var sPath = "/PainterSet(" + mParam["Id"] + ")";
          oData.read(sPath, {
            urlParameters: {
              $expand: "PainterKycDetails",
            },
            success: function (oData) {
              promise.resolve(oData);
            },
            error: function () {
              promise.reject();
            },
            // ...
          });
          return promise;
        },
        _checkFileUpload: function (oData) {
          var promise = jQuery.Deferred();
          var UploadCollection = this.getView().byId("idUploadCollection");
          var oItems = UploadCollection.getItems();
          var othat = this;
          var bFlag = false;
          if (oData.hasOwnProperty("PainterKycDetails")) {
            var oKycData = oData["PainterKycDetails"];
            if (oKycData !== null) {
              if (oKycData.hasOwnProperty("Id")) {
                if (oItems.length > 0) {
                  bFlag = true;
                }
              }
            }
          }
          if (!bFlag) {
            promise.resolve("NoFileUploadRequired");
            return promise;
          }
          var sUrl =
            this.sServiceURI +
            "PainterKycDetailsSet(" +
            oKycData["Id"] +
            ")/$value?image_type=";

          var sUrl2 = "";
          var async_request = [];

          for (var x = 0; x < oItems.length; x++) {
            var sFile = sap.ui.getCore().byId(oItems[x].getFileUploader())
              .oFileUpload.files[0];
            sUrl2 = x == 0 ? "front" : "back";
            async_request.push(
              jQuery.ajax({
                method: "PUT",
                url: sUrl + sUrl2,
                cache: false,
                contentType: false,
                processData: false,
                data: sFile,
                success: function (data) {},
                error: function () {},
              })
            );
          }
          if (oItems.length > 0) {
            jQuery.when.apply(null, async_request).then(
              function () {
                //promise.resolve("FileUpdated");
              },
              function () {
                //promise.resolve("FileNot Uplaoded");
              }
            );
          }
          promise.resolve();
          return promise;
        },
        _fileUpload: function (mParam) {
          var oUploadCollection = this.getView().byId("idUploadCollection");
          var oItems = oUploadCollection.getItems();
          var sUrl = this.sServiceURI;
          var oData = this.getView().getModel();
          var sGetPath = "/Painter(" + mParam["Id"] + ")";

          if (oItems.length > 0) {
            oData.get(sGetPath, {
              urlParameters: {
                $expand: "PainterKycDetails",
              },
              success: function (oData) {},
              error: function () {},
            });
          }
        },
        _ReturnObjects: function (mParam) {
          var obj = Object.assign({}, mParam);
          var oNew = Object.entries(obj).reduce(
            (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)),
            {}
          );
          return oNew;
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
            oRouter.navTo("RoutePList", {}, true);
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
            othat._setUploadCollectionMethod.call(othat);
          });
        },
        _setUploadCollectionMethod: function () {
          var oUploadCollection = this.getView().byId("idUploadCollection");

          var othat = this;
          oUploadCollection.__proto__._setNumberOfAttachmentsTitle = function (
            count
          ) {
            var nItems = count || 0;
            var sText;
            // When a file is being updated to a new version, there is one more file on the server than in the list so this corrects that mismatch.
            if (this._oItemToUpdate) {
              nItems--;
            }
            if (this.getNumberOfAttachmentsText()) {
              sText = this.getNumberOfAttachmentsText();
            } else {
              sText = this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [
                nItems,
              ]);
            }
            if (!this._oNumberOfAttachmentsTitle) {
              this._oNumberOfAttachmentsTitle = new Title(
                this.getId() + "-numberOfAttachmentsTitle",
                {
                  text: sText,
                }
              );
            } else {
              this._oNumberOfAttachmentsTitle.setText(sText);
            }

            othat._CheckAddBtnForUpload.call(othat, nItems);
          };
        },
        _CheckAddBtnForUpload: function (mParam) {
          var oModel = this.getView().getModel("oModelView");
          var sKycTypeId = oModel.getProperty("/PainterKycDetails/KycTypeId");
          var oUploadCol = this.getView().byId("idUploadCollection");
          if (sKycTypeId !== "") {
            if (sKycTypeId == "1") {
              if (mParam >= 2) {
                oUploadCol.setUploadButtonInvisible(true);
              } else if (mParam < 2) {
                oUploadCol.setUploadButtonInvisible(false);
              }
            } else {
              if (mParam >= 1) {
                oUploadCol.setUploadButtonInvisible(true);
              } else if (mParam < 1) {
                oUploadCol.setUploadButtonInvisible(false);
              }
            }
          }
        },
        _setDataValue: function () {
          var oInput = this.getView().byId("idCnfAcntNum");
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
              "com.knpl.pragati.ContactPainter.view.fragments." + sFragmentName,
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
        onPrimDealerChanged: function (oEvent) {
          var oSource = oEvent.getSource();
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sKey = oEvent.getSource().getSelectedKey();
          if (sKey == 7) {
            oSource.clearSelection();
            oModel.setProperty("/PainterDetails/DealerId", "");
            oSource.setSelectedKey("");
            oSource.removeAllAssociation();
            oSource.fireSelectionChange({
              selectedItem: null,
            });
          }
          if (sKey == "") {
            oSource.setValue("");
          }
        },

        onLinkPrimryChange: function (oEvent) {
          var oSource = oEvent.getSource();
          var sSkey = oSource.getSelectedKey();
          var sItem = oSource.getSelectedItem();
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");

          var mCmbx = oView.byId("mcmbxDlr").getSelectedKeys();
          var sFlag = true;
          for (var i of mCmbx) {
            if (parseInt(i) == parseInt(sSkey)) {
              sFlag = false;
            }
          }

          if (!sFlag) {
            oSource.clearSelection();
            oSource.setSelectedKey("");
            oSource.setValue("");
            MessageToast.show(
              "Kindly select a different dealer as its already selected as secondry dealer."
            );
          }
        },
        onChangePDealer: function (oEvent) {
          var oSource = oEvent.getSource();
          var sKey = oSource.getSelectedKey();

          if (sKey == "") {
            oSource.setValue("");
            //oSource.removeAssociation("selectedItem")
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
          if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length <= 5) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                MessageToast.show(
                  "Save or delete the existing data in the table before adding a new data."
                );
                return;
                break;
              }
            }
          }
          if (oFamiDtlMdl.length >= 5) {
            MessageToast.show(
              "We can only add 5 family members. Kinldy remove any existing data to add a new family member."
            );
            bFlag = false;
            return;
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
          var sPath = "/MasterVehicleTypeSet(" + mParam + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["VehicleType"];
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
          if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length <= 5) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                MessageToast.show(
                  "Save or delete the existing data in the 'Vehicle Details' table before adding a new data."
                );
                return;
                break;
              }
            }
          }
          if (oFamiDtlMdl.length >= 5) {
            MessageToast.show(
              "We can only add 5 Vehicles. Kinldy remove any existing data to add a new vehicle."
            );
            bFlag = false;
            return;
          }
          if (bFlag == true) {
            oFamiDtlMdl.push({
              VehicleTypeId: "",
              VehicleName: "",
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
          var oCheckProp = ["VehicleTypeId", "VehicleName"];
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
              "Kindly input 'vehicle' values in porper format to save."
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
        onRbBankStatus: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          if (iIndex == 0) {
            oModelView.setProperty("/PainterBankDetails/Status", "PENDING");
          } else if (iIndex == 1) {
            oModelView.setProperty("/PainterBankDetails/Status", "APPROVED");
          }
        },
        onRbKycStatus: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          if (iIndex == 0) {
            oModelView.setProperty("/PainterKycDetails/Status", "PENDING");
          } else if (iIndex == 1) {
            oModelView.setProperty("/PainterKycDetails/Status", "APPROVED");
          }
        },
        onAddNewBank: function () {
          var oView = this.getView();
          var oModelCtrl = oView
            .getModel("oModelControl")
            .setProperty("/AddNewBank", true);
        },
        onAddCanNewBank: function () {
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelCtrl = oView
            .getModel("oModelControl")
            .setProperty("/AddNewBank", false);
          var requiredInputs = [
            "IdAbIfscCode",
            "IdAbBankNameId",
            "IdAbAccountTypeId",
            "idAddAcntNum",
            "idCnfAcntNum",
            "IdAbAccountHolderName",
          ];
          var oBj;
          requiredInputs.forEach(function (mField) {
            oBj = oView.byId(mField);
            oBj.setValueState("None");
            oBj.setValue("");
          });
          oModelView.setProperty("/PainterBankDetails", {
            AccountHolderName: "",
            AccountTypeId: "",
            BankNameId: "",
            AccountNumber: "",
            IfscCode: "",
            Status: "PENDING",
          });
          oModelView.refresh();
        },

        onKycChange: function (oEvent) {
          var oModel = this.getView().getModel("oModelView");
          var oView = this.getView();
          oView.byId("kycIdNo").setValueState("None");
          oModel.setProperty("/PainterKycDetails/GovtId", "");
          oView.byId("idRKyc").setSelectedIndex(0);
          oModel.setProperty("/PainterKycDetails/Status", "PENDING");
          oView.byId("idUploadCollection").removeAllItems();
        },
        onUploadFileTypeMis: function () {
          MessageToast.show("Kindly upload a file of type jpg,jpeg,png");
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
