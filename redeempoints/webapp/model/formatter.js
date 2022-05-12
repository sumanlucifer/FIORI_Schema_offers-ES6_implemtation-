sap.ui.define([], function () {
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
        REFERENCED_SUBFLOW_FAILED: "sap-icon://process",
    };

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

        btnEscalate: function (m1, m2, m3) {
          
            if (m1 === "INPROGRESS") {
                if (m2 === 3 && m3 === "TL") {
                    return true;
                }
            }
            return false;
        },

        btnApproveDisplay: function (m1, m2) {
            
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
        ExecutionLogTitle: function (sSubject, sType) {
            //   return t.getText("EXECUTION_LOG_TYPE_" + e, [r])
            //   if("FORCETAT" == sSubject) return "Manual Escalation";
            switch (sSubject) {
                case "FORCETAT":
                    return "Manual Escalation";
                case "APPROVED":
                    return "Redemption request Approved";
                case "REJECTED":
                    return "Redemption request Rejected";
            }

            switch (sType) {
                case "USERTASK_CANCELED_BY_BOUNDARY_EVENT":
                    return "Auto Escalation";
                case "WORKFLOW_STARTED":
                    return "Redemption request Sent for Approval.";
                case "WORKFLOW_COMPLETED":
                    return "Redemption request Approval Process Completed.";
                case "WORKFLOW_CANCELED":
                    return "Redemption request Workflow Cancelled.";
                case "USERTASK_COMPLETED":
                    return "Redemption request Approved.";
            }

            return sSubject;
        },
        ExecutionLogUserName: function (aEmails) {
            return !!aEmails ? aEmails.join(" ") : " ";
        },
        ExecutionLogIcon: function (sStatus) {
            return wfIcons[sStatus];
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
        fmtDisplayUpdatedDetails: function (mParam1) {
            // mParam1 > createdbydetails/updatedby details
            if (!mParam1) {
                return "Mobile User"
            }
            if (mParam1) {
                return mParam1["Name"] + " - " + mParam1["Email"];
            }
        },
        fmtLeadZoneCheck: function (mParam1, mParam2, mParam3) {
            //console.log(mParam1, mParam2, mParam3);
            if (mParam2 !== 3) {
                return true
            }
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
            if (mParam2 !== 3) {
                return true
            }
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