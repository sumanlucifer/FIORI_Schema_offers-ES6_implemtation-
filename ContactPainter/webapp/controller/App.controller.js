sap.ui.define(
  [
    "com/knpl/pragati/ContactPainter/controller/BaseController",
    "sap/ui/model/json/JSONModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.App",
      {
        onInit: function () {
          var oViewModel,
            fnSetAppNotBusy,
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

          oViewModel = new JSONModel({
            busy: true,
            delay: 0,
          });
          this.setModel(oViewModel, "appView");

          fnSetAppNotBusy = function () {
            oViewModel.setProperty("/busy", false);
            oViewModel.setProperty("/delay", iOriginalBusyDelay);
          };

          // disable busy indication when the metadata is loaded and in case of errors
          this.getComponentModel().metadataLoaded().then(fnSetAppNotBusy);
          this.getComponentModel().attachMetadataFailed(fnSetAppNotBusy);

          // apply content density mode to root view
          this.getView().addStyleClass(
            this.getOwnerComponent().getContentDensityClass()
          );
          this.getComponentModel().attachRequestSent(function () {
            oViewModel.setProperty("/busy", true);
          });
          this.getComponentModel().attachRequestCompleted(function () {
           
            oViewModel.setProperty("/busy", false);
          });
        },
      }
    );
  }
);
