sap.ui.define([
    "sap/ushell/appRuntime/ui5/SessionHandlerAgent"
], function(SessionHandlerAgent) {
    "use strict";

    var service = {
        REFRESH_INTERVAL_IN_MINUTES: 5
    };
    
    service._userActivityHandler = function () {
        jQuery(document).trigger("touchstart.sessionTimeout");
    };

    service._extendSession = function(){
        SessionHandlerAgent.handleExtendSessionEvent().then(function(){
            //console.log('Session Keep Alive: Success');
        }).catch(function(){
            //console.log('Session Keep Alive: Error');
        });
    };

    service.sessionKeepAlive = function () {
        if(!window.fioriSessionInterval) {
            window.fioriSessionInterval = setInterval(function() {
                service._userActivityHandler();
                service._extendSession();
            }, service.REFRESH_INTERVAL_IN_MINUTES * 60000);
        }    
    };

    return service;
});
