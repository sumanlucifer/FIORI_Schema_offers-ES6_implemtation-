sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/Fragment',
     'sap/m/MessageToast'
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment,MessageToast) {
        "use strict";

        // // shortcut for sap.ui.core.ValueState
        // var ValueState = library.ValueState;

        // // shortcut for sap.ui.core.MessageType
        // var MessageType = library.MessageType;

        return Controller.extend("com.knpl.pragati.CompanySettings.controller.Home", {
            onInit: function () {
                var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/CompanySettingsSet(1)");

                this._formFragments = {};

                // Set the initial form to be the display one
                this._showFormFragment("Display");


                // this.getView().setModel(oModel);
                // var form = this.getView().byId('CompanySettingsForm');

                // form.bindElement({
                //     path: "/CompanySettingsSet(1)",
                //     events: {
                //         change: function () {
                //             //triggers on error too I think
                //             form.setBusy(false);
                //         },
                //         dataRequested: function () {
                //             form.setBusy(true);
                //         }
                //     }
                // });


            },
           handleEditPress : function () {

			//Clone the data
			this._oSupplier = Object.assign({}, this.getView().bindElement("/CompanySettingsSet(1)"));
            this._toggleButtonsAndView(true);
           

		},

		handleCancelPress : function () {

			//Restore the data
            var oModel = this.getView().getModel("data");
                this.getView().setModel(oModel);

                this.getView().bindElement("/CompanySettingsSet(1)");
            

			this._toggleButtonsAndView(false);

		},

		handleSavePress : function () {
            var about=this.getView().byId("aboutChange").getValue();
             var disclaimer=this.getView().byId("disclaimerChange").getValue();
              var callCenterHelpline=this.getView().byId("callCenterChange").getValue();

            var oData={
                AboutUs:about,
                Disclaimer:disclaimer,
                CallCenterHelpline:callCenterHelpline
            }

            //this._toggleButtonsAndView(false);
            console.log(oData)
            var editSet ="/CompanySettingsSet(1)";
            var oModel = this.getView().getModel("data");
             oModel.update(editSet, oData,{success:this.onSuccessPress()});

        },
        onSuccessPress: function (msg) {

                var msg = 'Saved Successfully!';
                MessageToast.show(msg);

                setTimeout(function () {
                    this._toggleButtonsAndView(false);
                }.bind(this), 1000);
               


            },

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "Change" : "Display");
		},

		_getFormFragment: function (sFragmentName) {
			var pFormFragment = this._formFragments[sFragmentName],
				oView = this.getView();

			if (!pFormFragment) {
				pFormFragment = Fragment.load({
					id: oView.getId(),
					name: "com.knpl.pragati.CompanySettings.view.fragment." + sFragmentName
				});
				this._formFragments[sFragmentName] = pFormFragment;
			}

			return pFormFragment;
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("CompanySettings");

			oPage.removeAllContent();
			this._getFormFragment(sFragmentName).then(function(oVBox){
				oPage.insertContent(oVBox);
			});
		}
        });
    });
