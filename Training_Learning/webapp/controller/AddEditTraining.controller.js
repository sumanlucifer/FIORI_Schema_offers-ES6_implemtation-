sap.ui.define(
  [
    "com/knpl/pragati/Training_Learning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/core/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    Fragment,
    FormElement,
    Input,
    Label,
    library,
    Filter,
    FilterOperator,
    ValueState
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Training_Learning.controller.AddEditTraining",
      {
          onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          sap.ui.getCore().attachValidationError(function (oEvent) {
            if (oEvent.getParameter("element").getRequired()) {
              oEvent.getParameter("element").setValueState(ValueState.Error);
            } else {
              oEvent.getParameter("element").setValueState(ValueState.None);
            }
          });
          sap.ui.getCore().attachValidationSuccess(function (oEvent) {
            oEvent.getParameter("element").setValueState(ValueState.None);
          });

          oRouter
            .getRoute("RouteAddEditT")
            .attachMatched(this._onRouteMatched, this);
          this._ValueState = library.ValueState;
          this._MessageType = library.MessageType;
        },

        _onRouteMatched: function (oEvent) {
          var sArgMode = oEvent.getParameter("arguments").mode;
          var sArgId = window.decodeURIComponent(
            oEvent.getParameter("arguments").id
          );
          this._initData(sArgMode, sArgId);
        },
        _initData: function (mParMode, mKey) {
            debugger;
          var oViewModel = new JSONModel({
            sIctbTitle: mParMode == "add" ? "Add" : "Edit",
            busy: false,
            mTrainingKey: mKey,
            mode: mParMode,
            edit: mParMode == "add" ? false : true,
            EditTb1FDL: false,
            EditTb2AST: false,
            TrainingDetails: {
              TrainingTypeId: null,
              Title: "",
              RewardPoints: null,
              StartDate: "",
              Url: "",
              StartTime: "",
              EndTime: "",
              Zone: null,
              Depot: null,
              Division: null,
              PainterType: null,
              PainterArcheType: null,
              Description: "",
            },
          });

          if (mParMode == "add") {
            this._showFormFragment("AddTraining");
            this.getView().unbindElement();
          } else {
          }

          this._formFragments; //used for the fragments of the add and edit forms
          this.getView().setModel(oViewModel, "oModelView");
          //this._initMessage(oViewModel);
          this.getView().getModel().resetChanges();
          //used to intialize the message class for displaying the messages
        },

        _showFormFragment: function (sFragmentName) {
          var objSection = this.getView().byId("oVbxSmtTbl");
          var oView = this.getView();
          objSection.destroyItems();
          var othat = this;
          this._getFormFragment(sFragmentName).then(function (oVBox) {
            oView.addDependent(oVBox);
            objSection.addItem(oVBox);
            // othat._setDataValue.call(othat);
          });
        },
        // _setDataValue: function () {
        //   var oInput = this.getView().byId("idAddAcntNum");
        //   oInput.addEventDelegate(
        //     {
        //       onAfterRendering: function () {
        //         var oInput = this.$().find(".sapMInputBaseInner");
        //         var oID = oInput[0].id;
        //         $("#" + oID).bind("cut copy paste", function (e) {
        //           e.preventDefault();
        //           return false;
        //         });
        //       },
        //     },
        //     oInput
        //   );
        // },

        _getFormFragment: function (sFragmentName) {
          var oView = this.getView();
          var othat = this;
          // if (!this._formFragments) {
          this._formFragments = Fragment.load({
            id: oView.getId(),
            name:
              "com.knpl.pragati.Training_Learning.view.fragments." + sFragmentName,
            controller: othat,
          }).then(function (oFragament) {
            return oFragament;
          });
          // }

          return this._formFragments;
        },

        /*
		 * @function
		 * Cancel current object action
		 */
        onCancel: function () {
            this.getRouter().navTo("worklist", true);
        },

        // onAfterRendering: function () {
        //     //Init Validation framework
        //     this._initMessage();
        // },

        // _initMessage: function () {
        //     //MessageProcessor could be of two type, Model binding based and Control based
        //     //we are using Model-binding based here
        //     var oMessageProcessor = this.getModel("oModelView");
        //     this._oMessageManager = sap.ui.getCore().getMessageManager();
        //     this._oMessageManager.registerMessageProcessor(oMessageProcessor);
        // },

		/* 
		 * @function
		 * Save edit or create FAQ details 
		 */
        onSave: function () {
            debugger;
            // this._oMessageManager.removeAllMessages();

            var oViewModel = this.getModel("oModelView");
            var oPayload = oViewModel.getProperty("/TrainingDetails");
                // oValid = this._fnValidation(oPayload);

            // if (oValid.IsNotValid) {
            //     this.showError(this._fnMsgConcatinator(oValid.sMsg));
            //     return;
            // }
            oViewModel.setProperty("/busy", true);
            this.CUOperation(oPayload);
        },

		/*
		 * To validate values of payload
		 * @constructor  
		 * @param data : data to be tested upon
		 * @returns Object
		 * @param IsNotValid : true for failed validation cases
		 * @param sMsg : Warning message to be shown for validation error
		 * 
		 * 
		 */
        _fnValidation: function (data) {
            var oReturn = {
                IsNotValid: false,
                sMsg: []
            },
                url = data.Url,
                aCtrlMessage = [];
            var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
            
            if (data.TrainingTypeId === "") {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTYPE");
                aCtrlMessage.push({
                    message: "MSG_PLS_ENTER_ERR_TTYPE",
                    target: "/TrainingDetails/TrainingTypeId"
                });
            } else 
            if (data.Title === "") {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TTL");
                aCtrlMessage.push({
                    message: "MSG_PLS_ENTER_ERR_TTL",
                    target: "/TrainingDetails/Title"
                });
            } else
            if (data.StartDate === "") {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TSDATE");
                aCtrlMessage.push({
                    message: "MSG_PLS_ENTER_ERR_TSDATE",
                    target: "/TrainingDetails/StartDate"
                });
            } else 
            if (data.StartTime === "" ) {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_PLS_ENTER_ERR_TSTIME");
                aCtrlMessage.push({
                    message: "MSG_PLS_ENTER_ERR_TSTIME",
                    target: "/TrainingDetails/StartTime"
                });
            } else 
            if (data.Url !== "" && !url.match(regex)) {
                oReturn.IsNotValid = true;
                oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
                aCtrlMessage.push({
                    message: "MSG_VALDTN_ERR_URL",
                    target: "/TrainingDetails/Url"
                });
            }

            if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
            return oReturn;
        },

        _genCtrlMessages: function (aCtrlMsgs) {
            var that = this,
                oViewModel = that.getModel("oModelView");
            aCtrlMsgs.forEach(function (ele) {
                that._oMessageManager.addMessages(
                    new sap.ui.core.message.Message({
                        message: that.getResourceBundle().getText(ele.message),
                        type: sap.ui.core.MessageType.Error,
                        target: ele.target,
                        processor: oViewModel,
                        persistent: true
                    }));
            });
        },

        _fnMsgConcatinator: function (aMsgs) {
            var that = this;
            return aMsgs.map(function (x) {
                return that.getResourceBundle().getText(x);
            }).join("");
        },

        CUOperation: function (oPayload) {
            debugger;
            var oViewModel = this.getModel("oModelView");
            oPayload.TrainingTypeId = parseInt(oPayload.TrainingTypeId);
            oPayload.RewardPoints = parseInt(oPayload.RewardPoints);
            // oPayload.Zone = parseInt(oPayload.Zone);
            // oPayload.Division = parseInt(oPayload.Division);
            // oPayload.Depot = parseInt(oPayload.Depot);
            // oPayload.PainterArcheType = parseInt(oPayload.PainterArcheType);
            // oPayload.PainterType = parseInt(oPayload.PainterType);
            var oClonePayload = $.extend(true, {}, oPayload),
                that = this;
            return new Promise(function (res, rej) {
                // if (oViewModel.getProperty("/sMode") === "E") {
                    // var sKey = that.getModel().createKey("/TrainingSet", {
                    //     Id: oClonePayload.Id
                    // });
                    // that.getModel().update(sKey, oClonePayload, {
                    //     success: function () {
                    //         oViewModel.setProperty("/busy", false);
                    //         that.getRouter().navTo("worklist", true);
                    //         that.showToast.call(that, "MSG_SUCCESS_UPDATE");
                    //         res(oClonePayload);
                    //         // that.onCancel();
                    //     },
                    //     error: function () {
                    //         oViewModel.setProperty("/busy", false);
                    //         rej();
                    //     }
                    // });
                // } else {
                    that.getModel().create("/TrainingSet", oClonePayload, {
                        success: function (data) {
                            oViewModel.setProperty("/busy", false);
                            that.getRouter().navTo("worklist", true);
                            that.showToast.call(that, "MSG_SUCCESS_TRAINING_CREATE");
                            res(data);
                            // that.onCancel();
                        },
                        error: function () {
                            oViewModel.setProperty("/busy", false);
                            rej();
                        }
                    });
                // }

            });
        }

      }
    );
  }
);