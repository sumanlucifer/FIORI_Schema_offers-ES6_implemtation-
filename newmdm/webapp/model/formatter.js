sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        numberUnit: function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },
        fmtStatus: function (mParam) {
            var sLetter = "";
            if (mParam) {
                sLetter = mParam
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
            }

            return sLetter;
        },

        fmtLowerCase: function (mParam) {
            var sStatus = "";
            if (mParam) {
                sStatus = mParam;
                sStatus = sStatus.toLowerCase();
                var aCharStatus = sStatus.split("");
                if (aCharStatus.indexOf("_") !== -1) {
                    aCharStatus[aCharStatus.indexOf("_") + 1] = aCharStatus[
                        aCharStatus.indexOf("_") + 1
                    ].toUpperCase();
                    aCharStatus.splice(aCharStatus.indexOf("_"), 1, " ");
                }
                aCharStatus[0] = aCharStatus[0].toUpperCase();
                sStatus = aCharStatus.join("");
            }

            return sStatus;
        },

        giveImage: function (ImageData) {
            if (ImageData) {
                return ImageData;
            }
            return "";
        },
    
        formatDateTime: function (dValue) {
            if (!dValue) {
                return "";
            }
            var dateValue = dValue.toDateString();
            // var timeValue = dValue.toLocaleTimeString();
            // var pattern = "dd/MM/yyyy hh:mm a";
            var pattern = "dd/MM/yyyy";
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: pattern
            });

            // var oDateTime = dateValue + " " + timeValue;
            var oNow = new Date(dateValue);
            return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"

        }


    };

});