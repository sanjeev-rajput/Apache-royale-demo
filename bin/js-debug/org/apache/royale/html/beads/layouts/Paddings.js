/**
 * Generated by Apache Royale Compiler from org/apache/royale/html/beads/layouts/Paddings.as
 * org.apache.royale.html.beads.layouts.Paddings
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.html.beads.layouts.Paddings');
/* Royale Dependency List: org.apache.royale.core.IStrand,org.apache.royale.core.IUIBase,org.apache.royale.utils.Language,XML*/

goog.require('org.apache.royale.html.beads.IPaddings');



/**
 * @constructor
 * @implements {org.apache.royale.html.beads.IPaddings}
 */
org.apache.royale.html.beads.layouts.Paddings = function() {
};


/**
 * @protected
 * @type {org.apache.royale.core.IUIBase}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.host;


/**
 * @private
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.org_apache_royale_html_beads_layouts_Paddings__padding;


/**
 * @private
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.org_apache_royale_html_beads_layouts_Paddings__paddingTop;


/**
 * @private
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.org_apache_royale_html_beads_layouts_Paddings__paddingRight;


/**
 * @private
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.org_apache_royale_html_beads_layouts_Paddings__paddingBottom;


/**
 * @private
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.org_apache_royale_html_beads_layouts_Paddings__paddingLeft;


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.strand;


org.apache.royale.html.beads.layouts.Paddings.prototype.set__strand = function(value) {
  this.host = org.apache.royale.utils.Language.as(value, org.apache.royale.core.IUIBase);
  if (this.org_apache_royale_html_beads_layouts_Paddings__padding) {
    this.org_apache_royale_html_beads_layouts_Paddings__paddingTop = this.org_apache_royale_html_beads_layouts_Paddings__padding;
    this.org_apache_royale_html_beads_layouts_Paddings__paddingRight = this.org_apache_royale_html_beads_layouts_Paddings__padding;
    this.org_apache_royale_html_beads_layouts_Paddings__paddingBottom = this.org_apache_royale_html_beads_layouts_Paddings__padding;
    this.org_apache_royale_html_beads_layouts_Paddings__paddingLeft = this.org_apache_royale_html_beads_layouts_Paddings__padding;
    this.host.positioner.style.padding = this.org_apache_royale_html_beads_layouts_Paddings__padding + "px";
  } else {
    this.host.positioner.style.paddingTop = this.org_apache_royale_html_beads_layouts_Paddings__paddingTop + "px";
    this.host.positioner.style.paddingRight = this.org_apache_royale_html_beads_layouts_Paddings__paddingRight + "px";
    this.host.positioner.style.paddingBottom = this.org_apache_royale_html_beads_layouts_Paddings__paddingBottom + "px";
    this.host.positioner.style.paddingLeft = this.org_apache_royale_html_beads_layouts_Paddings__paddingLeft + "px";
  }
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.padding;


org.apache.royale.html.beads.layouts.Paddings.prototype.get__padding = function() {
  return this.org_apache_royale_html_beads_layouts_Paddings__padding;
};


org.apache.royale.html.beads.layouts.Paddings.prototype.set__padding = function(value) {
  this.org_apache_royale_html_beads_layouts_Paddings__padding = value;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.paddingTop;


org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingTop = function() {
  return this.org_apache_royale_html_beads_layouts_Paddings__paddingTop;
};


org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingTop = function(value) {
  this.org_apache_royale_html_beads_layouts_Paddings__paddingTop = value;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.paddingRight;


org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingRight = function() {
  return this.org_apache_royale_html_beads_layouts_Paddings__paddingRight;
};


org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingRight = function(value) {
  this.org_apache_royale_html_beads_layouts_Paddings__paddingRight = value;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.paddingBottom;


org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingBottom = function() {
  return this.org_apache_royale_html_beads_layouts_Paddings__paddingBottom;
};


org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingBottom = function(value) {
  this.org_apache_royale_html_beads_layouts_Paddings__paddingBottom = value;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.paddingLeft;


org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingLeft = function() {
  return this.org_apache_royale_html_beads_layouts_Paddings__paddingLeft;
};


org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingLeft = function(value) {
  this.org_apache_royale_html_beads_layouts_Paddings__paddingLeft = value;
};


Object.defineProperties(org.apache.royale.html.beads.layouts.Paddings.prototype, /** @lends {org.apache.royale.html.beads.layouts.Paddings.prototype} */ {
/**
 * @type {org.apache.royale.core.IStrand}
 */
strand: {
set: org.apache.royale.html.beads.layouts.Paddings.prototype.set__strand},
/**
 * @type {number}
 */
padding: {
get: org.apache.royale.html.beads.layouts.Paddings.prototype.get__padding,
set: org.apache.royale.html.beads.layouts.Paddings.prototype.set__padding},
/**
 * @type {number}
 */
paddingTop: {
get: org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingTop,
set: org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingTop},
/**
 * @type {number}
 */
paddingRight: {
get: org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingRight,
set: org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingRight},
/**
 * @type {number}
 */
paddingBottom: {
get: org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingBottom,
set: org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingBottom},
/**
 * @type {number}
 */
paddingLeft: {
get: org.apache.royale.html.beads.layouts.Paddings.prototype.get__paddingLeft,
set: org.apache.royale.html.beads.layouts.Paddings.prototype.set__paddingLeft}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'Paddings', qName: 'org.apache.royale.html.beads.layouts.Paddings', kind: 'class' }], interfaces: [org.apache.royale.html.beads.IPaddings] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'strand': { type: 'org.apache.royale.core.IStrand', access: 'writeonly', declaredBy: 'org.apache.royale.html.beads.layouts.Paddings'},
        'padding': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.html.beads.layouts.Paddings'},
        'paddingTop': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.html.beads.layouts.Paddings'},
        'paddingRight': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.html.beads.layouts.Paddings'},
        'paddingBottom': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.html.beads.layouts.Paddings'},
        'paddingLeft': { type: 'Number', access: 'readwrite', declaredBy: 'org.apache.royale.html.beads.layouts.Paddings'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.html.beads.layouts.Paddings.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./Paddings.js.map
