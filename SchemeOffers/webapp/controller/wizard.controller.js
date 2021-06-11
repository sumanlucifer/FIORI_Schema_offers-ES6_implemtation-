sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/library'
], function (Controller, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("com.knpl.pragati.SchemeOffers.controller.wizard", {
		_syncSelect: function (sStepId) {
			var oModel = this.getView().getModel();
			oModel.setProperty('/linearWizardSelectedStep', sStepId);
		},

		validateProdInfoStep: function (abc) {
			var oModel = this.getView().getModel(),
				oProdInfoStep = this.getView().byId(abc);
				var aStep = this.getView().byId("ProductTypeStep")
                var aWizard = this.getView().byId("CreateProductWizard")
            oProdInfoStep.setValidated();
            console.log(aWizard)
            console.log(aStep)
            //this.getView().byId("CreateProductWizard").goToStep()
            //aWizard.previouStep()
		},

		onActivate: function (oEvent) {
			var sCurrentStepId = oEvent.getParameter("id");
            sCurrentStepId = sCurrentStepId.split('-').pop();
            var oView = this.getView()

			this._syncSelect(sCurrentStepId);
            console.log("Step Activated",sCurrentStepId)
			if (sCurrentStepId === 'PricingStep') {
                //this.validateProdInfoStep(sCurrentStepId);
               
			}
        },
        onInit:function(){
            console.log("onInit");
            console.log(this.getView().getModel("oModelView"));
        },
        onAfterRendering:function(){
            console.log("onAfter Rendering");
            var aStep = this.getView().byId("ProductTypeStep")
            this.getView().byId("CreateProductWizard").goToStep(aStep);
            this.getView().byId("CreateProductWizard").setShowNextButton(false);
        },
        onExit:function(){
            console.log("on Exit");
        }
	});
});
