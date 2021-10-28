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
        formatURL: function (sURL) {
            if (sURL) {
                return ("https://").concat(location.host, "/KNPL_PAINTER_API", new URL(sURL).pathname);
            }
        },
        formatLogIcon: function (sStatus) {
            return wfIcons[sStatus];
        },
        ExecutionLogTitle: function (sSubject, sType) {
            //   return t.getText("EXECUTION_LOG_TYPE_" + e, [r])
            //   if("FORCETAT" == sSubject) return "Manual Escalation";
            switch (sSubject) {
                case "FORCETAT": return "Manual Escalation";
                case "PENDING_FOR_APPROVAL": return "Pending for Approval"
            }
            switch (sType) {
                case "USERTASK_CANCELED_BY_BOUNDARY_EVENT": return "Auto Escalation";
                case "WORKFLOW_STARTED": return "Complaint raised";
                case "WORKFLOW_COMPLETED": return "Complaint closed";
                case "WORKFLOW_CANCELED": return "Complaint withdrawn";
                case "USERTASK_COMPLETED": return "Complaint resolved";
            }
            return sSubject;
        },
        AssigneUser: function (sAssignUser) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sAssignUser);
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
        ////////// Resolution Type//////////
        fmtCmbxResolutionType: function (m1, m2) {
            // m1 = approvalstatus
            // m2 = complianstatus
            if (m2 == "REGISTERED" || m2 == "INREVIEW" || m2 == "REOPEN") {
                if (m1 === null) {
                    return true;
                }
            }
            return false;
        },
        ////////// Category Type//////////
        fmtCmbxCategoryType: function (m1, m2) {
            // m1 = approvalstatus
            // m2 = complianstatus
            if (m2 == "REGISTERED" || m2 == "INREVIEW" || m2 == "REOPEN") {
                if (m1 === null) {
                    return true;
                }
            }
            return false;
        },
        ////////// Product Type//////////
        fmtProductCmbx: function (m1, m2, m3) {
            // m1 = approvalstatus
            // m2 = complianstatus
            if (m2 == "REGISTERED" || m2 == "INREVIEW" || m2 == "REOPEN") {
                if (m1 === null) {
                    return true;
                }
            }
            return false;
        },
        ////////// Pack Type//////////
        fmtPacksCmbx: function (m1, m2, m3) {
            // m1 = Approvalstatus
            // m2 = Complianstatus
            if (m2 == "REGISTERED" || m2 == "INREVIEW" || m2 == "REOPEN") {
                if (m1 === null) {
                    return true;
                }
            }
            return false;
        },
        ////////// Quantiy//////////
        fmtQuantiyInp: function (m1, m2, m3) {
            // m1 = approvalstatus
            // m2 = complianstatus
            if (m2 == "REGISTERED" || m2 == "INREVIEW" || m2 == "REOPEN") {
                if (m1 === null) {
                    return true;
                }
            }
            return false;
        }
    };
});