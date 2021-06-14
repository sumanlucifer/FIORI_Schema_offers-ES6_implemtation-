sap.ui.define(
    ["sap/ui/model/SimpleType", "sap/ui/model/ValidateException"],
    function (SimpleType, ValidateException) {
        "use strict";

        return SimpleType.extend(
            "com.knpl.pragati.SchemeOffers.model.ArrayDType1",
            {
                formatValue: function (oValue) {
                    console.log("Format", oValue)
                    return oValue
                },
                parseValue: function (oValue) {

                    console.log("ParseValue", oValue)
                    return oValue;
                },
                validateValue: function (oValue) {
                    console.log()
                    if (oValue.length <= 0) {
                        throw new ValidateException("Kindly select atlease 1 value.");
                    }
                },
            }
        );
    }
);
