sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/layout/form/FormElement",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    Fragment,
    JSONModel,
    GroupElement,
    SmartField,
    FormElement,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return Controller.extend(
      "com.knpl.pragati.MasterDataManagement.controller.EditTable",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          this._formFragments = {};

          oRouter
            .getRoute("RouteEditTable")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var sArgsFields = window.decodeURIComponent(
            oEvent.getParameter("arguments").fields
          );
          var sArgesProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          ); //popperty
          var sArgesMode = oEvent.getParameter("arguments").mode;
          var sArgName = window.decodeURIComponent(
            oEvent.getParameter("arguments").name
          );
          console.log(sArgsFields,sArgesProp,sArgesMode,sArgName);
          
           this.getView().bindElement("/" + sArgesProp);
          this._initData(sArgsFields,sArgesMode,sArgName,sArgesProp);
          this._showFormFragment("EditDepo");
        },
        _initData: function (sArgsType,sArgesMode,sArgName,sArgesProp) {
          var oData = {
            edit:sArgesMode=="edit"?true:false,
            modelProp:sArgesProp,
            prop1: "Group Title",
            prop2: [],
            titleP1:sArgesMode=="edit"?'Edit':"Add New",
            titleP2:sArgName,
            addData:{}
          };
          
         
          
          var aArray = sArgsType.split(",");
          for (var prop in aArray) {
            oData["prop2"].push({
              value: aArray[prop],
            });
            oData["addData"][aArray[prop]]=""
          };
          console.log(oData);
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelView");
        },
        myFactory: function (sId, oContext) {
            var sEdit = oContext.getModel().getProperty("/edit");
            console.log(sEdit);
          // var oSmartControl = new GroupElement(sId,{
          //     label:oContext.getObject()["value"],

          //     elements:[new SmartField({
          //         width:"60%",
          //         value:"'{"+ oContext.getObject()["value"]+"}'"
          //     })]
          // });
          // var oSmartControl = new SmartField({
          //         showLabel:true,
          //         textLabel:oContext.getObject()["value"],
          //         value:"'{"+ oContext.getObject()["value"]+"}'"
          //     })
          var oSmartControl = new FormElement({
            label: oContext.getObject()["value"],
            fields: [
              new sap.m.Input({
                value:sEdit==true? "{" + oContext.getObject()["value"] + "}":"{oModelView>/addData/" + oContext.getObject()["value"] + "}",
              }),
            ],
          });

          return oSmartControl;
        },
        onPressSave:function(){
            if(this.getView().getModel("oModelView").getProperty("/edit")){
                this._saveEdit();
            }else{
                this._saveAdd();
            }
        },
        _saveEdit:function(){
            var oDataModel = this.getView().getModel();
            var oView = this.getView();
            var oModelView = oView.getModel("oModelView");
             var sTitle = oModelView.getProperty("/titleP2");
            var oDataValue = oDataModel.getProperty(oView.getElementBinding().getPath());
            var oPrpReq = oModelView.getProperty("/prop2");
            var oPayload = {};
            for(var x in oPrpReq){
                oPayload[oPrpReq[x]["value"]]=oDataValue[oPrpReq[x]["value"]];
            }
            
           oDataModel.update(oView.getElementBinding().getPath(),oPayload,{
               success:function(data){
                   MessageToast.show(sTitle+" Successfully Updated.")
               },
               error:function(data){
                    var oRespText = JSON.parse(data.responseText);
                    MessageBox.error(oRespText["error"]["message"]["value"]);
               }
           })

        },
        _saveAdd:function(){
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oMdlView = oView.getModel("oModelView");
            var sEntity= "/"+oMdlView.getProperty("/modelProp");
            var aPayload = oMdlView.getProperty("/addData");
            var sTitle = oMdlView.getProperty("/titleP2");
            oDataModel.create(sEntity,aPayload,{
                success:function(data){
                    MessageToast.show(sTitle+" Successfully Created.")
                },
                error:function(data){
                    var oRespText = JSON.parse(data.responseText);
                    MessageBox.error(oRespText["error"]["message"]["value"]);
                }
            })
        },
        _getFormFragment: function (sFragmentName) {
          var pFormFragment = this._formFragments[sFragmentName],
            oView = this.getView();
          var othat = this;
          if (!pFormFragment) {
            pFormFragment = Fragment.load({
              id: oView.getId(),
              name:
                "com.knpl.pragati.MasterDataManagement.view." + sFragmentName,
              controller: othat,
            });
            this._formFragments[sFragmentName] = pFormFragment;
          }

          return pFormFragment;
        },

        _showFormFragment: function (sFragmentName, mType, mId) {
          // console.log(mType + "/" + mId);
          var objSection = this.getView().byId("objSec1");
          var oView = this.getView();
          objSection.removeAllBlocks();
          this._getFormFragment(sFragmentName).then(function (oVBox) {
            // if (mId !== "add") {
            //   oVBox.bindElement({
            //     path: "/" + mType + "/" + mId,
            //     model: "tableData",
            //   });
            // } else {
            //   oVBox.unbindObject("tableData");
            // }
            oView.addDependent(oVBox);
            objSection.addBlock(oVBox);
          });
        },
      }
    );
  }
);
