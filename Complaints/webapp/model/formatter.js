sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
        },
        
        formatURL: function(sURL){

            if(sURL)
            {
                return ("https://").concat(location.host, "/KNPL_PAINTER_API" ,new URL(sURL).pathname);
            }
        }

	};

});