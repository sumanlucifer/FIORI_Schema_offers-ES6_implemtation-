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
            if(!mParam){
                return 
            }
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
            return sStatus;
        },
        fmtCheckNull: function (mParam1) {
            if (!mParam1) {
                return "NA"
            }
            return mParam1;
        },
        fmtGenerateImageUrl: function (mMetadata) {
            // mMetadata (string) is required from the odata responce "__metadata"
            if (mMetadata) {
                if (mMetadata.media_src) {
                    return "https://".concat(
                        location.host,
                        "/KNPL_PAINTER_API",
                        new URL(mMetadata.media_src).pathname
                    );
                }
            }

            return "";

        },
        fmtStatusColorChange: function (mParam) {
            if (mParam === "APPROVED") {
                return "Success";
            }
            if (mParam === "PUBLISHED") {
                return "Success";
            }
            if (mParam === "PENDING") {
                return "Warning";
            }
            return "Error";
        },
    };

});