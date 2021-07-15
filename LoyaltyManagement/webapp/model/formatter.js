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
        // accuralType1: function (accuralType) {

        //     if (accuralType == "TOKEN_SCAN") {
        //         return "Token Scan";
        //     }
        //     else if (accuralType == "PROFILE_COMPLETION") {
        //         return "Profile Completion";
        //     }
        //     else if (accuralType == "LIVE_TRAINING") {
        //         return "Live Training";
        //     }
        //     else if (accuralType == "SETTLEMENT") {
        //         return "Settlement";
        //     }
        //     else if (accuralType == "VIDEO_TRAINING") {
        //         return "Video Training";
        //     }
        //     else if (accuralType == "OFFLINE_TRAINING") {
        //         return "Offline Training"
        //     }
        //     else if (accuralType == "REFERRAL") {
        //         return "Referral"
        //     }
        //     else if (accuralType == "CONDONATION") {
        //         return "Condonation"
        //     }else if (accuralType == "BANK_TRANSFER") {
        //         return "Bank Transfer"
        //     }
        //     else if (accuralType == "GIFT_REDEMPTION") {
        //         return "Gift Redemption"
        //     }
        //     else if (accuralType == "OFFER_BONUS_POINTS") {
        //         return "Offer Bonus Points"
        //     }
        //     else if (accuralType == "OFFER_POINTS") {
        //         return "Offer Points"
        //     }
        //      else if (accuralType == "REFERRAL_CLUB") {
        //         return "Referral Club"
        //     }
        //      else if (accuralType == "SYSTEM_MIGRATION") {
        //         return "System Migration"
        //     }
        //     else if(accuralType == "OFFER_GIFT_REDEMPTION"){
        //         return "Offer Gift Redemption"
        //     }
        // },
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
                return "Accrual";
            }
            else if (request == "REDEEMED") {
                return "Redemption";
            }
            else if (request == "CLOSING_BALANCE") {
                return "Closing Balance";
            }
           
        },
        accuralType: function (mParam){
                    var sStatus = "";
                    if (mParam) {
                        sStatus = mParam;
                       var StatusStr = sStatus.toLowerCase().split('_');
                            for (var i = 0; i < StatusStr.length; i++) {
                                // You do not need to check if i is larger than splitStr length, as your for does that for you
                                // Assign it back to the array
                                StatusStr[i] = StatusStr[i].charAt(0).toUpperCase() + StatusStr[i].substring(1);     
                            }
                            // Directly return the joined string
                            return StatusStr.join(' '); 
                    }

                    return StatusStr;
                },

    };

});
