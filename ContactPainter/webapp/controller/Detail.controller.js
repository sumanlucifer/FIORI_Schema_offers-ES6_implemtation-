sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
      "sap/m/MessageToast"
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    mobileLibrary,
    Fragment,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.Detail",
      {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
          // Model used to manipulate control states. The chosen values make sure,
          // detail page is busy indication immediately so there is no break in
          // between the busy indication for loading the view's meta data
          var oViewModel = new JSONModel({
            busy: false,
            delay: 0,
            lineItemListTitle: this.getResourceBundle().getText(
              "detailLineItemTableHeading"
            ),
          });

          this.getRouter()
            .getRoute("object")
            .attachPatternMatched(this._onObjectMatched, this);

          this.setModel(oViewModel, "detailView");
          // adding a new fragment
          this._formFragments = {};
          this._showFormFragment("DisplayInfo");

          //this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
        },
        handleEditToggled: function (oEvent) {
          if (oEvent.getParameter("editable") == false) {
            this.getView()
              .getModel()
              .submitChanges({
                success: function () {
                  console.log("Success");
                },
              });
          }
        },

        _getFormFragment: function (sFragmentName) {
          var pFormFragment = this._formFragments[sFragmentName],
            oView = this.getView();
          var othat = this;

          if (!pFormFragment) {
            pFormFragment = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.ContactPainter.view." + sFragmentName,
              controller: othat,
            });
            this._formFragments[sFragmentName] = pFormFragment;
          }

          return pFormFragment;
        },

        _showFormFragment: function (sFragmentName) {
          var oPage = this.byId("form");
          var othis = this;

          oPage.removeAllItems();
          this._getFormFragment(sFragmentName).then(function (oVBox) {
            //oVBox.bindElement("/PainterSet(2)")
            oPage.addItem(oVBox);
          });
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onSendEmailPress: function () {
          var oViewModel = this.getModel("detailView");

          URLHelper.triggerEmail(
            null,
            oViewModel.getProperty("/shareSendEmailSubject"),
            oViewModel.getProperty("/shareSendEmailMessage")
          );
        },

        /**
         * Updates the item count within the line item table's header
         * @param {object} oEvent an event containing the total number of items in the list
         * @private
         */
        onListUpdateFinished: function (oEvent) {
          var sTitle,
            iTotalItems = oEvent.getParameter("total"),
            oViewModel = this.getModel("detailView");

          // only update the counter if the length is final
          if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
            if (iTotalItems) {
              sTitle = this.getResourceBundle().getText(
                "detailLineItemTableHeadingCount",
                [iTotalItems]
              );
            } else {
              //Display 'Line Items' instead of 'Line items (0)'
              sTitle = this.getResourceBundle().getText(
                "detailLineItemTableHeading"
              );
            }
            oViewModel.setProperty("/lineItemListTitle", sTitle);
          }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */

        _onObjectMatched: function (oEvent) {
          var sObjectId = oEvent.getParameter("arguments").objectId;
          this.getModel("appView").setProperty(
            "/layout",
            "TwoColumnsMidExpanded"
          );
          console.log(sObjectId);
          this.getView().bindElement({
            path: "/" + sObjectId,
          });
        },
        _toggleButtonsAndView: function (bEdit) {
          var oView = this.getView();

          // Show the appropriate action buttons
          oView.byId("edit").setVisible(!bEdit);
          oView.byId("save").setVisible(bEdit);
          oView.byId("cancel").setVisible(bEdit);

          // Set the right form type
          this._showFormFragment(bEdit ? "ChangeInfo" : "DisplayInfo");
        },
        handleEditPress: function () {
          //Clone the data

          this._toggleButtonsAndView(true);
        },

        handleCancelPress: function () {
          this._toggleButtonsAndView(false);
        },

        handleSavePress: function () {
          var oData = this.getView().getModel();
          var oViewModel = this.getView().getModel("detailView");
          oViewModel.setProperty("/busy",true);
          var oView = this.getView();
          var oObj = oView.getElementBinding().getBoundContext().getObject();
          var sPath = oView.getElementBinding().getBoundContext().getPath();
          console.log(sPath);

          var oPayLoad = {
            Name: oObj["Name"],
            Email: oObj["Email"],
            Mobile: oObj["Mobile"],
          };
          var othat = this;
          oData.update(sPath, oPayLoad, {
            success: function () {
              MessageToast.show(
                "Data of " + oObj["Name"] + " successfully updated."
              );
              othat._toggleButtonsAndView(false);
              oViewModel.setProperty("/busy",false);
             
            },
            error: function (data) {
              var oRespText = JSON.parse(data.responseText);
              MessageBox.error(oRespText["error"]["message"]["value"]);
               oViewModel.setProperty("/busy",false);
            },
          });
          
        },
        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {
          // Set busy indicator during view binding
          var oViewModel = this.getModel("detailView");

          // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
          oViewModel.setProperty("/busy", false);

          this.getView().bindElement({
            path: sObjectPath,
            events: {
              change: this._onBindingChange.bind(this),
              dataRequested: function () {
                oViewModel.setProperty("/busy", true);
              },
              dataReceived: function () {
                oViewModel.setProperty("/busy", false);
              },
            },
          });
        },

        _onBindingChange: function () {
          var oView = this.getView(),
            oElementBinding = oView.getElementBinding();

          // No data for the binding
          if (!oElementBinding.getBoundContext()) {
            this.getRouter().getTargets().display("detailObjectNotFound");
            // if object could not be found, the selection in the master list
            // does not make sense anymore.
            this.getOwnerComponent().oListSelector.clearMasterListSelection();
            return;
          }

          var sPath = oElementBinding.getPath(),
            oResourceBundle = this.getResourceBundle(),
            oObject = oView.getModel().getObject(sPath),
            sObjectId = oObject.ProductID,
            sObjectName = oObject.ProductName,
            oViewModel = this.getModel("detailView");

          this.getOwnerComponent().oListSelector.selectAListItem(sPath);

          oViewModel.setProperty(
            "/shareSendEmailSubject",
            oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId])
          );
          oViewModel.setProperty(
            "/shareSendEmailMessage",
            oResourceBundle.getText("shareSendEmailObjectMessage", [
              sObjectName,
              sObjectId,
              location.href,
            ])
          );
        },

        _onMetadataLoaded: function () {
          // Store original busy indicator delay for the detail view
          var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
            oViewModel = this.getModel("detailView"),
            oLineItemTable = this.byId("lineItemsList"),
            iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

          // Make sure busy indicator is displayed immediately when
          // detail view is displayed for the first time
          oViewModel.setProperty("/delay", 0);
          oViewModel.setProperty("/lineItemTableDelay", 0);

          oLineItemTable.attachEventOnce("updateFinished", function () {
            // Restore original busy indicator delay for line item table
            oViewModel.setProperty(
              "/lineItemTableDelay",
              iOriginalLineItemTableBusyDelay
            );
          });

          // Binding the view will set it to not busy - so the view is always busy if it is not bound
          oViewModel.setProperty("/busy", true);
          // Restore original busy indicator delay for the detail view
          oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        /**
         * Set the full screen mode to false and navigate to master page
         */
        onCloseDetailPress: function () {
          this.getModel("appView").setProperty(
            "/actionButtonsInfo/midColumn/fullScreen",
            false
          );
          // No item should be selected on master after detail page is closed
          this.getOwnerComponent().oListSelector.clearMasterListSelection();
          this.getRouter().navTo("master");
        },

        /**
         * Toggle between full and non full screen mode.
         */
        toggleFullScreen: function () {
          var bFullScreen = this.getModel("appView").getProperty(
            "/actionButtonsInfo/midColumn/fullScreen"
          );
          this.getModel("appView").setProperty(
            "/actionButtonsInfo/midColumn/fullScreen",
            !bFullScreen
          );
          if (!bFullScreen) {
            // store current layout and go full screen
            this.getModel("appView").setProperty(
              "/previousLayout",
              this.getModel("appView").getProperty("/layout")
            );
            this.getModel("appView").setProperty(
              "/layout",
              "MidColumnFullScreen"
            );
          } else {
            // reset to previous layout
            this.getModel("appView").setProperty(
              "/layout",
              this.getModel("appView").getProperty("/previousLayout")
            );
          }
        },
      }
    );
  }
);
