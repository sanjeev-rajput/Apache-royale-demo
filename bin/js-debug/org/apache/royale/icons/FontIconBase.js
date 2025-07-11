/**
 * Generated by Apache Royale Compiler from org/apache/royale/icons/FontIconBase.as
 * org.apache.royale.icons.FontIconBase
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.icons.FontIconBase');
/* Royale Dependency List: org.apache.royale.core.WrappedHTMLElement,org.apache.royale.html.util.addElementToWrapper*/

goog.require('org.apache.royale.core.StyledUIBase');
goog.require('org.apache.royale.core.IIcon');



/**
 *  constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.3
 * @constructor
 * @extends {org.apache.royale.core.StyledUIBase}
 * @implements {org.apache.royale.core.IIcon}
 */
org.apache.royale.icons.FontIconBase = function() {
  org.apache.royale.icons.FontIconBase.base(this, 'constructor');
  this.typeNames = "";
};
goog.inherits(org.apache.royale.icons.FontIconBase, org.apache.royale.core.StyledUIBase);


/**
 * @protected
 * @type {string}
 */
org.apache.royale.icons.FontIconBase.prototype._text = "";


/**
 * @protected
 * @type {Text}
 */
org.apache.royale.icons.FontIconBase.prototype.textNode;


/**
 * @royaleignorecoercion org.apache.royale.core.WrappedHTMLElement
 * @royaleignorecoercion HTMLElement
 * @royaleignorecoercion Text
 * @protected
 * @override
 */
org.apache.royale.icons.FontIconBase.prototype.createElement = function() {
  var /** @type {Object} */ i = org.apache.royale.html.util.addElementToWrapper(this, 'i');
  this.textNode = document.createTextNode(this.iconText);
  this.textNode.textContent = '';
  i.appendChild(this.textNode);
  return this.element;
};


/**
 * @private
 * @type {number}
 */
org.apache.royale.icons.FontIconBase.prototype.org_apache_royale_icons_FontIconBase__size = 24;


/**
 * @private
 * @type {boolean}
 */
org.apache.royale.icons.FontIconBase.prototype.org_apache_royale_icons_FontIconBase__dark;


/**
 * @private
 * @type {boolean}
 */
org.apache.royale.icons.FontIconBase.prototype.org_apache_royale_icons_FontIconBase__light;


/**
 * @private
 * @type {boolean}
 */
org.apache.royale.icons.FontIconBase.prototype.org_apache_royale_icons_FontIconBase__inactive;


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.icons.FontIconBase.prototype.text;


org.apache.royale.icons.FontIconBase.prototype.get__text = function() {
  return this._text;
};


org.apache.royale.icons.FontIconBase.prototype.set__text = function(value) {
  this._text = value;
};


/**
 * @nocollapse
 * @type {string}
 */
org.apache.royale.icons.FontIconBase.prototype.iconText;


org.apache.royale.icons.FontIconBase.prototype.get__iconText = function() {
  return "";
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.icons.FontIconBase.prototype.size;


org.apache.royale.icons.FontIconBase.prototype.get__size = function() {
  return this.org_apache_royale_icons_FontIconBase__size;
};


org.apache.royale.icons.FontIconBase.prototype.set__size = function(value) {
  if (this.org_apache_royale_icons_FontIconBase__size != value) {
    this.removeClass("size-" + this.org_apache_royale_icons_FontIconBase__size);
    this.org_apache_royale_icons_FontIconBase__size = value;
    this.addClass("size-" + this.org_apache_royale_icons_FontIconBase__size);
  }
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
org.apache.royale.icons.FontIconBase.prototype.dark;


org.apache.royale.icons.FontIconBase.prototype.get__dark = function() {
  return this.org_apache_royale_icons_FontIconBase__dark;
};


org.apache.royale.icons.FontIconBase.prototype.set__dark = function(value) {
  if (this.org_apache_royale_icons_FontIconBase__dark != value) {
    this.org_apache_royale_icons_FontIconBase__dark = value;
    this.toggleClass("dark", this.org_apache_royale_icons_FontIconBase__dark);
  }
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
org.apache.royale.icons.FontIconBase.prototype.light;


org.apache.royale.icons.FontIconBase.prototype.get__light = function() {
  return this.org_apache_royale_icons_FontIconBase__light;
};


org.apache.royale.icons.FontIconBase.prototype.set__light = function(value) {
  if (this.org_apache_royale_icons_FontIconBase__light != value) {
    this.org_apache_royale_icons_FontIconBase__light = value;
    this.toggleClass("light", this.org_apache_royale_icons_FontIconBase__light);
  }
};


/**
 * @nocollapse
 * @export
 * @type {boolean}
 */
org.apache.royale.icons.FontIconBase.prototype.inactive;


org.apache.royale.icons.FontIconBase.prototype.get__inactive = function() {
  return this.org_apache_royale_icons_FontIconBase__inactive;
};


org.apache.royale.icons.FontIconBase.prototype.set__inactive = function(value) {
  if (this.org_apache_royale_icons_FontIconBase__inactive != value) {
    this.org_apache_royale_icons_FontIconBase__inactive = value;
    this.toggleClass("inactive", this.org_apache_royale_icons_FontIconBase__inactive);
  }
};


Object.defineProperties(org.apache.royale.icons.FontIconBase.prototype, /** @lends {org.apache.royale.icons.FontIconBase.prototype} */ {
/**
 * @type {string}
 */
text: {
get: org.apache.royale.icons.FontIconBase.prototype.get__text,
set: org.apache.royale.icons.FontIconBase.prototype.set__text},
/**
 * @type {string}
 */
iconText: {
get: org.apache.royale.icons.FontIconBase.prototype.get__iconText},
/**
 * @type {number}
 */
size: {
get: org.apache.royale.icons.FontIconBase.prototype.get__size,
set: org.apache.royale.icons.FontIconBase.prototype.set__size},
/**
 * @type {boolean}
 */
dark: {
get: org.apache.royale.icons.FontIconBase.prototype.get__dark,
set: org.apache.royale.icons.FontIconBase.prototype.set__dark},
/**
 * @type {boolean}
 */
light: {
get: org.apache.royale.icons.FontIconBase.prototype.get__light,
set: org.apache.royale.icons.FontIconBase.prototype.set__light},
/**
 * @type {boolean}
 */
inactive: {
get: org.apache.royale.icons.FontIconBase.prototype.get__inactive,
set: org.apache.royale.icons.FontIconBase.prototype.set__inactive}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.icons.FontIconBase.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'FontIconBase', qName: 'org.apache.royale.icons.FontIconBase', kind: 'class' }], interfaces: [org.apache.royale.core.IIcon] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.icons.FontIconBase.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'text': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.icons.FontIconBase'},
        'size': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.icons.FontIconBase'},
        'dark': { type: 'Boolean', access: 'readwrite', declaredBy: 'org.apache.royale.icons.FontIconBase'},
        'light': { type: 'Boolean', access: 'readwrite', declaredBy: 'org.apache.royale.icons.FontIconBase'},
        'inactive': { type: 'Boolean', access: 'readwrite', declaredBy: 'org.apache.royale.icons.FontIconBase'}
      };
    },
    methods: function () {
      return {
        'FontIconBase': { type: '', declaredBy: 'org.apache.royale.icons.FontIconBase'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.icons.FontIconBase.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./FontIconBase.js.map
