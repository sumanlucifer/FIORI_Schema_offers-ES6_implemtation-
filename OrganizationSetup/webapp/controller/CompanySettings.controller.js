sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    'sap/m/MessageToast',
    "sap/ui/richtexteditor/RichTextEditor"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, MessageToast, RichTextEditor) {
        "use strict";

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.CompanySettings", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("EditCompanySettings").attachPatternMatched(this._onObjectMatched, this);

                //this.loadRichTextEditiors();

            },
            _onObjectMatched: function (oEvent) {
                this.getView().bindElement({
                    path: "/" + window.decodeURIComponent(oEvent.getParameter("arguments").settingsId),
                    model: "tableData"
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
                var disclaimer = this.getView().byId("disclaimer").getValue();
                var aboutUs= this.getView().byId("about").getValue();
                 var callCenterNo= this.getView().byId("callcenter").getValue();
                // var mobile= this.getView().byId("mobile").getValue();
                // var countrycode= this.getView().byId("countrycode").getValue();

               // var oModel = this.getView().getModel("tableData");

                var oData = {
                    Disclaimer: disclaimer,
                    AboutUs:aboutUs,
                    CallCenterNumber:callCenterNo

                }
                console.log(oData);
                //oModel.create("/MasterAdminRoleSet", oData,{success:MessageToast.show("Successfully added!")});


            },
            update: function () {

                 var disclaimer = this.getView().byId("disclaimer").getValue();
                var aboutUs= this.getView().byId("about").getValue();
                 var callCenterNo= this.getView().byId("callcenter").getValue();


               // var oModel = this.getView().getModel("data");

                 var oData = {
                    Disclaimer: disclaimer,
                    AboutUs:aboutUs,
                    CallCenterNumber:callCenterNo

                }
                console.log(oData);

               // var editSet = this.getView().getBindingContext("data").getPath();

               // oModel.update(editSet, oData, { success: MessageToast.show("Successfully updated!") });
            },
            loadRichTextEditiors: function () {
                var oRichTextEditorDisclaimer = new RichTextEditor("myRTE1", {
                    width: "50%",
                    height: "100px",
                    showGroupClipboard: true,
                    showGroupStructure: true,
                    showGroupFont: true,
                    showGroupInsert: true,
                    showGroupLink: true,
                    showGroupUndo: true,
                    tooltip: "My RTE Tooltip",
                    //value:"Demo"

                });
                this.getView().byId("disclaimerVerticalLayout").addContent(oRichTextEditorDisclaimer);

                var oRichTextEditorAboutUs = new RichTextEditor("myRTE2", {
                    width: "50%",
                    height: "100px",
                    showGroupClipboard: true,
                    showGroupStructure: true,
                    showGroupFont: true,
                    showGroupInsert: true,
                    showGroupLink: true,
                    showGroupUndo: true,
                    tooltip: "My RTE Tooltip",
                    //value:"Demo"
                });
                this.getView().byId("aboutUsVerticalLayout").addContent(oRichTextEditorAboutUs);
            }
        });
    });
