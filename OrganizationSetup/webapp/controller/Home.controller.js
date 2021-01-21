sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,Sorter, Filter, FilterOperator, FilterType,) {
        "use strict";

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.Home", {
            onInit: function () {

            },
            onFilterUsers : function (oEvent) {
 
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Name", FilterOperator.Contains, sQuery));
			}
 
			// filter binding
			var oList = this.getView().byId("tableUsers");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
        },
        onFilterRoles : function (oEvent) {
 
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Role", FilterOperator.Contains, sQuery));
			}
 
			// filter binding
			var oList = this.getView().byId("tableRoles");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
            onPressAdd: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                
                oRouter.navTo("AddUser");

            },
            onPressAddRole: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // var selectedProductId = oEvent.getSource().getBindingContext().getProperty("ProductID");
                // oRouter.navTo("detail", {
                //     productId: selectedProductId
                // });
                oRouter.navTo("AddRole");

            },
            onPressEditRole: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //var selectedUserId = oEvent.getSource().getBindingContext("data").getPath();
                var oItem = oEvent.getSource();
                oRouter.navTo("EditRole", {
                    roleId: window.encodeURIComponent(oItem.getBindingContext("data").getPath().substr(1))
                });
                //console.log(selectedUserId);
            },
            onPressEdit: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //var selectedUserId = oEvent.getSource().getBindingContext("data").getPath();
                var oItem = oEvent.getSource();
                oRouter.navTo("EditUser", {
                    userId: window.encodeURIComponent(oItem.getBindingContext("data").getPath().substr(1))
                });
                //console.log(selectedUserId);
            },
            onPressRemove: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var oItem = oEvent.getSource();
                var removeSet = window.encodeURIComponent(oItem.getBindingContext("data").getPath().substr(1));
                console.log(removeSet);
                var oModel = this.getView().getModel("data");
                oModel.remove(removeSet);

            }
        });
    });
