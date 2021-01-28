sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/richtexteditor/RichTextEditor",
    'sap/m/MessageToast',
    "sap/ui/core/message/Message",
    "sap/ui/core/library",
    "sap/ui/core/Fragment"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, History, UIComponent, RichTextEditor, MessageToast, Message, library, Fragment) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.OrganizationSetup.controller.CompanySettings", {
            onInit: function () {

                var oMessageManager, oView;

                oView = this.getView();
                // set message model
                oMessageManager = sap.ui.getCore().getMessageManager();
                oView.setModel(oMessageManager.getMessageModel(), "message");

                oMessageManager.registerObject(oView, true);

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
            _getMessagePopover: function () {
                var oView = this.getView();

                // create popover lazily (singleton)
                if (!this._pMessagePopover) {
                    this._pMessagePopover = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.OrganizationSetup.view.MessagePopover"
                    }).then(function (oMessagePopover) {
                        oView.addDependent(oMessagePopover);
                        return oMessagePopover;
                    });
                }
                return this._pMessagePopover;
            },
            onMessagePopoverPress: function (oEvent) {
                var oSourceControl = oEvent.getSource();
                this._getMessagePopover().then(function (oMessagePopover) {
                    oMessagePopover.openBy(oSourceControl);
                });
            },

            onSuccessPress: function () {
                var oMessage = new Message({
                    message: "My generated success message",
                    type: MessageType.Success,
                    //target: "/Dummy",
                    //processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            },
            onErrorPress: function () {
                var oMessage = new Message({
                    message: "Mandatory Fields Are Empty!",
                    type: MessageType.Error,
                    target: "/Dummy",
                    processor: this.getView().getModel()
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            },
            handleEmptyFields: function (oEvent) {
                this.onErrorPress();
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
                var aboutUs = this.getView().byId("about").getValue();
                var callCenterNo = this.getView().byId("callcenter").getValue();

                var requiredInputs = this.returnIdListOfRequiredFields();
                var passedValidation = this.validateEventFeedbackForm(requiredInputs);
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }

                var oData = {
                    Disclaimer: disclaimer,
                    AboutUs: aboutUs,
                    CallCenterNumber: callCenterNo

                }
                console.log(oData);
                //oModel.create("/MasterAdminRoleSet", oData,{success:MessageToast.show("Successfully added!")});


            },
            update: function () {

                var disclaimer = this.getView().byId("disclaimer").getValue();
                var aboutUs = this.getView().byId("about").getValue();
                var callCenterNo = this.getView().byId("callcenter").getValue();

                var requiredInputs = this.returnIdListOfRequiredFields();
                var passedValidation = this.validateEventFeedbackForm(requiredInputs);
                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }


                // var oModel = this.getView().getModel("data");


                var oData = {
                    Disclaimer: disclaimer,
                    AboutUs: aboutUs,
                    CallCenterNumber: callCenterNo

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
            },
            //validation
            returnIdListOfRequiredFields: function () {
                let requiredInputs;
                return requiredInputs = ['disclaimer', 'about','callcenter'];
            },

            validateEventFeedbackForm: function (requiredInputs) {
                var _self = this;
                var valid = true;
                requiredInputs.forEach(function (input) {
                    var sInput = _self.getView().byId(input);
                    if (sInput.getValue() == "" || sInput.getValue() == undefined) {
                        valid = false;
                        sInput.setValueState("Error");
                    }
                    else {
                        sInput.setValueState("None");
                    }
                });
                return valid;
            },
            onClearPress : function(){
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},
        });
    });
