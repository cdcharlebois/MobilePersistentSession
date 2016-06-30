/*global logger*/
/*
    MobilePinCodePrompt
    ========================

    @file      : MobilePinCodePrompt.js
    @version   : 1.0
    @author    : Eric Tieniber
    @date      : Mon, 13 Jun 2016 18:15:07 GMT
    @copyright : 
    @license   : MIT

    Documentation
    ========================
    Shows a native mobile pincode prompt when loaded. Calls microflows based on the outcome.
	Uses the following plugin for phonegap https://github.com/Paldom/PinDialog, so include this in your config.xml file:
			<gap:plugin name="cordova-plugin-pindialog" source="npm"/>
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
    "dojo/_base/event",
	"dojo/on"
], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, on) {
    "use strict";

    // Declare widget's prototype.
    return declare("MobilePersistentSession.widget.MobilePinCodePrompt", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        title: "",
		message: "",
		successMicroflow: "",
		cancelMicroflow: "",
		pinCodeAttribute: "",
		useTouchId: true,

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
			
			
			if (this._context !== null && this.pinCodeAttribute) {
				//If the plugin exists, great, show the dialog. Otherwise, show an error.
				if(window.cordova && window.plugins && window.plugins.pinDialog) {   
					window.plugins.pinDialog.prompt(this.message, dojoLang.hitch(this, this._promptCallback), this.title, ["OK","Cancel"]);
				} else {
					mx.ui.error("Sorry, your device does not support pin codes.");
				}
			}
			
			
			callback();
        },
			
		_promptCallback: function(results) {
			if(results.buttonIndex == 1) {
				// OK clicked, set value in context entity (pinCodeAttribute), then call success microflow
				this._context.set(this.pinCodeAttribute, results.input1);
				
				mx.data.action({
					params: {
						applyto: "selection",
						actionname: this.successMicroflow,
						guids: [this._context.getGuid()]
					},
					store: {
						caller: this.mxform
					},
					callback: function (obj) {
						//TODO what to do when all is ok!
					},
					error: dojoLang.hitch(this, function (error) {
						console.log(this.id + ": An error occurred while executing microflow: " + error.description);
					})
				}, this);
				
			} else if(results.buttonIndex == 2) {
				// Cancel clicked
				mx.data.action({
				params: {
					applyto: "selection",
					actionname: this.cancelMicroflow,
					guids: [this._context.getGuid()]
				},
				store: {
					caller: this.mxform
				},
				callback: function (obj) {
					//TODO what to do when all is ok!
				},
				error: dojoLang.hitch(this, function (error) {
					console.log(this.id + ": An error occurred while executing microflow: " + error.description);
				})
			}, this);
			}
		},


        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        }
    });
});

require(["MobilePersistentSession/widget/MobilePinCodePrompt"]);
