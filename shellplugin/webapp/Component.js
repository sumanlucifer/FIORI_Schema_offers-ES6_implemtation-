sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/knpl/pragati/shellplugin/shellplugin/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.knpl.pragati.shellplugin.shellplugin.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                var rendererPromise = this._getRenderer();
                rendererPromise.then(function(oRenderer) {
                    oRenderer.addActionButton("sap.m.Button", {
                        id: "myHomeButton",
                        icon: "sap-icon://documents",
                        text: "Reset Password",
                        press: function () {
                            window.open("https://www.google.com/","_blank");
                            
                            
                        }
                    }, true, false, [sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState.Home, sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState.App]);
                                    
                });
            },
    
            _getRenderer: function () {
                var that = this,
                    oDeferred = new jQuery.Deferred(),
                    oRenderer;
    
    
                that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
                if (!that._oShellContainer) {
                    oDeferred.reject(
                        "Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
                } else {
                    oRenderer = that._oShellContainer.getRenderer();
                    if (oRenderer) {
                        oDeferred.resolve(oRenderer);
                    } else {
                        // renderer not initialized yet, listen to rendererCreated event
                        that._onRendererCreated = function (oEvent) {
                            oRenderer = oEvent.getParameter("renderer");
                            if (oRenderer) {
                                oDeferred.resolve(oRenderer);
                            } else {
                                oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
                            }
                        };
                        that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
                    }
                }
                return oDeferred.promise();
            }
           
    
    
        });
    });