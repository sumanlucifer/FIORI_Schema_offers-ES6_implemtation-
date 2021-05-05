// @Base Controller
sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    Controller,
    BusyIndicator,
    Filter,
    FilterOperator,
    History,
    JSONModel
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

        onZoneChange: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              ZoneId: x,
            });
          }
          var oDivision = oView.byId("idDivisions");
          var aDivFilter = [];
          for (var y of aArray) {
            aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y["ZoneId"]));
          }
          oDivision.getBinding("items").filter(aDivFilter);
          this._CheckAreaChange();
        },
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
          var oNewDivisionKeys =  oDivision.getSelectedKeys();
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
        onDepotCancelPress: function () {
          this._oDepotDialog.close();
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
        onArchiTypeChange: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              ArchiTypeId: parseInt(x),
            });
          }
          oView
            .getModel("oModelView")
            .setProperty("/SchemePainterArchiTypes", aArray);
        },
        onChangeProducts: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              SkuCode: x,
              HasPurchased: true,
            });
          }
          oView
            .getModel("oModelView")
            .setProperty("/SchemePainterProducts", aArray);
        },
        onChangeAppProducts: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              SkuCode: x,
            });
          }
          oView
            .getModel("oModelView")
            .setProperty("/SchemeApplicableProducts", aArray);
        },
        onBonusProdChange: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              SkuCode: x,
            });
          }
          oView
            .getModel("oModelView")
            .setProperty("/SchemeBonusApplicableProducts", aArray);
        },
        onRbAppPainter: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          if (iIndex == 0) {
            oModelView.setProperty("/IsSpecificPainter", false);
            this._propertyToBlank([
              "SchemePainterArchiTypes",
              "PotentialId",
              "SchemePainterProducts",
              "SlabId",
            ]);
          } else if (iIndex == 1) {
            oModelView.setProperty("/IsSpecificPainter", true);
          } //
          // making the fields blank
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
        _propertyToBlank: function (aArray) {
          var aProp = aArray;
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          for (var x of aProp) {
            var oGetProp = oModelView.getProperty("/" + x);
            if (Array.isArray(oGetProp)) {
              //oModelView.setProperty("/"+x,[]);
              oView.byId(x).clearSelection();
              oView.byId(x).fireSelectionChange();
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
