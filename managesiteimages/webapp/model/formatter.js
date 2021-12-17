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
            if(!mParam){
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

            if (oMetadata && oMetadata.media_src) {

                return "/KNPL_PAINTER_API" + "/PainterSet(" + sId + ")$value";
            }
            return "";
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
            return "Information";
        },

        fmtCheckNull: function (mParam1) {
            if (!mParam1) {
                return "NA"
            }
            return mParam1;
        }
    };

});