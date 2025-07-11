/**
 * Generated by Apache Royale Compiler from org/apache/royale/jewel/TitleBar.as
 * org.apache.royale.jewel.TitleBar
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.jewel.TitleBar');
/* Royale Dependency List: org.apache.royale.core.IBeadLayout,org.apache.royale.core.ITitleBarModel,org.apache.royale.core.WrappedHTMLElement,org.apache.royale.html.util.addElementToWrapper,org.apache.royale.utils.loadBeadFromValuesManager*/

goog.require('org.apache.royale.jewel.Group');
goog.require('org.apache.royale.core.IChrome');



/**
 *  constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.4
 * @constructor
 * @extends {org.apache.royale.jewel.Group}
 * @implements {org.apache.royale.core.IChrome}
 */
org.apache.royale.jewel.TitleBar = function() {
  org.apache.royale.jewel.TitleBar.base(this, 'constructor');
  this.typeNames = "jewel titlebar";
};
goog.inherits(org.apache.royale.jewel.TitleBar, org.apache.royale.jewel.Group);


/**
 * @asprivate
 * @override
 */
org.apache.royale.jewel.TitleBar.prototype.addedToParent = function() {
  org.apache.royale.jewel.TitleBar.superClass_.addedToParent.apply(this);
  org.apache.royale.utils.loadBeadFromValuesManager(org.apache.royale.core.IBeadLayout, "iBeadLayout", this);
};


/**
 * @royaleignorecoercion org.apache.royale.core.WrappedHTMLElement
 * @protected
 * @override
 */
org.apache.royale.jewel.TitleBar.prototype.createElement = function() {
  return org.apache.royale.html.util.addElementToWrapper(this, 'div');
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.TitleBar.prototype.title;


org.apache.royale.jewel.TitleBar.prototype.get__title = function() {
  return this.model.title;
};


org.apache.royale.jewel.TitleBar.prototype.set__title = function(value) {
  this.model.title = value;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.TitleBar.prototype.htmlTitle;


org.apache.royale.jewel.TitleBar.prototype.get__htmlTitle = function() {
  return this.model.htmlTitle;
};


org.apache.royale.jewel.TitleBar.prototype.set__htmlTitle = function(value) {
  this.model.htmlTitle = value;
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
org.apache.royale.jewel.TitleBar.prototype.showCloseButton;


org.apache.royale.jewel.TitleBar.prototype.get__showCloseButton = function() {
  return this.model.showCloseButton;
};


org.apache.royale.jewel.TitleBar.prototype.set__showCloseButton = function(value) {
  this.model.showCloseButton = value;
};


Object.defineProperties(org.apache.royale.jewel.TitleBar.prototype, /** @lends {org.apache.royale.jewel.TitleBar.prototype} */ {
/**
 * @type {string}
 */
title: {
get: org.apache.royale.jewel.TitleBar.prototype.get__title,
set: org.apache.royale.jewel.TitleBar.prototype.set__title},
/**
 * @type {string}
 */
htmlTitle: {
get: org.apache.royale.jewel.TitleBar.prototype.get__htmlTitle,
set: org.apache.royale.jewel.TitleBar.prototype.set__htmlTitle},
/**
 * @type {boolean}
 */
showCloseButton: {
get: org.apache.royale.jewel.TitleBar.prototype.get__showCloseButton,
set: org.apache.royale.jewel.TitleBar.prototype.set__showCloseButton}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.jewel.TitleBar.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'TitleBar', qName: 'org.apache.royale.jewel.TitleBar', kind: 'class' }], interfaces: [org.apache.royale.core.IChrome] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.jewel.TitleBar.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'title': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.TitleBar'},
        'htmlTitle': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.TitleBar'},
        'showCloseButton': { type: 'Boolean', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.TitleBar'}
      };
    },
    methods: function () {
      return {
        'TitleBar': { type: '', declaredBy: 'org.apache.royale.jewel.TitleBar'},
        'addedToParent': { type: 'void', declaredBy: 'org.apache.royale.jewel.TitleBar'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.jewel.TitleBar.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./TitleBar.js.map
