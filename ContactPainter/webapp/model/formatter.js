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
        },
        fmtCheckBonusPoints: function (m1) {
            if (m1) {
                var obj;
                for (var i in m1) {
                    obj = this.getView().getModel().getData("/" + m1[i]);
                    if (obj["RedemptionStatus"] === "REDEEMED") {
                        return obj["TotalBonusPoints"];
                    }
                }
            }
            return "NA";
        },
        fmtCheckAsssetType: function (mParam) {
            var sPath = "/MasterVehicleTypeSet(" + mParam + ")";
            var oData = this.getView().getModel().getProperty(sPath);
            if (oData !== undefined && oData !== null) {
                if (oData["VehicleType"] === "None") {
                    return false;
                }
            }
        },
        fmtBtnRedeemOfferTbl: function (m1, m2) {
           
            if (m1 === "REDEEMABLE") {
                if (m2 == 1 || m2 == 0) {
                    return true;
                }
            }
            return false;
        },
        fmtTxtRedmtOfferTbl: function (m1, m2) {
           
            if (m1 === "REDEEMABLE") {
                if (m2 == 2 || m2 == 3) {
                    return true;
                }
            }
            return false;
        },
        fmtTxtMsgOfferTable1: function (m1) {
            if (m1 == 2) {
                return "Not allowed as total achiever limit exhausted"
            }
            if (m1 == 3) {
                return "Not allowed as painter deselected."
            }
            return "NA";
        },
        checkOfferPainterReward: function (m1, m2) {
            //m1 RedemptionStatus
            //m2 RedemptionType
            //m3 RedeemRewardPoints
            //m4 RedeemRewardCash
            //m5 RewardGift
            if (m2) {
                if (m2.length > 0) {
                    var multiRewardData = this.getView().getModel().getData("/" + m2[0]);
                    if (multiRewardData.GiftRedemption !== null) {
                        var rewardGift = this.getView().getModel().getData("/" + multiRewardData.GiftRedemption.__ref),
                            m2 = multiRewardData.RedemptionType,
                            m3 = multiRewardData.RewardPoints,
                            m4 = multiRewardData.RewardCash,
                            m5 = rewardGift.RewardGiftName;
                        if (m2 === 'MULTI_REWARDS' && m1 === 'REDEEMED') {
                            var aString = [];
                            if (m3) {
                                aString.push("Points - " + m3)
                            }
                            if (m4) {
                                aString.push("Cash - Rs. " + m4)
                            }
                            if (m5) {
                                aString.push("Gift - " + m5)
                            }
                            return aString.join(", ");
                        }
                    }
                }
            }
            if (m1 === "REDEEMABLE") {
                return "Not Redeemed"
            }
            return "NA";
        },
        fmtOfferProgressStatus: function (mParam1) {
            if (mParam1 === "COMPLETED") {
                return "Completed"
            }
            if (mParam1 === "NOT_STARTED") {
                return "Not completed"
            }
            if (mParam1 === "STARTED") {
                return "In Progress"
            }
        },
        dateFormatter: function (jsonDateString) {
            const dt = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/yyyy"
            });
            // var date= new Date(parseInt(jsonDateString.replace('/Date(', '')));
            const dayMonthYear = dt.format(jsonDateString) // returns: "01/08/2020"
            return dayMonthYear;
        },
    };
});