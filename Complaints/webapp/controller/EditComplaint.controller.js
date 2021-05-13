sap.ui.define(
  [
    "com/knpl/pragati/Complaints/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
    "sap/m/DatePicker",
    "sap/ui/core/ValueState",
    "com/knpl/pragati/Complaints/controller/Validator",
    "sap/ui/model/type/Date",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "com/knpl/pragati/Complaints/model/customInt",
    "com/knpl/pragati/Complaints/model/cmbxDtype2",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    MessageBox,
    MessageToast,
    Fragment,
    FormElement,
    Input,
    Label,
    library,
    Message,
    DatePicker,
    ValueState,
    Validator,
    DateType,
    Sorter,
    Filter,
    FilterOperator,
    DateFormat,
    History,
    formatter,
    customInt,
    cmbxDtype2
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Complaints.controller.EditComplaint",
      {
        formatter: formatter,
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter(this);
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

          //Himank: Workflow interaction model
           this.oWorkflowModel = new JSONModel();
            this.getView().setModel(this.oWorkflowModel,"wfmodel")                    
         //End

          oRouter
            .getRoute("RouteEditCmp")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );
          var oView = this.getView();
          var sExpandParam = "ComplaintType,Painter,ComplaintSubtype,PainterComplainsHistory";

          //console.log(oProp);

          this._initData(oProp);

           
        },
        _getExecLogData: function(sWorkFlowInstanceId){
            //for Test case scenerios delete as needed
            if(!sWorkFlowInstanceId)
                sWorkFlowInstanceId = "41d8a91e-af04-11eb-a0a8-eeee0a81ec84"

            var sUrl = "/comknplpragatiComplaints/bpmworkflowruntime/v1/workflow-instances/" + sWorkFlowInstanceId + "/execution-logs";

            this.oWorkflowModel.loadData(sUrl); 
  
    
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: "PainterComplainsSet(" + oProp + ")",
            TokenCode: true,
            tokenCodeValue: "",
            ImageLoaded: false,
            ComplainResolved: false,
            ProbingSteps: "",
            ComplainCode: "",
            ComplainId: oProp,
          };
          var oDataModel;
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl");
          var othat = this;
          this._sErrorText = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle()
            .getText("errorText");
          var oBindProp = oData["bindProp"];
          var c1, c2, c3, c4;
          c1 = othat._loadEditProfile("Display");
              //this._getExecLogData();
          c1.then(function () {
               //Himank: TODO: Load Workflow data, will have to pass workflow instanceId in future
         
            c2 = othat._setDisplayData(oBindProp);
            c2.then(function () {
              c3 = othat._initEditData(oBindProp);
              c3.then(function () {
                c4 = othat._CheckImage(oBindProp);
              });
            });
          });
        },
        _setDisplayData: function (oProp) {
          var promise = jQuery.Deferred();
          var oView = this.getView();

          var sExpandParam = "ComplaintType,Painter,ComplaintSubtype,PainterComplainsHistory";
          var othat = this;
          if (oProp.trim() !== "") {
            oView.bindElement({
              path: "/" + oProp,
              parameters: {
                expand: sExpandParam,
              },
              events: {
                dataRequested: function (oEvent) {
                  oView.setBusy(true);
                },
                dataReceived: function (oEvent) {
                  oView.setBusy(false);
                },
              },
            });
          }
          promise.resolve();
          return promise;
        },
        _initEditData: function (oProp) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var oDataValue = "";
          var othat = this;
          var exPand = "PainterComplainsHistory";
          oView.getModel().read("/" + oProp, {
              urlParameters: {
              //$expand: exPand,
            },
            success: function (data) {
              var oViewModel = new JSONModel(data);
              //console.log(data);
              oView.setModel(oViewModel, "oModelView");
              othat._setInitData();
            },
            error: function () {},
          });
          promise.resolve();
          return promise;
        },
        _setInitData: function () {
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          // setting the resolved flag if we have the value from backend;
          if (oModelView.getProperty("/ComplaintStatus") === "RESOLVED" || oModelView.getProperty("/ComplaintStatus") === "WITHDRAWN") {
           
            oModelControl.setProperty("/ComplainResolved", true);
            oModelControl.setProperty("/TokenCode", false);
          }
          //setting the filtering for the scenario and Type Id
          var sComplainSubType = oModelView.getProperty("/ComplaintSubtypeId");
          var sComplaintStatus = oModelView.getProperty("/ComplaintStatus");
          var aResolutionFilter = [];

          if (sComplainSubType !== "") {
            aResolutionFilter.push(
              new Filter("TypeId", FilterOperator.EQ, sComplainSubType)
            );
            oView
              .byId("FormattedText")
              .bindElement(
                "/MasterComplaintSubtypeSet(" + sComplainSubType + ")"
              );
          }
          oView
            .byId("resolution")
            .getBinding("items")
            .filter(aResolutionFilter);

          var sReqFields = ["TokenCode", "RewardPoints"];
          var sValue = "",
            sPlit;

          for (var k of sReqFields) {
            sValue = oModelView.getProperty("/" + k);
            sPlit = k.split("/");
            if (sPlit.length > 1) {
              if (
                toString.call(oModelView.getProperty("/" + sPlit[0])) !==
                "[object Object]"
              ) {
                oModelView.setProperty("/" + sPlit[0], {});
              }
            }
            if (sValue == undefined) {
              oModelView.setProperty("/" + k, "");
            }
          }
          //setting token code scenario
          if (oModelView.getProperty("/TokenCode") !== "") {
            oModelControl.setProperty(
              "/tokenCodeValue",
              oModelView.getProperty("/TokenCode")
            );
            oModelControl.setProperty("/TokenCode", false);
          }
          //set data for the smart table
          oModelControl.setProperty(
            "/ComplainCode",
            oModelView.getProperty("/ComplaintCode")
          );
          oView.byId("smartHistory").rebindTable();
        },
        _CheckImage: function (oProp) {
          var oView = this.getView();
          var oModelControl = this.getView().getModel("oModelControl");
          var sImageUrl =
            "/KNPL_PAINTER_API/api/v2/odata.svc/" + oProp + "/$value";
          jQuery
            .get(sImageUrl)
            .done(function () {
              oModelControl.setProperty("/ImageLoaded", true);
              console.log("Image Exist");
            })
            .fail(function () {
              oModelControl.setProperty("/ImageLoaded", false);
              console.log("Image Doesnt Exist");
            });
        },
        _loadEditProfile: function (mParam) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var othat = this;
          var oVboxProfile = oView.byId("idVbx");
          var sFragName = mParam == "Edit" ? "EditProfile" : "DisplayComplaint";
          oVboxProfile.destroyItems();
          return Fragment.load({
            id: oView.getId(),
            controller: othat,
            name: "com.knpl.pragati.Complaints.view.fragments." + sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
            promise.resolve();
            return promise;
          });
        },
        onPressTokenCode: function (oEvent) {
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var sTokenCode = oModelControl.getProperty("/tokenCodeValue").trim();
          if (sTokenCode == "") {
            MessageToast.show("Kindly enter the token code to continue");
            return;
          }

          var oData = oView.getModel();

          oData.read("/QRCodeValidationAdmin", {
            urlParameters: {
              qrcode: "'" + sTokenCode + "'",
              painterid: oModelView.getProperty("/PainterId"),
              channel: "'Complains'",
            },
            success: function (oData) {
              if (oData !== null) {
                if (oData.hasOwnProperty("Status")) {
                  if (oData["Status"] == true) {
                    oModelView.setProperty(
                      "/RewardPoints",
                      oData["RewardPoints"]
                    );
                    oModelControl.setProperty("/TokenCode", false);
                    oModelView.setProperty("/TokenCode", sTokenCode);
                    MessageToast.show(oData["Message"]);
                  } else if (oData["Status"] == false) {
                    oModelView.setProperty("/RewardPoints", "");
                    oModelView.setProperty("/TokenCode", "");
                    oModelControl.setProperty("/tokenCodeValue", "");
                    oModelControl.setProperty("/TokenCode", true);
                    MessageToast.show(oData["Message"]);
                  }
                }
              }
            },
            error: function () {},
          });
        },
        onViewAttachment: function (oEvent) {
          var oButton = oEvent.getSource();
          var oView = this.getView();
          if (!this._pKycDialog) {
            Fragment.load({
              name:
                "com.knpl.pragati.Complaints.view.fragments.AttachmentDialog",
              controller: this,
            }).then(
              function (oDialog) {
                this._pKycDialog = oDialog;
                oView.addDependent(this._pKycDialog);
                this._pKycDialog.open();
              }.bind(this)
            );
          } else {
            oView.addDependent(this._pKycDialog);
            this._pKycDialog.open();
          }
        },
        onPressCloseDialog: function (oEvent) {
          oEvent.getSource().getParent().close();
        },
        onDialogClose: function (oEvent) {
          this._pKycDialog.open().destroy();
          delete this._pKycDialog;
        },
        handleSavePress: function () {
          var oModel = this.getView().getModel("oModelView");
          var oValidator = new Validator();
          var oVbox = this.getView().byId("idVbx");
          var bValidation = oValidator.validate(oVbox, true);
          if (bValidation == false) {
            MessageToast.show(
              "Kindly input the fields in proper format to continue."
            );
          }
          if (bValidation) {
            this._postDataToSave();
          }
        },
        onChangeResolution: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sKey = oEvent.getSource().getSelectedKey();
          if (sKey !== 90) {
            oModel.setProperty("/ResolutionOthers", "");
          }
          //console.log(oModel);
        },
        onScenarioChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey();
          var oView = this.getView();
          var sSuTypeId = oView
            .getModel("oModelView")
            .getProperty("/ComplaintSubtypeId");

          var oResolution = oView.byId("resolution");
          //clearning the serction for the resolution
          var aFilter = [];
          if (sKey) {
            aFilter.push(new Filter("Scenario", FilterOperator.EQ, sKey));
          }
          if (sSuTypeId !== "") {
            aFilter.push(new Filter("TypeId", FilterOperator.EQ, sSuTypeId));
          }
          oResolution.setSelectedKey("");

          oResolution.getBinding("items").filter(aFilter);
        },
        _postDataToSave: function () {
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");

          var oData = oView.getModel();
          var sPath = oView.getElementBinding().getPath();
          var oViewData = oView.getModel("oModelView").getData();
          var oPayload = Object.assign({}, oViewData);
          for (var a in oPayload) {
            if (oPayload[a] === "") {
              oPayload[a] = null;
            }
          }
          var othat = this;
          oData.update(sPath, oPayload, {
            success: function () {
              MessageToast.show("Complaint Sucessfully Updated");
              oData.refresh(true);
              othat.onNavBack();
            },
            error: function (a) {
              MessageBox.error(othat._sErrorText, {
                title: "Error Code: " + a.statusCode,
              });
            },
          });

          //var oProp =
        },
        handleCancelPress: function () {
          this.onNavBack();
        },
        onNavBack: function (oEvent) {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("worklist", {}, true);
          }
        },
        onBeforeRebindHistoryTable: function (oEvent) {
          var oView = this.getView();

          var sComplainCode = oView
            .getModel("oModelControl")
            .getProperty("/ComplainCode");

          var oBindingParams = oEvent.getParameter("bindingParams");
          var oFilter = new Filter(
            "ComplaintCode",
            FilterOperator.EQ,
            sComplainCode
          );
          oBindingParams.filters.push(oFilter);
          oBindingParams.sorter.push(new Sorter("UpdatedAt", true));
        },

        fmtStatus: function (sStatus) {
          var newStatus = "";
          if (sStatus === "REGISTERED") {
            newStatus = "Registered";
          } else if (sStatus === "INREVIEW") {
            newStatus = "In Review";
          } else if (sStatus === "RESOLVED") {
            newStatus = "Resolved";
          } else if (sStatus === "WITHDRAWN") {
            newStatus = "Withdrawn";
          }

          return newStatus;
        },
        fmtDate: function (mDate) {
          var date = new Date(mDate);
          var oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "dd/MM/YYYY h:mm a",
            UTC: true,
            strictParsing: true,
          });
          return oDateFormat.format(date);
        },
        fmtProbingSteps: function (mParam) {
          if (mParam === null) {
            return "NA";
          }
          return mParam;
        },
      }
    );
  }
);
