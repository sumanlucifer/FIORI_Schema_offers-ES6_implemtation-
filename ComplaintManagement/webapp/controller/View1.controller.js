sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend(
      "com.knpl.pragati.ComplaintManagement.ComplaintManagement.controller.View1",
      {
        onInit: function () {},
        onAfterRendering: function () {
          this._addSearchFieldAssociationToFB();
        },
        _addSearchFieldAssociationToFB: function () {
          let oFilterBar = this.getView().byId("filterbar");
          let oSearchField = oFilterBar.getBasicSearch();
          var oBasicSearch;
          var othat = this;
          if (!oSearchField) {
            // @ts-ignore
            oBasicSearch = new sap.m.SearchField({
              value: "{oModelView>/filterBar/Name}",
              showSearchButton: true,
              search: othat.onFilter.bind(othat),
            });
          } else {
            oSearchField = null;
          }

          oFilterBar.setBasicSearch(oBasicSearch);

          //   oBasicSearch.attachBrowserEvent(
          //     "keyup",
          //     function (e) {
          //       if (e.which === 13) {
          //         this.onSearch();
          //       }
          //     }.bind(this)
          //   );
        },
         onPressAddPainter: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteAddEditP", {
            mode: "add",
            id: "null",
          });
        },
      }
    );
  }
);
