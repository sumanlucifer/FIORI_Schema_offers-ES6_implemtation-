// @ts-ignore
sap.ui.define([
		"com/knpl/pragati/Tools/controller/BaseController",
		"sap/ui/model/json/JSONModel",
        "../service/FioriSessionService"
	], function (BaseController, JSONModel, FioriSessionService) {
		"use strict";

		return BaseController.extend("com.knpl.pragati.Tools.controller.App", {

			onInit : function () {
                FioriSessionService.sessionKeepAlive();
				var oViewModel,
					fnSetAppNotBusy,
					iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

				oViewModel = new JSONModel({
					busy : true,
					delay : 0
				});
				this.setModel(oViewModel, "appView");

				fnSetAppNotBusy = function() {
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				};

				// disable busy indication when the metadata is loaded and in case of errors
				this.getComponentModel().metadataLoaded().
					then(fnSetAppNotBusy);
				this.getComponentModel().attachMetadataFailed(fnSetAppNotBusy);

				// apply content density mode to root view
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
		});

	}
);
