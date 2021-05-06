sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    "sap/ui/core/library",
    "sap/ui/core/ValueState",
    "../utils/Validator",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, library, ValueState, Validator, Dialog, DialogType, Button, ButtonType, Text,
        JSONModel) {
        "use strict";

        // shortcut for sap.ui.core.ValueState
        var ValueState = library.ValueState;

        // shortcut for sap.ui.core.MessageType
        var MessageType = library.MessageType;

        var DisclaimerVersion;

        return Controller.extend("com.knpl.pragati.CompanySettings.controller.EditTextContent", {
            onInit: function () {
               



                this.sServiceURI = this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri;
                this.rteAbout = this.getView().byId("rteAbout");
                this.rteDisclaimer = this.getView().byId("rteDisclaimer");


                // Attaches validation handlers
                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });



                var oLocaModel = new JSONModel({
                    bEdit: false,
                    Catalogue: []
                });
                this.getView().setModel(oLocaModel, "local");

                this._property = "MasterCompanySettingsSet(1)";
                this.entitySet;

             this.getOwnerComponent().getRouter().getRoute("EditTextContent").attachPatternMatched(this._onObjectMatched, this);
               // this.initData();
               

               
            },
            _onObjectMatched: function () {
                 this.initData();
                //this._addRTE(["AboutUs"]);
            },
           
            initData: function () {
                var oData = {
                    AboutUs: null,
                    Disclaimer: null,
                    CallCenterHelpline: ""
                }
                var that = this;
                this.getOwnerComponent().getModel("data").read("/MasterCompanySettingsSet(1)", {
                    success: function (data, response) {
                         that.entitySet=data;
                        oData.AboutUs = data.AboutUs
                        oData.Disclaimer = data.Disclaimer
                        oData.CallCenterHelpline = data.CallCenterHelpline
                        oData.DisclaimerVersion = data.DisclaimerVersion
                        
                        
                        var oViewModel = new JSONModel(oData);
                        that.getView().setModel(oViewModel, "ActionEditModel");
                    },
                    error: function (oError) {
                    }
                });
                
            
                
            },
            onAfterRendering: function (){
                   this._addRTE(["AboutUs","Disclaimer"]);
                  // this._addRTE(["AboutUs"]);
            },
            // onBeforeRendering :function (){
            //      this.initData();
            // },
             _addRTE : function(aPaths){
                var that=this;
                    sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library","sap/m/Title"],
				function (RTE,EditorType,Title) {
                    aPaths.forEach(element => {

                    that.getView().byId("idVerticalLayout").addContent( 
                        new Title({
						 text:element
						
                    }));
                    that.getView().byId("idVerticalLayout").addContent( 
                        new RTE({
						width: "100%",
						value:"{ActionEditModel>/"+element+"}"
						
                    }));
                    
                    
                    });
					

					
			});
            },
            handleEditPress: function () {
                this.getView().getModel("local").setProperty("/bEdit", true);


                //Clone the data
                this._oSupplier = Object.assign({}, this.getView().bindElement("/MasterCompanySettingsSet(1)"));
                this._toggleButtonsAndView(true);


            },
            onEditTextContent: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EditTextContent");

            },

            handleCancelPress: function () {

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");

            },
            handleEmptyFields: function (oEvent) {
                console.log("empty");
                this.onDialogPress();
            },
            onReadyDisclaimer: function (oEvent){
              // var oe= oEvent.getSource().getProperty("value");
              var Disclaimer=this.getView().getModel("ActionEditModel").getProperty("/Disclaimer");
               this.rteDisclaimer.setValue(Disclaimer);
               
            },
            onReadyAbout: function (oEvent){
              // var oe= oEvent.getSource().getProperty("value");
              var About=this.getView().getModel("ActionEditModel").getProperty("/AboutUs");
               this.rteAbout.setValue(About);
               
            },

            handleSavePress: function () {

                // // console.log(DisclaimerVersion);

                // var oDataModel = this.getView().getModel();
                // var oView = this.getView();
                // // var oModelView = oView.getModel("oModelView");
                // // oModelView.setProperty("/busy", true);
                // var sEntityPath = oView.getElementBinding().getPath();
                // var oDataValue = oDataModel.getObject(sEntityPath);
                // //var oPrpReq = oModelView.getProperty("/prop2");
                var oDataValue={
                     AboutUs: this.getView().getModel("ActionEditModel").getProperty("/AboutUs"),
                    Disclaimer: this.getView().getModel("ActionEditModel").getProperty("/Disclaimer"),
                    CallCenterHelpline: this.getView().getModel("ActionEditModel").getProperty("/CallCenterHelpline"),
                    DisclaimerVersion: this.getView().getModel("ActionEditModel").getProperty("/DisclaimerVersion"),
                }



                var passedValidation = this.onValidate(oDataValue);

                if (passedValidation === false) {
                    //show an error message, rest of code will not execute.
                    this.handleEmptyFields();
                    return false;
                }

                var oData={
                    AboutUs: this.getView().getModel("ActionEditModel").getProperty("/AboutUs"),
                    Disclaimer: this.getView().getModel("ActionEditModel").getProperty("/Disclaimer"),
                    CallCenterHelpline: this.getView().getModel("ActionEditModel").getProperty("/CallCenterHelpline"),
                    DisclaimerVersion: this.getView().getModel("ActionEditModel").getProperty("/DisclaimerVersion") + 1,
                }
                var that = this;
                var editSet = "/MasterCompanySettingsSet(1)";
                var oModel = this.getView().getModel("data");
                oModel.update(editSet, oData, {
                    success: function () {
                        that.onSuccessPress();
                    }
                });


            },
            onSuccessPress: function (msg) {

                var msg = 'Saved Successfully!';
                MessageToast.show(msg);
                this.getOwnerComponent().getModel("data").refresh(true);
                setTimeout(function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHome");
                }.bind(this), 1000);



            },

            _toggleButtonsAndView: function (bEdit) {

                var oView = this.getView();

                // Show the appropriate action buttons
                oView.byId("edit").setVisible(!bEdit);
                oView.byId("save").setVisible(bEdit);
                oView.byId("cancel").setVisible(bEdit);

                // Set the right form type
                //this._showFormFragment(bEdit ? "Change" : "Display");
            },



            onValidate: function (oDataValue) {
                if(oDataValue.AboutUs==""||oDataValue.Disclaimer==""||oDataValue.CallCenterHelpline==""){
                    return false;
                }
                return true;
                // // Create new validator instance
                // var validator = new Validator();

                // // Validate input fields against root page with id 'somePage'
                // return validator.validate(this.byId("EditFragment"));
               
            },
            onDialogPress: function () {
                if (!this.oEscapePreventDialog) {
                    this.oEscapePreventDialog = new Dialog({
                        title: "Error",
                        content: new Text({ text: "Mandatory Fields Are Empty!" }),
                        type: DialogType.Message,
                        buttons: [
                            new Button({
                                text: "Close",
                                press: function () {
                                    this.oEscapePreventDialog.close();
                                }.bind(this)
                            })
                        ]

                    });
                }

                this.oEscapePreventDialog.open();
            },



        });
    });
