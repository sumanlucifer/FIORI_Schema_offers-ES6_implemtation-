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
        fmtDisplayUpdatedDetails: function (mParam1) {
            // mParam1 > createdbydetails/updatedby details
            if (!mParam1) {
                return "Mobile User"
            }
            if (mParam1) {
                return mParam1["Name"] + " - " + mParam1["Email"];
            }
        },
        fmtBtnApprove: function (mParam1, mParam2) {
            if (mParam1 === "PENDING") {
                if (mParam2 === 3 || mParam2 === 4) {
                    return true;
                }
            }
            return false
        },
        fmtEscalateBtn: function (mParam1, mParam2, mParam3, mParam4) {
            //m1 status
            // m2 assigned user type
            // m3 logged in user
            //m4 initialte forcetat
            if (mParam1 === "PENDING") {
                if (mParam2 === "TL") {
                    if (mParam3 === 3) {
                        if (mParam4 === false) {
                            return true;
                        }

                    }
                }
            }
            return false
        }

    };

});