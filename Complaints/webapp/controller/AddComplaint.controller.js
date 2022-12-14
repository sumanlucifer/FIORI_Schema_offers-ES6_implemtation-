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
        "sap/m/Title",
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
        Title,
        customInt,
        cmbxDtype2
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.Complaints.controller.AddComplaint",
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
                        .getRoute("RouteAddCmp")
                        .attachMatched(this._onRouteMatched, this);
                    this._ValueState = library.ValueState;
                    this._MessageType = library.MessageType;
                    this.productNumber = 1;
                },
                _onRouteMatched: function (oEvent) {
                    this._GetServiceData();
                    var sId = oEvent.getParameter("arguments").Id;
                    this._initData("add", "", sId);
                },
                
                _GetServiceData: function () { },
                _initData: function (mParMode, mKey, mPainterId) {
                    var oViewModel = new JSONModel({
                        sIctbTitle: mParMode == "add" ? "Add" : "Edit",
                        busy: false,
                        mPainterKey: mKey,
                        addComplaint: {
                            PainterId: "",
                            ComplaintTypeId: "",
                            ComplaintTypeCode: "",
                            ComplaintSubtypeCode: "",
                            ComplaintSubTypeId: "",
                            ResolutionId: "",
                            ResolutionType: "",
                            Remark: "",
                            TokenCode: "",
                            RewardPoints: "",
                            RewardGiftId: "",
                            ResolutionOthers: "",
                            ComplaintDescription: "",
                            LanguageCode: "EN",
                            PainterComplainProducts: []
                        },
                        addCompAddData: {
                            MembershipCard: "",
                            Mobile: "",
                            Name: "",
                        },
                        addRewardPoint: [{
                            "ProductNum": this.productNumber,
                            "CategoryCode": "",
                            "ProductCode": "",
                            "PainterComplainProducts": {
                                "ProductSKUCode": "",
                                "ProductQuantity": 0,
                                "Points": 0,
                            }
                        }]
                    });

                    if (mParMode == "add") {
                        this._showFormFragment("AddComplaint");
                        this.getView().unbindElement();
                    } else {
                    }

                    var oDataControl = {
                        TokenCode: true,
                        tokenCodeValue: "",
                        ZoneId: "",
                        DivisionId: "",
                        Depot: "",
                        ProductCode: "",
                        CategoryCode: "",
                        resolutionDetail: false,
                        aQuantity: [{
                            value: "1",
                            key: 1
                        }, {
                            value: "2",
                            key: 2
                        }, {
                            value: "3",
                            key: 3
                        }, {
                            value: "4",
                            key: 4
                        }, {
                            value: "5",
                            key: 5
                        }, {
                            value: "6",
                            key: 6
                        }, {
                            value: "7",
                            key: 7
                        }, {
                            value: "8",
                            key: 8
                        }, {
                            value: "9",
                            key: 9
                        }, {
                            value: "10",
                            key: 10
                        }],
                        dBtn: false
                    };

                    var oModelControl = new JSONModel(oDataControl);
                    this.getView().setModel(oModelControl, "oModelControl");

                    this._formFragments; //used for the fragments of the add and edit forms
                    this.getView().setModel(oViewModel, "oModelView");
                    //this._initMessage(oViewModel);
                    this.getView().getModel().resetChanges();
                    //used to intialize the message class for displaying the messages
                    if (mPainterId !== "new") {
                        this._getPainterDetails(mPainterId);
                    }
                    // this._getMasterComplaintType();
                },


                _getPainterDetails: function (mParam) {
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oViewModel = oView.getModel("oModelView");
                    var sPath = "/PainterSet(" + mParam + ")";
                    oData.read(sPath, {
                        urlParameters: {
                            $expand: "Depot",
                            $select: 'ZoneId,Id,Mobile,Name,MembershipCard,Depot/Depot'
                        },
                        success: function (obj) {
                            oViewModel.setProperty(
                                "/addCompAddData/MembershipCard",
                                obj["MembershipCard"]
                            );
                            oViewModel.setProperty("/addCompAddData/Mobile", obj["Mobile"]);
                            oViewModel.setProperty("/addCompAddData/Name", obj["Name"]);
                            oViewModel.setProperty("/addComplaint/PainterId", obj["Id"]);

                        },
                        error: function () {

                        }
                    })



                },

                /**
                 * Event handler when we Select the Pack
                 * @public 
                 */
                onPackChange: function (oEvent) {
                    var oSelectedItem = oEvent.getSource().getSelectedItem().getBindingContext().getObject(),
                        sId = oEvent.getParameter('id').split('-')[oEvent.getParameter('id').split('-').length - 1],
                        oModelView = this.getModel("oModelView").getProperty("/addRewardPoint")[Number(sId)];
                    oModelView.PainterComplainProducts.Points = Number(oSelectedItem.Points);
                    // oModelView.setProperty("addRewardPoint/"+oId+"/PainterComplainProducts/Points", oSelectedItem.Points);
                },

                /**
                 * Event handler when we Select the Category filter the product 
                 * @public 
                 */
                filterProducts: function (oEvent) {
                    var aId = oEvent.getParameter("id").split("-");
                    var iIndex = aId[aId.length - 1];
                    var aAddRwdPoint = this._getRewardProductDetails(iIndex, "Product");
                    var oProdCtrl = this._setProductControl(oEvent.getSource(), 3);
                    this._resetAndfilter(oProdCtrl, aAddRwdPoint, "ProductCategory/Id");
                },
                /**
                 * Clear the fields
                 * @param {BigInteger} iIndex 
                 * @param {String} param1 
                 * @returns selected reward point details object
                 */
                _getRewardProductDetails: function (iIndex, param1) {
                    var oModelView = this.getView();
                    var oModelData = oModelView.getModel("oModelView");
                    var oAddRewardpoints = oModelData.getProperty('/addRewardPoint');

                    if (param1 === "Product") {
                        oModelData.setProperty(`/addRewardPoint/${iIndex}/ProductCode`, '');
                        oModelData.setProperty(`/addRewardPoint/${iIndex}/PainterComplainProducts/ProductSKUCode`, '');
                        oModelData.setProperty(`/addRewardPoint/${iIndex}/PainterComplainProducts/ProductQuantity`, '');
                    } else if (param1 === "Pack") {
                        oModelData.setProperty(`/addRewardPoint/${iIndex}/PainterComplainProducts/ProductSKUCode`, '');
                        oModelData.setProperty(`/addRewardPoint/${iIndex}/PainterComplainProducts/ProductQuantity`, '');
                    }
                    return oAddRewardpoints[iIndex];
                },

                /**
                 * Fetch the parent control
                 * @param {Object} oCtrl 
                 * @param {bigint} iIndex 
                 * @returns Object of Parent Control
                 */
                _setProductControl: function (oCtrl, iIndex) {
                    var oParentCtrl = oCtrl.getParent().getParent().getContent()[iIndex].getItems();
                    return oParentCtrl[oParentCtrl.length - 1];
                },

                /**
                 * Event handler when we select Product pack get filtered
                 * @param {*} oEvent 
                 */
                filterPacks: function (oEvent) {
                    var aId = oEvent.getParameter("id").split("-");
                    var iIndex = aId[aId.length - 1];
                    var aAddRwdPoint = this._getRewardProductDetails(iIndex, "Pack");
                    var oProdCtrl = this._setProductControl(oEvent.getSource(), 4);
                    this._resetAndfilter(oProdCtrl, aAddRwdPoint, "ProductCode");
                },

                /**
                 * Filtering the Item aggregation
                 * @param {Object} oCtrl 
                 * @param {String} sPropertyKey 
                 * @param {String} sFilterKey 
                 * @returns
                 */
                _resetAndfilter: function (oCtrl, sPropertyKey, sFilterKey) {
                    if (!oCtrl)
                        return;

                    var sKey;
                    if (sFilterKey === "ProductCategory/Id") {
                        sKey = sPropertyKey.CategoryCode;
                    } else if (sFilterKey === "ProductCode") {
                        sKey = sPropertyKey.ProductCode;
                    }
                    oCtrl.getBinding("items").filter([new Filter(sFilterKey, FilterOperator.EQ, sKey)]);
                },

                onPressSave: function () {
                    this.sServiceURI = this.getOwnerComponent(this)
                        .getManifestObject()
                        .getEntry("/sap.app").dataSources.mainService.uri;
                    var oModel = this.getView().getModel("oModelView");
                    var oValidator = new Validator();
                    var oVbox = this.getView().byId("idVbx");
                    var bValidation = oValidator.validate(oVbox, true);
                    var cTbleFamily = !oModel.getProperty("/EditTb1FDL");
                    var dTbleAssets = !oModel.getProperty("/EditTb2AST");

                    if (!bValidation) {
                        MessageToast.show(
                            "Kindly input all the mandatory(*) fields to continue."
                        );
                    }
                    if (bValidation) {
                        this.getRewardDetails();
                        this._postDataToSave();
                    }
                },

                getRewardDetails: function () {
                    var oViewModel = this.getView().getModel("oModelView");
                    var oAddRewardDetails = oViewModel.getProperty("/addRewardPoint");
                    var oAddCompData = oViewModel.getProperty("/addComplaint");
                    var data = [];
                    for (var i = 0; i < oAddRewardDetails.length; i++) {
                        // delete oAddRewardDetails[i].PainterComplainProducts.Points;
                        oAddRewardDetails[i].PainterComplainProducts.PainterId = oAddCompData.PainterId;
                        oAddRewardDetails[i].PainterComplainProducts.ProductQuantity = Number(oAddRewardDetails[i].PainterComplainProducts.ProductQuantity);
                        data.push(oAddRewardDetails[i].PainterComplainProducts);
                    }
                    oViewModel.setProperty("/addComplaint/PainterComplainProducts", data);
                },

                _postDataToSave: function () {
                    var oView = this.getView();
                    var oViewModel = oView.getModel("oModelView");

                    var oAddCompData = oViewModel.getProperty("/addComplaint");
                    var oModelContrl = oView.getModel("oModelControl");

                    // if tokecode property is set to true, we have make the string empty
                    //   if (oModelContrl.getProperty("/TokenCode") == true) {
                    //     oAddCompData["RewardPoints"] = "";
                    //     oAddCompData["TokenCode"] = "";
                    //   }
                    var oPayLoad = this._ReturnObjects(oAddCompData);
                    var othat = this;
                    var oData = this.getView().getModel();
                    //
                    if(oPayLoad.ComplaintTypeId === 7) {
                        oPayLoad.ComplaintSubTypeId = 23;
                        oPayLoad.ComplaintSubtypeCode = 16;
                    }

                    var c1, c2;
                    c1 = this._postCreateData(oPayLoad);

                    var oUploadItems = oView.byId("idUploadCollection").getItems();
                    c1.then(function (oData) {
                        if (oUploadItems.length > 0) {
                            c2 = othat._checkFileUpload(oData);
                            c2.then(function () {
                                othat.navPressBack();
                            });
                        } else {
                            othat.navPressBack();
                        }
                    });
                },

                /**
                 * Deleting the Reward Point details
                 * @param {*} oEvent 
                 * @returns 
                 */
                onPressDelete: function (oEvent) {
                    var aIndex = oEvent.getParameter("id").split("-");
                    var iIndex = aIndex[aIndex.length - 1];
                    var oParent = oEvent.getSource().getParent().getParent().getParent().getAggregation("content");
                    var oModel = this.getView().getModel("oModelView")
                    var oRewardPoint = oModel.getProperty("/addRewardPoint");
                    if (oParent.length === 1) {
                        return false;
                    }

                    oRewardPoint.splice(iIndex, 1);
                    oModel.setProperty("/addRewardPoint", oRewardPoint);
                    if (oRewardPoint.length === 1) {
                        this.getView().getModel('oModelControl').setProperty('/dBtn', false);
                    }
                    this.productNumber = this.productNumber - 1;
                },

                _postCreateData: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oData = this.getView().getModel();
                    var othat = this;
                    oData.create("/PainterComplainsSet", oPayLoad, {
                        success: function (oData) {
                            MessageToast.show("Complain Successfully Created");
                            promise.resolve(oData);
                            //othat.navPressBack();
                        },
                        error: function (a) {
                            MessageBox.error(
                                "Unable to create a complaint due to the server issues",
                                {
                                    title: "Error Code: " + a.statusCode,
                                }
                            );
                            promise.reject(a);
                        },
                    });
                    return promise;
                },
                _checkFileUpload: function (oData) {
                    var promise = jQuery.Deferred();
                    var UploadCollection = this.getView().byId("idUploadCollection");
                    var oItems = UploadCollection.getItems();
                    var othat = this;
                    var bFlag = false;
                    if (oData.hasOwnProperty("Id")) {
                        if (oData["Id"] !== null) {
                            if (oItems.length > 0) {
                                bFlag = true;
                            }
                        }
                    }

                    if (!bFlag) {
                        promise.resolve("NoFileUploadRequired");
                        return promise;
                    }
                    var sUrl =
                        "/KNPL_PAINTER_API/api/v2/odata.svc/" +
                        "PainterComplainsSet(" +
                        oData["Id"] +
                        ")/$value";

                    var async_request = [];

                    for (var x = 0; x < oItems.length; x++) {
                        var sFile = sap.ui.getCore().byId(oItems[x].getFileUploader())
                            .oFileUpload.files[0];

                        async_request.push(
                            jQuery.ajax({
                                method: "PUT",
                                url: sUrl,
                                cache: false,
                                contentType: false,
                                processData: false,
                                data: sFile,
                                success: function (data) { },
                                error: function () { },
                            })
                        );
                    }
                    if (oItems.length > 0) {
                        jQuery.when.apply(null, async_request).then(
                            function () {
                                // console.log("File successfully uploaded")
                                //promise.resolve("FileUpdated");
                            },
                            function () {
                                //promise.resolve("FileNot Uplaoded");
                            }
                        );
                    }
                    promise.resolve();
                    return promise;
                },
                _ReturnObjects: function (mParam) {
                    var obj = Object.assign({}, mParam);
                    var oNew = Object.entries(obj).reduce(
                        (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)),
                        {}
                    );

                    var patt1 = /Id/g;

                    for (var i in oNew) {
                        if (i.match(patt1) !== null) {
                            oNew[i] = parseInt(oNew[i]);
                        }
                        if (i === "RewardPoints") {
                            oNew[i] = parseInt(oNew[i]);
                        }
                    }
                    return oNew;
                },

                onCmpTypChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oViewModel = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var oCmbxSubType = oView.byId("idCompainSubType");
                    var oFilter = new Filter("ComplaintTypeId", FilterOperator.EQ, sKey);
                    oCmbxSubType.clearSelection();
                    oCmbxSubType.setValue("");
                    oCmbxSubType.getBinding("items").filter(oFilter);

                    // clearning the inreview and the resolution
                    //   oView.byId("scenario").setSelectedKey("");
                    //   oView.byId("resolution").setSelectedKey("");
                },

                /**
                 * Event Handler when we select Complaint Type filters the Complaint sub type field
                 * @param {*} oEvent 
                 */
                onComplainTypeChange: function (oEvent) {
                    // var sKey = oEvent.getSource().getSelectedKey();
                    // var oViewModel = this.getView().getModel();
                    // var oView = this.getView();
                    // var oCmxCmplnSubType = oView.byId("idCompainSubType");
                    // oCmxCmplnSubType.clearSelection();
                    // var sComplainTypeCode = oViewModel.getProperty("/MasterComplaintTypeSet(" + sKey + ")")["ComplaintTypeCode"];
                    // this.getView().getModel("oModelView").setProperty("/addComplaint/ComplaintTypeCode", Number(sComplainTypeCode));
                    // this._getMasterComplaintSubType();

                    var sKey = oEvent.getSource().getSelectedKey();
                    var oViewModel = this.getView().getModel();
                    var oView = this.getView();
                    var oCmbxSubType = oView.byId("idCompainSubType");
                    var oModeView = this.getView().getModel("oModelView");
                    var oModelControl = this.getView().getModel("oModelControl");
                    var sComplainTypeCode = oViewModel.getProperty("/MasterComplaintTypeSet(" + sKey + ")")["ComplaintTypeCode"];
                    var oFilter = new Filter("ComplaintTypeCode", FilterOperator.EQ, Number(sComplainTypeCode));
                    this.getView().getModel("oModelView").setProperty("/addComplaint/ComplaintTypeCode", Number(sComplainTypeCode));
                    oCmbxSubType.clearSelection();
                    oCmbxSubType.setValue("");
                    if (sKey == "") {
                        oCmbxSubType.getBinding("items").filter(null);
                    } else {
                        oCmbxSubType.getBinding("items").filter(oFilter);
                    }

                    if(sKey === "7") {
                        oModelControl.setProperty("/resolutionDetail", true);
                        this._getResolutionType();
                    }  else {
                        oModelControl.setProperty("/resolutionDetail", false);
                    }

                },
                /**
                 * Getting Complaint Sub type data
                 * @private
                 * @return 
                 */
                _getMasterComplaintSubType: function () {
                    var that = this;
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oModel = oView.getModel('oModelView');
                    var sLanguageCode = oModel.getProperty("/addComplaint/LanguageCode");
                    var sComplaintTypeCode = oModel.getProperty("/addComplaint/ComplaintTypeCode");
                    var sPath = "/MasterComplaintSubtypeSet";

                    oData.read(sPath, {
                        urlParameters: {
                            LanguageCode: sLanguageCode,
                            ComplaintTypeCode: sComplaintTypeCode
                        },
                        success: function (obj) {
                            var oMasterComplaintSubType = new JSONModel(obj);
                            that.getView().setModel(oMasterComplaintSubType, "MasterComplaintSubType");
                        },
                        error: function () { }
                    })
                },

                /**
                 * Getting Complaint Type data
                 * @private
                 * @return 
                 */
                _getMasterComplaintType: function () {
                    var that = this;
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oModel = oView.getModel('oModelView');
                    var sLanguageCode = oModel.getProperty("/addComplaint/LanguageCode");
                    var sPath = "/MasterComplaintTypeSet"

                    oData.read(sPath, {
                        urlParameters: {
                            LanguageCode: sLanguageCode
                        },
                        success: function (obj) {
                            var oMasterComplaintType = new JSONModel(obj);
                            that.getView().setModel(oMasterComplaintType, "MasterComplaintType");
                        },
                        error: function () { }
                    })
                },

                /**
                 * Fetching the resolution details and setting to model
                 */
                _getResolutionType: function () {
                    var that = this;
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oModel = oView.getModel('oModelView');
                    var sComplaintSubTypeCode = oModel.getProperty("/addComplaint/ComplaintSubtypeCode");
                    var sPath = "/MasterResolutionSet"

                    oData.read(sPath, {
                        urlParameters: {
                            $filter: 'IsArchived eq false and SubTypeCode eq 16'
                        },
                        success: function (obj) {
                            var oMasterResolution = new JSONModel(obj);
                            that.getView().setModel(oMasterResolution, "MasterResolution");
                        },
                        error: function () {

                        }
                    })
                },

                /**
                 * Event Handler on Change of Complaint Sub Type Resolution data get filtered
                 * @param {*} oEvent 
                 */
                onComplainSubTypeChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oViewModel = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var aAddComplaint = oViewModel.getProperty("/addComplaint");
                    var sComplainSubTypeCode = this.getView().getModel().getProperty("/MasterComplaintSubtypeSet(" + sKey + ")")["ComplaninSubTypeCode"];

                    if (sKey == "2" || sKey == "3") {
                        oViewModel.setProperty("/addComplaint/RewardPoints", "");
                        oViewModel.setProperty("/addComplaint/TokenCode", "");
                    }
                    // clearning the inreview and the resolution
                    oViewModel.setProperty("/addComplaint/ComplaintSubtypeCode", sComplainSubTypeCode);
                    oViewModel.setProperty("/addComplaint/ComplaintDescription", "");

                    
                },
                onSenarioChange: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var sSuTypeId = oView
                        .getModel("oModelView")
                        .getProperty("/addComplaint/ComplaintSubTypeId");

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
                onPressTokenCode: function () {
                    var oView = this.getView();
                    var oModelView = oView.getModel("oModelView");
                    var oModelControl = oView.getModel("oModelControl");
                    var oData = oView.getModel();
                    var sPainterId = oModelView.getProperty("/addComplaint/PainterId");
                    //  var sTokenCode = oModelControl.getProperty("/tokenCodeValue");

                    if (sPainterId == "") {
                        MessageToast.show("Kindly select a valid painter");
                        return;
                    }
                    if (sTokenCode == "") {
                        MessageToast.show("Kindly Input the token code.");
                        return;
                    }
                    oData.read("/QRCodeValidationAdmin", {
                        urlParameters: {
                            qrcode: "'" + sTokenCode + "'",
                            painterid: sPainterId,
                            channel: "'Complains'",
                        },
                        success: function (oData) {
                            if (oData !== null) {
                                if (oData.hasOwnProperty("Status")) {
                                    if (oData["Status"] == true) {
                                        oModelView.setProperty(
                                            "/addComplaint/RewardPoints",
                                            oData["RewardPoints"]
                                        );

                                        var patt1 = /Id/g;

                                        for (var i in oNew) {
                                            if (i.match(patt1) !== null) {
                                                oNew[i] = parseInt(oNew[i]);
                                            }
                                            if (i === "RewardPoints") {
                                                oNew[i] = parseInt(oNew[i]);
                                            }
                                        }
                                        return oNew;
                                    }
                                }
                            }
                        }
                    });
                },

                showQRCodedetails: function (data) {

                    var oModelView = this.getView().getModel("oModelView");
                    oModelView.setProperty("/QRCodeData", data);

                    if (!this.oQRCodeDialog) {
                        Fragment.load({ type: "XML", controller: this, name: "com.knpl.pragati.Complaints.view.fragments.QRCodeDetails" }).then(function (oDialog) {
                            this.oQRCodeDialog = oDialog;
                            this.getView().addDependent(oDialog);
                            oDialog.open();
                        }.bind(this));
                    } else {
                        this.oQRCodeDialog.open();
                    }



                },
                onTokenDlgClose: function () {
                    this.oQRCodeDialog.close();
                },
                onValueHelpRequest: function (oEvent) {
                    var sInputValue = oEvent.getSource().getValue(),
                        oView = this.getView();

                    if (!this._pValueHelpDialog) {
                        this._pValueHelpDialog = Fragment.load({
                            id: oView.getId(),
                            name:
                                "com.knpl.pragati.Complaints.view.fragments.ValueHelpDialog",
                            controller: this,
                        }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                    this._pValueHelpDialog.then(function (oDialog) {
                        // Create a filter for the binding
                        oDialog
                            .getBinding("items")
                            .filter([
                                new Filter(
                                    [
                                        new Filter(
                                            {
                                                path: "Name",
                                                operator: "Contains",
                                                value1: sInputValue.trim(),
                                                caseSensitive: false
                                            }
                                        ),
                                        new Filter(
                                            {
                                                path: "Mobile",
                                                operator: "Contains",
                                                value1: sInputValue.trim(),
                                                caseSensitive: false
                                            }
                                        ),
                                    ],
                                    false
                                ),
                            ]);
                        // Open ValueHelpDialog filtered by the input's value
                        oDialog.open(sInputValue);
                    });
                },
                onValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new Filter(
                        [
                            new Filter(
                                {
                                    path: "Name",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            ),
                            new Filter(
                                {
                                    path: "Mobile",
                                    operator: "Contains",
                                    value1: sValue.trim(),
                                    caseSensitive: false
                                }
                            )
                        ],
                        false
                    );

                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                onValueHelpClose: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    oEvent.getSource().getBinding("items").filter([]);
                    var oViewModel = this.getView().getModel("oModelView"),
                        oModelControl = this.getView().getModel("oModelControl");
                    if (!oSelectedItem) {
                        return;
                    }
                    var obj = oSelectedItem.getBindingContext().getObject();
                    oViewModel.setProperty(
                        "/addCompAddData/MembershipCard",
                        obj["MembershipCard"]
                    );
                    oViewModel.setProperty("/addCompAddData/Mobile", obj["Mobile"]);
                    oViewModel.setProperty("/addCompAddData/Name", obj["Name"]);
                    oViewModel.setProperty("/addComplaint/PainterId", obj["Id"]);

                    oModelControl.setProperty("/DivisionId", obj.DivisionId);
                    oModelControl.setProperty("/ZoneId", obj.ZoneId);

                    oModelControl.setProperty("/DepotId", "");
                    //Fallback as Preliminary context not supported
                    this._getDepot(obj.DepotId);
                    //DivisionId,ZoneId
                },
                _getDepot: function (sDepotId) {
                    if (!sDepotId) return;

                    var sPath = this.getModel().createKey("/MasterDepotSet", {
                        Id: sDepotId
                    }),
                        oModel = this.getModel("oModelControl");

                    this.getModel().read(sPath, {
                        success: ele => oModel.setProperty("/Depot", ele.Depot)
                    })

                },
                onAfterRendering: function () { },

                _initMessage: function (oViewModel) {
                    this._onClearMgsClass();
                    this._oMessageManager = sap.ui.getCore().getMessageManager();
                    var oView = this.getView();

                    oView.setModel(this._oMessageManager.getMessageModel(), "message");
                    this._oMessageManager.registerObject(oView, true);
                },
                onUploadFileTypeMis: function () {
                    MessageToast.show("Kindly upload a file of type jpg,jpeg,png");
                },
                onChangeResolution: function (oEvent) {
                    var sKey = oEvent.getSource().getSelectedKey();
                    var oView = this.getView();
                    var oModel = oView.getModel("oModelView");
                    var oMasterResolutionModel = oView.getModel();
                    var iResolutionType = oMasterResolutionModel.getProperty("/MasterResolutionSet(" + sKey + ")")["SubTypeCode"];

                    if (sKey !== 90) {
                        oModel.setProperty("/addComplaint/ResolutionOthers", "");
                    }
                    if (sKey === "8") {
                        this._getMasterProductCategory();
                    }
                    oModel.setProperty("/addComplaint/ResolutionId", sKey);
                    oModel.setProperty("/addComplaint/ResolutionType", iResolutionType);

                    // console.log(sKey)
                },

                _getMasterProductCategory: function () {
                    var that = this;
                    var oView = this.getView();
                    var oData = oView.getModel();
                    var oViewModel = oView.getModel("oModelView");
                    var sPath = "/MasterProductCategorySet";
                    oData.read(sPath, {
                        success: function (obj) {
                            // console.log(obj)
                            var oMasterProductCategory = new JSONModel(obj);
                            that.getView().setModel(oMasterProductCategory, "MasterProductCategory");
                        },
                        error: function () {

                        }
                    })
                },

                navPressBack: function () {
                    var oHistory = History.getInstance();
                    var sPreviousHash = oHistory.getPreviousHash();

                    if (sPreviousHash !== undefined) {
                        window.history.go(-1);
                    } else {
                        var oRouter = this.getOwnerComponent().getRouter();
                        oRouter.navTo("worklist", {}, true);
                    }
                },
                _showFormFragment: function (sFragmentName) {
                    var objSection = this.getView().byId("oVbxSmtTbl");
                    var oView = this.getView();
                    objSection.destroyItems();
                    var othat = this;
                    this._getFormFragment(sFragmentName).then(function (oVBox) {
                        oView.addDependent(oVBox);
                        objSection.addItem(oVBox);
                        othat._setUploadCollectionMethod.call(othat);
                    });
                },

                _getFormFragment: function (sFragmentName) {
                    var oView = this.getView();
                    var othat = this;
                    // if (!this._formFragments) {
                    this._formFragments = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.Complaints.view.fragments." + sFragmentName,
                        controller: othat,
                    }).then(function (oFragament) {
                        return oFragament;
                    });
                    // }

                    return this._formFragments;
                },

                _setUploadCollectionMethod: function () {
                    var oUploadCollection = this.getView().byId("idUploadCollection");

                    var othat = this;
                    oUploadCollection.__proto__._setNumberOfAttachmentsTitle = function (
                        count
                    ) {
                        var nItems = count || 0;
                        var sText;
                        // When a file is being updated to a new version, there is one more file on the server than in the list so this corrects that mismatch.
                        if (this._oItemToUpdate) {
                            nItems--;
                        }
                        if (this.getNumberOfAttachmentsText()) {
                            sText = this.getNumberOfAttachmentsText();
                        } else {
                            sText = this._oRb.getText("UPLOADCOLLECTION_ATTACHMENTS", [
                                nItems,
                            ]);
                        }
                        if (!this._oNumberOfAttachmentsTitle) {
                            this._oNumberOfAttachmentsTitle = new Title(
                                this.getId() + "-numberOfAttachmentsTitle",
                                {
                                    text: sText,
                                }
                            );
                        } else {
                            this._oNumberOfAttachmentsTitle.setText(sText);
                        }

                        othat._CheckAddBtnForUpload.call(othat, nItems);
                    };
                },
                _CheckAddBtnForUpload: function (mParam) {
                    var oUploadCol = this.getView().byId("idUploadCollection");

                    if (mParam == 1) {
                        oUploadCol.setUploadButtonInvisible(true);
                    } else if (mParam < 1) {
                        oUploadCol.setUploadButtonInvisible(false);
                    }
                },
                onExit: function () { },
                /**
                 * Event handler when se click on Add More Button 
                 * New Fields will be added (Category, Product, Pack, Quantity)
                 * @param {*} oEvent 
                 */
                onPressAddMore: function (oEvent) {
                    var oModel = this.getView().getModel("oModelView");
                    var oRwdDtlMdl = oModel.getProperty("/addRewardPoint");
                    var oValidator = new Validator();
                    var oGrid = this.getView().byId("idRewardDetails");
                    var bValidation = oValidator.validate(oGrid, true);

                    if (bValidation) {
                        this.productNumber = this.productNumber + 1;
                        oRwdDtlMdl.push({
                            "ProductNum": this.productNumber,
                            "CategoryCode": "",
                            "ProductCode": "",
                            "PainterComplainProducts": {
                                "ProductSKUCode": "",
                                "ProductQuantity": "",
                                "Points": "",
                            }
                        });

                        oModel.setProperty("/addRewardPoint", oRwdDtlMdl);
                        this.getView().getModel('oModelControl').setProperty('/dBtn', true);
                        oModel.refresh(true);

                    } else {
                        MessageToast.show(
                            "Kindly input all the mandatory(*) fields to continue."
                        );

                    }
                }
            }
        );
    }
);
