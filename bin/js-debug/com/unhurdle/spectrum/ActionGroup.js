/**
 * Generated by Apache Royale Compiler from com/unhurdle/spectrum/ActionGroup.as
 * com.unhurdle.spectrum.ActionGroup
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('com.unhurdle.spectrum.ActionGroup');
/* Royale Dependency List: com.unhurdle.spectrum.ActionButton,com.unhurdle.spectrum.ISpectrumElement,com.unhurdle.spectrum.includes.ActionButtonInclude,org.apache.royale.core.IChild,org.apache.royale.utils.Language*/

goog.require('com.unhurdle.spectrum.Group');



/**
 * @constructor
 * @extends {com.unhurdle.spectrum.Group}
 */
com.unhurdle.spectrum.ActionGroup = function() {
  com.unhurdle.spectrum.ActionGroup.base(this, 'constructor');
};
goog.inherits(com.unhurdle.spectrum.ActionGroup, com.unhurdle.spectrum.Group);


/**
 * @protected
 * @override
 */
com.unhurdle.spectrum.ActionGroup.prototype.getSelector = function() {
  return "spectrum-ActionGroup";
};


/**
 * @private
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.com_unhurdle_spectrum_ActionGroup__vertical = false;


/**
 * @private
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.com_unhurdle_spectrum_ActionGroup__horizontal = false;


/**
 * @private
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.com_unhurdle_spectrum_ActionGroup__justified = false;


/**
 * @private
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.com_unhurdle_spectrum_ActionGroup__quiet = false;


/**
 * @private
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.com_unhurdle_spectrum_ActionGroup__compact = false;


/**
 * @override
 */
com.unhurdle.spectrum.ActionGroup.prototype.addElement = function(c, dispatchEvent) {
  dispatchEvent = typeof dispatchEvent !== 'undefined' ? dispatchEvent : true;
  com.unhurdle.spectrum.ActionGroup.superClass_.addElement.apply(this, [c, dispatchEvent]);
  this.com_unhurdle_spectrum_ActionGroup_appendItemSelector(c, true);
};


/**
 * @override
 */
com.unhurdle.spectrum.ActionGroup.prototype.addElementAt = function(c, index, dispatchEvent) {
  dispatchEvent = typeof dispatchEvent !== 'undefined' ? dispatchEvent : true;
  com.unhurdle.spectrum.ActionGroup.superClass_.addElementAt.apply(this, [c, index, dispatchEvent]);
  this.com_unhurdle_spectrum_ActionGroup_appendItemSelector(c, true);
};


/**
 * @override
 */
com.unhurdle.spectrum.ActionGroup.prototype.removeElement = function(c, dispatchEvent) {
  dispatchEvent = typeof dispatchEvent !== 'undefined' ? dispatchEvent : true;
  com.unhurdle.spectrum.ActionGroup.superClass_.removeElement.apply(this, [c, dispatchEvent]);
  this.com_unhurdle_spectrum_ActionGroup_appendItemSelector(c, false);
};


/**
 * @royaleemitcoercion com.unhurdle.spectrum.ISpectrumElement
 * @private
 * @param {Object} c
 * @param {Object} add
 */
