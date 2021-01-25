sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    'sap/m/MessageToast'
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast) {
        "use strict";

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.Role", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditRole").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").roleId),
                    model: "data"
                });



            },
            onNavBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteHome", {}, true);
                }
            },
            add: function () {
                var role = this.getView().byId("role").getValue();
                var description = this.getView().byId("description").getValue();
                

                var oModel = this.getView().getModel("data");

                var oData = {
                    Role: role,
                    Description: description


                }

                oModel.create("/MasterAdminRoleSet", oData, { success: MessageToast.show("Successfully added!") });


            },
            update: function () {

                var role = this.getView().byId("role").getValue();
                var description = this.getView().byId("description").getValue();

                var oModel = this.getView().getModel("data");

                var oData = {
                    Role: role,
                    Description: description

                }
                        console.log(oData)
               // var editSet = this.getView().getBindingContext("data").getPath();

               // oModel.update(editSet, oData, { success: MessageToast.show("Successfully updated!") });
            }
        });
    });
