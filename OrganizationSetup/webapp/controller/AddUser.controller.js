sap.ui.define([
		"sap/ui/core/mvc/Controller"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller) {
		"use strict";

		return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.AddUser", {
			onInit: function () {

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
		});
	});
