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

          oRouter
            .getRoute("RouteEditCmp")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );
          var oView = this.getView();
          var sExpandParam = "ComplaintType,Painter,ComplaintSubtype";

          //console.log(oProp);

          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: oProp,
            TokenCode: true,
            tokenCodeValue: "",
            ImageLoaded: false,
            ComplainResolved:false,
          };
          var oDataModel;
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl");
          var othat = this;
          this._sErrorText = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle()
            .getText("errorText");
          var c1, c2, c3, c4;
          c1 = othat._loadEditProfile("Display");
          c1.then(function () {
            c2 = othat._setDisplayData(oProp);
            c2.then(function () {
              c3 = othat._initEditData(oProp);
              c3.then(function () {
                c4 = othat._CheckImage(oProp);
              });
            });
          });
        },
        _setDisplayData: function (oProp) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var sExpandParam = "ComplaintType,Painter,ComplaintSubtype";
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
         
          oView.getModel().read("/" + oProp, {
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
          if(oModelView.getProperty("/ComplaintStatus")==="RESOLVED"){
              console.log("Status is resolved");
              oModelControl.setProperty("/ComplainResolved",true);
              oModelControl.setProperty("/TokenCode", false);
          }

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
          
        },
        _CheckImage: function (oProp) {
            var oView = this.getView();
            var oModelControl = this.getView().getModel("oModelControl");
            var sImageUrl = "/KNPL_PAINTER_API/api/v2/odata.svc/"+oProp+"/$value"
          jQuery.get(sImageUrl)
            .done(function () {
                oModelControl.setProperty("/ImageLoaded",true);
              console.log("Image Exist");
            })
            .fail(function () {
                oModelControl.setProperty("/ImageLoaded",false);
              console.log("Image Doesnt Exist")
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
              channel:"'Complains'"
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
          if (sKey !== 22) {
            oModel.setProperty("/ResolutionOthers", "");
          }
          //console.log(oModel);
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
      }
    );
  }
);
