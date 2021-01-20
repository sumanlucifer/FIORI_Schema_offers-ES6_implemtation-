sap.ui.define([
		"sap/ui/core/mvc/Controller"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller) {
		"use strict";

		return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.AddRole", {
			onInit: function () {

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
                    Description: description,
                    IsArchived: false,
                    CreatedAt: null,
                    CreatedBy: null,
                    UpdatedAt: null,
                    UpdatedBy: null,
                    IsSelected: null
                
                }

                oModel.create("/MasterAdminRoleModel", oData);
                
                
            },
		});
	});
