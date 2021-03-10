sap.ui.define(
  [
    "com/knpl/pragati/ContactPainter/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/format/DateFormat",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    MessageBox,
    MessageToast,
    Fragment,
    Filter,
    FilterOperator,
    Sorter,
    Device,
    DateFormat
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.PainterList",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          console.log("Painter Data Loaded");
          oRouter
            .getRoute("RoutePList")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          console.log("Painter List Loaded");

          this.getView().getModel().resetChanges();
          this._initData();
          this._addSearchFieldAssociationToFB();
        },
        _initData: function () {
          var oViewModel = new JSONModel({
            pageTitle: this.getResourceBundle().getText("PainterList"),
            tableNoDataText: this.getResourceBundle().getText(
              "tableNoDataText"
            ),
            tableBusyDelay: 0,
            prop1: "",
            busy: false,
            filterBar: {
              AgeGroupId: "",
              CreatedAt: null,
              RegistrationStatus: "",
              Name: "",
            },

            SortSettings: true,
          });
          this.setModel(oViewModel, "oModelView");
          this.getView().getModel().refresh();
          this._fiterBarSort();
          this._FilterInit();
        },
        _fiterBarSort: function () {
          if (this._ViewSortDialog) {
            var oDialog = this.getView().byId("viewSetting");
            oDialog.setSortDescending(true);
            oDialog.setSelectedSortItem("CreatedAt");
            var otable = this.getView().byId("idPainterTable");
            var oSorter = new Sorter({ path: "CreatedAt", descending: true });
            otable.getBinding("items").sort(oSorter);
          }
        },

        _FilterInit: function () {
          this._ResetFilterBar();
        },
        fmtStatus: function (mParam) {
          var sLetter = "";
          if (mParam) {
            sLetter = mParam
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }

          return sLetter;
        },
        onFilter: function (oEvent) {
          console.log("On FIlter");
          var aCurrentFilterValues = [];
          var oViewFilter = this.getView()
            .getModel("oModelView")
            .getProperty("/filterBar");
          var aFlaEmpty = true;
          for (let prop in oViewFilter) {
            if (oViewFilter[prop]) {
              console.log(oViewFilter[prop]);
              if (prop === "AgeGroupId") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter("AgeGroupId", FilterOperator.EQ, oViewFilter[prop])
                );
              } else if (prop === "CreatedAt") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(prop, FilterOperator.LE, oViewFilter[prop])
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "Name") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    [
                      new Filter(
                        "tolower(Name)",
                        FilterOperator.Contains,
                        "'" +
                          oViewFilter[prop]
                            .trim()
                            .toLowerCase()
                            .replace("'", "''") +
                          "'"
                      ),
                      new Filter(
                        "MembershipCard",
                        FilterOperator.Contains,
                        oViewFilter[prop].trim().toUpperCase()
                      ),
                      new Filter(
                        "Mobile",
                        FilterOperator.Contains,
                        oViewFilter[prop].trim()
                      ),
                    ],
                    false
                  )
                );
              } else {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    prop,
                    FilterOperator.Contains,
                    oViewFilter[prop].trim()
                  )
                );
              }
            }
          }

          var endFilter = new Filter({
            filters: aCurrentFilterValues,
            and: true,
          });
          var oTable = this.getView().byId("idPainterTable");
          var oBinding = oTable.getBinding("items");
          if (!aFlaEmpty) {
            oBinding.filter(endFilter);
          } else {
            oBinding.filter([]);
          }
        },
        onResetFilterBar: function () {
          this._ResetFilterBar();
        },
        _ResetFilterBar: function () {
          var aCurrentFilterValues = [];
          var aResetProp = {
            AgeGroupId: "",
            CreatedAt: null,
            RegistrationStatus: "",
            searchBar: "",
          };
          var oViewModel = this.getView().getModel("oModelView");
          oViewModel.setProperty("/filterBar", aResetProp);
          //oViewModel.setProperty("/searchBar", "");

          //   for (let prop in aResetProp) {
          //     aCurrentFilterValues.push(
          //       new Filter(prop, FilterOperator.Contains, aResetProp[prop])
          //     );
          //   }
          //   var endFilter = new Filter({
          //     filters: aCurrentFilterValues,
          //     and: false,
          //   });
          var oTable = this.byId("idPainterTable");
          var oBinding = oTable.getBinding("items");
          oBinding.filter([]);
        },
        onPressAddPainter: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteAddEditP", {
            mode: "add",
            id: "null",
          });
        },
        onSuggest: function (event) {
          var oSearchField = this.getView().byId("searchField");
          var sValue = event.getParameter("suggestValue"),
            aFilters = [];
          if (sValue) {
            aFilters = [
              new Filter(
                [
                  new Filter("Name", function (sText) {
                    return (
                      (sText || "")
                        .toUpperCase()
                        .indexOf(sValue.toUpperCase()) > -1
                    );
                  }),
                ],
                false
              ),
            ];
          }

          oSearchField.getBinding("suggestionItems").filter(aFilters);
          oSearchField.suggest();
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

        onSearch: function (oEvent) {
          var aFilters = [];
          var endFilter;
          var sQuery = oEvent.getSource().getValue();
          if (sQuery && sQuery.length > 0) {
            var filter1 = new Filter("Name", FilterOperator.Contains, sQuery);
            //var filter2 = new Filter("Email", FilterOperator.Contains, sQuery);
            //var filtes3 = new Filter("Mobile", FilterOperator.Contains, sQuery);
            aFilters.push(filter1);
            //aFilters.push(filter2);
            //aFilters.push(filtes3);
            endFilter = new Filter({ filters: aFilters, and: false });
          }

          // update list binding
          var oTable = this.getView().byId("idPainterTable");
          var oBinding = oTable.getBinding("items");
          oBinding.filter(endFilter);
        },
        handleSortButtonPressed: function () {
          this.getViewSettingsDialog(
            "com.knpl.pragati.ContactPainter.view.fragments.SortDialog"
          ).then(function (oViewSettingsDialog) {
            oViewSettingsDialog.open();
          });
        },
        getViewSettingsDialog: function (sDialogFragmentName) {
          if (!this._ViewSortDialog) {
            var othat = this;
            this._ViewSortDialog = Fragment.load({
              id: this.getView().getId(),
              name: sDialogFragmentName,
              controller: this,
            }).then(function (oDialog) {
              if (Device.system.desktop) {
                othat.getView().addDependent(oDialog);
                oDialog.addStyleClass("sapUiSizeCompact");
              }
              return oDialog;
            });
          }
          return this._ViewSortDialog;
        },
        handleSortDialogConfirm: function (oEvent) {
          var oTable = this.byId("idPainterTable"),
            mParams = oEvent.getParameters(),
            oBinding = oTable.getBinding("items"),
            sPath,
            bDescending,
            aSorters = [];

          sPath = mParams.sortItem.getKey();
          bDescending = mParams.sortDescending;
          aSorters.push(new Sorter(sPath, bDescending));

          // apply the selected sort and group settings
          oBinding.sort(aSorters);
        },

        onUpdateFinished: function (oEvent) {
          // update the worklist's object counter after the table update
          var sTitle,
            oTable = this.getView().byId("idPainterTable"),
            iTotalItems = oEvent.getParameter("total");
          // only update the counter if the length is final and
          // the table is not empty
          if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
            sTitle = this.getResourceBundle().getText("PainterList", [
              iTotalItems,
            ]);
          } else {
            sTitle = this.getResourceBundle().getText("PainterList");
          }
          this.getViewModel("oModelView").setProperty("/pageTitle", sTitle);
        },
        fmtDate: function (mDate) {
          var date = new Date(mDate);
          var oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "dd/MM/yyyy",
          });
          return oDateFormat.format(date);
        },
        onDealersPress: function (oEvent) {
          var oSource = oEvent.getSource();
          var sPath = oSource.getBindingContext().getPath();
          var oView = this.getView();
          if (!this._pPopover) {
            this._pPopover = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.ContactPainter.view.fragments.Popover",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              return oPopover;
            });
          }
          this._pPopover.then(function (oPopover) {
            oPopover.openBy(oSource);
            console.log(sPath);
            oPopover.bindElement({
              path: sPath,
              parameters: {
                expand: "Dealers",
              },
            });
          });
        },
        onListItemPress: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          var sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .substr(1);
          console.log(sPath);
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteProfile", {
            mode: "edit",
            prop: window.encodeURIComponent(sPath),
          });
        },
        onPressEditPainter: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          var sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .substr(1);
          console.log(sPath);

          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteProfile", {
            mode: "edit",
            prop: window.encodeURIComponent(sPath),
          });
        },
        onDeactivate: function (oEvent) {
          var oView = this.getView();
          var oBject = oEvent.getSource().getBindingContext().getObject();
          var sPath = oEvent.getSource().getBindingContext().getPath();
          var oData = oView.getModel();
          var othat = this;
          console.log(sPath, oBject);
          MessageBox.confirm(
            "Kindly confirm to deactivated the painter- " + oBject["Name"],
            {
              actions: [MessageBox.Action.CLOSE, MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
              onClose: function (sAction) {
                if (sAction == "OK") {
                  othat._Deactivate(oData, sPath, oBject);
                }
              },
            }
          );
        },
        _Deactivate: function (oData, sPath, oBject) {
          var oPayload = {
            IsArchived: true,
          };
          oData.update(sPath + "/IsArchived", oPayload, {
            success: function (mData) {
              MessageToast.show(oBject["Name"] + " Sucessfully Deactivated.");
              oData.refresh();
            },
            error: function (data) {
              var oRespText = JSON.parse(data.responseText);
              MessageBox.error(oRespText["error"]["message"]["value"]);
            },
          });
        },
      }
    );
  }
);
