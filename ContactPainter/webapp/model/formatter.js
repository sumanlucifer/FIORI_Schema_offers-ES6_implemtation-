sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";
    var wfIcons = {
        WORKFLOW_STARTED: "sap-icon://initiative",
        WORKFLOW_COMPLETED: "sap-icon://stop",
        WORKFLOW_CANCELED: "sap-icon://sys-cancel-2",
        WORKFLOW_SUSPENDED: "sap-icon://media-pause",
        WORKFLOW_CONTINUED: "sap-icon://redo",
        WORKFLOW_RESUMED: "sap-icon://media-play",
        WORKFLOW_CONTEXT_OVERWRITTEN_BY_ADMIN: "sap-icon://user-edit",
        WORKFLOW_CONTEXT_PATCHED_BY_ADMIN: "sap-icon://user-edit",
        USERTASK_CREATED: "sap-icon://activity-individual",
        USERTASK_CLAIMED: "sap-icon://activity-individual",
        USERTASK_RELEASED: "sap-icon://activity-individual",
        USERTASK_CANCELED_BY_BOUNDARY_EVENT: "sap-icon://lateness",
        USERTASK_COMPLETED: "sap-icon://activity-2",
        USERTASK_FAILED: "sap-icon://activity-individual",
        USERTASK_PATCHED_BY_ADMIN: "sap-icon://activity-individual",
        SERVICETASK_CREATED: "sap-icon://settings",
        SERVICETASK_COMPLETED: "sap-icon://settings",
        SERVICETASK_FAILED: "sap-icon://settings",
        SCRIPTTASK_CREATED: "sap-icon://activities",
        SCRIPTTASK_COMPLETED: "sap-icon://activities",
        SCRIPTTASK_FAILED: "sap-icon://activities",
        INTERMEDIATE_MESSAGE_EVENT_REACHED: "sap-icon://message-popup",
        INTERMEDIATE_MESSAGE_EVENT_TRIGGERED: "sap-icon://message-popup",
        CANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED: "sap-icon://circle-task",
        NONCANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED: "sap-icon://mirrored-task-circle",
        INTERMEDIATE_TIMER_EVENT_REACHED: "sap-icon://fob-watch",
        INTERMEDIATE_TIMER_EVENT_TRIGGERED: "sap-icon://fob-watch",
        MAILTASK_CREATED: "sap-icon://email",
        MAILTASK_COMPLETED: "sap-icon://email",
        MAILTASK_FAILED: "sap-icon://email",
        PARALLEL_GATEWAY_REACHED: "sap-icon://combine",
        PARALLEL_GATEWAY_FAILED: "sap-icon://combine",
        EXCLUSIVE_GATEWAY_REACHED: "sap-icon://split",
        EXCLUSIVE_GATEWAY_FAILED: "sap-icon://split",
        REFERENCED_SUBFLOW_STARTED: "sap-icon://process",
        REFERENCED_SUBFLOW_COMPLETED: "sap-icon://process",
        REFERENCED_SUBFLOW_FAILED: "sap-icon://process"
    }
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
        fmtCheckNull: function (mParam) {
            if (!mParam) {
                return "NA"
            }
            return mParam

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
                        } else if (pointData.RedemptionType === "MULTI_REWARDS") {
                            var aString = [];
                            if (pointData["RewardPoints"]) {
                                aString.push("Points - " + pointData["RewardPoints"]);
                            }
                            if (pointData["GiftRedemptionId"]) {
                                aString.push("Gift - " + pointData["RewardGiftName"]);
                            }
                            if (pointData["RewardCash"]) {
                                aString.push("Cash - Rs." + pointData["RewardCash"]);
                            }
                            return aString.join(", ")
                        }
                    }
                }
            }
            if (mParam1 === "REDEEMABLE") {
                return "Not Redeemed"
            }
            return "NA";
        },
        fmtCheckBonusPoints: function (m1) {
            if (m1) {
                var obj;
                for (var i in m1) {
                    obj = this.getView().getModel().getData("/" + m1[i]);
                    if (obj["RedemptionStatus"] === "REDEEMED" || obj["RedemptionStatus"] === "SCHEDULED") {
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
                if (m2 == 2 || m2 == 3 || m2 == 4) {
                    return true;
                }
            }
            if (m1 !== "REDEEMABLE") {
                return true;
            }
            return false;
        },
        fmtTxtMsgOfferTable1: function (m1, m2) {

            if (m2 == 2) {
                return "Not allowed as total achiever limit exhausted";
            }
            if (m2 == 3) {
                return "Not allowed as painter deselected";
            }
            if (m2 == 4) {
                return "Not allowed as achiever duration expired";
            }
            if (m1 === 'REDEEMED') {
                return "Yes";
            }
            if (m1 === 'REDEEMABLE') {
                return "Yes";
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
        fmtCheckSettlemnetPoints: function (mParam1, mParam2) {
            if (mParam2 === "REDEEMED") {
                return "-" + mParam1
            }
            return mParam1;
        },
        dateFormatter: function (jsonDateString) {
            const dt = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/yyyy"
            });
            // var date= new Date(parseInt(jsonDateString.replace('/Date(', '')));
            const dayMonthYear = dt.format(jsonDateString) // returns: "01/08/2020"
            return dayMonthYear;
        },
        fmtExperience: function (mParam1) {

            if (mParam1) {
                var aArray = [];
                var oData;
                for (var x of mParam1) {
                    oData = this.getView().getModel().getData("/" + x);
                    if (!oData["IsArchived"]) {
                        aArray.push(oData["ExpertiseId"]);
                    }

                }
                return aArray
            }
            return []
        },
        fmtEnableAccess2: function (mParam1) {
            // method used to give approve reject kyc and bank details buttons only to specific users. 
            // mParam1 > user email id
            //shatakshi users has been given access for the purpose of QA.
            var aAllowedUsers = [
                "nppaocor031@nerolac.com",
                "nppaocor032@nerolac.com",
                "nppaocor004@nerolac.com",
                "nppaocor028@nerolac.com",
                "opsnpp@nerolac.com",
                "nppaocor001@nerolac.com",
                "shatakshi.upadhyay@extentia.com",
                "eastnppsupport@nerolac.com",
                "northnppsupport@nerolac.com",
                "westnppsupport@nerolac.com",
                "southnppsupport@nerolac.com",
                "north1nppsupport@nerolac.com",
                "south1nppsupport@nerolac.com",
                "nppaocor021@nerolac.com",
                "nppaocor042@nerolac.com",
                "azhar.sayyed@extentia.com",
                "sachin.korpad@extentia.com"
            ]
            if (mParam1) {
                var sEmail = mParam1.toLowerCase().trim();
                if (aAllowedUsers.indexOf(sEmail) >= 0) {
                    return true;
                }
            }
            return false;
        },
        fmtEnableAccess1: function (mParam1) {
            if (mParam1) {
                return true;
            }
            return false
        },
        fmtDisplayUpdatedDetails: function (mParam1) {
            // mParam1 > createdbydetails/updatedby details
            if (!mParam1) {
                return "Mobile User"
            }
            if (mParam1) {
                return mParam1["Name"] + " - " + mParam1["Email"];
            }
        },
        fmtDisplayUpdatedDetails2: function (mParam) {
            if (!mParam) {
                return "Mobile User"
            }
            return mParam
        },
        fmtSendApprNameChangeReq: function (mParam1, mParam2, mParam3, mParam4, mParam5, mParam6, mParam7) {
            // mParam1 PainterNameChangeRequest
            // mParam2 oModelControl2>/NameChange/Edit
            //mParam3  LoginInfo>/UserTypeId
            // mParam4 PainterBankDetails/Status
            // mParam5 PainterBankDetails/Status
            // mParam6 MembershipID
            // mParam7 Rejected status for PainterNameChangeRequest
            if (mParam1 === null || mParam7 === "REJECTED") {
                if (mParam2 === false) {
                    if (mParam3 === 2) {
                        if (mParam4 !== "APPROVED") {
                            if (mParam5 !== "APPROVED") {
                                if (mParam6) {
                                    return true
                                }
                            }
                        }
                    }
                }
            }
            return false;
        },
        fmtNameApprove: function (mParam1, mParam2) {
            if (mParam1 === "PENDING") {
                if (mParam2 === 3 || mParam2 === 4) {
                    return true;
                }
            }
            return false
        },
        fmtNameEscalate: function (mParam1, mParam2, mParam3, mParam4) {

            if (mParam1 === "PENDING") {
                if (mParam2 === "TL") {
                    if (mParam3 === 3) {
                        if (mParam4 === false) {
                            return true;
                        }

                    }
                }
            }

            return false
        },
        fmtSendApprMobChangeReq: function (mParam1, mParam2, mParam3, mParam4, mParam5, mParam6, mParam7) {
            // mParam1 PainterNameChangeRequest
            // mParam2 'oModelControl2>/NameChange/Edit
            //mParam3 LoginInfo>/UserTypeId
            // mParam4 PainterBankDetails/Status
            // mParam5 PainterBankDetails/Status
            // mParam6 MembershipID
            //console.log(mParam1, mParam2, mParam3, mParam4, mParam5, mParam6)
            if (mParam1 === null || mParam7 === "REJECTED") {
                if (mParam2 === false) {
                    if (mParam3 === 2) {
                        if (mParam6) {
                            return true
                        }
                    }
                }
            }
            return false;
        },
        fmtMobileChangeApproveBtn: function (mParam1, mParam2) {
            if (mParam1 === "PENDING") {
                if (mParam2 === 3 || mParam2 === 4) {
                    return true;
                }
            }
            return false
        },
        fmtMobileEscalateBtn: function (mParam1, mParam2, mParam3, mParam4) {
            if (mParam1 === "PENDING") {
                if (mParam2 === "TL") {
                    if (mParam3 === 3) {
                        if (mParam4 === false) {
                            return true;
                        }

                    }
                }
            }
            return false
        },
        fmtStatus1: function (sStatus) {
            var newStatus = "";
            if (sStatus === "REGISTERED") {
                newStatus = "Registered";
            } else if (sStatus === "INREVIEW") {
                newStatus = "In Review";
            } else if (sStatus === "RESOLVED") {
                newStatus = "Resolved";
            } else if (sStatus === "WITHDRAWN") {
                newStatus = "Withdrawn";
            } ///// added by deepanjali for History table////
            else if (sStatus === "REOPEN") {
                newStatus = "Reopen";
            } else if (sStatus === "PENDING") {
                newStatus = "Pending";
            } else if (sStatus === "APPROVED") {
                newStatus = "Approved";
            } else if (sStatus === "REJECTED") {
                newStatus = "Rejected";
            }
            return newStatus;
        },
        // workflow icons
        ExecutionLogTitle: function (sSubject, sType) {
            //   return t.getText("EXECUTION_LOG_TYPE_" + e, [r])
            //   if("FORCETAT" == sSubject) return "Manual Escalation";
            switch (sSubject) {
                case "FORCETAT":
                    return "Manual Escalation";
                case "APPROVED":
                    return "Name Change request Approved";
                case "REJECTED":
                    return "Name Change request Rejected";
            }
            switch (sType) {
                case "USERTASK_CANCELED_BY_BOUNDARY_EVENT":
                    return "Auto Escalation";
                case "WORKFLOW_STARTED":
                    return "Name Change request Sent for Approval.";
                case "WORKFLOW_COMPLETED":
                    return "Name Change request Approval Process Completed.";
                case "WORKFLOW_CANCELED":
                    return "Name Change request Workflow Cancelled.";
                case "USERTASK_COMPLETED":
                    return "Name Change request Approved.";
            }
            return sSubject;
        },
        ExecutionLogTitle2: function (sSubject, sType) {
            switch (sSubject) {
                case "FORCETAT":
                    return "Manual Escalation";
                case "APPROVED":
                    return "Mobile No. Change request Approved";
                case "REJECTED":
                    return "Mobile No. Change request Rejected";
            }
            switch (sType) {
                case "USERTASK_CANCELED_BY_BOUNDARY_EVENT":
                    return "Auto Escalation";
                case "WORKFLOW_STARTED":
                    return "Mobile No. Change request Sent for Approval.";
                case "WORKFLOW_COMPLETED":
                    return "Mobile No. Change request Approval Process Completed.";
                case "WORKFLOW_CANCELED":
                    return "Mobile No. Change request Workflow Cancelled.";
                case "USERTASK_COMPLETED":
                    return "Mobile No. Change request Approved.";
            }
            return sSubject;
        },
        formatLogIcon: function (sStatus) {
            return wfIcons[sStatus];
        },
        ExecutionLogUserName: function (aEmails) {
            return !!(aEmails) ? aEmails.join(" ") : " ";
        },
        ExecutionLogDateTime: function (dValue) {
            if (!dValue) {
                return "";
            }
            var localDate = new Date(dValue);
            var pattern = "dd/MM/yyyy hh:mm a";
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: pattern
            });
            var oNow = new Date(localDate);
            return oDateFormat.format(oNow);
        },
        fmtLeadZoneCheck: function (mParam1, mParam2, mParam3) {
            //console.log(mParam1, mParam2, mParam3);
            // if (mParam2 !== 3) {
            //     return true
            // }
            if (mParam3) {
                if(mParam3.hasOwnProperty("results")){
                    if (mParam3["results"].length > 0) {
                        for (var x of mParam3["results"]) {
                            if (x["ZoneId"] == mParam1) {
                                return true;
    
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        },
        fmtLeadDivisionCheck: function (mParam1, mParam2, mParam3) {
            //console.log(mParam1, mParam2, mParam3);
            // if (mParam2 !== 3) {
            //     return true
            // }
            if (mParam3) {
                if(mParam3.hasOwnProperty("results")){
                    if (mParam3["results"].length > 0) {
                        for (var x of mParam3["results"]) {
                            if (x["DivisionId"] == mParam1) {
                                return true;
    
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        }
    };
});