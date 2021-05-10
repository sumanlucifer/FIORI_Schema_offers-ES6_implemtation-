sap.ui.define([], function () {
	"use strict";

  var wfIcons = {
        WORKFLOW_STARTED: "sap-icon://initiative",
        WORKFLOW_COMPLETED: "sap-icon://stop",
        WORKFLOW_CANCELED: "sap-icon://sys-cancel",
        WORKFLOW_SUSPENDED: "sap-icon://media-pause",
        WORKFLOW_CONTINUED: "sap-icon://redo",
        WORKFLOW_RESUMED: "sap-icon://media-play",
        WORKFLOW_CONTEXT_OVERWRITTEN_BY_ADMIN: "sap-icon://user-edit",
        WORKFLOW_CONTEXT_PATCHED_BY_ADMIN: "sap-icon://user-edit",
        USERTASK_CREATED: "sap-icon://workflow/userTask",
        USERTASK_CLAIMED: "sap-icon://workflow/userTask",
        USERTASK_RELEASED: "sap-icon://workflow/userTask",
        USERTASK_CANCELED_BY_BOUNDARY_EVENT: "sap-icon://workflow/userTask",
        USERTASK_COMPLETED: "sap-icon://workflow/userTask",
        USERTASK_FAILED: "sap-icon://workflow/userTask",
        USERTASK_PATCHED_BY_ADMIN: "sap-icon://workflow/userTask",
        SERVICETASK_CREATED: "sap-icon://settings",
        SERVICETASK_COMPLETED: "sap-icon://settings",
        SERVICETASK_FAILED: "sap-icon://settings",
        SCRIPTTASK_CREATED: "sap-icon://workflow/scriptTask",
        SCRIPTTASK_COMPLETED: "sap-icon://workflow/scriptTask",
        SCRIPTTASK_FAILED: "sap-icon://workflow/scriptTask",
        INTERMEDIATE_MESSAGE_EVENT_REACHED: "sap-icon://workflow/messageEvent",
        INTERMEDIATE_MESSAGE_EVENT_TRIGGERED: "sap-icon://workflow/messageEvent",
        CANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED: "sap-icon://workflow/cancelingBoundaryTimerEvent",
        NONCANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED: "sap-icon://workflow/nonCancelingBoundaryTimerEvent",
        INTERMEDIATE_TIMER_EVENT_REACHED: "sap-icon://workflow/intermediateTimerEvent",
        INTERMEDIATE_TIMER_EVENT_TRIGGERED: "sap-icon://workflow/intermediateTimerEvent",
        MAILTASK_CREATED: "sap-icon://email",
        MAILTASK_COMPLETED: "sap-icon://email",
        MAILTASK_FAILED: "sap-icon://email",
        PARALLEL_GATEWAY_REACHED: "sap-icon://workflow/parallelGateway",
        PARALLEL_GATEWAY_FAILED: "sap-icon://workflow/parallelGateway",
        EXCLUSIVE_GATEWAY_REACHED: "sap-icon://workflow/exclusiveGateway",
        EXCLUSIVE_GATEWAY_FAILED: "sap-icon://workflow/exclusiveGateway",
        REFERENCED_SUBFLOW_STARTED: "sap-icon://workflow/referenceSubflow",
        REFERENCED_SUBFLOW_COMPLETED: "sap-icon://workflow/referenceSubflow",
        REFERENCED_SUBFLOW_FAILED: "sap-icon://workflow/referenceSubflow"
    }


	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
        },
        
        formatURL: function(sURL){

            if(sURL)
            {
                return ("https://").concat(location.host, "/KNPL_PAINTER_API" ,new URL(sURL).pathname);
            }
        },
        
        formatLogIcon : function(sStatus){
            return wfIcons[sStatus];
        },

        formatExecutionLogTitle: function(e, r) {
         //   return t.getText("EXECUTION_LOG_TYPE_" + e, [r])
        }





	};

});