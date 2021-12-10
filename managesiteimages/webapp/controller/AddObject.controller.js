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
            var c1, c2, c3;
            var c1 = othat._AddObjectControlModel("Add", null);
            c1.then(function () {
                c1.then(function () {
                    c2 = othat._setInitViewModel();
                    c2.then(function () {
                        c3 = othat._LoadAddFragment("AddSiteImage");
                        c3.then(function () {
                            oView.getModel("oModelControl").setProperty("/PageBusy", false);
                        })
                    })
                })
            })

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
                PortfolioStatus: "PENDING"
            }
            var oModel1 = new JSONModel(oDataView);
            oView.setModel(oModel1, "oModelView");

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
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name:
                        "com.knpl.pragati.managesiteimages.view.fragments.ValueHelpDialog",
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
            var oModelControl = this.getView().getModel("oModelControl");
            var oModelView = this.getView().getModel("oModelView");
            if (!oSelectedItem) {
                return;
            }
            var obj = oSelectedItem.getBindingContext().getObject();
            oModelView.setProperty("/PainterId", obj["Id"]);

            oModelControl.setProperty("/MembershipCard", obj["MembershipCard"]);
            oModelControl.setProperty("/Mobile", obj["Mobile"]);
            oModelControl.setProperty("/Name", obj["Name"]);
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

        // onSiteCategoryChange: function (oEvent) {
        //     var oModelControl = this.getModel("oModelControl");
        //     var aFilter = [];
        //     var sId = oEvent.getSource().getSelectedKey();
        //     if (sId) {
        //         oModelControl.setProperty("/hasPainterSite", oEvent.getSource().getSelectedItem().getBindingContext().getObject().HasPainterSite);
        //         if (oEvent.getSource().getSelectedItem().getBindingContext().getObject().HasPainterSite === true) {
        //             var oPainterSite = this.getView().byId("idPainterSite");
        //             var oPainterSiteItems = oPainterSite.getBinding("items");
        //             oPainterSite.clearSelection();
        //             oPainterSite.setValue("");
        //             aFilter.push(new Filter("IsArchived", FilterOperator.EQ, false));
        //             aFilter.push(new Filter("SiteCategoryId", FilterOperator.EQ, sId));
        //             oPainterSiteItems.filter(aFilter);
        //         }
        //     } else {
        //         oModelControl.setProperty("/hasPainterSite", false);
        //     }
        // },

        onPressSave: function () {
            var bValidateForm = this._ValidateForm();
            if (bValidateForm) {
                this._postDataToSave();
            }

        },
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
            c1.then(function (oPayload) {
                c2 = othat._CreateObject(oPayload);
                c2.then(function (oData) {
                    c3 = othat._uploadFile(oData);
                    c3.then(function () {
                        oModelControl.setProperty("/PageBusy", false);
                        othat.onNavToHome();
                    })
                })
            })
        },

        _CreateObject: function (oPayLoad) {
            //console.log(oPayLoad);
            var othat = this;
            var oView = this.getView();
            var oDataModel = oView.getModel();
            var oModelControl = oView.getModel("oModelControl");
            return new Promise((resolve, reject) => {
                oDataModel.create("/PainterPortfolioSet", oPayLoad, {
                    success: function (data) {
                        MessageToast.show(othat.geti18nText("Message1"));
                        oModelControl.setProperty("/SiteImageId", data["Id"]);
                        resolve(data);
                    },
                    error: function (data) {
                        MessageToast.show(othat.geti18nText("errorMessage2"));
                        oModelControl.setProperty("/PageBusy", false);
                        reject(data);
                    },
                });
            });
        },

        _uploadFile: function (oData) {
            var that = this;
            var oModelContrl = this.getView().getModel("oModelControl");
            var oImage = this.getView().getModel("oModelControl").getProperty("/oImage");
            var newSpath = "/PainterPortfolioSet(" + oData.Id + ")";
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
                        MessageToast.show("Portfolio Image Successfully Uploaded");
                        resolve(x);
                    },
                    error: function (a) {
                        oModelContrl.setProperty("/busy", false);
                        MessageToast.show("Portfolio Image creation failed");
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

        _fnAddFile: function (oItem) {
            this.getModel("oModelControl").setProperty("/oImage", {
                Image: oItem.Image, //.slice(iIndex),
                FileName: oItem.name,
                IsArchived: false
            });
            this.getModel("oModelControl").refresh();
        }

    });

});