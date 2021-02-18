// @ts-ignore
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.knpl.pragati.MDM.controller.FlexibleColumnLayout", {

		onInit : function () {
            this.initialLoad = true;
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			// Navigating to a first tab in order to display two columns initially
            this.oRouter.navTo("detail", {layout: "TwoColumnsMidExpanded", tab: "0"});
            
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy : false,
				delay : 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			// this.getOwnerComponent().getModel().metadataLoaded().
			// 	then(fnSetAppNotBusy);
			// this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        onBeforeRouteMatched: function(oEvent) {

			var oModel = this.getOwnerComponent().getModel("layout");

			var sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},
        
        onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			this._updateUIElements();

			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentProduct = oArguments.product;
			this.currentSupplier = oArguments.supplier;
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

			this._updateUIElements();

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {layout: sLayout, product: this.currentProduct, supplier: this.currentSupplier}, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
            var oModel = this.getOwnerComponent().getModel("layout");
            if (this.initialLoad) {
                oModel.setProperty("/layout", "TwoColumnsMidExpanded");
            } else {
                var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
			    oModel.setData(oUIState);
            }
			this.initialLoad = false;
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		}
	});
});
