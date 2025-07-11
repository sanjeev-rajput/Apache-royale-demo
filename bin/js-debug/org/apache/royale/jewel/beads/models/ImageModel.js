/**
 * Generated by Apache Royale Compiler from org/apache/royale/jewel/beads/models/ImageModel.as
 * org.apache.royale.jewel.beads.models.ImageModel
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.jewel.beads.models.ImageModel');
/* Royale Dependency List: org.apache.royale.core.IStrand,org.apache.royale.events.Event*/

goog.require('org.apache.royale.events.EventDispatcher');
goog.require('org.apache.royale.core.IImageModel');



/**
 *  constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.4
 * @constructor
 * @extends {org.apache.royale.events.EventDispatcher}
 * @implements {org.apache.royale.core.IImageModel}
 */
org.apache.royale.jewel.beads.models.ImageModel = function() {
  org.apache.royale.jewel.beads.models.ImageModel.base(this, 'constructor');
};
goog.inherits(org.apache.royale.jewel.beads.models.ImageModel, org.apache.royale.events.EventDispatcher);


/**
 * @private
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype.org_apache_royale_jewel_beads_models_ImageModel__strand;


/**
 * @protected
 * @type {string}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype._url;


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype.strand;


org.apache.royale.jewel.beads.models.ImageModel.prototype.set__strand = function(value) {
  this.org_apache_royale_jewel_beads_models_ImageModel__strand = value;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype.url;


org.apache.royale.jewel.beads.models.ImageModel.prototype.get__url = function() {
  return this._url;
};


org.apache.royale.jewel.beads.models.ImageModel.prototype.set__url = function(value) {
  if (value != this._url) {
    this._url = value;
    this.dispatchEvent(new org.apache.royale.events.Event("urlChanged"));
  }
};


Object.defineProperties(org.apache.royale.jewel.beads.models.ImageModel.prototype, /** @lends {org.apache.royale.jewel.beads.models.ImageModel.prototype} */ {
/**
 * @type {org.apache.royale.core.IStrand}
 */
strand: {
set: org.apache.royale.jewel.beads.models.ImageModel.prototype.set__strand},
/**
 * @type {string}
 */
url: {
get: org.apache.royale.jewel.beads.models.ImageModel.prototype.get__url,
set: org.apache.royale.jewel.beads.models.ImageModel.prototype.set__url}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'ImageModel', qName: 'org.apache.royale.jewel.beads.models.ImageModel', kind: 'class' }], interfaces: [org.apache.royale.core.IImageModel] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'strand': { type: 'org.apache.royale.core.IStrand', access: 'writeonly', declaredBy: 'org.apache.royale.jewel.beads.models.ImageModel'},
        'url': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.ImageModel'}
      };
    },
    methods: function () {
      return {
        'ImageModel': { type: '', declaredBy: 'org.apache.royale.jewel.beads.models.ImageModel'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.jewel.beads.models.ImageModel.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./ImageModel.js.map