com.unhurdle.spectrum.ActionGroup.prototype.com_unhurdle_spectrum_ActionGroup_appendItemSelector = function(c, add) {
  var /** @type {com.unhurdle.spectrum.ISpectrumElement} */ spectrumItem = org.apache.royale.utils.Language.as(c, com.unhurdle.spectrum.ISpectrumElement);
  if (spectrumItem) {
    spectrumItem.toggle(this.appendSelector("-item"), add);
    if (this.quiet) {
      if (add) {
        spectrumItem.toggle(com.unhurdle.spectrum.includes.ActionButtonInclude.getSelector() + "--quiet", add);
      } else {
        if (org.apache.royale.utils.Language.is(!spectrumItem, com.unhurdle.spectrum.ActionButton) || !spectrumItem.quiet) {
          spectrumItem.toggle(com.unhurdle.spectrum.includes.ActionButtonInclude.getSelector() + "--quiet", add);
        }
      }
    }
  }
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.vertical;


com.unhurdle.spectrum.ActionGroup.prototype.get__vertical = function() {
  return this.com_unhurdle_spectrum_ActionGroup__vertical;
};


com.unhurdle.spectrum.ActionGroup.prototype.set__vertical = function(value) {
  if (value != !!this.com_unhurdle_spectrum_ActionGroup__vertical) {
    this.toggle(this.valueToSelector("vertical"), value);
  }
  this.com_unhurdle_spectrum_ActionGroup__vertical = value;
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.horizontal;


com.unhurdle.spectrum.ActionGroup.prototype.get__horizontal = function() {
  return this.com_unhurdle_spectrum_ActionGroup__horizontal;
};


com.unhurdle.spectrum.ActionGroup.prototype.set__horizontal = function(value) {
  if (value != !!this.com_unhurdle_spectrum_ActionGroup__horizontal) {
    this.toggle(this.valueToSelector("horizontal"), value);
  }
  this.com_unhurdle_spectrum_ActionGroup__horizontal = value;
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.justified;


com.unhurdle.spectrum.ActionGroup.prototype.get__justified = function() {
  return this.com_unhurdle_spectrum_ActionGroup__justified;
};


com.unhurdle.spectrum.ActionGroup.prototype.set__justified = function(value) {
  if (value != !!this.com_unhurdle_spectrum_ActionGroup__justified) {
    this.toggle(this.valueToSelector("justified"), value);
  }
  this.com_unhurdle_spectrum_ActionGroup__justified = value;
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.quiet;


com.unhurdle.spectrum.ActionGroup.prototype.get__quiet = function() {
  return this.com_unhurdle_spectrum_ActionGroup__quiet;
};


com.unhurdle.spectrum.ActionGroup.prototype.set__quiet = function(value) {
  if (this.com_unhurdle_spectrum_ActionGroup__quiet != value) {
    this.toggle(this.valueToSelector("quiet"), value);
  }
  this.com_unhurdle_spectrum_ActionGroup__quiet = value;
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
com.unhurdle.spectrum.ActionGroup.prototype.compact;


com.unhurdle.spectrum.ActionGroup.prototype.get__compact = function() {
  return this.com_unhurdle_spectrum_ActionGroup__compact;
};


com.unhurdle.spectrum.ActionGroup.prototype.set__compact = function(value) {
  if (value != !!this.com_unhurdle_spectrum_ActionGroup__compact) {
    this.toggle(this.valueToSelector("compact"), value);
  }
  this.com_unhurdle_spectrum_ActionGroup__compact = value;
};


Object.defineProperties(com.unhurdle.spectrum.ActionGroup.prototype, /** @lends {com.unhurdle.spectrum.ActionGroup.prototype} */ {
/**
 * @type {boolean}
 */
vertical: {
get: com.unhurdle.spectrum.ActionGroup.prototype.get__vertical,
set: com.unhurdle.spectrum.ActionGroup.prototype.set__vertical},
/**
 * @type {boolean}
 */
horizontal: {
get: com.unhurdle.spectrum.ActionGroup.prototype.get__horizontal,
set: com.unhurdle.spectrum.ActionGroup.prototype.set__horizontal},
/**
 * @type {boolean}
 */
justified: {
get: com.unhurdle.spectrum.ActionGroup.prototype.get__justified,
set: com.unhurdle.spectrum.ActionGroup.prototype.set__justified},
/**
 * @type {boolean}
 */
quiet: {
get: com.unhurdle.spectrum.ActionGroup.prototype.get__quiet,
set: com.unhurdle.spectrum.ActionGroup.prototype.set__quiet},
/**
 * @type {boolean}
 */
compact: {
get: com.unhurdle.spectrum.ActionGroup.prototype.get__compact,
set: com.unhurdle.spectrum.ActionGroup.prototype.set__compact}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
com.unhurdle.spectrum.ActionGroup.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'ActionGroup', qName: 'com.unhurdle.spectrum.ActionGroup', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
com.unhurdle.spectrum.ActionGroup.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'vertical': { type: 'Boolean', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.ActionGroup'},
        'horizontal': { type: 'Boolean', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.ActionGroup'},
        'justified': { type: 'Boolean', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.ActionGroup'},
        'quiet': { type: 'Boolean', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.ActionGroup'},
        'compact': { type: 'Boolean', access: 'readwrite', declaredBy: 'com.unhurdle.spectrum.ActionGroup'}
      };
    },
    methods: function () {
      return {
        'ActionGroup': { type: '', declaredBy: 'com.unhurdle.spectrum.ActionGroup'},
        'addElement': { type: 'void', declaredBy: 'com.unhurdle.spectrum.ActionGroup', parameters: function () { return [ 'org.apache.royale.core.IChild', false ,'Boolean', true ]; }},
        'addElementAt': { type: 'void', declaredBy: 'com.unhurdle.spectrum.ActionGroup', parameters: function () { return [ 'org.apache.royale.core.IChild', false ,'int', false ,'Boolean', true ]; }},
        'removeElement': { type: 'void', declaredBy: 'com.unhurdle.spectrum.ActionGroup', parameters: function () { return [ 'org.apache.royale.core.IChild', false ,'Boolean', true ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
com.unhurdle.spectrum.ActionGroup.prototype.ROYALE_COMPILE_FLAGS = 11;
