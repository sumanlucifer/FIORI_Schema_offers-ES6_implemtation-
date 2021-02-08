sap.ui.define(
  [
    "com/knpl/pragati/MasterDataManagement/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (BaseController, JSONModel, MessageBox, MessageToast, Fragment,Filter,FilterOperator) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.MasterDataManagement.controller.MasterData",
      {
        onInit: function () {
          

          this._fragment;
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter
            .getRoute("RouteMaster")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oQuery = oEvent.getParameter("arguments")["?query"];
          console.log(oQuery);
          var aValidKeys = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ];
          var sKey = 0;
          if (oQuery && aValidKeys.indexOf(oQuery.tab) > -1) {
            sKey = oQuery.tab;
          }
          this._setData();
          this._initFragment(sKey);
        },
        _setData: function () {
          var oData = {
            smtTblEty: "MasterExternalLinksSet",
            smtTblFlds: "Title,Description,Url",
            IcnTbFilName: "External Links",
            busy:false
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oCtrlMdl");
          this.getView().getModel().resetChanges();
          //this.getView().getModel().refresh(true);
        },
        _initFragment: function (mKey) {
          console.log("InitFragment");
          var oView = this.getView();
          var oIctbar = oView.byId("idIconTabBarFiori2");
          var oItemFirst = oIctbar.getItems()[parseInt(mKey)];
          oIctbar.setSelectedKey(mKey.toString());
          oIctbar.fireSelect({
            key: mKey.toString(),
            item: oItemFirst,
          });
        },
        onNavBtnPress: function () {
          console.log("onNavButtonPress");
        },
        onBeforeRebindTable: function (oEvent) {
          var mBindingParams = oEvent.getParameter("bindingParams");
          console.log(mBindingParams);

          console.log("omBeforeBindingTrigerred");
          // to apply the sort
          mBindingParams.sorter = [
            new sap.ui.model.Sorter({
              path: "CreatedAt",
              descending: true,
            }),
          ];
           mBindingParams.filters = [
             new Filter("IsArchived",FilterOperator.NE,"true")
           ]
          // to short the sorted column in P13N dialog
          // to prevent applying the initial sort all times
        },
        onSectIctb: function (oEvent) {
          console.log("selectTrigerred");
          var oView = this.getView();
          var sKey = oEvent.getSource().getSelectedKey();
          var oCtrlMdl = oView.getModel("oCtrlMdl");
          var oVBox = oView.byId("oVbxSmtTbl");
          oVBox.destroyItems();
          var oFragment = Fragment.load({
            id: oView.getId(),
            name:
              "com.knpl.pragati.MasterDataManagement.view.DisplayTableMaster",
            controller: this,
          }).then(function (oControl) {
            oVBox.addItem(oControl);
          });
          var sItbFilName = oEvent.getParameter("item").getText();
          oCtrlMdl.setProperty("/IcnTbFilName", sItbFilName);
          if (sKey == "0") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterExternalLinksSet");
            oCtrlMdl.setProperty("/smtTblFlds", "Title,Description,Url");
          } else if (sKey == "1") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterDepotSet");
            oCtrlMdl.setProperty("/smtTblFlds", "Depot");
          } else if (sKey == "2") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterKycTypeSet");
            oCtrlMdl.setProperty("/smtTblFlds", "KycType");
          } else if (sKey == "3") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterReligionSet");
            oCtrlMdl.setProperty("/smtTblFlds", "Religion");
          } else if (sKey == "4") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterTrainingTypeSet");
            oCtrlMdl.setProperty("/smtTblFlds", "TrainingType");
          } else if (sKey == "5") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterBusinessGroupSet");
            oCtrlMdl.setProperty("/smtTblFlds", "BusinessGroup");
          } else if (sKey == "6") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterBusinessCategorySet");
            oCtrlMdl.setProperty("/smtTblFlds", "BusinessCategory");
          } else if (sKey == "7") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterArcheTypeSet");
            oCtrlMdl.setProperty("/smtTblFlds", "ArcheType");
          } else if (sKey == "8") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterMaritalStatusSet");
            oCtrlMdl.setProperty("/smtTblFlds", "MaritalStatus");
          } else if (sKey == "9") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterLanguageSet");
            oCtrlMdl.setProperty(
              "/smtTblFlds",
              "Language,LanguageCode,LanguageDescription"
            );
          } else if (sKey == "10") {
            oCtrlMdl.setProperty("/smtTblEty", "MasterComplaintTypeSet");
            oCtrlMdl.setProperty("/smtTblFlds", "ComplaintType");
          }
        },

        onPressEdit: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          var sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .substr(1);
          var oFields = this.getView()
            .getModel("oCtrlMdl")
            .getProperty("/smtTblFlds");
          var oIctbar = this.getView().byId("idIconTabBarFiori2");
          var sSelectedKey = oIctbar.getSelectedKey();
          var sName = oIctbar.getItems()[parseInt(sSelectedKey)].getText();
          oRouter.navTo("RouteEditTable", {
            fields: window.encodeURIComponent(oFields),
            prop: window.encodeURIComponent(sPath),
            mode: "edit",
            name: window.encodeURIComponent(sName),
            key: sSelectedKey,
          });
        },
        onPressAddBtn: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();

          var oView = this.getView();
          var oCtrlMdodel = oView.getModel("oCtrlMdl");
          var oFields = oView.getModel("oCtrlMdl").getProperty("/smtTblFlds");
          var sPath = oCtrlMdodel.getProperty("/smtTblEty");
          var sName = oCtrlMdodel.getProperty("/IcnTbFilName");
          oRouter.navTo("RouteEditTable", {
            fields: window.encodeURIComponent(oFields),
            prop: window.encodeURIComponent(sPath),
            mode: "add",
            name: window.encodeURIComponent(sName),
            key: this.getView().byId("idIconTabBarFiori2").getSelectedKey(),
          });
        },
        onPressRemove: function (oEvent) {
          var othat = this;
          var oView = this.getView();
          var sPath = oEvent.getSource().getBindingContext().getPath();
          var oBject = oEvent.getSource().getBindingContext().getObject();
          var oModel = this.getView().getModel();
          var oTitle = oView.getModel("oCtrlMdl").getProperty("/IcnTbFilName");
          var oPayload = {
            IsArchived: true,
          };
          console.log(sPath);
          MessageBox.confirm("Kindly confirm to remove " + oTitle, {
            actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],

            onClose: function (sAction) {
              if (sAction == "OK") {
                oModel.update(sPath, oPayload, {
                  success: function () {
                    MessageToast.show(oTitle + " Sucessfully Deleted.");
                    console.log(oView.getModel());
                    oView.byId("smartTable").getModel().refresh();
                  },
                  error: function () {
                    MessageBox.error("Unable to delete the data.");
                  },
                });
                // oModel.refresh(true);
                // oView.byId("smartTable").rebindTable();
              }
            },
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
            0: "eventsData",
            1: "depoData",
          };
          var oRouter = this.getOwnerComponent().getRouter();
          var sParam = oJSON[sKey];
          oRouter.navTo("RouteEditTable", {
            type: sParam,
            id: "add",
          });
        },
        handleSortButtonPressed: function () {
          this._openDialog("Dialog");
        },
        _openDialog: function (sName, sPage, fInit) {
          var oView = this.getView();

          // creates requested dialog if not yet created
          if (!this._mDialogs[sName]) {
            this._mDialogs[sName] = Fragment.load({
              id: oView.getId(),
              name:
                "com.knpl.pragati.MasterDataManagement.view.DialogViewSetting",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              if (fInit) {
                fInit(oDialog);
              }
              return oDialog;
            });
          }
          this._mDialogs[sName].then(function (oDialog) {
            // opens the requested dialog
            oDialog.open();
          });
        },
      }
    );
  }
);
