sap.ui.define(
    [
        "com/knpl/pragati/MDM/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Sorter",
        "com/knpl/pragati/MDM/controller/Validator",
        "sap/ui/core/ValueState",
        "com/knpl/pragati/MDM/model/formatter",
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
        Filter,
        FilterOperator,
        Sorter,
        Validator,
        ValueState,
        formatter
    ) {
        "use strict";

        return BaseController.extend(
            "com.knpl.pragati.MDM.controller.BannerDetail", {
                formatter: formatter,

                onInit: function () {
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.getRoute("bannerDetail").attachMatched(this._onRouteMatched, this);
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
                },

                _onRouteMatched: function (oEvent) {
                    var oProp = window.decodeURIComponent(
                        oEvent.getParameter("arguments").prop
                    );
                    var sMode = window.decodeURIComponent(
                        oEvent.getParameter("arguments").mode
                    );
                    var oView = this.getView();
                    // To display or View details use bindElement
                    if (oProp.trim() !== "") {
                        oView.bindElement({
                            path: "/MobileBannerImageSet(" + oProp + ")"
                        });
                    }
                    this._initData(oProp);
                },

                _initData: function (oProp) {
                    var oData = {
                        mode: "Display",
                        bindProp: "MobileBannerImageSet(" + oProp + ")",
                        oImage: "/KNPL_PAINTER_API/api/v2/odata.svc/MobileBannerImageSet(" + oProp + ")/$value"
                    };
                    var oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "oModelControl2");
                    this._showFormFragment("DetailBannerImage");
                },

                _showFormFragment: function (sFragmentName) {
                    var objSection = this.getView().byId("oVbxSmtTbl");
                    var oView = this.getView();
                    objSection.destroyItems();
                    var othat = this;
                    this._getFormFragment(sFragmentName).then(function (oVBox) {
                        oView.addDependent(oVBox);
                        objSection.addItem(oVBox);
                    });
                },

                _getFormFragment: function (sFragmentName) {
                    var oView = this.getView();
                    var othat = this;
                    this._formFragments = Fragment.load({
                        id: oView.getId(),
                        name: "com.knpl.pragati.MDM.view.fragment." + sFragmentName,
                        controller: othat,
                    }).then(function (oFragament) {
                        return oFragament;
                    });
                    return this._formFragments;
                },

                handleCancelPress: function () {
                    this.onNavBack();
                },

                handleEditPress: function (oEvent) {
                    var oView = this.getView();
                    var oCtrl2Model = oView.getModel("oModelControl2");
                    oCtrl2Model.setProperty("/mode", "Edit");
                    oCtrl2Model.setProperty("/busy", true);
                    var oProp = oCtrl2Model.getProperty("/bindProp");
                    var c1, c2, c3;
                
                    var othat = this;
                    c1 = othat._LoadEditFragment("BannerImageForm");
                    c1.then(function () {
                        c2 = othat._initEditData(oProp);
                        c2.then(function (data) {
                            c3 = othat._editControllerData(data);
                        });
                    });
                },
                _LoadEditFragment:function(){
                    var oView = this.getView();
                    var promise = jQuery.Deferred();
                    var othat = this;
                    var oVboxProfile = oView.byId("oVbxSmtTbl");
                    var sFragName = "BannerImageForm";
                    oVboxProfile.destroyItems();
                    return Fragment.load({
                        id: oView.getId(),
                        controller: othat,
                        name: "com.knpl.pragati.MDM.view.fragment." + sFragName,
                    }).then(function (oControlProfile) {
                        oView.addDependent(oControlProfile);
                        oVboxProfile.addItem(oControlProfile);
                        promise.resolve();
                        return promise;
                    });

                },
                _editControllerData: function (data) {
                    console.log(data)
                    var promise = jQuery.Deferred();
                    var oView = this.getView();
                    var oDataValue = "";
                    var othat = this;

                    var oDataControl = {
                        mode: "Edit",
                        StartTime: "",
                        EndTime: "",
                        //showPreviewImageButton: false,
                        busy: false,

                    };
                    var oModelControl = new JSONModel(oDataControl);
                    this.getView().setModel(oModelControl, "oModelControl");

                    var oViewModel = new JSONModel(data);
                    oView.setModel(oViewModel, "oModelView");

                    oView.getModel("oModelControl2").setProperty("/busy", false);
                    promise.resolve();
                    return promise;
                    //othat.getModel("oModelControl2").refresh();
                },

                _initEditData: function (oProp) {


                    var oView = this.getView();
                    var oDataValue = "";
                    var othat = this;


                    return new Promise(function (resolve, reject) {
                        oView.getModel().read("/" + oProp, {
                            success: function (data) {



                                resolve(data);
                            },
                            error: function (a) {
                                oView.getModel("oModelControl2").setProperty("/busy", false);
                                reject(a);
                            },
                        });
                    })




                },

                onUpload: function (oEvent) {
                    var oFile = oEvent.getSource().FUEl.files[0];
                    this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
                },

                handleTypeMissmatch: function () {

                },

                onImageView: function (oEvent) {
                    var oButton = oEvent.getSource();
                    var oView = this.getView();
                    var oThat = this;
                    if (!oThat.ImageDialog) {
                        Fragment.load({
                            name: "com.knpl.pragati.MDM.view.fragment.ImageDialog",
                            controller: oThat,
                        }).then(
                            function (oDialog) {
                                oView.addDependent(oDialog);
                                oThat.ImageDialog = oDialog;
                                oDialog.open();
                            });
                    } else {
                        oThat.ImageDialog.open();
                    }
                },

                onPressCloseImageDialog: function () {
                    this.ImageDialog.close();
                },

                getImageBinary: function (oFile) {
                    var oFileReader = new FileReader();
                    var sFileName = oFile.name;
                    return new Promise(function (res, rej) {

                        if (!(oFile instanceof File)) {
                            res(oFile);
                            return;
                        }

                        oFileReader.onload = function () {
                            res({
                                Image: oFileReader.result,
                                name: sFileName
                            });
                        };
                        res({
                            Image: oFile,
                            name: sFileName
                        });
                    });
                },

                _fnAddFile: function (oItem) {
                    this.getModel("oModelControl").setProperty("/oImage", {
                        Image: oItem.Image, //.slice(iIndex),
                        FileName: oItem.name,
                        IsArchived: false
                    });
                    this.getModel("oModelControl").setProperty("/showPreviewImageButton", true);
                    this.getModel("oModelControl").refresh();
                },

                handleSavePress: function () {
                    var oModel = this.getView().getModel("oModelView");
                    var oValidator = new Validator();
                    var oVbox = this.getView().byId("idVbx");
                    var bValidation = oValidator.validate(oVbox, true);
                    var oModelContrl = this.getView().getModel("oModelControl");
                    debugger;
                    if (bValidation == false) {
                        MessageToast.show(
                            "Kindly input all the mandatory(*) fields to continue."
                        );
                    }
                    if (bValidation) {
                        if (oModelContrl.getProperty("/oImage")) {
                            this._putDataToSave();
                        } else {
                            MessageToast.show(
                                "Kindly upload Banner Image to continue."
                            );
                        }

                    }
                },

                _putDataToSave: function () {
                    var oView = this.getView();
                    var oViewModel = oView.getModel("oModelView");
                    var oAddData = oViewModel.getData();
                    debugger;
                    var oPayLoad = this._ReturnObjects(oAddData);
                    var othat = this;
                    var oData = this.getView().getModel();
                    var c1, c2;
                    c1 = this._putUpdateData(oPayLoad);
                    c1.then(function (oData) {
                        c2 = othat._ImageUpload(oPayLoad);
                        c2.then(function () {
                            othat.onNavBack();
                        });
                    });
                },

                _ImageUpload: function (oPayLoad) {
                    debugger;
                    var that = this;
                    var promise = jQuery.Deferred();
                    var oImage = this.getView().getModel("oModelControl").getProperty("/oImage");
                    var newSpath = "/MobileBannerImageSet(" + oPayLoad.Id + ")";
                    // return new Promise(function (res, rej) {
                    var settings = {
                        url: "/KNPL_PAINTER_API/api/v2/odata.svc" + newSpath + "/$value",
                        data: oImage.Image,
                        method: "PUT",
                        headers: that.getModel().getHeaders(),
                        contentType: "image/png",
                        processData: false,
                        success: function (x) {
                            // promise.resolve(x);
                            MessageToast.show("Banner Image Successfully Updated");
                            that.onNavBack();
                        },
                        error: function (a) {
                            // promise.reject(a);
                            MessageToast.show(
                                "Error in updating Banner Image"
                            );
                        }
                    };

                    $.ajax(settings);
                    // return promise;
                    // });
                },

                _putUpdateData: function (oPayLoad) {
                    var promise = jQuery.Deferred();
                    var oData = this.getView().getModel();
                    var othat = this;
                    // var path = "/MobileBannerImageSet(" + oPayLoad.Id + ")";
                    debugger;
                    var sKey = othat.getModel().createKey("/MobileBannerImageSet", {
                        Id: oPayLoad.Id
                    });
                    oData.update(sKey, oPayLoad, {
                        success: function (oData) {
                            // MessageToast.show("Banner Image Successfully Created");
                            promise.resolve(oData);
                        },
                        error: function (a) {
                            MessageBox.error(
                                "Unable to update Banner Image due to server issues", {
                                    title: "Error Code: " + a.statusCode,
                                }
                            );
                            promise.reject(a);
                        },
                    });
                    return promise;
                },

                _ReturnObjects: function (mParam) {
                    var obj = Object.assign({}, mParam);
                    var oNew = Object.entries(obj).reduce(
                        (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)), {}
                    );

                    var patt1 = /Id/g;

                    for (var i in oNew) {
                        if (i.match(patt1) !== null) {
                            oNew[i] = parseInt(oNew[i]);
                        }
                    }
                    return oNew;
                }
            }

        );
    }
);