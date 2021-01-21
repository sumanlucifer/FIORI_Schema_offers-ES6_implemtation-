sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/ui/core/UIComponent"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller,History,UIComponent) {
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
                var role= this.getView().byId("role").getValue();
                var description= this.getView().byId("description").getValue();
                // var dialcode= this.getView().byId("dialcode").getValue();
                // var mobile= this.getView().byId("mobile").getValue();
                // var countrycode= this.getView().byId("countrycode").getValue();

                 var oModel = this.getView().getModel("data");

                 var oData = {
                    Role: role,
                    
                
                }

                oModel.create("/MasterAdminRoleSet", oData);
                
                
            },
            update: function () {

                var role= this.getView().byId("role").getValue();
               

                 var oModel = this.getView().getModel("data");
                
                 var oData = {
                    Role: role,
                   
                }

                var editSet = this.getView().getBindingContext("data").getPath();
                
            oModel.update(editSet, oData);
            }
		});
	});
