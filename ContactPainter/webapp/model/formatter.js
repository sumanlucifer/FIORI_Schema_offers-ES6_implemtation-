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

        formatURL: function (sURL) {

            if (sURL) {
                return ("https://").concat(location.host, "/KNPL_PAINTER_API", new URL(sURL).pathname);
            }
        },

        RegStatusIcon: function (sRegStatus) {
            switch (sRegStatus) {
                case "PENDING":
                    return "sap-icon://message-warning"
                case "REGISTERED":
                    return "sap-icon://message-success"
            }
        },

        RegStatusColor: function (sRegStatus) {

            switch (sRegStatus) {
                case "PENDING":
                    return sap.ui.core.IconColor.Critical;
                case "REGISTERED":
                    return sap.ui.core.IconColor.Positive;

            }

        },
        ProductProperty: function (sPath, sProperty) {
            var oProduct = this.getView().getModel().getData("/" + sPath);
            if (sProperty && oProduct) {
                var oPackDetails = this.getView().getModel().getData("/" + oProduct.ProductPackDetails.__ref);
            } else {
                return "NA"
            }
            switch (sProperty) {

                case "Product Name":
                    return oPackDetails.Description;

                case "Total Points":
                    return oProduct.ProductQuantity * oProduct.Points;
                case "Category":
                    var cat = this.getView().getModel().getData("/" + oPackDetails.ProductCategoryDetails.__ref);
                    return cat.Category;
                case "Quantity":
                    return oProduct.ProductQuantity;
                case "Reward Points":
                    return oProduct.Points;

            }


            return "NA"
        },
        PackDetails: function (sPath, sProperty) {
            var oProduct = this.getView().getModel().getData("/" + sPath)

        },
        CallbackReqTblStatus: function (mParam1) {
            if (mParam1 === "REGISTERED") {
                return "Pending";
            }
            if (mParam1 === "INPROGRESS") {
                return "Pending";
            }
            if (mParam1 === "RESOLVED") {
                return "Completed";
            }
            if (mParam1 === "REJECTED") {
                return "Completed"
            }
        },
        fmtStatus: function (mParam) {
            var sLetter = "";
            if (mParam) {
                sLetter = mParam
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
            }

            return sLetter;
        },
        fmtLowerCase2: function (mParam1) {
            if (mParam1) {
                var aReplce = mParam1.replace(/_/gi, " ");

                var sResult = aReplce.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

                return sResult

            }
            return mParam1

        },

        // Added by Debasisa Pradhan for GiftRedeemed column with offers table
        fmtOfferGiftRedeemed: function (mParam1, mParam2) {
            if (mParam1 = "REDEEMED") {
                if (mParam2) {
                    if (mParam2.length > 0) {
                        var pointData = this.getView().getModel().getData("/" + mParam2[0]);
                        console.log(pointData);
                        if (pointData.RedemptionType === "POINTS_TRANSFER" && pointData["RewardPoints"]) {
                            var point = "Points - " + pointData.RewardPoints;
                            return point;
                        } else
                        if (pointData.RedemptionType === "GIFT_REDEMPTION" && pointData["GiftRedemptionId"]) {
                            var giftData = this.getView().getModel().getData("/" + pointData.GiftRedemption.__ref);
                            return "Gift - " + giftData.RewardGiftName;
                        } else
                        if (pointData.RedemptionType === "BANK_TRANSFER" && pointData["RewardCash"]) {
                            var cash = "Cash - Rs. " + pointData["RewardCash"];
                            return cash;
                        }
                    }
                }
            }
            return "NA";
        }

    };

});