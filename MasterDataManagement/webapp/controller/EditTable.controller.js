sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/ui/core/Fragment',
		'sap/ui/model/json/JSONModel'
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller,Fragment,JSONModel) {
		"use strict";

		return Controller.extend("com.knpl.pragat.MasterDataManagement.controller.EditTable", {
			onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                this._formFragments = {};
               
			    oRouter.getRoute("RouteEditTable").attachMatched(this._onRouteMatched, this);

            },
            _onRouteMatched:function(oEvent){
                var sArgs = oEvent.getParameter("arguments")["type"];
                console.log(sArgs);
                 var oFrag = {
                    eventsData:"EditExtLink",
                    depoData:"EditDepo"
                }
                console.log(oFrag[sArgs]);
                this._showFormFragment(oFrag[sArgs]);
            },
            _getFormFragment: function (sFragmentName) {
			var pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();

			if (!pFormFragment) {
				pFormFragment = Fragment.load({
					id: oView.getId(),
					name: "com.knpl.pragat.MasterDataManagement.view." + sFragmentName
				});
				this._formFragments[sFragmentName] = pFormFragment;
			}

			return pFormFragment;
		},

		_showFormFragment : function (sFragmentName) {
			var objSection = this.getView().byId("objSec1");

			objSection.removeAllBlocks();
			this._getFormFragment(sFragmentName).then(function(oVBox){
				objSection.addBlock(oVBox);
			});
		}


		});
	});
