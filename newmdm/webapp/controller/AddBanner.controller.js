sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/library",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "com/knpl/pragati/MDM/model/cmbxDtype2",
    "com/knpl/pragati/MDM/controller/Validator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, library, ValueState, Fragment, cmbxDtype2, Validator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.MDM.controller.AddBanner", {
        cmbxDtype2: cmbxDtype2,
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data

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
                .getRoute("addBanner")
                .attachMatched(this._onRouteMatched, this);
            this._ValueState = library.ValueState;
            this._MessageType = library.MessageType;
        },

        _onRouteMatched: function (oEvent) {
            this._GetServiceData();
            var sId = oEvent.getParameter("arguments").Id;
            this._initData("add", "", sId);
        },

        _GetServiceData: function () { },

        _initData: function (mParMode) {
            var oViewModel = new JSONModel({
                Title: "",
                StartTime: null,
                EndTime: null
            });

            if (mParMode == "add") {
                this._showFormFragment("BannerImageForm");
                this.getView().unbindElement();
            } else { }

            var oDataControl = {
                StartTime: "",
                EndTime: "",
                showPreviewImageButton: false,
                busy: false,
                mode: "Add"
            };

            var oModelControl = new JSONModel(oDataControl);
            this.getView().setModel(oModelControl, "oModelControl");

            this._formFragments; //used for the fragments of the add and edit forms
            this.getView().setModel(oViewModel, "oModelView");
            //this._initMessage(oViewModel);
            this.getView().getModel().resetChanges();

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

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
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

        onPressSave: function () {
            var oModel = this.getView().getModel("oModelView");
            var oValidator = new Validator();
            var oVbox = this.getView().byId("idVbx");
            var bValidation = oValidator.validate(oVbox, true);
            var oModelContrl = this.getView().getModel("oModelControl");

            if (bValidation == false) {
                MessageToast.show(
                    "Kindly input all the mandatory(*) fields to continue."
                );
            }
            if (bValidation) {
                if (oModelContrl.getProperty("/oImage")) {
                    oModelContrl.setProperty("/busy", true);
                    this._postDataToSave();
                } else {
                    MessageToast.show(
                        "Kindly upload Banner Image to continue."
                    );
                }

            }
        },

        _postDataToSave: function () {
            var oView = this.getView();
            var oViewModel = oView.getModel("oModelView");
            var oAddData = oViewModel.getData();
            var oPayLoad = this._ReturnObjects(oAddData);
            var othat = this;
            var oData = this.getView().getModel();
            var c1, c2;
            c1 = this._postCreateData(oPayLoad);
            c1.then(function (oData) {
                c2 = othat._ImageUpload(oData);
                c2.then(function () {
                    othat.navPressBackBanner();
                });
            });
        },

        _ImageUpload: function (oData) {
            var that = this;
            var oModelContrl = this.getView().getModel("oModelControl");
            var oImage = this.getView().getModel("oModelControl").getProperty("/oImage");
            var newSpath = "/MobileBannerImageSet(" + oData.Id + ")";
            return new Promise(function (resolve, reject) {
                var settings = {
                    url: "/KNPL_PAINTER_API/api/v2/odata.svc" + newSpath + "/$value",
                    data: oImage.Image,
                    method: "PUT",
                    headers: that.getModel().getHeaders(),
                    contentType: "image/png",
                    processData: false,
                    success: function (x) {
                        oModelContrl.setProperty("/busy", false);
                        MessageToast.show("Banner Image Successfully Uploaded");
                        resolve(x);
                    },
                    error: function (a) {
                        oModelContrl.setProperty("/busy", false);
                        MessageToast.show("Banner Image creation failed");
                        reject(a);
                    }
                };
                $.ajax(settings);
            })
        },

        _postCreateData: function (oPayLoad) {
            var oData = this.getView().getModel();
            var othat = this;
            return new Promise(function (resolve, reject) {
                oData.create("/MobileBannerImageSet", oPayLoad, {
                    success: function (oData) {
                        resolve(oData);
                    },
                    error: function (a) {
                        MessageBox.error(
                            "Unable to create Banner Image due to server issues", {
                            title: "Error Code: " + a.statusCode,
                        }
                        );
                        reject(a);
                    },
                });
            })
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

    });

});