// @ts-ignore
sap.ui.define(
  [
    "com/knpl/pragati/SchemeOffers/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Token",
    "sap/ui/core/format/DateFormat"
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    JSONModel,
    Sorter,
    Fragment,
    Device,
    MessageBox,
    MessageToast,
    ColumnListItem,
    Label,
    Token,
    DateFormat
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.SchemeOffers.controller.LandingPage",
      {
        onInit: function () {
          // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
          this._mViewSettingsDialogs = {};

          //Router Object
          this.oRouter = this.getRouter();
          this.oRouter
            .getRoute("RouteLandingPage")
            .attachPatternMatched(this._onObjectMatched, this);
          this._SetFilterData();
        },
        _SetFilterData: function () {
          var oDataControl = {
            filterBar: {
              StartDate: null,
              EndDate: null,
              Name: "",
              OfferType: "",
              Status: "",
              TrainingZone: "",
              TrainingDivision: "",
              TrainingDepot: "",
            },
          };
          var oMdlCtrl = new JSONModel(oDataControl);
          this.getView().setModel(oMdlCtrl, "oModelControl");
        },
        _onObjectMatched: function (oEvent) {
          var oViewModel,
            iOriginalBusyDelay,
            oTable = this.byId("idOffersTable");

          iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
          oViewModel = new JSONModel({
            TableTitle: this.getResourceBundle().getText("TableTitle"),
            tableNoDataText: this.getResourceBundle().getText(
              "tableNoDataText"
            ),
            tableBusyDelay: 0,
          });

          this.setModel(oViewModel, "worklistView");

          oTable.attachEventOnce("updateFinished", function () {
            // Restore original busy indicator delay for worklist's table
            oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
          });
          this.getView().getModel().refresh();
        },

        onUpdateFinished: function (oEvent) {
          var sTitle,
            oTable = oEvent.getSource(),
            iTotalItems = oEvent.getParameter("total");
          if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
            sTitle = this.getResourceBundle().getText("TableDataCount", [
              iTotalItems,
            ]);
          } else {
            sTitle = this.getResourceBundle().getText("TableTitle");
          }
          this.getView()
            .getModel("worklistView")
            .setProperty("/TableTitle", sTitle);
        },

        onPressListItem: function (oEvent) {
          var sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .substr(1);
          var oBject = oEvent.getSource().getBindingContext().getObject();
          this.oRouter.navTo("DetailPage", {
            prop: oBject["Id"],
          });
        },

        onPressAdd: function (oEvent) {
          this.oRouter.navTo("AddOfferPage");
        },

        onPressEdit: function (oEvent) {
          var sPath = oEvent.getSource().getBindingContext().getPath();
          this.oRouter.navTo("ActionPage", {
            action: "edit",
            property: sPath.substr(1),
          });
        },

        onPressDelete: function (oEvent) {
          var oView = this.getView();
          var sPath = oEvent.getSource().getBindingContext().getPath();
          var oModel = this.getComponentModel();
          var oViewModel = this.getView().getModel("ViewModel");
          var oResourceBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();
          var oPayload = {
            IsArchived: true,
          };
          MessageBox.confirm(
            oResourceBundle.getText("deleteConfirmationMessage"),
            {
              actions: [
                oResourceBundle.getText("messageBoxDeleteBtnText"),
                MessageBox.Action.CANCEL,
              ],
              emphasizedAction: oResourceBundle.getText(
                "messageBoxDeleteBtnText"
              ),
              onClose: function (sAction) {
                if (
                  sAction == oResourceBundle.getText("messageBoxDeleteBtnText")
                ) {
                  oViewModel.setProperty("/busy", true);
                  oModel.update(sPath, oPayload, {
                    success: function () {
                      MessageToast.show(
                        oResourceBundle.getText("messageBoxDeleteSuccessMsg")
                      );
                      oViewModel.setProperty("/busy", false);
                      oView.byId("idToolTable").getModel().refresh();
                    },
                    error: function () {
                      oViewModel.setProperty("/busy", false);
                      MessageBox.error(
                        oResourceBundle.getText("messageBoxDeleteErrorMsg-")
                      );
                    },
                  });
                }
              },
            }
          );
        },

        onSearch: function (oEvent) {
          var aCurrentFilterValues = [];
          var oViewFilter = this.getView()
            .getModel("oModelControl")
            .getProperty("/filterBar");
          var aFlaEmpty = true;
          for (let prop in oViewFilter) {
            if (oViewFilter[prop]) {
              if (prop === "OfferType") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "SchemeTypeId",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                );
              } else if (prop === "StartDate") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "StartDate",
                    FilterOperator.GE,
                    new Date(oViewFilter[prop])
                  )
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "EndDate") {
                aFlaEmpty = false;
                var oDate = new Date(oViewFilter[prop]);
                oDate.setDate(oDate.getDate() + 1);
                aCurrentFilterValues.push(
                  new Filter("EndDate", FilterOperator.LT, oDate)
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "Status") {
                aFlaEmpty = false;

                aCurrentFilterValues.push(
                  new Filter(
                    "SchemeStatus",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "TrainingZone") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "SchemeZones/ZoneId",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                );
              } else if (prop === "TrainingDivision") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "SchemeDivisions/DivisionId",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                );
              } else if (prop === "TrainingDepot") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "SchemeDepots/DepotId",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                );
              } else if (prop === "Name") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    [
                      new Filter(
                        "tolower(Title)",
                        FilterOperator.Contains,
                        "'" +
                          oViewFilter[prop]
                            .trim()
                            .toLowerCase()
                            .replace("'", "''") +
                          "'"
                      ),
                      new Filter(
                        "tolower(SchemeStatus)",
                        FilterOperator.Contains,
                        "'" +
                          oViewFilter[prop]
                            .trim()
                            .toLowerCase()
                            .replace("'", "''") +
                          "'"
                      ),
                    ],
                    false
                  )
                );
              }
            }
          }

          var endFilter = new Filter({
            filters: aCurrentFilterValues,
            and: true,
          });
          var oTable = this.getView().byId("idOffersTable");
          var oBinding = oTable.getBinding("items");
          if (!aFlaEmpty) {
            oBinding.filter(endFilter);
          } else {
            oBinding.filter([]);
          }
        },
        fmtDate: function (mDate) {
          var date = new Date(mDate);
          var oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "dd/MM/yyyy",
            UTC: true,
            strictParsing: true,
          });
          return oDateFormat.format(date);
        },

        fmtLowerCase: function (mParam) {
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

        onValueHelpRequested: function () {
          var oColModel = new JSONModel({
            cols: [
              {
                label: "Name",
                template: "Name",
              },
            ],
          });
          // @ts-ignore
          this._oValueHelpDialog = sap.ui.xmlfragment(
            "com.knpl.pragati.SchemeOffers.view.fragment.CreatedByValueHelpDialog",
            this
          );
          this.getView().addDependent(this._oValueHelpDialog);

          this._oValueHelpDialog.getTableAsync().then(
            function (oTable) {
              oTable.setModel(this.getComponentModel());
              oTable.setModel(oColModel, "columns");
              oTable.setWidth("25rem");

              if (oTable.bindRows) {
                oTable.bindAggregation("rows", {
                  path: "/AdminSet",
                  filters: [new Filter("IsArchived", FilterOperator.EQ, false)],
                });
              }

              if (oTable.bindItems) {
                var aCols = oColModel.getData().cols;
                oTable.bindAggregation("items", {
                  path: "/AdminSet",
                  filters: [new Filter("IsArchived", FilterOperator.EQ, false)],
                  template: function () {
                    return new ColumnListItem({
                      cells: aCols.map(function (column) {
                        return new Label({ text: "{" + column.template + "}" });
                      }),
                    });
                  },
                  templateShareable: false,
                });
              }

              this._oValueHelpDialog.update();
            }.bind(this)
          );

          var oToken = new Token();
          var oControl = this.getView().byId("idCreatedByInput");
          oToken.setKey(oControl.getSelectedKey());
          oToken.setText(oControl.getValue());
          this._oValueHelpDialog.setTokens([oToken]);
          this._oValueHelpDialog.open();
        },

        onValueHelpOkPress: function (oEvent) {
          var aTokens = oEvent.getParameter("tokens");
          var oControl = this.getView().byId("idCreatedByInput");
          oControl.setSelectedKey(aTokens[0].getKey());
          this._oValueHelpDialog.close();
        },

        onValueHelpCancelPress: function () {
          this._oValueHelpDialog.close();
        },

        onValueHelpAfterClose: function () {
          this._oValueHelpDialog.destroy();
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

        handleSortButtonPressed: function () {
          this.getViewSettingsDialog(
            "com.knpl.pragati.SchemeOffers.view.fragment.SortDialog"
          ).then(function (oViewSettingsDialog) {
            oViewSettingsDialog.open();
          });
        },

        handleSortDialogConfirm: function (oEvent) {
          var oTable = this.byId("idOffersTable"),
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
        onReset: function () {
          this._ResetFilterBar();
        },
        _ResetFilterBar: function () {
          var aCurrentFilterValues = [];
          var aResetProp = {
            StartDate: null,
            EndDate: null,
            Name: "",
            OfferType: "",
            Status: "",
            TrainingZone: "",
            TrainingDivision: "",
            TrainingDepot: "",
          };
          var oViewModel = this.getView().getModel("oModelControl");
          oViewModel.setProperty("/filterBar", aResetProp);
          var oTable = this.byId("idOffersTable");
          var oBinding = oTable.getBinding("items");
          oBinding.filter([]);
          oBinding.sort(new Sorter({ path: "CreatedAt", descending: true }));
          this._fiterBarSort();
        },
        _fiterBarSort: function () {
          if (this._ViewSortDialog) {
            var oDialog = this.getView().byId("viewSetting");
            oDialog.setSortDescending(true);
            oDialog.setSelectedSortItem("CreatedAt");
          }
        },
      }
    );
  }
);
