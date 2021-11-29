sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
    "../service/FioriSessionService"
], function (BaseController, JSONModel,FioriSessionService) {
	"use strict";

	return BaseController.extend("com.knpl.pragati.Manage_FAQ.controller.App", {

		onInit : function () {
            FioriSessionService.sessionKeepAlive();
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
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});