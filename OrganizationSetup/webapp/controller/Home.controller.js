sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/richtexteditor/RichTextEditor",
    'sap/m/MessageToast'

],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Sorter, Filter, FilterOperator, FilterType, RichTextEditor, MessageToast) {
        "use strict";
        

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.Home", {
            onInit: function () {
               

            },
            
            
            onFilterUsers: function (oEvent) {

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
            onFilterRoles: function (oEvent) {

                // build filter array
                var aFilter = [];
                var sQuery = oEvent.getParameter("query");
                if (sQuery) {
                    aFilter.push(new Filter("Description", FilterOperator.Contains, sQuery));
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
            onPressAddCompanySettings: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.navTo("AddCompanySettings");

            },
            onPressEditCompanySettings: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var oItem = oEvent.getSource();
                oRouter.navTo("EditCompanySettings", {
                    settingsId: window.encodeURIComponent(oItem.getBindingContext("data").getPath().substr(1))
                });
                //console.log(selectedUserId);
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
            onPressRemoveUser: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var oItem = oEvent.getSource();
                var removeSet = oItem.getBindingContext("data").getPath();

                var oTable = this.getView().byId("tableUsers");

                var oSelectedItem = oEvent.getSource().getBindingContext('data').getObject()

                var oParam = {
                    Name: oSelectedItem.Name,
                    Email: oSelectedItem.Email,
                    Mobile: oSelectedItem.Mobile,
                    CountryCode: oSelectedItem.CountryCode,
                    RoleId: oSelectedItem.RoleId,
                    IsArchived: true
                };
                //console.log(oParam);
                var oModel = this.getView().getModel("data");
                oModel.update(removeSet, oParam, { success: this.onRemoveSuccess() });



            },
            onRemoveSuccess: function () {
                

                var oModel = this.getView().getModel("data");
                oModel.refresh();
                var msg = 'Removed Successfully!';
                MessageToast.show(msg);


            },
            onRemoveError: function () {
                var msg = 'Error!';
                MessageToast.show(msg);


            },
            onPressRemoveRole: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var oItem = oEvent.getSource();
                var removeSet = oItem.getBindingContext("data").getPath();

                var oTable = this.getView().byId("tableRole");

                var oSelectedItem = oEvent.getSource().getBindingContext('data').getObject()

                var oParam = {
                    Role: oSelectedItem.Role,
                    IsArchived: true
                };
                //console.log(oParam);
                var oModel = this.getView().getModel("data");
                oModel.update(removeSet, oParam, { success: this.onRemoveSuccess() });


            },
            onPressRemoveCompanySettings: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var oItem = oEvent.getSource();
                var removeSet = oItem.getBindingContext("data").getPath();

                var oTable = this.getView().byId("tableCompanySettings");

                var oSelectedItem = oEvent.getSource().getBindingContext('data').getObject()

                var oParam = {
                    AboutUs: oSelectedItem.aboutUs,
                    Disclaimer: oSelectedItem.disclaimer,
                    CallCenterHelpline: oSelectedItem.callCenterNo,
                    IsArchived: true
                };
                //console.log(oParam);
                var oModel = this.getView().getModel("data");
                oModel.update(removeSet, oParam, { success: this.onRemoveSuccess() });

            }




        });
    });
