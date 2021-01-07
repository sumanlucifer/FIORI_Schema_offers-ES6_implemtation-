sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("com.knpl.pragati.MasterDataManagement.controller.MasterData", {
            onInit: function () {
                //this._setData()
            },
            _setData: function () {



                var oData = {
                    eventsData: [
                        {
                            desc: "whatsapp link",
                            link: "www.whatsapp.com"
                        },
                        {
                            desc: "google link",
                            link: "www.google.com"
                        }
                    ],
                    depoData: [
                        {
                            title: "Depot 1",
                            link: "sample link 1"
                        },
                        {
                            title: "Depot 2",
                            link: "sample link 1"
                        }
                    ]
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelView")
            },
            onPressEdit: function (oEvent) {
                var oRouter = this.getOwnerComponent().getRouter();
                var sPath = oEvent.getSource().getBindingContext("tableData").getPath().split("/");
                var sParam = sPath[1];
                oRouter.navTo("RouteEditTable", {
                    type: sParam,
                    id:sPath[2]
                });

            },
            onPressRemove: function (oEvent) {
                var othat = this;
                var oView = this.getView();
                var sPath = oEvent.getSource().getBindingContext("tableData").getPath()
                var arryPath = sPath.split("/");
                var sIndex = parseInt(arryPath[arryPath.length - 1]);
                var oModel = oView.getModel("tableData");

                var oProperty = oModel.getProperty(sPath.substring(0, sPath.lastIndexOf("/")));
                console.log(oProperty)

                MessageBox.confirm("Kindly confirm to remove.", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],

                    onClose: function (sAction) {
                        if (sAction == "OK") {
                            oProperty.splice(sIndex, 1);
                            MessageToast.show("Data Sucessfully Deleted.");
                        }
                        oModel.refresh();
                    }
                });

            },
            onRefresh: function () {
                var myLocation = location;
                myLocation.reload();
            },
            onPressAdd: function () {
                var oView = this.getView();
                var oIcnTbr = oView.byId("idIconTabBarFiori2");
                var sKey = oIcnTbr.getSelectedKey();
                var oJSON = {
                    "0": "eventsData",
                    "1": "depoData"
                }
                var oRouter = this.getOwnerComponent().getRouter();
                var sParam = oJSON[sKey];
                oRouter.navTo("RouteEditTable", {
                    type: sParam,
                    id:"add"
                });

            }

        });
    });
