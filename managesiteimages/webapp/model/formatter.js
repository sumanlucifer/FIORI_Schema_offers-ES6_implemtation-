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
                if (mParam2 === "PENDING" || mParam2 === "REJECTED") {
                    return true;
                }
            }
            return false;
        },
        fmtBtnRejectImage: function (mParam1, mParam2) {
            if (!mParam1) {
                if (mParam2 === "PENDING" || mParam2 === "APPROVED") {
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
        }
    };

});