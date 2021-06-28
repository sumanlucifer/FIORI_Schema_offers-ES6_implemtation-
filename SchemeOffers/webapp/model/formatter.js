// @ts-ignore
sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
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
        fmtDate: function (mDate) {
            var date = new Date(mDate);
            var oDateFormat = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/YYYY h:mm a",
                UTC: true,
                strictParsing: true,
            });
            return oDateFormat.format(date);
        },
        fmtDate2: function (mDate) {
            var date = new Date(mDate);
            var oDateFormat = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/YYYY",
                UTC: false,
                strictParsing: false,
            });
            return oDateFormat.format(date);
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
        fmtOfferStateColor: function (mParam) {

            if (mParam === "APPROVED") {
                return "Success"
            }
            if (mParam === "PUBLISHED") {
                return "Success"
            }
            if (mParam === "PENDING") {
                return "Warning"
            }
            return "Error"

        },
        fmtVldtyDuration: function (mParam1, mParam2, mParam3) {
            var aArray = [];
            if (mParam1) {
                aArray.push(mParam1 + " years");
            }
            if (mParam2) {
                aArray.push(mParam1 + " months");
            }
            if (mParam3) {
                aArray.push(mParam1 + " days");
            }
            return aArray.join(" ");
        },
        formatURL: function (sURL) {
            console.log("format url trigerred");
            if (sURL) {
                return "https://".concat(
                    location.host,
                    "/KNPL_PAINTER_API",
                    new URL(sURL).pathname
                );
            }
        },
        fmtCheckNull: function (mParam1) {
            if (mParam1) {
                return mParam1
            }
            return "NA"
        },
        fmtCheckNull2: function (mParam1) {
            if (mParam1) {
                return mParam1
            }
            if (mParam1 === 0) {
                return 0;
            }
            return "NA"
        },
        // all formatters for the button in the display and also for the workflow
        // user id HOM-5, HOM1-6, HOD- 7
        btnRedeemCheck: function (m1, m2, m3, m4) {

            //m1 offer id 6-slab based offer// m3 IsPublished true //m2 Offer Status //m4 button already redeem check
            if (m1 === 6) {
                if (m2 === "EXPIRED") {
                    if (m3 === true) {
                        return true
                    }
                }
            }
            return false
        },
        btnSendForApprovalCheck: function (m1, m2) {
            if (m1 === "DRAFT") {
                if (m2 === 5) {
                    return true;
                }
            }
            return false;
        },
        //btnApproveDisplay and reject button
        btnApproveDisplay: function (m1, m2) {
            if (m1 === "PENDING") {
                if (m2 === 6 || m2 === 7) {
                    return true;
                }
            }
            return false;
        },
        btnPublished: function (m1, m2) {
            if (m1 === "APPROVED") {
                if (m2 === 6 || m2 === 7) {
                    return true
                }
            }
            return false

        },
        btnEscalate: function (m1, m2, m3) {
            if (m1 === "PENDING") {
                if (m2 === 6) {
                    if (m3 === "HO_MARKETING_1") {
                        return true
                    }
                }
            }
            return false
        }

    };
});