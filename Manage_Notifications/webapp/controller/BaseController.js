sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

], function (Controller, UIComponent, mobileLibrary, MessageToast, MessageBox,Filter,FilterOperator) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.knpl.pragati.Manage_Notifications.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress : function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
        },
        /*
		 * Common function for showing warning dialogs
		 * @param sMsgTxt : i18n Key string
		 * @param _fnYes : Optional: function to be called for Yes response
		 */
        showWarning: function (sMsgTxt, _fnYes) {
            var that = this;
            MessageBox.warning(this.getResourceBundle().getText(sMsgTxt), {
                actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        _fnYes && _fnYes.apply(that);
                    }
                }
            });
        },

        showError: function (sMsg) {
            var that = this;
            MessageBox.error(sMsg, {
                title: that.getResourceBundle().getText("TtlError")
            });

        },

		/*
		 * Common function for showing toast messages
		 * @param sMsgTxt: i18n Key string
		 */
        showToast: function (sMsgTxt) {
            MessageToast.show(this.getResourceBundle().getText(sMsgTxt));
        },
        // onFilterBarSearchPainter: function (oEvent) {
        //             var afilterBar = oEvent.getParameter("selectionSet");

        //             var aCurrentFilterValues = [];
        //             var oViewFilter = this.getView().getModel("oModelControl").getProperty("/Search/PainterVh");
        //             var aFlaEmpty = true;
        //             for (let prop in oViewFilter) {
        //                 if (oViewFilter[prop]) {
        //                     if (prop === "ZoneId") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter("ZoneId", FilterOperator.EQ, oViewFilter[prop])
        //                         );
        //                     } else if (prop === "DivisionId") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter("DivisionId", FilterOperator.EQ, oViewFilter[prop])
        //                         );
        //                     } else if (prop === "DepotId") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter("DepotId", FilterOperator.EQ, oViewFilter[prop])
        //                         );
        //                     } else if (prop === "PainterType") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter({ path: "PainterTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
        //                         );
        //                     } else if (prop === "ArcheType") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter({ path: "ArcheTypeId", operator: FilterOperator.EQ, value1: oViewFilter[prop] })
        //                         );
        //                     } else if (prop === "MembershipCard") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter({ path: "MembershipCard", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
        //                         );
        //                     } else if (prop === "Name") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter({ path: "Name", operator: FilterOperator.Contains, value1: oViewFilter[prop], caseSensitive: false })
        //                         );
        //                     } else if (prop === "Mobile") {
        //                         aFlaEmpty = false;
        //                         aCurrentFilterValues.push(
        //                             new Filter({ path: "Mobile", operator: FilterOperator.Contains, value1: oViewFilter[prop] })
        //                         );
        //                     }
        //                 }
        //             }

        //             aCurrentFilterValues.push(new Filter({
        //                 path: "IsArchived",
        //                 operator: FilterOperator.EQ,
        //                 value1: false
        //             }))
        //             aCurrentFilterValues.push(new Filter({
        //                 path: "RegistrationStatus",
        //                 operator: FilterOperator.NotContains,
        //                 value1: "DEREGISTERED"
        //             }))
        //             aCurrentFilterValues.push(new Filter({
        //                 path: "ActivationStatus",
        //                 operator: FilterOperator.NotContains,
        //                 value1: "DEACTIVATED"
        //             }))

        //             this._FilterPainterValueTable(
        //                 new Filter({
        //                     filters: aCurrentFilterValues,
        //                     and: true,
        //                 })
        //             );
        //         },
        //         onPVhZoneChange: function (oEvent) {
        //             var sId = oEvent.getSource().getSelectedKey();
        //             var oView = this.getView();

        //             var oDivision = sap.ui.getCore().byId("idPVhDivision");
        //             var oDivItems = oDivision.getBinding("items");
        //             var oDivSelItm = oDivision.getSelectedItem(); //.getBindingContext().getObject()
        //             oDivision.clearSelection();
        //             oDivision.setValue("");
        //             oDivItems.filter(new Filter("Zone", FilterOperator.EQ, sId));
        //             //setting the data for depot;
        //             var oDepot = sap.ui.getCore().byId("idPVhDepot");
        //             oDepot.clearSelection();
        //             oDepot.setValue("");
        //             // clearning data for dealer
        //         },
        //         onPVhDivisionChange: function (oEvent) {
        //             var sKey = oEvent.getSource().getSelectedKey();
        //             var oView = this.getView();
        //             var oDepot = sap.ui.getCore().byId("idPVhDepot");
        //             var oDepBindItems = oDepot.getBinding("items");
        //             oDepot.clearSelection();
        //             oDepot.setValue("");
        //             oDepBindItems.filter(new Filter("Division", FilterOperator.EQ, sKey));
        //         },
        //         onClearPainterVhSearch: function () {
        //             var oView = this.getView();
        //             var oModel = oView.getModel("oModelControl"), aCurrentFilterValues = [];
        //             oModel.setProperty("/Search/PainterVh", {
        //                 ZoneId: "",
        //                 DivisionId: "",
        //                 DepotId: "",
        //                 PainterType: "",
        //                 ArcheType: "",
        //                 MembershipCard: "",
        //                 Name: "",
        //                 Mobile: ""
        //             });
        //             aCurrentFilterValues.push(new Filter({
        //                 path: "IsArchived",
        //                 operator: FilterOperator.EQ,
        //                 value1: false
        //             }));
                   
        //             this._FilterPainterValueTable(
        //                 new Filter({
        //                     filters: aCurrentFilterValues,
        //                     and: true,
        //                 })
        //             );
        //         },
        //         _FilterPainterValueTable: function (oFilter, sType) {
        //             var oValueHelpDialog = this._PainterValueHelp;

        //             oValueHelpDialog.getTableAsync().then(function (oTable) {
        //                 if (oTable.bindRows) {
        //                     oTable.getBinding("rows").filter(oFilter, sType || "ApplicatApplication");
        //                 }

        //                 if (oTable.bindItems) {
        //                     oTable
        //                         .getBinding("items")
        //                         .filter(oFilter, sType || "Application");
        //                 }

        //                 oValueHelpDialog.update();
        //             });
        //         },


    });

});