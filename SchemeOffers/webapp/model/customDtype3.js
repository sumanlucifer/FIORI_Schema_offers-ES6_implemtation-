sap.ui.define(
  ["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"],
  function (SimpleType, ValidateException) {
    "use strict";

    return SimpleType.extend(
      "com.knpl.pragati.SchemeOffers.model.cmbxDtype3",
      {
        formatValue: function (oValue) {
         
         console.log(oValue,"format value")
        },
        parseValue: function (oValue) {
          console.log(oValue,"Parse Value")
        },
        validateValue: function (oValue) {
            console.log(oValue,"Validate Value")
        },
      }
    );
  }
);
