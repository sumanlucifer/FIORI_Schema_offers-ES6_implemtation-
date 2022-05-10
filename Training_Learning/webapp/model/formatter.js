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

        formatDate: function (dValue) {
            if (!dValue) {
                return "";
            }
            var sValue = dValue;
            var pattern = "dd/MM/yyyy";
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: pattern
            });

            var oNow = new Date(sValue);
            return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"

        },

        formatDateTime: function (dValue) {
            if (!dValue) {
                return "";
            }
            var dateValue = dValue.toDateString();
            var timeValue = dValue.toLocaleTimeString();
            var pattern = "dd/MM/yyyy hh:mm a";
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: pattern
            });

            var oDateTime = dateValue + " " + timeValue;
            var oNow = new Date(oDateTime);
            return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"

        },

        giveImage: function (oMetadata, ImageData) {
            if (ImageData && ImageData.Image) {
                return URL.createObjectURL(ImageData.Image);
            }
            if (oMetadata && oMetadata.media_src) {
                var sPathname = new URL(oMetadata.media_src).pathname;
                return ("/KNPL_PAINTER_API").concat(sPathname);
            }
            return "";
        },

        giveAttendance: function (oMetadata, AttendanceData) {
            if (oMetadata && oMetadata.media_src && !AttendanceData) {
                var sPathname = new URL(oMetadata.media_src).pathname;
                return ("/KNPL_PAINTER_API").concat(sPathname);
            }

            if (AttendanceData)
                return URL.createObjectURL(AttendanceData.Image);
        },

        UploadStatus: function (fValue) {
            if (fValue === true) {
                return "Success";
            } else {
                return "Failure";
            }
        },

        fmtTrainStatus: function (mParam) {
            if (mParam.replace(/\s/g, "").toLowerCase() === "offlinetraining") {
                return "NA";
            }
            return "Not Submitted";
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
        fmtDisplayUpdatedDetails2: function (mParam1,mParam2) {
            // mParam1 > createor name
            // mparam2 > creator email
            if (!mParam1) {
                return "SYSTEM"
            }
            if (mParam1) {
                return mParam1 + "-" + mParam2;
            }
        },
        fmtLeadsZoneCheck: function (mParam1, mParam2, mParam3) {
          
            if (mParam2 !== 3) {
                return true
            }
            if (mParam3["results"].length > 0) {
                for (var x of mParam3["results"]) {
                    if (x["ZoneId"] == mParam1) {
                        return true;
                      
                    }
                }
                return false;
            } else {
                return true;
            }

          

        }

    };

});