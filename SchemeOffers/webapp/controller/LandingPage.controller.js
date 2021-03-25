// @ts-ignore
sap.ui.define([
    "com/knpl/pragati/SchemeOffers/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/Device',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/Token'
],
function (BaseController, Filter, FilterOperator, JSONModel, Sorter, Fragment, Device, MessageBox, MessageToast, ColumnListItem, Label, Token) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.SchemeOffers.controller.LandingPage", {
        onInit: function () {
            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};
            
            var oModel = new JSONModel({
                TotalCount: 0,
                busy: true,
                filterBar: {
                    search: "",
                    offerType: "all",
                    date: "",
                    status: ""
                }
            });
            this.getView().setModel(oModel, "ViewModel");
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) { },

        onUpdateFinished: function (oEvent) {
            var oModel = this.getViewModel("ViewModel");
            var tableCount = oEvent.getParameters().actual;
            oModel.setProperty("/TotalCount", tableCount);
            oModel.setProperty("/busy", false);
        },

        onPressListItem: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("MockData").getPath();
            this.oRouter.navTo("DetailPage", {
                property: sPath.split("/")[2]
            });
        },

        onPressAdd: function (oEvent) {
            this.oRouter.navTo("AddOfferPage");
        },

        onPressEdit: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            this.oRouter.navTo("ActionPage", {
                action: "edit",
                property: sPath.substr(1)
            });
        },

        onPressDelete: function (oEvent) {
            var oView = this.getView();
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getComponentModel();
            var oViewModel = this.getView().getModel("ViewModel");
            var oResourceBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            var oPayload = {
                IsArchived: true,
            };
            MessageBox.confirm(oResourceBundle.getText("deleteConfirmationMessage"), {
                actions: [oResourceBundle.getText("messageBoxDeleteBtnText"), MessageBox.Action.CANCEL],
				emphasizedAction: oResourceBundle.getText("messageBoxDeleteBtnText"),
                onClose: function (sAction) {
                    if (sAction == oResourceBundle.getText("messageBoxDeleteBtnText")) {
                        oViewModel.setProperty("/busy", true);
                        oModel.update(sPath, oPayload, {
                            success: function () {
                                MessageToast.show(oResourceBundle.getText("messageBoxDeleteSuccessMsg"));
                                oViewModel.setProperty("/busy", false);
                                oView.byId("idToolTable").getModel().refresh();
                            },
                            error: function () {
                                oViewModel.setProperty("/busy", false);
                                MessageBox.error(oResourceBundle.getText("messageBoxDeleteErrorMsg-"));
                            }
                        });
                    }
                }
            });
        },

        onSearch: function (oEvent) {
            var aFilterControls = oEvent.getParameter("selectionSet");
            var aFilters = [], sValue;
            for (var i = 0; i < aFilterControls.length; i++) {
                var oControl = aFilterControls[i];
                var sControlName = oControl.getCustomData("filterName")[0].getValue();
                switch(sControlName) {
                    case "Search":
                        sValue = oControl.getValue();
                        if (sValue && sValue !== "") {
                            aFilters.push(new Filter([
                                new Filter("Title", FilterOperator.Contains, sValue),
                                new Filter("Description", FilterOperator.Contains, sValue),
                                new Filter("Url", FilterOperator.Contains, sValue)
                            ], false));
                        }
                        break;
                    case "Creation Date": 
                        sValue = oControl.getValue();
                        if (sValue && sValue !== "") {
                            aFilters.push(new Filter("CreatedAt", FilterOperator.LE, sValue + "T23:59:59"));
                        }
                        break;
                    case "Title":
                        sValue = oControl.getValue();
                        if (sValue && sValue !== "") {
                            aFilters.push(new Filter("Title", FilterOperator.Contains, sValue));
                        }
                        break;
                    case "Created By":
                        sValue = oControl.getSelectedKey();
                        if (sValue && sValue !== "") {
                            aFilters.push(new Filter("CreatedBy", FilterOperator.EQ, sValue));
                        }
                        break;
                }
            }

            var oTable = this.getView().byId("idToolTable");
            var oBinding = oTable.getBinding("items");
            if (aFilters.length > 0) {
                var oFilter = new Filter({
                    filters: aFilters,
                    and: true,
                });
                oBinding.filter(oFilter);
            } else {
                oBinding.filter([]);
            }
        },

        onValueHelpRequested: function() {
            var oColModel = new JSONModel({
                "cols": [{
                    "label": "Name",
                    "template": "Name"
                }]
            });
			// @ts-ignore
			this._oValueHelpDialog = sap.ui.xmlfragment("com.knpl.pragati.SchemeOffers.view.fragment.CreatedByValueHelpDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(this.getComponentModel());
                oTable.setModel(oColModel, "columns");
                oTable.setWidth("25rem");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", {path: '/AdminSet',filters: [new Filter("IsArchived", FilterOperator.EQ, false)]});
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
                                })
                            });
                        },
                        templateShareable: false
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

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
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

        handleSortButtonPressed: function () {
			this.getViewSettingsDialog("com.knpl.pragati.SchemeOffers.view.fragment.SortDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
        },
        
        handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idToolTable"),
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
		}
    });
});
