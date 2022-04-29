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
        fmtDisplayUpdatedDetails: function (mParam1) {
            // mParam1 > createdbydetails/updatedby details
            if (!mParam1) {
                return "Mobile User"
            }
            if (mParam1) {
                return mParam1["Name"] + " - " + mParam1["Email"];
            }
        },
        fmtBtnApprove: function (mParam1, mParam2) {
            if (mParam1 === "PENDING") {
                if (mParam2 === 3 || mParam2 === 4) {
                    return true;
                }
            }
            return false
        },
        fmtEscalateBtn: function (mParam1, mParam2, mParam3, mParam4) {
            //m1 status
            // m2 assigned user type
            // m3 logged in user
            //m4 initialte forcetat
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
        fmtStatus: function (sStatus) {
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
                    return "Condonation request Approved";
                case "REJECTED":
                    return "Condonation request Rejected";
            }
            switch (sType) {
                case "USERTASK_CANCELED_BY_BOUNDARY_EVENT":
                    return "Auto Escalation";
                case "WORKFLOW_STARTED":
                    return "Condonation request Sent for Approval.";
                case "WORKFLOW_COMPLETED":
                    return "Condonation request Approval Process Completed.";
                case "WORKFLOW_CANCELED":
                    return "Condonation request Workflow Cancelled.";
                case "USERTASK_COMPLETED":
                    return "Condonation request Approved.";
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
        fmtLowerCase: function (mParam) {
            if (!mParam) {
                return
            }
            var sStatus = "";

            if (mParam.split("_").length > 1) {
                var mArray = mParam.split("_");

            } else {
                var mArray = mParam.split(" ");

            }
            for (var x of mArray) {
                var a = x.toLowerCase() + " ";
                var b = a[0].toUpperCase() + a.slice(1);

                sStatus += b;
            }
            return sStatus;
        },

        fmtStatusStateColor: function (mParam) {
            if (mParam === "APPROVED") {
                return "Success";
            }
            if (mParam === "PUBLISHED") {
                return "Success";
            }
            if (mParam === "PENDING") {
                return "Warning";
            }
            return "Error";
        },

    };

});