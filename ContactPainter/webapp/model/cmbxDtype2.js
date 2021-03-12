sap.ui.define(
  ["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"],
  function (SimpleType, ValidateException) {
    "use strict";

    return SimpleType.extend(
      "com.knpl.pragati.ContactPainter.model.cmbxDtype2",
      {
        formatValue: function (oValue) {
         
          if (oValue == "") {
            return oValue;
          } else if (oValue !== "") {
            return parseInt(oValue);
          }
        },
        parseValue: function (oValue) {
          var abc = 0;
          if (oValue == "") {
            abc = "";
          } else if (Number.isInteger(parseInt(oValue))) {
            abc = parseInt(oValue);
          }
          return abc;
        },
        validateValue: function (oValue) {
        
        },
      }
    );
  }
);
