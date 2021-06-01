sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
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
        dateFormatter: function (jsonDateString) {
            const dt = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" });
            var date = new Date(parseInt(jsonDateString.replace('/Date(', '')));
            const dayMonthYear = dt.format(date) // returns: "01/08/2020"
            return dayMonthYear;
        },
        dateFormatter2: function (jsonDateString) {
            const dt = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" });
            // var date= new Date(parseInt(jsonDateString.replace('/Date(', '')));
            const dayMonthYear = dt.format(jsonDateString) // returns: "01/08/2020"
            return dayMonthYear;
        },
        accuralType: function (accuralType) {

            if (accuralType == "TOKEN_SCAN") {
                return "Token Scan";
            }
            else if (accuralType == "PROFILE_COMPLETION") {
                return "Profile Completion";
            }
            else if (accuralType == "LIVE_TRAINING") {
                return "Live Training";
            }
            else if (accuralType == "SETTLEMENT") {
                return "Settlement";
            }
            else if (accuralType == "VIDEO_TRAINING") {
                return "Video Training";
            }
            else if (accuralType == "OFFLINE_TRAINING") {
                return "Offline Training"
            }
            else if (accuralType == "REFERRAL") {
                return "Referral"
            }
            else if (accuralType == "CONDONATION") {
                return "Condonation"
            }
        },
        status: function (status) {
                 if (status == "PENDING") {
                return "Pending";
            }
            else if (status == "REGISTERED") {
                return "Registered";
            }
            else if (status == "COMPLETED") {
                return "Completed";
            }
        },
        requestType: function (request) {
                 if (request == "ACCRUED") {
                return "Accrued";
            }
            else if (request == "CLOSING_BALANCE") {
                return "Closing Balance";
            }
           
        }

    };

});
