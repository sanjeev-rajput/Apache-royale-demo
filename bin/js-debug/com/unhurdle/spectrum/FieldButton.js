/**
 * Generated by Apache Royale Compiler from com/unhurdle/spectrum/FieldButton.as
 * com.unhurdle.spectrum.FieldButton
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('com.unhurdle.spectrum.FieldButton');
/* Royale Dependency List: com.unhurdle.spectrum.Icon*/

goog.require('com.unhurdle.spectrum.Button');



/**
 * @constructor
 * @extends {com.unhurdle.spectrum.Button}
 */
com.unhurdle.spectrum.FieldButton = function() {
  com.unhurdle.spectrum.FieldButton.base(this, 'constructor');
  this.setAttribute("type", "button");
};
goog.inherits(com.unhurdle.spectrum.FieldButton, com.unhurdle.spectrum.Button);


/**
 * @protected
 * @override
 */
com.unhurdle.spectrum.FieldButton.prototype.getSelector = function() {
  return "spectrum-FieldButton";
};


/**
 * @private
 * @type {string}
 */
com.unhurdle.spectrum.FieldButton.prototype.com_unhurdle_spectrum_FieldButton__labelClass = null;


/**
 * @private
 * @type {string}
 */
com.unhurdle.spectrum.FieldButton.prototype.com_unhurdle_spectrum_FieldButton__placeholderText = null;


/**
 * @protected
 * @override
 */
com.unhurdle.spectrum.FieldButton.prototype.createIcon = function(selector) {
  if (this.iconElement) {
    this.iconElement.selector = selector;
    this.setIconProps();
  } else {
    this.iconElement = new com.unhurdle.spectrum.Icon(selector);
    this.setIconProps();
    this.addElement(this.iconElement);
  }
};


com.unhurdle.spectrum.FieldButton.prototype.set__flavor = function(value) {
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
com.unhurdle.spectrum.FieldButton.prototype.labelClass;


com.unhurdle.spectrum.FieldButton.prototype.get__labelClass = function() {
  return this.textNode.className;
};


com.unhurdle.spectrum.FieldButton.prototype.set__labelClass = function(value) {
  this.textNode.className = value;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
com.unhurdle.spectrum.FieldButton.prototype.placeholderText;


com.unhurdle.spectrum.FieldButton.prototype.get__placeholderText = function() {
  return this.com_unhurdle_spectrum_FieldButton__placeholderText;
};


com.unhurdle.spectrum.FieldButton.prototype.set__placeholderText = function(value) {
  if (value) {
    this.text = value;
    this.textNode.element.classList.add("is-placeholder");
  } else {
    this.textNode.element.classList.remove("is-placeholder");
    if (this.com_unhurdle_spectrum_FieldButton__placeholderText && this.com_unhurdle_spectrum_FieldButton__placeholderText == this.text) {
      this.text = "";
    }
  }
  this.com_unhurdle_spectrum_FieldButton__placeholderText = value;
};


com.unhurdle.spectrum.FieldButton.prototype.set__text = function(value) {
  com.unhurdle.spectrum.FieldButton.superClass_.set__text.apply(this, [value]);
  this.placeholderText = "";
};


com.unhurdle.spectrum.FieldButton.prototype.get__invalid = function() {
  return com.unhurdle.spectrum.FieldButton.superClass_.get__invalid.apply(this);
};


com.unhurdle.spectrum.FieldButton.prototype.set__invalid = function(value) {
  com.unhurdle.spectrum.FieldButton.superClass_.set__invalid.apply(this, [value]);
};


Object.defineProperties(com.unhurdle.spectrum.FieldButton.prototype, /** @lends {com.unhurdle.spectrum.FieldButton.prototype} */ {
/**
 * @type {string}
 */
flavor: {
get: com.unhurdle.spectrum.Button.prototype.get__flavor,
set: com.unhurdle.spectrum.FieldButton.prototype.set__flavor},
/**
 * @type {string}
 */
labelClass: {
get: com.unhurdle.spectrum.FieldButton.prototype.get__labelClass,
set: com.unhurdle.spectrum.FieldButton.prototype.set__labelClass},
/**
 * @type {string}
 */
placeholderText: {
get: com.unhurdle.spectrum.FieldButton.prototype.get__placeholderText,
set: com.unhurdle.spectrum.FieldButton.prototype.set__placeholderText},
/**
 * @type {string}
 */
text: {
get: com.unhurdle.spectrum.Button.prototype.get__text,
set: com.unhurdle.spectrum.FieldButton.prototype.set__text},
/**
 * @type {boolean}
 */
invalid: {
get: com.unhurdle.spectrum.FieldButton.prototype.get__invalid,
set: com.unhurdle.spectrum.FieldButton.prototype.set__invalid}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
com.unhurdle.spectrum.FieldButton.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'FieldButton', qName: 'com.unhurdle.spectrum.FieldButton', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
com.unhurdle.spectrum.FieldButton.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'flavor': { type: 'String', access: 'writeonly', declaredBy: 'com.unhurdle.spectrum.FieldButton'},
        'labelClass': { type: 'String', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.FieldButton'},
        'placeholderText': { type: 'String', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.FieldButton'},
        'text': { type: 'String', access: 'writeonly', declaredBy: 'com.unhurdle.spectrum.FieldButton'},
        'invalid': { type: 'Boolean', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.FieldButton'}
      };
    },
    methods: function () {
      return {
        'FieldButton': { type: '', declaredBy: 'com.unhurdle.spectrum.FieldButton'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
com.unhurdle.spectrum.FieldButton.prototype.ROYALE_COMPILE_FLAGS = 11;
