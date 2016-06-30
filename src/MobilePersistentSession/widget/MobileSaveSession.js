/*global logger*/
/*
    MobileSaveSession
    ========================

    @file      : MobileSaveSession.js
    @version   : 1.0
    @author    : Eric Tieniber
    @date      : Mon, 13 Jun 2016 18:15:07 GMT
    @copyright : 
    @license   : MIT

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event"
], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    // Declare widget's prototype.
    return declare("MobilePersistentSession.widget.MobileSaveSession", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        loginUUIDAttr: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
		_context: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");

        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");
			this._context = obj;
			
			
			if (this._context !== null && this.loginUUIDAttr && window.cordova && window.localStorage) {
				var loginUUID = this._context.get(this.loginUUIDAttr);
				if (loginUUID) {
					window.localStorage.loginToken = loginUUID;	
				}
			}
			
			callback();
        },


        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        }
    });
});

require(["MobilePersistentSession/widget/MobileSaveSession"]);
