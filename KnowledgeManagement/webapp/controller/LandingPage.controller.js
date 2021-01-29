sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("com.knpl.pragati.KnowledgeManagement.controller.LandingPage", {
            onInit: function () {
                this._addSearchFieldAssociationToFB();
            },

            _addSearchFieldAssociationToFB: function () {
                let oFilterBar = this.getView().byId("filterbar");
                let oSearchField = oFilterBar.getBasicSearch();
                var oBasicSearch;
                if (!oSearchField) {
                    // @ts-ignore
                    oBasicSearch = new sap.m.SearchField({
                        showSearchButton: false
                    });
                } else {
                    oSearchField = null;
                }

                oFilterBar.setBasicSearch(oBasicSearch);

                oBasicSearch.attachBrowserEvent("keyup", function (e) {
                    if (e.which === 13) {
                        this.onSearch();
                    }
                }.bind(this)
                );
            },
        });
    });
