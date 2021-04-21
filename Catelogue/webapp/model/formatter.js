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

        status: function (status) {
            if (status) {
                return 'Deactivate ';
            } else {
                return 'Activate';
            }
        },
        statusList: function (status){
             if (status) {
                return 'Active ';
            } else {
                return 'Inactive';
            }

        }

    };

});