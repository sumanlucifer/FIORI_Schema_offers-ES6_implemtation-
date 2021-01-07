sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment',
    'sap/ui/model/json/JSONModel'
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, JSONModel) {
        "use strict";

        return Controller.extend("com.knpl.pragati.MasterDataManagement.controller.EditTable", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                this._formFragments = {};

                oRouter.getRoute("RouteEditTable").attachMatched(this._onRouteMatched, this);

            },
            _onRouteMatched: function (oEvent) {
                var sArgsType = oEvent.getParameter("arguments").type;
                var sId = oEvent.getParameter("arguments").id;
                console.log(sArgsType, sId);
                var oFrag = {
                    eventsData: "EditExtLink",
                    depoData: "EditDepo"
                }
                this._initData(oFrag[sArgsType], sId);
                this._showFormFragment(oFrag[sArgsType], sArgsType, sId);
            },
            _initData: function (mParam1, mParam2) {
                console.log(mParam1);
                var oData = {
                    titlePart1: mParam2 == "add" ? "Add" : "Edit",
                    titlePart2: mParam1 == 'EditExtLink' ? 'External Link' : 'Depot'
                }
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "oModelView");
            },
            _getFormFragment: function (sFragmentName) {
                var pFormFragment = this._formFragments[sFragmentName],
                    oView = this.getView();

                if (!pFormFragment) {
                    pFormFragment = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.MasterDataManagement.view." + sFragmentName
                    });
                    this._formFragments[sFragmentName] = pFormFragment;
                }

                return pFormFragment;
            },

            _showFormFragment: function (sFragmentName, mType, mId) {
                console.log(mType + "/" + mId)
                var objSection = this.getView().byId("objSec1");

                objSection.removeAllBlocks();
                this._getFormFragment(sFragmentName).then(function (oVBox) {
                    if (mId !== "add") {
                        oVBox.bindElement({
                            path: "/" + mType + "/" + mId, model: "tableData"
                        });
                    } else {
                        oVBox.unbindObject("tableData");
                    }
                    objSection.addBlock(oVBox);
                });
            }


        });
    });
