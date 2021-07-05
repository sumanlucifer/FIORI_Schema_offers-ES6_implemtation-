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
            // var pattern = "dd MMM yyyy";
            // if (tValue) {
            // 	sValue = sValue + " " + tValue;
            // }
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
            // var pattern = "dd MMM yyyy";  dd/MM/yyyy
            // if (tValue) {
            // 	sValue = sValue + " " + tValue;
            // }
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: pattern
            });

            var oDateTime = dateValue + " " + timeValue;
            var oNow = new Date(oDateTime);
            return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"

        },

        giveImage : function(oMetadata, ImageData){
            if(oMetadata && oMetadata.media_src && !ImageData  )
            {  
                var sPathname = new URL(oMetadata.media_src).pathname;
                return ("/KNPL_PAINTER_API").concat(sPathname) ;
            }
            
            if (ImageData)
		 	return URL.createObjectURL(ImageData.Image);	
        },
        
        giveAttendance : function(oMetadata, AttendanceData){
            if(oMetadata && oMetadata.media_src && !AttendanceData  )
            {  
                var sPathname = new URL(oMetadata.media_src).pathname;
                return ("/KNPL_PAINTER_API").concat(sPathname) ;
            }
            
            if (AttendanceData)
		 	return URL.createObjectURL(AttendanceData.Image);	
		}

    };

});