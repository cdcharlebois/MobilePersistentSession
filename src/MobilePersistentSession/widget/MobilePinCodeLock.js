/*global logger*/
/*
    MobilePinCodeLock
    ========================

    @file      : MobilePinCodeLock.js
    @version   : 1.0
    @author    : Eric Tieniber
    @date      : Mon, 13 Jun 2016 18:15:07 GMT
    @copyright :
    @license   : MIT

    Documentation
    ========================
    Shows a native mobile pincode prompt when the app is resumed. Calls a verification microflow, and logs the user out if they fail to verify.
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
    return declare("MobilePersistentSession.widget.MobilePinCodeLock", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        title: "",
		message: "",
		validationMicroflow: "",
		pinCodeEntity: "",
		pinCodeAttribute: "",
		numAttemptsAllowed: 3,
		useTouchIdAttr: "",
		enabledAttr: "",
		touchIdPrompt: "Scan your fingerprint",
		lockNow: false,
		successMicroflow: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
		_contextObj: null,
		_enteredPin: "",
		_numTries: 0,
		_listener: null,
		_usePin: false,

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

			this._contextObj = obj;

			if (this._contextObj) {
				if (this.pinCodeEntity !== null && this.pinCodeAttribute) {
					//If the plugin exists, great, show the dialog. Otherwise, show an error.
					if(window.cordova && window.plugins && window.plugins.pinDialog) {
						if (this.lockNow) {
							this._prompt();
						} else {
							this._listener = on(document, "resume", dojoLang.hitch(this, this._prompt));
						}
					} else {
						//mx.ui.error("Sorry, your device does not support pin codes.");
					}
				}
			}

			callback();
        },

		_prompt: function() {
			if (this._contextObj && this._contextObj.get(this.enabledAttr)) {
				if (!this._usePin && window.plugins.touchid && this._contextObj && this._contextObj.get(this.useTouchIdAttr)) {
					window.plugins.touchid.isAvailable(
					  dojoLang.hitch(this, this._showTouchIdPrompt), // success handler: TouchID available
					  dojoLang.hitch(this, this._showPinPrompt) // error handler: no TouchID available
					);
				} else {
					this._showPinPrompt();
				}
			}
		},

		_showPinPrompt: function() {
			this._lockBackButton();

			window.plugins.pinDialog.prompt(this.message, dojoLang.hitch(this, this._promptCallback), this.title, ["OK","Cancel"]);
		},

		_lockBackButton: function() {
			document.addEventListener("backbutton", this._backButtonEventHandler, false);
		},

		_unlockBackButton: function() {
			document.removeEventListener("backbutton", this._backButtonEventHandler, false);
		},

		_backButtonEventHandler: function(e) {
			e.preventDefault();
			navigator.app.exitApp();
		},

		_showTouchIdPrompt: function() {
			window.plugins.touchid.verifyFingerprintWithCustomPasswordFallbackAndEnterPasswordLabel(
			  this.touchIdPrompt, // this will be shown in the native scanner popup
			  'Enter PIN', // this will become the 'Enter password' button label
			   dojoLang.hitch(this, this._validationSuccess), // success handler: fingerprint accepted
			   dojoLang.hitch(this, this._touchIdFail) // error handler with errorcode and localised reason
			);
		},

		_promptCallback: function(results) {
			if(results.buttonIndex == 1) {
				// OK clicked, set value in context entity (pinCodeAttribute), then call validation microflow
				//this._context.set(this.pinCodeAttribute, results.input1);
				this._enteredPin = results.input1;

				this._createPinCodeEntity(this._callValidation, this._validationFail);

			} else if(results.buttonIndex == 2 || results.buttonIndex == 0) {
				// Cancel clicked
				if (window.localStorage && window.localStorage.loginToken) {
					window.localStorage.removeItem("loginToken");
				}
				mx.logout();
			}
		},

		_createPinCodeEntity: function(success, error) {
			mx.data.create({
				entity: this.pinCodeEntity,
				callback: success,
				error: error
			}, this);
		},

		_callValidation: function (mxObj) {
			//Code here for setting attributes!
			mxObj.set(this.pinCodeAttribute, this._enteredPin);

			mx.data.action({
				params: {
					applyto: "selection",
					actionname: this.validationMicroflow,
					guids: [mxObj.getGuid()]
				},
				store: {
					caller: this.mxform
				},
				callback: dojoLang.hitch(this, function (myBool) {
					//TODO what to do when all is ok!
					if (myBool) {
						this._validationSuccess();
					} else {
						this._validationFail();
					}
				}),
				error: function (error) {
					console.log(this.id + ": An error occurred while executing validation microflow: " + error.description);
				}
			}, this);
		},

		_validationSuccess: function() {
			//if there's a success MF, call it
			if (this.successMicroflow) {
				mx.data.action({
					params: {
						applyto: "selection",
						actionname: this.successMicroflow,
						guids: [this._contextObj.getGuid()]
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

		_touchIdFail: function(msg) {
			if(msg && msg.code == -3) {
				//Use PIN button touched
				this._usePin = true;
				this._prompt();
			} else {
				this._validationFail();
			}
		},

		_validationFail: function() {
			this._numTries = this._numTries + 1;

			if (this._numTries > this.numAttemptsAllowed) {
				if (window.localStorage && window.localStorage.loginToken) {
					window.localStorage.removeItem("loginToken");
				}
				mx.logout();
			} else {
				this._prompt();
			}
		},

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
			if (this._listener) {
				this._listener.remove();
			}
        }
    });
});

require(["MobilePersistentSession/widget/MobilePinCodeLock"]);
