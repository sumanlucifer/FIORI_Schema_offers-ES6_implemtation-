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
        fmtLowerCase: function (mParam) {
            var sStatus = "";
          
            if(mParam.split("_").length>1){
                  var mArray = mParam.split("_");
                  
            }else {
                  var mArray = mParam.split(" ");
                 
            }
            for (var x of mArray) {
                var a = x.toLowerCase() + " ";
                var b = a[0].toUpperCase()+ a.slice(1);
           
                sStatus +=b; 
            }
            return sStatus;
        },



        btnEscalate: function (m1, m2, m3) {
            console.log(m1, m2, m3);
            if (m1 === "INPROGRESS") {
                if (m2 === 3 && m3 === "TL") {
                    return true;
                }
            }
            return false;
        },

        btnApproveDisplay: function (m1, m2) {
            console.log(m1, m2);
            if (m1 === "INPROGRESS") {
                if (m2 === 3 || m2 === 4) {
                    return true;
                }
            }
            return false;
        },

        // List view workflow changes
        btnAddRedemption: function (m1) {
            //m1 is the logged in user type
            if (m1 === 2) {
                return true;
            }
            return false;
        },

        // execution log changes
        //execution log title



    };

});