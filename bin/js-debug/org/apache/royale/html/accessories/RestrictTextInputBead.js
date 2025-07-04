/**
 * Generated by Apache Royale Compiler from org/apache/royale/html/accessories/RestrictTextInputBead.as
 * org.apache.royale.html.accessories.RestrictTextInputBead
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.html.accessories.RestrictTextInputBead');
/* Royale Dependency List: org.apache.royale.core.IRenderedObject,org.apache.royale.core.IStrand,org.apache.royale.utils.Language,XML*/

goog.require('org.apache.royale.core.Bead');



/**
 *  constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.8
 * @constructor
 * @extends {org.apache.royale.core.Bead}
 */
org.apache.royale.html.accessories.RestrictTextInputBead = function() {
  org.apache.royale.html.accessories.RestrictTextInputBead.base(this, 'constructor');
};
goog.inherits(org.apache.royale.html.accessories.RestrictTextInputBead, org.apache.royale.core.Bead);


/**
 * @private
 * @type {string}
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.org_apache_royale_html_accessories_RestrictTextInputBead__restrict;


/**
 * @private
 * @param {goog.events.BrowserEvent} event
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.org_apache_royale_html_accessories_RestrictTextInputBead_validateKeypress = function(event) {
  var /** @type {number} */ code = (event.charCode) >> 0;
  var /** @type {string} */ key = String.fromCharCode(code);
  if (this.restrict) {
    var /** @type {RegExp} */ regex = new RegExp("[" + this.restrict + "]");
    if (!regex.test(key)) {
      event["returnValue"] = false;
      if (org.apache.royale.utils.Language.closure(event.preventDefault, event, 'preventDefault'))
        event.preventDefault();
      return;
    }
  }
};


/**
 *  @royaleignorecoercion HTMLInputElement 
 *  @royaleignorecoercion org.apache.royale.core.IRenderedObject
 * @private
 * @param {goog.events.BrowserEvent} event
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.org_apache_royale_html_accessories_RestrictTextInputBead_validateInput = function(event) {
  var /** @type {Object} */ host = this._strand;
  var /** @type {string} */ data = host.element.value;
  if (this.restrict && data != null && data.length > 0) {
    var /** @type {RegExp} */ regex = new RegExp("[" + this.restrict + "]");
    var /** @type {string} */ out = "";
    var /** @type {number} */ n = (data.length) >> 0;
    var /** @type {boolean} */ blocked = false;
    for (var /** @type {number} */ i = 0; i < n; i++) {
      var /** @type {string} */ key = data.charAt(i);
      if (regex.test(key)) {
        out += key;
      }
      else
        blocked = true;
    }
    if (blocked) {
      event["returnValue"] = false;
      if (org.apache.royale.utils.Language.closure(event.preventDefault, event, 'preventDefault'))
        event.preventDefault();
      host.element.value = out;
    }
  }
};


org.apache.royale.html.accessories.RestrictTextInputBead.prototype.set__strand = function(value) {
  this._strand = value;
  
  var /** @type {Object} */ host = this._strand;
  host.element.addEventListener("keypress", org.apache.royale.utils.Language.closure(this.org_apache_royale_html_accessories_RestrictTextInputBead_validateKeypress, this, 'org_apache_royale_html_accessories_RestrictTextInputBead_validateKeypress'), false);
  host.element.addEventListener("input", org.apache.royale.utils.Language.closure(this.org_apache_royale_html_accessories_RestrictTextInputBead_validateInput, this, 'org_apache_royale_html_accessories_RestrictTextInputBead_validateInput'), false);
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.restrict;


org.apache.royale.html.accessories.RestrictTextInputBead.prototype.get__restrict = function() {
  return this.org_apache_royale_html_accessories_RestrictTextInputBead__restrict;
};


org.apache.royale.html.accessories.RestrictTextInputBead.prototype.set__restrict = function(value) {
  if (this.org_apache_royale_html_accessories_RestrictTextInputBead__restrict != value) {
    this.org_apache_royale_html_accessories_RestrictTextInputBead__restrict = value;
  }
};


Object.defineProperties(org.apache.royale.html.accessories.RestrictTextInputBead.prototype, /** @lends {org.apache.royale.html.accessories.RestrictTextInputBead.prototype} */ {
/**
 * @type {org.apache.royale.core.IStrand}
 */
strand: {
set: org.apache.royale.html.accessories.RestrictTextInputBead.prototype.set__strand},
/**
 * @type {string}
 */
restrict: {
get: org.apache.royale.html.accessories.RestrictTextInputBead.prototype.get__restrict,
set: org.apache.royale.html.accessories.RestrictTextInputBead.prototype.set__restrict}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'RestrictTextInputBead', qName: 'org.apache.royale.html.accessories.RestrictTextInputBead', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'strand': { type: 'org.apache.royale.core.IStrand', access: 'writeonly', declaredBy: 'org.apache.royale.html.accessories.RestrictTextInputBead'},
        'restrict': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.html.accessories.RestrictTextInputBead'}
      };
    },
    methods: function () {
      return {
        'RestrictTextInputBead': { type: '', declaredBy: 'org.apache.royale.html.accessories.RestrictTextInputBead'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.html.accessories.RestrictTextInputBead.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./RestrictTextInputBead.js.map
