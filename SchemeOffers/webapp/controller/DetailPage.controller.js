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
    "../model/formatter",
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
    formatter
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.SchemeOffers.controller.DetailPage",
      {
        formatter: formatter,
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
            PainterId: oProp, //.replace(/[^0-9]/g, ""),
            //ProfilePic:"/KNPL_PAINTER_API/api/v2/odata.svc/PainterSet(717)/$value",
            tableDealay: 0,
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl2");

          var othat = this;
          var c1, c2, c3, c4;
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
          console.log(oData);
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
          oModelControl2.setProperty("/Display/Divisions", aDivisions);
          if (oData["SchemeDepots"]["results"].length > 0) {
            for (var z of oData["SchemeDepots"]["results"]) {
              aDepots.push(z["DepotId"]);
            }
          }
          oModelControl2.setProperty("/Display/Depots", aDepots);

          if (oData["SchemePainterArchiTypes"]["results"].length > 0) {
            for (var p of oData["SchemePainterArchiTypes"]["results"]) {
              aArchiTypes.push(p["ArchiTypeId"]);
            }
          }
          oModelControl2.setProperty("/Display/ArchiTypes", aArchiTypes);

          if (oData["SchemePainterArchiTypes"]["results"].length > 0) {
            for (var p of oData["SchemePainterArchiTypes"]["results"]) {
              aArchiTypes.push(p["ArchiTypeId"]);
            }
          }
          oModelControl2.setProperty("/Display/ArchiTypes", aArchiTypes);

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
          console.log(oModelControl2);
          promise.resolve();
          return promise;
        },
        handleEditPress: function () {
          this._toggleButtonsAndView(true);
          var oView = this.getView();
          var oCtrl2Model = oView.getModel("oModelControl2");
          var c1, c2, c3;
          var othat = this;
          c1 = othat._loadEditProfile("Edit");
          c1.then(function () {
            c2 = othat._GetInitEditData();
            c2.then(function (data) {
              c3 = othat._setEditData(data);
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
          var oModelView = new JSONModel(oData);

          promise.resolve();
          return promise;
        },
        handleSavePress: function () {
          var oView = this.getView();
          
        },

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
          this._toggleButtonsAndView(false);
          var oView = this.getView();
          this._loadEditProfile("Display");
          oView.getModel().refresh(true);
        },
      }
    );
  }
);
