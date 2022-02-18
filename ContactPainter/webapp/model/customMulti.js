sap.ui.define(
    ["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"],
    function (SimpleType, ValidateException) {
      "use strict";
  
      return SimpleType.extend(
        "com.knpl.pragati.ContactPainter.model.customMulti",
        {
          formatValue: function (oValue) {
            return oValue
          },
          parseValue: function (oValue) {
            return oValue
          },
          validateValue: function (oValue) {
         
            if (oValue.length < 1) {
              throw new ValidateException("Kindly enter atleast single value");
            }
          },
        }
      );
    }
  );
  