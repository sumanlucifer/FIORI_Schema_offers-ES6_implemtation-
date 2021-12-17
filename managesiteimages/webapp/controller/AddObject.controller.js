sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, ValueState, Fragment, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.knpl.pragati.managesiteimages.controller.AddObject", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {

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


            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Add").attachMatched(this._onRouterMatched, this);


        },
        _onRouterMatched: function (oEvent) {
            var sPainterId = oEvent.getParameter("arguments").Id;
            this._initData();
        },
        _initData: function () {
            var oView = this.getView();
            var othat = this;
            var c1, c2, c3, c4;
            var c1 = othat._AddObjectControlModel("Add", null);
            c1.then(function () {
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function () {
                        c3 = othat._DummyPromise("AddSiteImage");
                        c3.then(function () {
                            c4 = othat._openPainterPopOver();
                            c4.then(function () {
                                oView.getModel("oModelControl").setProperty("/PageBusy", false);
                            })

                        })
                    })
                })
            })

        },
        _DummyPromise: function () {
            var promise = jQuery.Deferred();
            promise.resolve()
            return promise;
        },
        onValueHelpConfirm: function (oEvent) {
            var sObject = oEvent.getParameter("selectedItem").getBindingContext().getObject();
            var oView = this.getView();
            var othat = this;
            var oModelControl = oView.getModel("oModelControl");
            oModelControl.setProperty("/PainterId", sObject["Id"]);
            oModelControl.setProperty("/PageBusy", true);
            var c1, c2, c3, c4, c5;
            c1 = this._Createportfolio(sObject["Id"]);
            c1.then(function (mParam1) {
                c2 = othat._DisplayDetailsPainter(mParam1);
                c2.then(function () {
                    c3 = othat._SetIconTabData();
                    c3.then(function () {
                        c4 = othat._AddTableFragment();
                        c4.then(function () {
                            c5 = othat._GetSelectedCategoryData();
                            c5.then(function () {
                                oModelControl.setProperty("/PageBusy", false);
                            })
                        })
                    })
                })
            })


        },
        onIcnTbarChange: function (oEvent) {
            var c1, c2, c3;
            var othat = this;
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            c1 = othat._AddTableFragment();
            oModelControl.setProperty("/PageBusy", true);
            c1.then(function () {
                c2 = othat._GetSelectedCategoryData();
                c2.then(function(){
                    oModelControl.setProperty("/PageBusy", false);
                })
            })
        },
        onApproveImage: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oModelControl = oView.getModel("oModelControl");
            var othat = this;
            var oBj = oSource.getBindingContext("oModelControl").getObject();
            var oPayload = Object.assign({}, oBj);
            oPayload["ApprovalStatus"] = "APPROVED";

            MessageBox.information(this.geti18nText("Message13"), {
                actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        this._ChangePortImageStatus(oPayload);

                    }
                }.bind(this)
            });


        },
        onRejectImage: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oModelControl = oView.getModel("oModelControl");
            var othat = this;
            var oBj = oSource.getBindingContext("oModelControl").getObject();
            var oPayload = Object.assign({}, oBj);
            oPayload["ApprovalStatus"] = "REJECTED";

            MessageBox.information(this.geti18nText("Message14"), {
                actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        this._ChangePortImageStatus(oPayload);

                    }
                }.bind(this)
            });


        },

        _ChangePortImageStatus: function (oPayload) {
            var c1, c2, c3;
            var oView = this.getView();
            var othat = this;
            var oModelControl = oView.getModel("oModelControl");
            oModelControl.setProperty("/PageBusy", true);
            c1 = othat._SendReqForImageStatus(oPayload);
            c1.then(function () {
                c2 = othat._GetSelectedCategoryData();
                c2.then(function () {
                    oModelControl.setProperty("/PageBusy", false);
                })
            })

        },
        _SendReqForImageStatus: function (oPayload) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");
            var oDataModel = oView.getModel();
            var sPath = "/PainterPortfolioImageSet(" + oPayload["Id"] + ")";
            return new Promise((resolve, reject) => {
                oDataModel.update(sPath, oPayload, {
                    success: function () {
                        resolve()
                    },
                    error: function () {
                        reject();
                    }
                })
            })

        },
        onDelteportFolioImage: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oModelControl = oView.getModel("oModelControl");
            var othat = this;

            var oBject = oSource.getBindingContext("oModelControl").getObject();
            if (oBject.hasOwnProperty("__metadata") && oBject.hasOwnProperty("Id")) {

                MessageBox.warning(this.geti18nText("Message12"), {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.YES],
                    onClose: function (sAction) {
                        if (sAction === "YES") {
                            this._SetUpDeleteRequeset(oBject);
                        }
                    }.bind(this)
                });

            } else {
                var sPath = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getPath()
                    .split("/");
                var oTable = oModelControl.getProperty("/TableData1");
                oTable.splice(sPath[sPath.length - 1], 1);
                oModelControl.refresh();
            }

        },
        _SetUpDeleteRequeset: function (oBject) {
            var oView = this.getView();
            var othat = this;
            var oModelControl = oView.getModel("oModelControl");
            oModelControl.setProperty("/PageBusy", true);
            var c1, c2, c3;
            c1 = othat._DeletPortRequest(oBject);
            c1.then(function () {
                c2 = othat._GetSelectedCategoryData();
                c2.then(function () {
                    oModelControl.setProperty("/PageBusy", false);
                    othat._showMessageToast("Message11")
                })
            })
        },
        _DeletPortRequest: function (mParam1) {
            var sId = mParam1["Id"];
            var oView = this.getView();
            var oDataModel = oView.getModel()
            var sPath = "/PainterPortfolioImageSet(" + sId + ")";
            return new Promise((resolve, reject) => {
                oDataModel.remove(sPath, {
                    success: function () {
                        resolve();
                    }
                })
            })

        },
        onCancelImagesTable: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oModelControl = oView.getModel("oModelControl")
            var oBject = oSource.getBindingContext("oModelControl").getObject();
            if (oBject.hasOwnProperty("__metadata") && oBject.hasOwnProperty("Id")) {
                oBject["editable"] = false;
                oModelControl.refresh();
            }
        },
        onSaveCategoryImage: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oModelControl = oView.getModel("oModelControl")
            var oBject = oSource.getBindingContext("oModelControl").getObject();
            var oControl = oSource.getParent().getParent().getCells()[0].getItems()[0];
            var othat = this;
            if (oControl.data()) {
                if (oControl.data()["type"] === "fileUploader") {
                    var sFile = oControl.oFileUpload.files[0];
                    if (sFile) {
                        var c1, c2;
                        oModelControl.setProperty("/PageBusy", true)
                        c1 = this._UploadNewImage(sFile, oBject);
                        c1.then(function () {
                            c2 = othat._GetSelectedCategoryData();
                            c2.then(function () {
                                oModelControl.setProperty("/PageBusy", false);
                                othat._showMessageToast("Meesage9");
                            })

                        })
                    } else {
                        this._showMessageToast("Message10");
                    }

                }
            }


        },
        _UploadNewImage: function (sFile, oBject) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl");

            var sPath1 = oModelControl.getProperty("/dataSource") + "PainterPortfolioImageSet(0)/$value";
            var sPath2 = "?painterId=" + oBject["PainterId"] + "&categoryId=" + oBject["PortfolioCategoryId"] + "&ApprovalStatus=PENDING";
            if (oBject.hasOwnProperty("__metadata") && oBject.hasOwnProperty("Id")) {
                sPath1 = oModelControl.getProperty("/dataSource") + "PainterPortfolioImageSet(" + oBject["Id"] + ")/$value";
            }
            var othat = this;
            var sTotalPath = sPath1 + sPath2;
            return new Promise((resolve, reject) => {
                jQuery.ajax({
                    method: "PUT",
                    url: sTotalPath,
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: sFile,
                    success: function (data) {
                        resolve()
                    },
                    error: function () {
                        reject()
                    },
                })

            })

        },
        onViewImage: function (oEvent) {
            var oView = this.getView();
            var oSource = oEvent.getSource();
            var oModelControl = oView.getModel("oModelControl")
            var oBject = oSource.getBindingContext("oModelControl").getObject();
            if (!this._ViewImageDialog) {
                Fragment.load({
                    id: oView.getId(),
                    controller: this,
                    name: oModelControl.getProperty("/resourcePath") + ".view.fragments.ViewImageDialog"
                }).then(function (oDialog) {
                    this._ViewImageDialog = oDialog;
                    oView.addDependent(this._ViewImageDialog);
                    this._BindElemetToViewImageDialog(oBject);

                }.bind(this))
            } else {
                this._BindElemetToViewImageDialog(oBject);
            }

        },
        _BindElemetToViewImageDialog: function (mParam) {
            var oView = this.getView();
            var sImage = oView.byId("idViewImage");
            var sURL = mParam["__metadata"]["media_src"];
            var src = "https://".concat(location.host, "/KNPL_PAINTER_API", new URL(sURL).pathname);
            sImage.setSrc(src);
            this._ViewImageDialog.open();
        },

        onPressAddNewImage: function (oEvent) {
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl")
            var oIcontTab = oView.byId("iconTabBar");
            var sKey = oIcontTab.getSelectedKey();
            var sObject = oView.byId("categoryTable").getParent().getBindingContext().getObject();
            var sMaxImages = sObject["MAXIMAGES"];
            var sPainterId = oModelControl.getProperty("/PainterId");
            var oTableData = oModelControl.getProperty("/TableData1");
            if (oEvent !== "add") {
                var oView = this.getView();

                var oObject = oEvent
                    .getSource()
                    .getBindingContext("oModelControl")
                    .getObject();
                oObject["editable"] = true;
                oModelControl.refresh();
                return;
            } else {
                var bFlag = true;

                if (oTableData.length > 0 && oTableData.length <= sMaxImages) {
                    for (var prop of oTableData) {
                        if (prop["editable"] == true) {
                            bFlag = false;
                            this._showMessageToast("Message7")
                            return;
                            break;
                        }
                    }
                }
                if (oTableData.length >= sMaxImages) {
                    this._showMessageToast("Message6", [sMaxImages])
                    bFlag = false;
                    return;
                }
                if (bFlag == true) {
                    oTableData.push({
                        ApprovalStatus: null,
                        editable: true,
                        PainterId: sPainterId,
                        PortfolioCategoryId: sObject["Id"],
                        Remark: null
                    });
                    //relvalue and editable properties are added here and will be removed in the postsave function
                }
                oModelControl.refresh();
            }

        },

        _GetSelectedCategoryData: function () {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl")
            var oIcontTab = oView.byId("iconTabBar");
            var sKey = oIcontTab.getSelectedKey();
            var oDataModel = oView.getModel();
            var sPainterId = oModelControl.getProperty("/PainterId");
            return new Promise((resolve, reject) => {
                oDataModel.read("/PainterPortfolioImageSet", {
                    filters: [new Filter("PortfolioCategoryId", FilterOperator.EQ, sKey), new Filter("PainterId", FilterOperator.EQ, sPainterId)],
                    success: function (oData) {
                        oModelControl.setProperty("/TableData1", oData["results"]);
                        resolve();
                    },
                    error: function () {

                    }
                })
            })
        },
        _AddTableFragment: function () {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl")
            var oIcontTab = oView.byId("iconTabBar");
            var sKey = oIcontTab.getSelectedKey();
            var oItems = oIcontTab.getItems();
            var sSelectedItem;
            for (var x of oItems) {
                x.destroyContent();
                if (x.getBindingContext().getObject()["Id"] == sKey) {
                    sSelectedItem = x;
                }
            }
            return Fragment.load({
                id: oView.getId(),
                name: oModelControl.getProperty("/resourcePath") + ".view.fragments.TableCategoryImages",
                controller: this
            }).then(function (oTable) {
                oView.addDependent(oTable);
                sSelectedItem.addContent(oTable)
                promise.resolve();
                return promise;
            });

        },
        _SetIconTabData: function () {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oModelControl = oView.getModel("oModelControl")
            var oIcontTab = oView.byId("iconTabBar");
            var oObject = oIcontTab.getItems()[0].getBindingContext().getObject();
            oModelControl.setProperty("/IconTabKey", oObject["Id"]);

            promise.resolve()
            return promise;
        },
        _DisplayDetailsPainter: function (mParam1) {
            var promise = jQuery.Deferred();
            var iPortFolioId = mParam1;
            var oView = this.getView();

            oView.bindElement({
                path: "/PainterPortfolioSet(" + iPortFolioId + ")",
                parameters: {
                    expand: "Painter/Depot",
                    select: "Id,PortfolioCode,Painter/Id,Painter/Name,Painter/MembershipCard,Painter/ZoneId,Painter/Depot/Depot,Painter/DivisionId"
                },
                events: {
                    dataRequested: function (oEvent) {

                    },
                    dataReceived: function (oEvent) {

                    },
                },
            });
            promise.resolve()
            return promise;
        },
        _Createportfolio: function (mParam1) {
            var iPainterId = mParam1;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oModelControl = oView.getModel("oModelControl")
            var oPayload = {
                "PainterId": iPainterId
            };
            return new Promise((resolve, reject) => {
                oDataModel.create("/PainterPortfolioSet", oPayload, {
                    success: function (oData) {
                        oModelControl.setProperty("/PortfolioId", oData["Id"]);
                        resolve(oData["Id"])
                    },
                    error: function (oData) {

                    }
                })
            })
        },
        _openPainterPopOver: function () {
            var promise = jQuery.Deferred();

            var oView = this.getView();

            if (!this._pValueHelpDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.knpl.pragati.managesiteimages.view.fragments.ValueHelpDialog",
                    controller: this,
                }).then(function (oDialog) {
                    this._pValueHelpDialog = oDialog
                    oView.addDependent(this._pValueHelpDialog);
                    this._pValueHelpDialog.open();
                }.bind(this));
            } else {
                this._pValueHelpDialog.open();
            }

            promise.resolve();
            return promise;
        },
        _setInitViewModel: function () {
            /*
             * Author: manik saluja
             * Date: 02-Dec-2021
             * Language:  JS
             * Purpose: Used to set the view data model that is binded to value fields of control in xml
             */
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var oDataView = {
                PainterId: "",
                PortfolioCategoryId: "",
                ApprovalStatus: "PENDING"
            }
            var oModel1 = new JSONModel(oDataView);
            oView.setModel(oModel1, "oModelView");

            var oPortfolioDataView = {
                PainterId: "",
                ApprovalStatus: "PENDING"
            }
            var oPortfolioModel1 = new JSONModel(oPortfolioDataView);
            oView.setModel(oModel1, "oPortfolioModelView");

            promise.resolve();
            return promise;
        },

        _LoadAddFragment: function (mParam) {
            var promise = jQuery.Deferred();
            var oView = this.getView();
            var othat = this;
            var oVboxProfile = oView.byId("oVBoxAddObjectPage");
            var sResourcePath = oView.getModel("oModelControl").getProperty("/resourcePath")
            oVboxProfile.destroyItems();
            return Fragment.load({
                id: oView.getId(),
                controller: othat,
                name: sResourcePath + ".view.fragments." + mParam,
            }).then(function (oControlProfile) {
                oView.addDependent(oControlProfile);
                oVboxProfile.addItem(oControlProfile);
                promise.resolve();
                return promise;
            });
        },

        onValueHelpRequest: function (oEvent) {

        },

        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter(
                [
                    new Filter({
                        path: "Name",
                        operator: "Contains",
                        value1: sValue.trim(),
                        caseSensitive: false
                    }),
                    new Filter({
                        path: "Mobile",
                        operator: "Contains",
                        value1: sValue.trim(),
                        caseSensitive: false
                    })
                ],
                false
            );

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpClose: function (oEvent) {
            this.onNavToHome();
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

        onPressSave: function () {
            var oModelContrl = this.getView().getModel("oModelControl");
            var bValidateForm = this._ValidateForm();
            // if (bValidateForm) {
            //     this._postDataToSave();
            // }

            if (bValidateForm) {
                var that = this;
                if (oModelContrl.getProperty("/oImage")) {
                    this._postDataToSave();
                } else {
                    MessageToast.show(that.geti18nText("errorMessage4"));
                }

            }

        },

        // _postDataToSave: function () {
        //     /*
        //      * Author: manik saluja
        //      * Date: 02-Dec-2021
        //      * Language:  JS
        //      * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
        //      */
        //     var oView = this.getView();
        //     var oData = this.getView().getModel();
        //     var oModelControl = oView.getModel("oModelControl");
        //     oModelControl.setProperty("/PageBusy", true);
        //     var othat = this;
        //     var c1, c2, c3, c4;
        //     c1 = othat._CheckEmptyFieldsPostPayload();
        //     c1.then(function (oPayload) {
        //         c2 = othat._CreateObject(oPayload);
        //         c2.then(function (oData) {
        //             c3 = othat._uploadFile(oData);
        //             c3.then(function () {
        //                 oModelControl.setProperty("/PageBusy", false);
        //                 othat.onNavToHome();
        //             })
        //         })
        //     })
        // },

        _postDataToSave: function () {
            /*
             * Author: manik saluja
             * Date: 02-Dec-2021
             * Language:  JS
             * Purpose: Payload is ready and we have to send the same based to server but before that we have to modify it slighlty
             */
            var oView = this.getView();
            var oData = this.getView().getModel();
            var oModelControl = oView.getModel("oModelControl");
            oModelControl.setProperty("/PageBusy", true);
            var othat = this;
            var c1, c2, c3, c4;
            c1 = othat._CheckEmptyFieldsPostPayload();
            // c1.then(function (oPayload) {
            //     c2 = othat._CreateObject(oPayload);
            c1.then(function (oPayload) {
                c2 = othat._uploadFile(oPayload);
                c2.then(function () {
                    oModelControl.setProperty("/PageBusy", false);
                    othat.onNavToHome();
                })
            })
            // })
        },

        // _CreateObject: function (oPayLoad) {
        //     //console.log(oPayLoad);
        //     var othat = this;
        //     var oView = this.getView();
        //     var oDataModel = oView.getModel();
        //     var oModelControl = oView.getModel("oModelControl");
        //     return new Promise((resolve, reject) => {
        //         oDataModel.create("/PainterPortfolioImageSet", oPayLoad, {
        //             success: function (data) {
        //                 MessageToast.show(othat.geti18nText("Message1"));
        //                 oModelControl.setProperty("/SiteImageId", data["Id"]);
        //                 resolve(data);
        //             },
        //             error: function (data) {
        //                 MessageToast.show(othat.geti18nText("errorMessage2"));
        //                 oModelControl.setProperty("/PageBusy", false);
        //                 reject(data);
        //             },
        //         });
        //     });
        // },

        _uploadFile: function (oData) {
            var that = this;
            var oModelContrl = this.getView().getModel("oModelControl");
            var oImage = this.getView().getModel("oModelControl").getProperty("/oImage");
            var newSpath = "/PainterPortfolioImageSet(0)";
            return new Promise(function (resolve, reject) {
                var settings = {
                    url: "/KNPL_PAINTER_API/api/v2/odata.svc" + newSpath + "/$value?painterId=" + oData.PainterId + "&categoryId=" + oData.PortfolioCategoryId,
                    data: oImage.Image,
                    method: "PUT",
                    headers: that.getModel().getHeaders(),
                    contentType: "image/png",
                    processData: false,
                    success: function (x) {
                        oModelContrl.setProperty("/busy", false);
                        MessageToast.show(that.geti18nText("Message4"));
                        resolve(x);
                    },
                    error: function (a) {
                        oModelContrl.setProperty("/busy", false);
                        MessageToast.show(that.geti18nText("errorMessage3"));
                        reject(a);
                    }
                };
                $.ajax(settings);
            })
        },

        onUpload: function (oEvent) {
            var oFile = oEvent.getSource().FUEl.files[0];
            this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
        },

        handleTypeMissmatch: function () {

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
        onFilteMisMatch: function () {
            this._showMessageToast("Message8")
        },

        _fnAddFile: function (oItem) {
            this.getModel("oModelControl").setProperty("/oImage", {
                Image: oItem.Image, //.slice(iIndex),
                FileName: oItem.name,
                IsArchived: false
            });
            this.getModel("oModelControl").refresh();
        },
        onExit: function () {
            console.log("exited the view");
        }

    });

});