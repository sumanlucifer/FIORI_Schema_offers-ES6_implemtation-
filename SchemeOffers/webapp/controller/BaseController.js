// @ts-nocheck
sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/BusyIndicator",  "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator","sap/ui/core/routing/History"
],
  function (Controller, BusyIndicator,Filter,FilterOperator,History) {
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
          oView.getModel("oModelView").setProperty("/SchemeZones", aArray);
          var oDivision = oView.byId("idDivision");
          

          oDivision.clearSelection();
          oDivision.fireSelectionChange();
          var aDivFilter = [];
          for (var y of aArray){
              aDivFilter.push(new Filter("Zone", FilterOperator.EQ, y["ZoneId"]))
          }
         
          oDivision.getBinding("items").filter(aDivFilter);


          var oDepot = oView.byId("idDepot");
          oDepot.clearSelection();
          oDepot.fireSelectionChange();
        },
        onDivisionChange: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              DivisionId: x,
            });
          }
          oView.getModel("oModelView").setProperty("/SchemeDivisions", aArray);
          //depot clear
          var oDepot = oView.byId("idDepot");
          oDepot.clearSelection();
          oDepot.fireSelectionChange();

          //depot filter
          var aDepot = [];
          for (var y of aArray){
              aDepot.push(new Filter("Division", FilterOperator.EQ, y["DivisionId"]))
          }
         
          oDepot.getBinding("items").filter(aDepot);
        },
        onDepotChange: function (oEvent) {
          var sKeys = oEvent.getSource().getSelectedKeys();
          var oView = this.getView();
          var aArray = [];
          for (var x of sKeys) {
            aArray.push({
              DepotId: x,
            });
          }
          oView.getModel("oModelView").setProperty("/SchemeDepots", aArray);
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
             this._propertyToBlank(["SchemePainterArchiTypes","PotentialId","SchemePainterProducts","SlabId"])
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
            this._propertyToBlank(["BonusRewardPoints"])
          } else if (iIndex == 1) {
            oModelView.setProperty("/HasBonusPercentage", true);
            this._propertyToBlank(["BonusRewardPoints"])
          } //
          // making the fields blank
        },
        onRbBonusValidity: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl")
        
          if (iIndex == 0) {
            oModelControl.setProperty("/HasTillDate", false);
            this._propertyToBlank(["BonusValidityDate"]);
          } else if (iIndex == 1) {
            oModelControl.setProperty("/HasTillDate", true);
            this._propertyToBlank(["BonusValidityDurationYear","BonusValidityDurationMonth","BonusValidityDurationDays"]);
          } //

          
        },
        _propertyToBlank:function(aArray){
            var aProp = aArray;
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
            
            console.log("method trigerred");
            for(var x of aProp){
                var oGetProp = oModelView.getProperty("/"+x)
                if(Array.isArray(oGetProp)){
                    //oModelView.setProperty("/"+x,[]);
                    oView.byId(x).clearSelection();
                    oView.byId(x).fireSelectionChange();
                }else if (oGetProp===null){
                    oModelView.setProperty("/"+x,null)
                    console.log("date made as null")
                }else if (oGetProp instanceof  Date ){
                    oModelView.setProperty("/"+x,null)
                    console.log("Non Empty Date made as null")
                }else {
                    oModelView.setProperty("/"+x,"")
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
