sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        fmtLowerCase: function (mParam) {
            var sStatus = "";
            if (!mParam) {
                return "NA"
            }

            if (mParam.split("_").length > 1) {
                var mArray = mParam.split("_");

            } else {
                var mArray = mParam.split(" ");

            }
            for (var x of mArray) {
                var a = x.toLowerCase() + " ";
                var b = a[0].toUpperCase() + a.slice(1);

                sStatus += b;
            }
            return sStatus;
        },
        generateImageUrl: function (oMetadata, sId) {
            if (oMetadata) {
                if (oMetadata.media_src) {
                    return "https://".concat(
                        location.host,
                        "/KNPL_PAINTER_API",
                        new URL(oMetadata.media_src).pathname
                    );
                }
            }

            return "";

        },
        fmtAgeGrp: function (mParam1) {
            if (mParam1) {
                return mParam1 + " years";
            }
        },
        fmtAddress: function (mParam1, mParam2, mParam3) {
            if (mParam1) {
                return mParam1.trim() + ", " + mParam2 + ", " + mParam3;
            } else {
                return mParam2 + ", " + mParam3;
            }
        },
        formatURL: function (sURL) {
            if (sURL) {
                return "https://".concat(
                    location.host,
                    "/KNPL_PAINTER_API",
                    new URL(sURL).pathname
                );
            }
        },
        fmtCheckStatusColor: function (mParam) {
            if (mParam === "APPROVED") {
                return "Success";
            }
            if (mParam === "REJECTED") {
                return "Error";
            }
            if (mParam === "PENDING") {
                return "Warning";
            }
            return "None";
        },
        fmtBtnApproveImage: function (mParam1, mParam2) {
            if (!mParam1) {
                if (mParam2 === "PENDING") {
                    return true;
                }
            }
            return false;
        },
        fmtBtnRejectImage: function (mParam1, mParam2) {
            if (!mParam1) {
                if (mParam2 === "PENDING") {
                    return true;
                }
            }
            return false;
        },
        fmtCheckNull: function (mParam1) {
            if (!mParam1) {
                return "NA"
            }
            return mParam1;
        },
        fmtIcontabBartitle: function (mParam, mParam2) {
            var sStatus = "";


            if (mParam.split("_").length > 1) {
                var mArray = mParam.split("_");

            } else {
                var mArray = mParam.split(" ");

            }
            for (var x of mArray) {
                var a = x.toLowerCase() + " ";
                var b = a[0].toUpperCase() + a.slice(1);

                sStatus += b;
            }
            return sStatus + " (Max: " + mParam2 + ")";
        },
        fmtRemarksEnable: function (mParam) {
            var sPath = "/MasterPortfolioRejectionReasonSet(" + mParam + ")";
            var oData = this.getView().getModel().getProperty(sPath);
            if (oData !== undefined && oData !== null) {
                if (oData["Description"].trim().toLowerCase() === "other") {
                    return true;
                }
            }
            return false
        },
        fmtCheckUploadCount: function (mParam1, mParam2) {
            /*
                mparam1 > approval status
                mParam2 > upload count
            */
            if (mParam1 === "APPROVED") {
                if (mParam2 === 0) {
                    return false;
                }
            }
            return true;
        },
        fmtCheckCreatedName: function (mParam1, mParam2) {
            /*
                mParam1 > cratedbyId or UpdatedbyId
                mParam2 > Expansion CraetedByName/UpdatedByName
            */

            if (mParam1 === 0) {
                return "Mobile User"; 
            }
            if (mParam2) {
                return mParam2["Name"];
            }

            return mParam1;
        },
        fmtCheckToolTipEdit: function (mParam1, mParam2) {
            /*
                mparam1 > approval status
                mParam2 > upload count
            */

            if (mParam1 === "APPROVED") {
                if (mParam2 === 0) {
                    return "You can update the site image twice within 30 days from date of first approval.";
                }
            }
            return "Edit";
        },

    };

});