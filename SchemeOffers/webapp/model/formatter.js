// @ts-ignore
sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
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
    NONCANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED:
      "sap-icon://mirrored-task-circle",
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
    fmtDate: function (mDate) {
      var date = new Date(mDate);
      var oDateFormat = DateFormat.getDateTimeInstance({
        pattern: "dd/MM/YYYY h:mm a",
        UTC: true,
        strictParsing: true,
      });
      return oDateFormat.format(date);
    },
    fmtDate2: function (mDate) {
      var date = new Date(mDate);
      var oDateFormat = DateFormat.getDateTimeInstance({
        pattern: "dd/MM/YYYY",
        UTC: false,
        strictParsing: false,
      });
      return oDateFormat.format(date);
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
    fmtOfferStateColor: function (mParam) {
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
    fmtVldtyDuration: function (mParam1, mParam2, mParam3) {
      var aArray = [];
      if (mParam1) {
        aArray.push(mParam1 + " years");
      }
      if (mParam2) {
        aArray.push(mParam1 + " months");
      }
      if (mParam3) {
        aArray.push(mParam1 + " days");
      }
      return aArray.join(" ");
    },
    formatURL: function (sURL) {
      if (sURL) {
        return "https://".concat(
          location.host,
          "/KNPL_PAINTER_API",
          new URL(sURL).pathname
        );
      }
    },
    fmtCheckNull: function (mParam1) {
      if (mParam1) {
        return mParam1;
      }
      return "NA";
    },
    fmtCheckNull2: function (mParam1) {
      if (mParam1) {
        return mParam1;
      }
      if (mParam1 === 0) {
        return 0;
      }
      return "NA";
    },
    //List View Workflow changes
    btnEditOfferTable: function (m1, m2, m3) {
      //m1 edit applicable; m2 login information; m3 offer status
      if (m2 === 5) {
        if (m3 === "DRAFT" || m3 === "REJECTED") {
          return m1;
        } else {
          return false;
        }
      }
      return m1;
    },

    // all formatters for the button in the display and also for the workflow
    // user id HOM-5, HOM1-6, HOD- 7
    btnRedeemCheck: function (m1, m2, m3, m4) {
      //m1 offer id 6-slab based offer// m3 IsPublished true //m2 Offer Status //m4 button already redeem check
      if (m1 === 6) {
        if (m2 === "EXPIRED") {
          if (m3 === true) {
            return true;
          }
        }
      }
      return false;
    },
    btnSendForApprovalCheck: function (m1, m2) {
      if (m1 === "DRAFT") {
        if (m2 === 5) {
          return true;
        }
      }
      return false;
    },
    //btn Approve Display and reject button
    btnApproveDisplay: function (m1, m2) {
      if (m1 === "PENDING") {
        if (m2 === 6 || m2 === 7) {
          return true;
        }
      }
      return false;
    },
    btnPublished: function (m1, m2) {
      if (m1 === "APPROVED") {
        return true;
      }
      return false;
    },
    btnEscalate: function (m1, m2, m3) {
      if (m1 === "PENDING") {
        if (m2 === 6) {
          if (m3 === "HO_MARKETING_1") {
            return true;
          }
        }
      }
      return false;
    },
    //execution log title
    ExecutionLogTitle: function (sSubject, sType) {
      //   return t.getText("EXECUTION_LOG_TYPE_" + e, [r])
      //   if("FORCETAT" == sSubject) return "Manual Escalation";
      switch (sSubject) {
        case "FORCETAT":
          return "Manual Escalation";
        case "APPROVED":
          return "Offer Approved";
        case "REJECTED":
          return "Offer Rejected";
      }

      switch (sType) {
        case "USERTASK_CANCELED_BY_BOUNDARY_EVENT":
          return "Auto Escalation";
        case "WORKFLOW_STARTED":
          return "Offer Sent for Approval.";
        case "WORKFLOW_COMPLETED":
          return "Offer Approval Process Completed.";
        case "WORKFLOW_CANCELED":
          return "Offer Workflow Cancelled.";
        case "USERTASK_COMPLETED":
          return "Offer Approved.";
      }

      return sSubject;
    },
    ExecutionLogUserName: function (aEmails) {
      return !!aEmails ? aEmails.join(" ") : " ";
    },
    ExecutionLogIcon: function (sStatus) {
      return wfIcons[sStatus];
    },
  };
});
