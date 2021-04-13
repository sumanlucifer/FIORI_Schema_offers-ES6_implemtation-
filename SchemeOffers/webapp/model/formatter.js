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
        pattern: "dd/MM/yyyy",
        UTC: true,
        strictParsing: true,
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
  };
});
