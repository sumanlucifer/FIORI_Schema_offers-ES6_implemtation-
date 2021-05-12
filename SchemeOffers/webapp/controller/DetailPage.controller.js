// @ts-ignore
sap.ui.define(
  [
    "com/knpl/pragati/SchemeOffers/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Avatar",
    "sap/ui/core/ValueState",
    "../model/formatter",
    "com/knpl/pragati/SchemeOffers/controller/Validator",
    "com/knpl/pragati/SchemeOffers/model/customInt",
    "com/knpl/pragati/SchemeOffers/model/cmbxDtype2",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    Sorter,
    Fragment,
    Device,
    MessageBox,
    MessageToast,
    Avatar,
    ValueState,
    formatter,
    Validator,
    customInt,
    cmbxDtype2
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.SchemeOffers.controller.DetailPage",
      {
        formatter: formatter,
        customInt: customInt,
        cmbxDtype2: cmbxDtype2,
        onInit: function () {
          //Router Object
          var oViewModel = new JSONModel({
            busy: false,
            editable: false,
          });
          this.getView().setModel(oViewModel, "DetailViewModel");
          this.oViewModel = this.getView().getModel("DetailViewModel");
          this.oResourceBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();
          this.oRouter = this.getRouter();
          this.oRouter
            .getRoute("DetailPage")
            .attachPatternMatched(this._onObjectMatched, this);
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
        },

        _onObjectMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );

          var oView = this.getView();
          var sExpandParam = "CreatedByDetails,SchemeType,Potential,Slab";
          console.log(oProp);
          if (oProp.trim() !== "") {
            oView.bindElement({
              path: "/SchemeSet(" + oProp + ")",
              parameters: {
                expand: sExpandParam,
              },
            });
          }
          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: true,
            bindProp: "SchemeSet(" + oProp + ")",
            Display: {
              Zones: [],
              Divisions: [],
              Depots: [],
              ArchiTypes: [],
              PainterProducts: [],
              ApplicableProducts: [],
              BonusApplicableProducts: [],
            },
            HasTillDate: true,
            ImageLoaded: true,
            SchemeId: oProp, //.replace(/[^0-9]/g, ""),
            //ProfilePic:"/KNPL_PAINTER_API/api/v2/odata.svc/PainterSet(717)/$value",
            tableDealay: 0,
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl2");

          var othat = this;
          var c1, c2, c3, c4, c5, c7, c8;
          var oView = this.getView();

          c1 = this._loadEditProfile("Display");
          c1.then(function () {
            c2 = othat._getInitData(oProp);
            c2.then(function (data) {
              c3 = othat._setViewData(data);
              c3.then(function (data) {
                c4 = othat._CheckAttachment();
              });
            });
          });
          this._toggleButtonsAndView(false);
        },

        onPressEdit: function () {
          this.oViewModel.setProperty("/editable", true);
        },

        onPressSave: function () {
          this.oViewModel.setProperty("/editable", false);
        },
        _getInitData: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oData = oView.getModel();
          var oModelControl2 = oView.getModel("oModelControl2");
          var sPath = oModelControl2.getProperty("/bindProp");
          var othat = this;
          var exPand =
            "SchemeZones,SchemeDivisions,SchemeDepots,SchemePainterArchiTypes,SchemePainterProducts,SchemeApplicableProducts,SchemeBonusApplicableProducts";
          oView.getModel().read("/" + sPath, {
            urlParameters: {
              $expand: exPand,
            },
            success: function (data) {
              promise.resolve(data);
            },
            error: function () {
              promise.reject();
            },
          });
          return promise;
        },
        _setViewData: function (oData) {
          var promise = jQuery.Deferred();
          //console.log(oData);
          var oView = this.getView();
          var oModelControl2 = oView.getModel("oModelControl2");
          var aZones = [],
            aDivisions = [],
            aDepots = [],
            aArchiTypes = [],
            aPainterProducts = [],
            aApplicableProducts = [],
            aBonusApplicableProducts = [];

          if (oData["SchemeZones"]["results"].length > 0) {
            for (var x of oData["SchemeZones"]["results"]) {
              aZones.push(x["ZoneId"]);
            }
          }
          oModelControl2.setProperty("/Display/Zones", aZones);
          if (oData["SchemeDivisions"]["results"].length > 0) {
            for (var y of oData["SchemeDivisions"]["results"]) {
              aDivisions.push(y["DivisionId"]);
            }
          }
          // 

          oModelControl2.setProperty("/Display/Divisions", aDivisions);
          if (oData["SchemeDepots"]["results"].length > 0) {
            for (var z of oData["SchemeDepots"]["results"]) {
              aDepots.push(z["DepotId"]);
            }
          }
          oModelControl2.setProperty("/Display/Depots", aDepots);

          //architype
          if (oData["SchemePainterArchiTypes"]["results"].length > 0) {
            for (var p of oData["SchemePainterArchiTypes"]["results"]) {
              aArchiTypes.push(p["ArchiTypeId"]);
            }
          }
          oModelControl2.setProperty("/Display/ArchiTypes", aArchiTypes);

          //painter produts
          if (oData["SchemePainterProducts"]["results"].length > 0) {
            for (var q of oData["SchemePainterProducts"]["results"]) {
              aPainterProducts.push(q["SkuCode"]);
            }
          }
          oModelControl2.setProperty(
            "/Display/PainterProducts",
            aPainterProducts
          );

          //Applicable Products
          if (oData["SchemeApplicableProducts"]["results"].length > 0) {
            for (var r of oData["SchemeApplicableProducts"]["results"]) {
              aApplicableProducts.push(r["SkuCode"]);
            }
          }
          oModelControl2.setProperty(
            "/Display/ApplicableProducts",
            aApplicableProducts
          );

          //Bonus Applicable Products
          if (oData["SchemeBonusApplicableProducts"]["results"].length > 0) {
            for (var s of oData["SchemeBonusApplicableProducts"]["results"]) {
              aBonusApplicableProducts.push(s["SkuCode"]);
            }
          }
          oModelControl2.setProperty(
            "/Display/BonusApplicableProducts",
            aBonusApplicableProducts
          );

          //Bonus Validity Flag
          if (oData["BonusValidityDate"] === null) {
            oModelControl2.setProperty("/HasTillDate", false);
          }
          //oModelControl2.refresh(true)

          promise.resolve();
          return promise;
        },
        handleEditPress: function () {
          this._toggleButtonsAndView(true);
          var oView = this.getView();
          var oCtrl2Model = oView.getModel("oModelControl2");
          var c1, c2, c3, c4, c5, c6;
          var othat = this;
          c1 = othat._loadEditProfile("Edit");
          c1.then(function () {
            c2 = othat._GetInitEditData();
            c2.then(function (data) {
              c3 = othat._setEditData(data);
              c3.then(function (data) {
                c4 = othat._setMultiComboData(data);
              });
              //othat.getView().getModel("oModelView").refresh(true);
            });
          });

          // this._initSaveModel();
        },
        _GetInitEditData: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oData = oView.getModel();
          var oModelControl2 = oView.getModel("oModelControl2");
          var sPath = oModelControl2.getProperty("/bindProp");
          var othat = this;
          var exPand =
            "SchemeZones,SchemeDivisions,SchemeDepots,SchemePainterArchiTypes,SchemePainterProducts,SchemeApplicableProducts,SchemeBonusApplicableProducts";
          oView.getModel().read("/" + sPath, {
            urlParameters: {
              $expand: exPand,
            },
            success: function (data) {
              promise.resolve(data);
            },
            error: function () {
              promise.reject();
            },
          });
          return promise;
        },
        _setEditData: function (data) {
          var promise = jQuery.Deferred();
          var oData = data;
          var oView = this.getView();
          var oModelControl2 = oView.getModel("oModelControl2");
          var oBonusValidity = [];
          for (var i = 0; i <= 12; i++) {
            oBonusValidity.push({ key: i });
          }
          var oDataControl = {
            HasTillDate: true,
            ImageLoaded: oModelControl2.getProperty("/ImageLoaded"),
            BonusValidity: oBonusValidity,
            modeEdit: true,
            StartDate: "",
            EndDate: "",
            RewardGift: [
              {
                Id: 1,
                Name: "TV",
              },
              {
                Id: 2,
                Name: "Washing Machine",
              },
            ],
            MultiCombo: {
              Zones: [],
              Divisions: [],
              Depots: [],
              ArcheTypes: [],
              PainterProducts: [],
              ApplicableProducts: [],
              BonusApplicableProducts: [],
            },
            HasImage: false,
          };
          var oControlModel = new JSONModel(oDataControl);
          oView.setModel(oControlModel, "oModelControl");

          var oModelView = new JSONModel(oData);
          oView.setModel(oModelView, "oModelView");

          var sReqFields = [
            "SchemeTypeId",
            "Title",
            "Description",
            "PotentialId",
            "SlabId",
            "PurchaseVolumeRequired",
            "AccuredPointsRequired",
            "RewardPoints",
            "RewardCash",
            "RewardGiftId",
            "BonusRewardPoints",
            "BonusValidityDurationYear",
            "BonusValidityDurationMonth",
            "BonusValidityDurationDays",
            "SchemeStatus",
            "Reason",
          ];
          var sValue = "",
            sPlit;
          for (var k of sReqFields) {
            sValue = oModelView.getProperty("/" + k);
            sPlit = k.split("/");
            if (sPlit.length > 1) {
              if (
                toString.call(oModelView.getProperty("/" + sPlit[0])) !==
                "[object Object]"
              ) {
                oModelView.setProperty("/" + sPlit[0], {});
              }
            }
            if (sValue == undefined) {
              oModelView.setProperty("/" + k, "");
            }
          }

          promise.resolve(data);
          return promise;
        },
        _setMultiComboData: function (data) {
          console.log(data);
          var promise = jQuery.Deferred();
          var oData = data;
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var aZones = [],
            aDivisions = [],
            aDepots = [],
            aArchiTypes = [],
            aPainterProducts = [],
            aApplicableProducts = [],
            aBonusApplicableProducts = [];
          // zones
          if (oData["SchemeZones"]["results"].length > 0) {
            for (var x of oData["SchemeZones"]["results"]) {
              aZones.push(x["ZoneId"]);
            }
          }
          oModelControl.setProperty("/MultiCombo/Zones", aZones);
          //divisions
          if (oData["SchemeDivisions"]["results"].length > 0) {
            for (var y of oData["SchemeDivisions"]["results"]) {
              aDivisions.push(y["DivisionId"]);
            }
          }
          oModelControl.setProperty("/MultiCombo/Divisions", aDivisions);
          //depots
          if (oData["SchemeDepots"]["results"].length > 0) {
            for (var z of oData["SchemeDepots"]["results"]) {
              aDepots.push({ DepotId: z["DepotId"] });
            }
          }
          oModelControl.setProperty("/MultiCombo/Depots", aDepots);

          //architype
          if (oData["SchemePainterArchiTypes"]["results"].length > 0) {
            for (var p of oData["SchemePainterArchiTypes"]["results"]) {
              aArchiTypes.push(p["ArchiTypeId"]);
            }
          }
          oModelControl.setProperty("/MultiCombo/ArcheTypes", aArchiTypes);

          //painter produts
          if (oData["SchemePainterProducts"]["results"].length > 0) {
            for (var q of oData["SchemePainterProducts"]["results"]) {
              aPainterProducts.push(q["SkuCode"]);
            }
          }
          oModelControl.setProperty(
            "/MultiCombo/PainterProducts",
            aPainterProducts
          );

          //Applicable Products
          if (oData["SchemeApplicableProducts"]["results"].length > 0) {
            for (var r of oData["SchemeApplicableProducts"]["results"]) {
              aApplicableProducts.push(r["SkuCode"]);
            }
          }
          oModelControl.setProperty(
            "/MultiCombo/ApplicableProducts",
            aApplicableProducts
          );
          //Bonus Applicable Products
          if (oData["SchemeBonusApplicableProducts"]["results"].length > 0) {
            for (var s of oData["SchemeBonusApplicableProducts"]["results"]) {
              aBonusApplicableProducts.push(s["SkuCode"]);
            }
          }
          oModelControl.setProperty(
            "/MultiCombo/BonusApplicableProducts",
            aBonusApplicableProducts
          );

          // HasTillDate
          if (oData["BonusValidityDate"] === null) {
            oModelControl.setProperty("/HasTillDate", false);
          }

          console.log(oModelControl);

          promise.resolve(data);
          return promise;
        },
        handleSavePress: function () {
          var oView = this.getView();
          this._ValidateSaveData();
        },
        _ValidateSaveData: function () {
          var oView = this.getView();
          var oValidate = new Validator();
          var oForm = oView.byId("FormChange");

          var bFlagValidate = oValidate.validate(oForm);

          var sFile = this.getView().byId("idFileUpload").oFileUpload.files[0];
          var bFileFlag = false;

          if (bFlagValidate == false) {
            MessageToast.show("Kinldy Input All the Mandatory(*) fields.");
            return;
          }
          //check if it has file
          if (sFile !== undefined) {
            bFileFlag = true;
          }
          console.log(bFileFlag);
          //validate the data

          this._postData(bFileFlag);
        },

        _postData: function (bFileFlag) {
          var othat = this;
          var oView = this.getView();
          var oModelView = this.getView().getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var oViewData = oModelView.getData();
          var oPayload = Object.assign({}, oViewData);
          var oData = oView.getModel();
          var sPath =
            "/" + oView.getModel("oModelControl2").getProperty("/bindProp");

          var oNewpayload = this._RemoveEmptyValue(oPayload);
          //setting up zone data in the array.
          oNewpayload["SchemeZones"] = oModelControl
            .getProperty("/MultiCombo/Zones")
            .map(function (k) {
              return { ZoneId: k };
            });
          //setting up division data in the array.
          oNewpayload["SchemeDivisions"] = oModelControl
            .getProperty("/MultiCombo/Divisions")
            .map(function (k) {
              return { DivisionId: k };
            });
          oNewpayload["SchemeDepots"] = oModelControl
            .getProperty("/MultiCombo/Depots")
            .map(function (k) {
              return { DepotId: k["DepotId"] };
            });
          var inTegerProperty = [
            "PurchaseVolumeRequired",
            "AccuredPointsRequired",
            "RewardPoints",
            "RewardCash",
            "BonusRewardPoints",
            "BonusValidityDurationYear",
            "BonusValidityDurationMonth",
            "BonusValidityDurationDays",
          ];
          for (var y of inTegerProperty) {
            if (oNewpayload.hasOwnProperty(y)) {
              if (oNewpayload[y] !== null) {
                oNewpayload[y] = parseInt(oNewpayload[y]);
              }
            }
          }
          console.log(oNewpayload);
          oData.update(sPath, oNewpayload, {
            success: function (data) {
              console.log("Data Sucessfully updated", data);
              if (bFileFlag) {
                othat._UploadFile(data);
              }
            },
            error: function () {
              console.log("Unable to update the data");
            },
          });
        },
        _UploadFile: function (data) {
          var oView = this.getView();
          var data = oView.getModel("oModelView").getData();
          var oFile = oView.byId("idFileUpload").oFileUpload.files[0];
          var sServiceUrl = this.getOwnerComponent(this)
            .getManifestObject()
            .getEntry("/sap.app").dataSources.mainService.uri;

          var sUrl = sServiceUrl + "SchemeSet(" + data["Id"] + ")/$value";
          jQuery.ajax({
            method: "PUT",
            url: sUrl,
            cache: false,
            contentType: false,
            processData: false,
            data: oFile,
            success: function (data) {},
            error: function () {},
          });
        },
        _RemoveEmptyValue: function (mParam) {
          var obj = Object.assign({}, mParam);
          // remove string values
          for (var b in obj) {
            if (obj[b] === "") {
              obj[b] = null;
            }
          }

          return obj;
        },

        _reLoadInitData: function () {},

        _loadEditProfile: function (mParam) {
          var oView = this.getView();
          var promise = jQuery.Deferred();
          var othat = this;
          var oVboxProfile = oView.byId("idVbProfile");
          var sFragName = mParam == "Edit" ? "ChangeDetail" : "DisplayDetail";
          oVboxProfile.destroyItems();
          return Fragment.load({
            id: oView.getId(),
            controller: othat,
            name: "com.knpl.pragati.SchemeOffers.view.fragment." + sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
            promise.resolve();
            return promise;
          });
        },
        // Attachment View and other Changes
        _CheckAttachment: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModelControl = this.getView().getModel("oModelControl2");
          var oProp = oModelControl.getProperty("/bindProp");
          var sImageUrl =
            "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
          jQuery
            .get(sImageUrl)
            .done(function () {
              oModelControl.setProperty("/ImageLoaded", true);
            })
            .fail(function () {
              oModelControl.setProperty("/ImageLoaded", false);
            });

          promise.resolve();
          return promise;
        },
        onViewAttachment: function (oEvent) {
          var oButton = oEvent.getSource();
          var oView = this.getView();
          if (!this._pKycDialog) {
            Fragment.load({
              name:
                "com.knpl.pragati.SchemeOffers.view.fragment.AttachmentDialog",
              controller: this,
            }).then(
              function (oDialog) {
                this._pKycDialog = oDialog;
                oView.addDependent(this._pKycDialog);
                this._pKycDialog.open();
              }.bind(this)
            );
          } else {
            oView.addDependent(this._pKycDialog);
            this._pKycDialog.open();
          }
        },
        onAttachDialogClose: function (oEvent) {
          oEvent.getSource().getParent().close();
        },
        onAfterAttachClose: function (oEvent) {
          this._pKycDialog.destroy();
          delete this._pKycDialog;
        },
        _toggleButtonsAndView: function (bEdit) {
          var oView = this.getView();
          oView.byId("edit").setVisible(!bEdit);
          oView.byId("save").setVisible(bEdit);
          oView.byId("cancel").setVisible(bEdit);
        },
        handleCancelPress: function () {
          var oView = this.getView();
          var othat = this;
          var oProp = oView.getModel("oModelControl2").getProperty("/SchemeId");

          var c1, c2, c3, c4;
          this._initData(oProp);
        },
      }
    );
  }
);
