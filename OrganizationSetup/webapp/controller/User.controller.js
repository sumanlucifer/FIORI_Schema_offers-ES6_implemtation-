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

		return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.User", {
			onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("EditUser").attachPatternMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {
               this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").userId),
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
                var name= this.getView().byId("name").getValue();
                var email= this.getView().byId("email").getValue();
                var dialcode= this.getView().byId("dialcode").getValue();
                var mobile= this.getView().byId("mobile").getValue();
                var countrycode= this.getView().byId("countrycode").getValue();

                 var oModel = this.getView().getModel("data");

                 var oData = {
                    Name: name,
                    Email: email,
                    Mobile: null,
                    DialCode:null,
                    CountryCode: countrycode,
                    RoleId:1
                }

                oModel.create("/AdminSet", oData);
                
                
            },
            update: function () {
                var name= this.getView().byId("name").getValue();
                var email= this.getView().byId("email").getValue();
                var dialcode= this.getView().byId("dialcode").getValue();
                var mobile= this.getView().byId("mobile").getValue();
                var countrycode= this.getView().byId("countrycode").getValue();

                 var oModel = this.getView().getModel("data");
                
                 var oData = {
                    Name: name,
                    Email: email,
                    Mobile: null,
                    DialCode:null,
                    CountryCode: countrycode,
                    RoleId:1
                }

                var editSet = this.getView().getBindingContext("data").getPath();
                
            oModel.update(editSet, oData);
                
                
            },
		});
	});
