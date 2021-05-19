// @Base Controller
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    BusyIndicator,
    Filter,
    FilterOperator,
    History,
    JSONModel,
    Fragment,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return Controller.extend(
      "com.knpl.pragati.SchemeOffers.controller.BaseController",
      {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
          return sap.ui.core.UIComponent.getRouterFor(this);
        },

        addContentDensityClass: function () {
          return this.getView().addStyleClass(
            this.getOwnerComponent().getContentDensityClass()
          );
        },
        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getViewModel: function (sName) {
          return this.getView().getModel(sName);
        },

        getComponentModel: function () {
          return this.getOwnerComponent().getModel();
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        //for controlling global busy indicator
        presentBusyDialog: function () {
          BusyIndicator.show();
        },

        dismissBusyDialog: function () {
          BusyIndicator.hide();
        },

        onPressBreadcrumbLink: function () {
          this._navToHome();
        },

        _navToHome: function () {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteLandingPage", {}, true);
          }
        },

        onPostSchemeData: function (oPayload, fileFlag) {},
        onStartDateChange: function (oEvent) {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oModelView = oView.getModel("oModelView");
          var oStartDate = oEvent.getSource().getDateValue();
          var oEndDate = oModelView.getProperty("/EndDate");
          if (oEndDate) {
            if (oStartDate > oEndDate) {
              MessageToast.show("Kinldy select a date less than end date.");
              oModelControl.setProperty("/StartDate", "");
              oModelView.setProperty("/StartDate", null);
            }
          }
          if (oStartDate < new Date().setHours(0, 0, 0, 0)) {
            MessageToast.show(
              "Kindly enter a date greater than or equal to current date"
            );
            oModelControl.setProperty("/StartDate", "");
            oModelView.setProperty("/StartDate", null);
          }
        },
        onEndDateChange: function (oEvent) {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oModelView = oView.getModel("oModelView");
          var oEndDate = oEvent.getSource().getDateValue();
          var oStartDate = oModelView.getProperty("/StartDate");
          if (oStartDate >= oEndDate) {
            MessageToast.show("Kinldy select a date more than start date.");
            oModelControl.setProperty("/EndDate", "");
            oModelView.setProperty("/EndDate", null);
          }
        },
        onDivisionChange: function (oEvent) {
          this._CheckAreaChange();
        },
        onOfferTypeChanged: function (oEvent) {
          var oView = this.getView();
          var oSource = oEvent.getSource().getSelectedItem();
          var object = oSource.getBindingContext().getObject();
          var oModelControl = oView.getModel("oModelControl");
          oModelControl.setProperty("/OfferType", object);
          this._OfferTypeFieldsSet();
        },

        _OfferTypeFieldsSet: function () {
          // disabling all the fields that we have to hide.
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oOfferType = oView
            .getModel("oModelControl")
            .getProperty("/OfferType");
          var othat = this;
          for (var a in oOfferType) {
            if (!oOfferType[a]) {
              if (a === "ApplicablePainters") {
                othat._propertyToBlank(
                  [
                    "MultiCombo/ArcheTypes",
                    "MultiCombo/PainterType",
                    "MultiCombo/Potential",
                    "MultiCombo/Zones",
                    "MultiCombo/Divisions",
                    "MultiCombo/Depots",
                    "MultiEnabled/Zones",
                    "MultiEnabled/Division",
                    "MultiEnabled/Depots",
                  ],
                  true
                );
                othat._RbtnReset([
                  "Rbtn/Zones",
                  "Rbtn/Division",
                  "Rbtn/Depots",
                  "Rbtn/AppPainter",
                ]);
              } else if (a === "ApplicablePainterProducts") {
                othat._propertyToBlank(
                  [
                    "MultiCombo/PCat2",
                    "MultiCombo/PClass2",
                    "MultiCombo/AppProd2",
                    "MultiCombo/AppPacks2",
                    "MultiCombo/PCat3",
                    "MultiCombo/PClass3",
                    "MultiCombo/AppProd3",
                    "MultiCombo/AppPacks3",
                  ],
                  true
                );
                othat._RbtnReset([
                  "Rbtn/Zones",
                  "Rbtn/PCat2",
                  "Rbtn/PClass2",
                  "Rbtn/AppProd2",
                  "Rbtn/AppPacks2",
                  "Rbtn/PCat3",
                  "Rbtn/PClass3",
                  "Rbtn/AppProd3",
                  "Rbtn/AppPacks3",
                ]);
              } else if (a === "AdditionalReward") {
                othat._propertyToBlank(
                  [
                    "MultiCombo/PCat4",
                    "MultiCombo/PClass4",
                    "MultiCombo/AppProd4",
                    "MultiCombo/AppPacks4",
                    "Table/Table4",
                  ],
                  true
                );
                othat._RbtnReset([
                  "Rbtn/PCat4",
                  "Rbtn/PClass4",
                  "Rbtn/AppProd4",
                  "Rbtn/AppPacks4",
                ]);
                oModelControl.setProperty("/Table/Table3", [
                  {
                    StartDate: null,
                    EndDate: null,
                    BonusPoints: "",
                  },
                ]);
              }
            }
          }
        },
        onMultyZoneChange: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oDivision = this.getView().byId("idDivision");
          var aDivFilter = [];
          for (var y of sKeys) {
            aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y));
          }
          oDivision.getBinding("items").filter(aDivFilter);
        },
        _CheckAreaChange: function () {
          var oView = this.getView();
          var sZone = oView.byId("idZones");
          var sZoneKey = sZone.getSelectedKeys();
          var oDivision = oView.byId("idDivisions");
          var aDivisioKeys = oDivision.getSelectedKeys();
          var oDivisionItems = oDivision.getSelectedItems();

          var oDivObj;

          // check the division if its there for all the zones selected
          for (var j of oDivisionItems) {
            oDivObj = j.getBindingContext().getObject();
            if (sZoneKey.indexOf(oDivObj["Zone"]) < 0) {
              oDivision.removeSelectedItem(j);
            }
          }
          // check for the depot tokens
          var oDepot = oView.byId("idDepots");
          var aTokens = oDepot.getTokens();
          var oModelControl = oView.getModel("oModelControl");
          var aTokenKeys = oModelControl.getProperty("/MultiCombo/Depots");
          var oNewDivisionKeys = oDivision.getSelectedKeys();
          var aDepotToken = [];
          for (var k in aTokenKeys) {
            if (oNewDivisionKeys.indexOf(aTokenKeys[k]["Division"]) >= 0) {
              aDepotToken.push(aTokenKeys[k]);
            }
          }
          oModelControl.setProperty("/MultiCombo/Depots", aDepotToken);
        },
        onRbPrntOffer: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModel = oView.getModel("oModelControl");
          var oModel2 = oView.getModel("oModelView");
          if (sKey === 0) {
            oModel.setProperty("/Fields/ParentOfferTitle", "");
            oModel2.setProperty("/ParentOfferId", null);
          }
        },
        onPAppDropChange: function () {
          this._CreateRewardTableData();
        },
        onBRAppDropChange: function () {
          this._CreateBonusRewardTable();
        },
        onRbRewardRatio: function () {
          this._CreateRewardTableData();
        },
        onBRRbChange: function () {
          this._CreateBonusRewardTable();
        },
        onPressAddRewards: function () {
          var oView = this.getView();
          var othat = this;

          if (!this._RewardsDialog1) {
            Fragment.load({
              name: "com.knpl.pragati.SchemeOffers.view.fragment.AddProdPacks",
              controller: othat,
            }).then(
              function (oDialog) {
                this._RewardsDialog1 = oDialog;
                oView.addDependent(this._RewardsDialog1);
                this._RewardsDialog1.open();
              }.bind(this)
            );
          } else {
            oView.addDependent(this._RewardsDialog1);
            this._RewardsDialog1.open();
          }
        },
        onRewardBeforeOpen: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var iRtnSelected = oModelControl.getProperty("/Rbtn/AppPacks1");
          if (iRtnSelected === 0) {
            this._RewardsDialog1.bindElement("oModelControl>/Dialog/Bonus1");

            oModelControl.setProperty("/Dialog/Bonus1", {
              ProductCode: "",
              RequiredVolume: "",
              RequiredPoints: "",
              RewardPoints: "",
              RewardGiftId: "",
              RewardCash: "",
            });
            this._setProductsData();
          } else {
            this._RewardsDialog1.bindElement("oModelControl>/Dialog/Bonus1");

            oModelControl.setProperty("/Dialog/Bonus1", {
              SkuCode: "",
              RequiredVolume: "",
              RequiredPoints: "",
              RewardPoints: "",
              RewardGiftId: "",
              RewardCash: "",
            });
             this._setPacksData();
          }
        },
        onSubmitRewards1: function () {
          var oView = this.getView();
          var oModel2 = oView.getModel("oModelControl");

          var oPayload = oModel2.getProperty("/Dialog/Bonus1");
          if (oPayload["RequiredVolume"] == "") {
            MessageToast.show("Kindly Input Required Volume to Continue");
            return;
          }
          if (oPayload["RewardPoints"] == "") {
            MessageToast.show("Kindly Input Reward Points to Continue");
            return;
          }
          var oPayloadNew = Object.assign({}, oPayload);
          oModel2.getProperty("/Table/Table2").push(oPayloadNew);
          oModel2.refresh();
          this._RewardsDialog1.close();
        },
        onRemovedReward: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelControl");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelControl")
            .getPath()
            .split("/");

          var oTable = oModel.getProperty("/Table/Table2");

          oTable.splice(sPath[sPath.length - 1], 1);
          oModel.refresh();
        },
        onRbChnageMain: function (oEvent) {
          var oView = this.getView();
          var oSource = oEvent.getSource();
          var sKey = oSource.getSelectedIndex();
          var sPath = oSource.getBinding("selectedIndex").getPath();
          var sPathArray = sPath.split("/");
          var oModelControl = oView.getModel("oModelControl");
          if (sKey == 1) {
            oModelControl.setProperty("/MultiEnabled/" + sPathArray[2], true);
          } else {
            oModelControl.setProperty("/MultiEnabled/" + sPathArray[2], false);
            this._propertyToBlank(["MultiCombo/" + sPathArray[2]], true);
          }

          var aChkTblData = ["PCat1", "PClass1", "AppProd1", "AppPacks1"];
          var aChkTblData2 = ["PCat4", "PClass4", "AppProd4", "AppPacks4"];
          if (aChkTblData.indexOf(sPathArray[2]) >= 0) {
            this._CreateRewardTableData();
          }
          if (aChkTblData2.indexOf(sPathArray[2]) >= 0) {
            this._CreateBonusRewardTable();
          }
        },

        onRbBonusRewardChange: function (oEvent) {},
        _CreateBonusRewardTable: function () {
          var oView = this.getView();
          var othat = this;
          var oModelControl = oView.getModel("oModelControl");
          var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks4");
          var oDataModel = this.getView().getModel();
          var c1, c2, c3, c4, c5;

          if (sCheckPacks == 0) {
            othat._setBRProductsData();
          } else {
            othat._setBRPacksData();
          }
        },

        _CreateRewardTableData: function (oEvent) {
          //check if all or specific table is there or not
          var oView = this.getView();
          var othat = this;
          var oModelControl = oView.getModel("oModelControl");
          oModelControl.setProperty("/Table/Table2", []);
          var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks1");
          var oDataModel = this.getView().getModel();
          var c1, c2, c3, c4, c5;

          //   if (sCheckPacks == 0) {
          //     othat._setProductsData();
          //   } else {
          //     othat._setPacksData();
          //   }
        },
        onRbTable1Change: function (oEvent) {
          var oView = this.getView();
          var sKey = oEvent.getSource().getSeleckedIndex();
          var spath = oEvent.getSource().getBinding("selectedIndex").getPath();
        },

        _setProductsData: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var aSelectedKeys = oModelControl.getProperty("/MultiCombo/AppProd1");
          var oControl = oView.byId("AppProd1").getSelectedItems();
          var bRbProd = oModelControl.getProperty("/Rbtn/AppProd1");
          if (oControl.length <= 0 && bRbProd == 0) {
            oControl = oModelControl.getProperty("/oData/Products");
          }
          var aSelectedData = [],
            obj;

          for (var x of oControl) {
            if (x instanceof sap.ui.base.ManagedObject) {
              obj = x.getBindingContext().getObject();
            } else {
              obj = x;
            }

            aSelectedData.push({
              Id: obj["Id"],
              Name: obj["ProductName"],
            });
          }

          oModelControl.setProperty("/MultiCombo/Reward", aSelectedData);
        },
        _setPacksData: function (sKey) {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var aSelectedKeys = oModelControl.getProperty(
            "/MultiCombo/AppPacks1"
          );
          var oControl = oView.byId("AppPacks1").getSelectedItems();
          var aSelectedData = [],
            obj;
          for (var x of oControl) {
            obj = x.getBindingContext().getObject();
            aSelectedData.push({
              Id: obj["SkuCode"],
              Name: obj["Description"],
            });
          }
          oModelControl.setProperty("/MultiCombo/Reward", aSelectedData);
        },
        _setBRProductsData: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oControl = oView.byId("AppProd4").getSelectedItems();
          var bRbProd = oModelControl.getProperty("/Rbtn/AppProd4");
          if (oControl.length <= 0) {
            oControl = oModelControl.getProperty("/oData/Products");
          }
          var aSelectedData = [],
            obj;

          for (var x of oControl) {
            if (x instanceof sap.ui.base.ManagedObject) {
              obj = x.getBindingContext().getObject();
            } else {
              obj = x;
            }

            aSelectedData.push({
              ProductCode: obj["Id"],
              StartDate: null,
              EndDate: null,
              BonusPoints: "",
            });
          }

          oModelControl.setProperty("/Table/Table4", aSelectedData);
        },
        _setBRPacksData: function (sKey) {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");

          var oControl = oView.byId("AppPacks4").getSelectedItems();
          var aSelectedData = [],
            obj;
          for (var x of oControl) {
            obj = x.getBindingContext().getObject();
            aSelectedData.push({
              SkuCode: obj["SkuCode"],
              StartDate: null,
              EndDate: null,
              BonusPoints: "",
            });
          }
          oModelControl.setProperty("/Table/Table4", aSelectedData);
        },
        _getPacksData: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var sPacks = oModelControl.getProperty("/oData/Packs");
          var oData = oView.getModel();
          if (sPacks.length > 0) {
            promise.resolve();
            return promise;
          }
          oData.read("/MasterRepProductSkuSet", {
            success: function (mParam1) {
              oModelControl.setProperty("/oData/Packs", mParam1["results"]);
            },
            error: function (mParam1) {},
          });
          promise.resolve();
          return promise;
        },
        onValueHelpRequestedPainter: function () {
          this._PainterMulti = this.getView().byId("Painters");
          this.oColModel = new JSONModel({
            cols: [
              {
                label: "Membership ID",
                template: "MembershipCard",
              },
              {
                label: "Name",
                template: "Name",
              },
              {
                label: "Mobile Number",
                template: "Mobile",
              },
              {
                label: "Zone",
                template: "ZoneId",
              },
              {
                label: "Division",
                template: "DivisionId",
              },
              {
                label: "Depot",
                template: "Depot/Depot",
              },
              {
                label: "Painter Type",
                template: "PainterType/PainterType",
              },
              {
                label: "Painter ArcheType",
                template: "ArcheType/ArcheType",
              },
            ],
          });

          var aCols = this.oColModel.getData().cols;
          var oFilter = new sap.ui.model.Filter(
            "IsArchived",
            sap.ui.model.FilterOperator.EQ,
            false
          );

          this._PainterValueHelp = sap.ui.xmlfragment(
            "com.knpl.pragati.SchemeOffers.view.fragment.PainterValueHelp",
            this
          );
          this.getView().addDependent(this._PainterValueHelp);

          this._PainterValueHelp.getTableAsync().then(
            function (oTable) {
              oTable.setModel(this.oColModel, "columns");

              if (oTable.bindRows) {
                oTable.bindAggregation("rows", {
                  path: "/PainterSet",
                  parameters: { expand: "Depot,PainterType,ArcheType" },
                  events: {
                    dataReceived: function () {
                      this._PainterValueHelp.update();
                    }.bind(this),
                  },
                });
              }

              if (oTable.bindItems) {
                oTable.bindAggregation("items", "/PainterSet", function () {
                  return new sap.m.ColumnListItem({
                    cells: aCols.map(function (column) {
                      return new sap.m.Label({
                        text: "{" + column.template + "}",
                      });
                    }),
                  });
                });
              }

              this._PainterValueHelp.update();
            }.bind(this)
          );

          this._PainterValueHelp.setTokens(this._PainterMulti.getTokens());
          this._PainterValueHelp.open();
        },
        onPainterOkayPress: function (oEvent) {
          var oData = [];
          var xUnique = new Set();
          var aTokens = oEvent.getParameter("tokens");

          aTokens.forEach(function (ele) {
            if (xUnique.has(ele.getKey()) == false) {
              oData.push({
                PainterName: ele.getText(),
                PainterId: ele.getKey(),
              });
              xUnique.add(ele.getKey());
            }
          });

          this.getView()
            .getModel("oModelControl")
            .setProperty("/MultiCombo/Painters", oData);

          this._PainterValueHelp.close();
        },
        onPainterValueAfterOpen: function () {
          var aFilter = this._getFilterForPainterValue();
          this._FilterPainterValueTable(aFilter, "Control");
        },
        _getFilterForPainterValue: function () {
          var aFilters = [];
          var aFilter1 = new Filter("IsArchived", FilterOperator.EQ, false);
          aFilters.push(aFilter1);
          if (aFilters.length == 0) {
            return [];
          }

          return aFilter1;
        },
        _FilterPainterValueTable: function (oFilter, sType) {
          var oValueHelpDialog = this._PainterValueHelp;

          oValueHelpDialog.getTableAsync().then(function (oTable) {
            if (oTable.bindRows) {
              oTable.getBinding("rows").filter(oFilter, sType || "Application");
            }

            if (oTable.bindItems) {
              oTable
                .getBinding("items")
                .filter(oFilter, sType || "Application");
            }

            oValueHelpDialog.update();
          });
        },
        onFilterBarSearchPainter: function (oEvent) {
          var afilterBar = oEvent.getParameter("selectionSet"),
            aFilters = [];

          for (var i = 0; i < afilterBar.length; i++) {
            if (afilterBar[i].getValue()) {
              aFilters.push(
                new Filter({
                  path: afilterBar[i].mProperties.name,
                  operator: FilterOperator.Contains,
                  value1: afilterBar[i].getValue(),
                  caseSensitive: false,
                })
              );
            }
          }

          aFilters.push(
            new Filter({
              path: "IsArchived",
              operator: FilterOperator.EQ,
              value1: false,
            })
          );

          this._FilterPainterValueTable(
            new Filter({
              filters: aFilters,
              and: true,
            })
          );
        },

        onDepotValueHelpOpen: function (oEvent) {
          this._oMultiInput = this.getView().byId("idDepots");
          this.oColModel = new JSONModel({
            cols: [
              {
                label: "Depot Id",
                template: "Id",
                width: "10rem",
              },
              {
                label: "Depot Name",
                template: "Depot",
              },
            ],
          });

          var aCols = this.oColModel.getData().cols;

          this._oDepotDialog = sap.ui.xmlfragment(
            "com.knpl.pragati.SchemeOffers.view.fragment.DepotFragment",
            this
          );
          this.getView().addDependent(this._oDepotDialog);

          this._oDepotDialog.getTableAsync().then(
            function (oTable) {
              //		oTable.setModel(this.oProductsModel);
              oTable.setModel(this.oColModel, "columns");

              if (oTable.bindRows) {
                oTable.bindAggregation("rows", {
                  path: "/MasterDepotSet",
                  events: {
                    dataReceived: function () {
                      this._oDepotDialog.update();
                    }.bind(this),
                  },
                });
              }

              if (oTable.bindItems) {
                oTable.bindAggregation("items", "/MasterDepotSet", function () {
                  return new sap.m.ColumnListItem({
                    cells: aCols.map(function (column) {
                      return new sap.m.Label({
                        text: "{" + column.template + "}",
                      });
                    }),
                  });
                });
              }

              this._oDepotDialog.update();
            }.bind(this)
          );

          this._oDepotDialog.setTokens(this._oMultiInput.getTokens());
          this._oDepotDialog.open();
        },
        onValueHelpAfterClose: function () {
          if (this._DepotDialog) {
            this._oDepotDialog.destroy();
            delete this._oDepotDialog;
          }
          if (this._PainterValueHelp) {
            this._PainterValueHelp.destroy();
            delete this._PainterValueHelp;
          }
          if (this._RewardsDialog1) {
            this._RewardsDialog1.destroy();
            delete this._RewardsDialog1;
          }
        },
        onValueHelpClose: function () {
          if (this._oDepotDialog) {
            this._oDepotDialog.close();
          }
          if (this._PainterValueHelp) {
            this._PainterValueHelp.close();
          }
          if (this._RewardsDialog1) {
            this._RewardsDialog1.close();
          }
        },
        onDepotOkPress: function (oEvent) {
          var oData = [];
          var oView = this.getView();
          var aTokens = oEvent.getParameter("tokens");
          var aArrayBackEnd = [];
          aTokens.forEach(function (ele) {
            oData.push({
              DepotId: ele.getKey(),
              Division: ele.getCustomData()[0].getValue()["Division"],
            });
          });

          oView
            .getModel("oModelControl")
            .setProperty("/MultiCombo/Depots", oData);

          this._oDepotDialog.close();
        },
        onDepotAfterOpen: function () {
          var aFilter = this._getFilterForDepot();
          this._FilterDepotTable(aFilter, "Control");
        },
        _getFilterForDepot: function () {
          var sDivisions = this.getView()
            .getModel("oModelControl")
            .getProperty("/MultiCombo/Divisions");
          var aFilters = [];

          for (var div of sDivisions) {
            aFilters.push(new Filter("Division", FilterOperator.EQ, div));
          }

          if (aFilters.length == 0) {
            return [];
          }
          return new Filter({
            filters: aFilters,
            and: false,
          });
        },
        _FilterDepotTable: function (oFilter, sType) {
          var oValueHelpDialog = this._oDepotDialog;

          oValueHelpDialog.getTableAsync().then(function (oTable) {
            if (oTable.bindRows) {
              oTable.getBinding("rows").filter(oFilter, sType || "Application");
            }

            if (oTable.bindItems) {
              oTable
                .getBinding("items")
                .filter(oFilter, sType || "Application");
            }

            oValueHelpDialog.update();
          });
        },

        onProductCatChange: function (oEvent) {
          var oView = this.getView();
          var oSource = oEvent.getSource();
          //var sKey = oSource.getSeleckedKeys();
        },
        onProdClassChange: function (oEvent) {},
        onAppProdChange: function (oEvent) {},
        onArchiTypeChange: function (oEvent) {},

        onRbAppPainter: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          this._propertyToBlank(
            ["PointSlabUpperLimit", "PointSlabLowerLimit"],
            false
          );
          this._propertyToBlank(
            [
              "MultiCombo/ArcheTypes",
              "MultiCombo/PainterType",
              "MultiCombo/Potential",
              "MultiCombo/PCat2",
              "MultiCombo/PClass2",
              "MultiCombo/AppProd2",
              "MultiCombo/AppPacks2",
              "MultiCombo/PCat3",
              "MultiCombo/PClass3",
              "MultiCombo/AppProd3",
              "MultiCombo/AppPacks3",
              "MultiCombo/Zones",
              "MultiCombo/Divisions",
              "MultiCombo/Depots",
              "MultiCombo/Painters",
              "Fields/Date1",
              "Fields/Date2",
            ],
            true
          );
          oModelControl.setProperty("/Rbtn/PCat2", 0);
          oModelControl.setProperty("/Rbtn/PClass2", 0);
          oModelControl.setProperty("/Rbtn/AppProd2", 0);
          oModelControl.setProperty("/Rbtn/AppPacks2", 0);
          oModelControl.setProperty("/Rbtn/PCat3", 0);
          oModelControl.setProperty("/Rbtn/PClass3", 0);
          oModelControl.setProperty("/Rbtn/AppProd3", 0);
          oModelControl.setProperty("/Rbtn/AppPacks3", 0);
          oModelControl.setProperty("/Rbtn/Zones", 0);
          oModelControl.setProperty("/Rbtn/Divisions", 0);
          oModelControl.setProperty("/Rbtn/Depots", 0);

          if (iIndex == 0) {
            oModelControl.setProperty("/MultiCombo/AppPainter", false);
            oModelView.setProperty("/PainterSelection", 0);
          } else if (iIndex == 1) {
            oModelControl.setProperty("/MultiCombo/AppPainter", true);
            oModelView.setProperty("/PainterSelection", 1);
          } else if (iIndex == 2) {
            oModelControl.setProperty("/MultiCombo/AppPainter", true);
            oModelView.setProperty("/PainterSelection", 2);
          } //
          // making the fields blank
        },
        onRbTopApp: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedIndex();
          this._propertyToBlank(["BonusApplicableTopPainter"]);
        },
        onRbAppRewards: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          if (iIndex == 0) {
            oModelView.setProperty("/HasBonusPercentage", false);
            this._propertyToBlank(["BonusRewardPoints"]);
          } else if (iIndex == 1) {
            oModelView.setProperty("/HasBonusPercentage", true);
            this._propertyToBlank(["BonusRewardPoints"]);
          } //
          // making the fields blank
        },
        onRbBonusValidity: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");

          if (iIndex == 0) {
            oModelControl.setProperty("/HasTillDate", false);
            this._propertyToBlank(["BonusValidityDate"]);
          } else if (iIndex == 1) {
            oModelControl.setProperty("/HasTillDate", true);
            this._propertyToBlank([
              "BonusValidityDurationYear",
              "BonusValidityDurationMonth",
              "BonusValidityDurationDays",
            ]);
          } //
        },
        _propertyToBlank: function (aArray, aModel2) {
          var aProp = aArray;
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          if (aModel2) {
            oModelView = oView.getModel("oModelControl");
          }

          for (var x of aProp) {
            var oGetProp = oModelView.getProperty("/" + x);
            if (Array.isArray(oGetProp)) {
              oModelView.setProperty("/" + x, []);
              //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
            } else if (oGetProp === null) {
              oModelView.setProperty("/" + x, null);
            } else if (oGetProp instanceof Date) {
              oModelView.setProperty("/" + x, null);
            } else if (typeof oGetProp === "boolean") {
              oModelView.setProperty("/" + x, false);
            } else {
              oModelView.setProperty("/" + x, "");
            }
          }
          oModelView.refresh(true);
        },
        _RbtnReset: function (aArray, aModel2 = true) {
          var aProp = aArray;
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          if (aModel2) {
            oModelView = oView.getModel("oModelControl");
          }
          for (var x of aProp) {
            var oGetProp = oModelView.getProperty("/" + x);

            oModelView.setProperty("/" + x, 0);
            //oView.byId(x.substring(x.indexOf("/") + 1)).fireChange();
          }
          oModelView.refresh(true);
        },
        onValueHelpParentOffer: function (oEvent) {
          var sInputValue = oEvent.getSource().getValue(),
            oView = this.getView();

          if (!this._pOfferpDialog) {
            this._pOfferpDialog = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.SchemeOffers.view.fragment.OfferDialog",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              return oDialog;
            });
          }
          this._pOfferpDialog.then(function (oDialog) {
            // Create a filter for the binding

            // Open ValueHelpDialog filtered by the input's value
            oDialog.open();
          });
        },
        onParentOfferValueHelpClose: function (oEvent) {
          var oSelectedItem = oEvent.getParameter("selectedItem");
          oEvent.getSource().getBinding("items").filter([]);
          var oView = this.getView();
          var oViewModel = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          if (!oSelectedItem) {
            return;
          }
          var obj = oSelectedItem.getBindingContext().getObject();
          oViewModel.setProperty("/ParentOfferId", obj["Id"]);
          oModelControl.setProperty("/Fields/ParentOfferTitle", obj["Title"]);
        },
        onValueHelpSearch: function (oEvent) {
          var sValue = oEvent.getParameter("value");
          var oFilter = new Filter(
            [new Filter("Title", FilterOperator.Contains, sValue)],
            false
          );

          oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        _getProductsData: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oData = oView.getModel();
          oData.read("/MasterProductSet", {
            success: function (mParam1) {
              oModelControl.setProperty("/oData/Products", mParam1["results"]);
            },
            error: function (mParam1) {},
          });
        },
        GetPackName: function (mParam1) {
          var sPath = "/MasterRepProductSkuSet('" + mParam1 + "')";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["Description"];
          }
        },
        GetProdName: function (mParam1) {
          var sPath = "/MasterProductSet('" + mParam1 + "')";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["ProductName"];
          }
        },
        _CreatePayloadPart1(bFileFlag) {
          var promise = jQuery.Deferred();
          //creating the payload
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var oDataModel = oView.getModel();
          var oViewData = oModelView.getData();
          var oPayLoad = this._RemoveEmptyValue(oViewData);

          var inTegerProperty = [
            "PointSlabUpperLimit",
            "PointSlabLowerLimit",
            "BonusApplicableTopPainter",
            "ParentOfferId",
          ];
          for (var y of inTegerProperty) {
            if (oPayLoad.hasOwnProperty(y)) {
              if (oPayLoad[y] !== null) {
                oPayLoad[y] = parseInt(oPayLoad[y]);
              }
            }
          }
          // setting the zone, division, depot data.

          promise.resolve(oPayLoad);
          return promise;
        },
        _CreatePayloadPart2: function (oPayLoad) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          //      "IsSpecificApplicableProductCategory": false,
          // "IsSpecificApplicableProductClassification": false,
          // "IsSpecificApplicableProduct": false,
          // "IsSpecificApplicablePack": false,
          // "IsSpecificRewardRatio": false,
          var aBoleanProps = {
            IsSpecificZone: "Zones",
            IsSpecificDivision: "Divisions",
            IsSpecificDepot: "Depots",
            IsSpecificApplicableProductCategory: "PCat1",
            IsSpecificApplicableProductClassification: "PClass1",
            IsSpecificApplicableProduct: "AppProd1",
            IsSpecificApplicablePack: "AppPacks1",
            IsSpecificRewardRatio: "Rewards",
            IsSpecificBuyerProductCategory: "PCat2",
            IsSpecificBuyerProductClassification: "PClass2",
            IsSpecificBuyerProduct: "AppProd2",
            IsSpecificBuyerPack: "AppPacks2",
            IsSpecificNonBuyerProductCategory: "PCat3",
            IsSpecificNonBuyerProductClassification: "PClass3",
            IsSpecificNonBuyerProduct: "AppProd3",
            IsSpecificNonBuyerPack: "AppPacks3",
            IsSpecificBonusProductCategory: "PCat4",
            IsSpecificBonusProductClassification: "PClass4",
            IsSpecificBonusProduct: "AppProd4",
            IsSpecificBonusPack: "AppPacks4",
            IsSpecificBonusRewardRatio: "BRewards",
          };
          var oModelControl = oView.getModel("oModelControl");
          var oPropRbtn = oModelControl.getProperty("/Rbtn");
          for (var key in aBoleanProps) {
            oPayLoad[key] = oPropRbtn[aBoleanProps[key]] == 0 ? false : true;
          }

          promise.resolve(oPayLoad);
          return promise;
        },

        // postdata
        _CreatePayloadPart3: function (oPayLoad) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var sMultiKeys = oModelControl.getProperty("/MultiCombo");

          // setting the values of zone
          oPayLoad["OfferZone"] = sMultiKeys["Zones"].map(function (elem) {
            return {
              ZoneId: elem,
            };
          });
          oPayLoad["OfferDivision"] = sMultiKeys["Divisions"].map(function (
            elem
          ) {
            return {
              DivisionId: elem,
            };
          });
          oPayLoad["OfferDepot"] = sMultiKeys["Depots"].map(function (elem) {
            return {
              DepotId: elem["DepotId"],
            };
          });
          oPayLoad["OfferApplicableProductCategory"] = sMultiKeys["PCat1"].map(
            function (elem) {
              return {
                ProductCategoryCode: elem,
              };
            }
          );
          oPayLoad["OfferApplicableProductClassification"] = sMultiKeys[
            "PClass1"
          ].map(function (elem) {
            return {
              ProductClassificationCode: elem,
            };
          });
          oPayLoad["OfferApplicableProduct"] = sMultiKeys["AppProd1"].map(
            function (elem) {
              return {
                ProductCode: elem,
              };
            }
          );
          oPayLoad["OfferApplicablePack"] = sMultiKeys["AppPacks1"].map(
            function (elem) {
              return {
                SkuCode: elem,
              };
            }
          );
          oPayLoad["OfferPainterType"] = sMultiKeys["PainterType"].map(
            function (elem) {
              return {
                PainterTypeId: parseInt(elem),
              };
            }
          );
          oPayLoad["OfferPainterArchiType"] = sMultiKeys["ArcheTypes"].map(
            function (elem) {
              return {
                ArchiTypeId: parseInt(elem),
              };
            }
          );
          oPayLoad["OfferPainterPotential"] = sMultiKeys["Potential"].map(
            function (elem) {
              return {
                PotentialId: parseInt(elem),
              };
            }
          );
          oPayLoad["OfferBuyerProductCategory"] = sMultiKeys["PCat2"].map(
            function (elem) {
              return {
                ProductCategoryCode: elem,
              };
            }
          );
          oPayLoad["OfferBuyerProductClassification"] = sMultiKeys[
            "PClass2"
          ].map(function (elem) {
            return {
              ProductClassificationCode: elem,
            };
          });
          oPayLoad["OfferBuyerProduct"] = sMultiKeys["AppProd2"].map(function (
            elem
          ) {
            return {
              ProductCode: elem,
            };
          });
          oPayLoad["OfferBuyerPack"] = sMultiKeys["AppPacks2"].map(function (
            elem
          ) {
            return {
              SkuCode: elem,
            };
          });
          oPayLoad["OfferNonBuyerProductCategory"] = sMultiKeys["PCat3"].map(
            function (elem) {
              return {
                ProductCategoryCode: elem,
              };
            }
          );
          oPayLoad["OfferNonBuyerProductClassification"] = sMultiKeys[
            "PClass3"
          ].map(function (elem) {
            return {
              ProductClassificationCode: elem,
            };
          });
          oPayLoad["OfferNonBuyerProduct"] = sMultiKeys["AppProd3"].map(
            function (elem) {
              return {
                ProductCode: elem,
              };
            }
          );
          oPayLoad["OfferNonBuyerPack"] = sMultiKeys["AppPacks3"].map(function (
            elem
          ) {
            return {
              SkuCode: elem,
            };
          });
          // Bonus Reward Ratio
          oPayLoad["OfferBonusProductCategory"] = sMultiKeys["PCat4"].map(
            function (elem) {
              return {
                ProductCategoryCode: elem,
              };
            }
          );
          oPayLoad["OfferBonusProductClassification"] = sMultiKeys[
            "PClass4"
          ].map(function (elem) {
            return {
              ProductClassificationCode: elem,
            };
          });
          oPayLoad["OfferBonusProduct"] = sMultiKeys["AppProd4"].map(function (
            elem
          ) {
            return {
              ProductCode: elem,
            };
          });
          oPayLoad["OfferBonusPack"] = sMultiKeys["AppPacks4"].map(function (
            elem
          ) {
            return {
              SkuCode: elem,
            };
          });

          oPayLoad["OfferSpecificPainter"] = sMultiKeys["Painters"].map(
            function (elem) {
              return {
                PainterId: parseInt(elem["PainterId"]),
              };
            }
          );
          promise.resolve(oPayLoad);
          return promise;
        },
        _CreatePayLoadPart4: function (oPayLoad) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModel = oView.getModel("oModelControl");
          var bRewardSelected = oModel.getProperty("/Rbtn/Rewards");
          var aFinalArray = [];
          if (bRewardSelected === 0) {
            var oDataTbl = oModel
              .getProperty("/Table/Table1")
              .map(function (a) {
                return Object.assign({}, a);
              });

            var aCheckProp = [
              "RequiredVolume",
              "RequiredPoints",
              "RewardPoints",
              "RewardGiftId",
              "RewardCash",
            ];
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["RequiredVolume"] && ele["RewardPoints"]) {
                for (var a in aCheckProp) {
                  if (ele[aCheckProp[a]] === "") {
                    ele[aCheckProp[a]] = null;
                  }
                }

                return ele;
              }
            });
            oPayLoad["OfferProductRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
          // this menas that specific is selected we will check first
          // if packs all is selected and products data will be displayed

          var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks1");
          if (bAllProdSelected === 0) {
            var oDataTbl = oModel
              .getProperty("/Table/Table2")
              .map(function (a) {
                return Object.assign({}, a);
              });

            var aCheckProp = [
              "RequiredVolume",
              "RequiredPoints",
              "RewardPoints",
              "RewardGiftId",
              "RewardCash",
            ];
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["RequiredVolume"] && ele["RewardPoints"]) {
                for (var a in aCheckProp) {
                  if (ele[aCheckProp[a]] === "") {
                    ele[aCheckProp[a]] = null;
                  }
                }
                return ele;
              }
            });
            oPayLoad["OfferProductRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
          if (bAllProdSelected === 1) {
            var oDataTbl = oModel
              .getProperty("/Table/Table2")
              .map(function (a) {
                return Object.assign({}, a);
              });

            var aCheckProp = [
              "RequiredVolume",
              "RequiredPoints",
              "RewardPoints",
              "RewardGiftId",
              "RewardCash",
            ];
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["RequiredVolume"] && ele["RewardPoints"]) {
                for (var a in aCheckProp) {
                  if (ele[aCheckProp[a]] === "") {
                    ele[aCheckProp[a]] = null;
                  }
                }
                return ele;
              }
            });
            oPayLoad["OfferPackRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
        },
        _CreatePayLoadPart5: function (oPayLoad) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oModel = oView.getModel("oModelControl");
          var bRewardSelected = oModel.getProperty("/Rbtn/BRewards");
          var aFinalArray = [];
          if (bRewardSelected === 0) {
            var oDataTbl = oModel
              .getProperty("/Table/Table3")
              .map(function (a) {
                return Object.assign({}, a);
              });

            var aCheckProp = ["StartDate", "EndDate", "BonusPoints"];
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["StartDate"] && ele["EndDate"] && ele["BonusPoints"]) {
                for (var a in aCheckProp) {
                  if (ele[aCheckProp[a]] === "") {
                    ele[aCheckProp[a]] = null;
                  }
                }
                return ele;
              }
            });
            oPayLoad["OfferBonusProductRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
          // this menas that specific is selected we will check first
          // if packs all is selected and products data will be displayed
          var bAllProdSelected = oModel.getProperty("/Rbtn/AppPacks4");
          if (bAllProdSelected === 0) {
            var oDataTbl = oModel
              .getProperty("/Table/Table4")
              .map(function (a) {
                return Object.assign({}, a);
              });
            var aCheckProp = ["StartDate", "EndDate", "BonusPoints"];
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["StartDate"] && ele["EndDate"] && ele["BonusPoints"]) {
                for (var a in aCheckProp) {
                  if (ele[aCheckProp[a]] === "") {
                    ele[aCheckProp[a]] = null;
                  }
                }
                return ele;
              }
            });
            oPayLoad["OfferBonusProductRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
          // this means that the user has selected specific for bonus reward packs
          if (bAllProdSelected === 1) {
            var oDataTbl = oModel
              .getProperty("/Table/Table4")
              .map(function (a) {
                return Object.assign({}, a);
              });
            var aCheckProp = ["StartDate", "EndDate", "BonusPoints"];
            aFinalArray = oDataTbl.filter(function (ele) {
              if (ele["StartDate"] && ele["EndDate"] && ele["BonusPoints"]) {
                for (var a in aCheckProp) {
                  if (ele[aCheckProp[a]] === "") {
                    ele[aCheckProp[a]] = null;
                  }
                }
                return ele;
              }
            });
            oPayLoad["OfferBonusPackRewardRatio"] = aFinalArray;

            promise.resolve(oPayLoad);
            return promise;
          }
        },
        onUploadMisMatch: function () {
          MessageToast.show("Kindly upload a file of type .png, .jpg, .jpeg");
        },

        /**
         * Adds a history entry in the FLP page history
         * @public
         * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
         * @param {boolean} bReset If true resets the history before the new entry is added
         */
        addHistoryEntry: (function () {
          var aHistoryEntries = [];

          return function (oEntry, bReset) {
            if (bReset) {
              aHistoryEntries = [];
            }

            var bInHistory = aHistoryEntries.some(function (entry) {
              return entry.intent === oEntry.intent;
            });

            if (!bInHistory) {
              aHistoryEntries.push(oEntry);
              this.getOwnerComponent()
                .getService("ShellUIService")
                .then(function (oService) {
                  oService.setHierarchy(aHistoryEntries);
                });
            }
          };
        })(),
      }
    );
  }
);
