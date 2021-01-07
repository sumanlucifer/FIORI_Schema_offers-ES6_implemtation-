sap.ui.define([
        "sap/ui/core/mvc/Controller",
        	"sap/ui/model/json/JSONModel"
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller,JSONModel) {
		"use strict";

		return Controller.extend("com.knpl.pragat.MasterDataManagement.controller.MasterData", {
			onInit: function () {
                this._setData()
            },
            _setData:function(){
               
                var oData = {
                    eventsData:[
                        {
                            desc:"More than 60 pavillions",
                            link:"sample link 1"
                        },
                        {
                             desc:"Interactive exibits, live entertainment, memorable meetings",
                             link:"sample link 2"
                         }
                    ],
                    depoData:[
                        {
                            title:"Title 1",
                            link:"sample link 1"
                        },
                          {
                            title:"Title 2",
                            link:"sample link 1"
                        }
                    ]
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel,"oModelView")
            },
            onPressEdit:function(oEvent){
                    var oRouter = this.getOwnerComponent().getRouter();
                    var sPath = oEvent.getSource().getBindingContext("oModelView").getPath().split("/");
                    var sParam = sPath[1];
                    oRouter.navTo("RouteEditTable",{
                        type:sParam
                    });

            }
            
		});
	});
