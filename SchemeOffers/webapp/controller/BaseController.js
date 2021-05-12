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
  ],
  function (
    Controller,
    BusyIndicator,
    Filter,
    FilterOperator,
    History,
    JSONModel,
    Fragment
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

        onDivisionChange: function (oEvent) {
          this._CheckAreaChange();
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
          var sCheckPacks = oModelControl.getProperty("/Rbtn/AppPacks1");
          var oDataModel = this.getView().getModel();
          var c1, c2, c3, c4, c5;

          if (sCheckPacks == 0) {
            othat._setProductsData();
          } else {
            othat._setPacksData();
          }
        },
        onRbTable1Change: function (oEvent) {
          var oView = this.getView();
          var sKey = oEvent.getSource().getSeleckedIndex();
          var spath = oEvent.getSource().getBinding("selectedIndex").getPath();
        },
        onDepotCancelPress: function () {
          this._oDepotDialog.close();
        },
        _setProductsData: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var aSelectedKeys = oModelControl.getProperty("/MultiCombo/AppProd1");
          var oControl = oView.byId("AppProd1").getSelectedItems();
          var bRbProd = oModelControl.getProperty("/Rbtn/AppProd1");
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
              Name: obj["ProductName"],
              ProductCode: obj["Id"],
              RequiredVolume: "",
              RequiredPoints: "",
              RewardPoints: "",
              RewardGiftId: "",
              RewardCash: "",
            });
          }

          oModelControl.setProperty("/Table/Table2", aSelectedData);
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
              Name: obj["Description"],
              SkuCode: obj["SkuCode"],
              RequiredVolume: "",
              RequiredPoints: "",
              RewardPoints: "",
              RewardGiftId: "",
              RewardCash: "",
            });
          }
          oModelControl.setProperty("/Table/Table2", aSelectedData);
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
              Name: obj["ProductName"],
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
              Name: obj["Description"],
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
        onValueHelpAfterClose: function () {
          if (this._DepotDialog) {
            this._oDepotDialog.destroy();
            delete this._oDepotDialog;
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
          console.log(oData);
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

          if (iIndex == 0) {
            oModelView.setProperty("/IsSpecificPainter", false);
            this._propertyToBlank([
              "PotentialId",
              "PointSlabLowerLimit",
              "PointSlabUpperLimit",
            ]);
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
          } else if (iIndex == 1) {
            oModelView.setProperty("/IsSpecificPainter", true);
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
              console.log("date made as null");
            } else if (oGetProp instanceof Date) {
              oModelView.setProperty("/" + x, null);
              console.log("Non Empty Date made as null");
            } else {
              oModelView.setProperty("/" + x, "");
            }
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
            oDialog
              .getBinding("items")
              .filter([
                new Filter(
                  [
                    new Filter(
                      "tolower(Title)",
                      FilterOperator.Contains,
                      "'" +
                        sInputValue.trim().toLowerCase().replace("'", "''") +
                        "'"
                    ),
                    new Filter(
                      "Description",
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
