/**
 * Generated by Apache Royale Compiler from org/apache/royale/jewel/beads/models/AlertModel.as
 * org.apache.royale.jewel.beads.models.AlertModel
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.jewel.beads.models.AlertModel');
/* Royale Dependency List: org.apache.royale.core.IStrand,org.apache.royale.events.Event*/

goog.require('org.apache.royale.events.EventDispatcher');
goog.require('org.apache.royale.core.IAlertModel');
goog.require('org.apache.royale.core.IBead');



/**
 *  constructor.
 *  
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.4
 * @constructor
 * @extends {org.apache.royale.events.EventDispatcher}
 * @implements {org.apache.royale.core.IAlertModel}
 * @implements {org.apache.royale.core.IBead}
 */
org.apache.royale.jewel.beads.models.AlertModel = function() {
  org.apache.royale.jewel.beads.models.AlertModel.base(this, 'constructor');
};
goog.inherits(org.apache.royale.jewel.beads.models.AlertModel, org.apache.royale.events.EventDispatcher);


/**
 * @private
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__strand;


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__title;


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__htmlTitle;


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__message;


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__htmlMessage;


/**
 * @private
 * @type {number}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__flags = 0;


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__okLabel = "OK";


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__cancelLabel = "Cancel";


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__yesLabel = "YES";


/**
 * @private
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.org_apache_royale_jewel_beads_models_AlertModel__noLabel = "NO";


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IStrand}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.strand;


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__strand = function(value) {
  this.org_apache_royale_jewel_beads_models_AlertModel__strand = value;
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.title;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__title = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__title;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__title = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__title) {
    this.org_apache_royale_jewel_beads_models_AlertModel__title = value;
    this.dispatchEvent(new org.apache.royale.events.Event("titleChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.htmlTitle;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__htmlTitle = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__htmlTitle;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__htmlTitle = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__htmlTitle) {
    this.org_apache_royale_jewel_beads_models_AlertModel__htmlTitle = value;
    this.dispatchEvent(new org.apache.royale.events.Event("htmlTitleChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.message;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__message = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__message;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__message = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__message) {
    this.org_apache_royale_jewel_beads_models_AlertModel__message = value;
    this.dispatchEvent(new org.apache.royale.events.Event("messageChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.htmlMessage;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__htmlMessage = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__htmlMessage;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__htmlMessage = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__htmlMessage) {
    this.org_apache_royale_jewel_beads_models_AlertModel__htmlMessage = value;
    this.dispatchEvent(new org.apache.royale.events.Event("htmlMessageChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.flags;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__flags = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__flags;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__flags = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__flags) {
    this.org_apache_royale_jewel_beads_models_AlertModel__flags = value;
    this.dispatchEvent(new org.apache.royale.events.Event("flagsChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.okLabel;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__okLabel = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__okLabel;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__okLabel = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__okLabel) {
    this.org_apache_royale_jewel_beads_models_AlertModel__okLabel = value;
    this.dispatchEvent(new org.apache.royale.events.Event("okLabelChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.cancelLabel;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__cancelLabel = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__cancelLabel;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__cancelLabel = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__cancelLabel) {
    this.org_apache_royale_jewel_beads_models_AlertModel__cancelLabel = value;
    this.dispatchEvent(new org.apache.royale.events.Event("cancelLabelChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.yesLabel;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__yesLabel = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__yesLabel;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__yesLabel = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__yesLabel) {
    this.org_apache_royale_jewel_beads_models_AlertModel__yesLabel = value;
    this.dispatchEvent(new org.apache.royale.events.Event("yesLabelChange"));
  }
};


/**
 * @nocollapse
 * @export
 * @type {string}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.noLabel;


org.apache.royale.jewel.beads.models.AlertModel.prototype.get__noLabel = function() {
  return this.org_apache_royale_jewel_beads_models_AlertModel__noLabel;
};


org.apache.royale.jewel.beads.models.AlertModel.prototype.set__noLabel = function(value) {
  if (value != this.org_apache_royale_jewel_beads_models_AlertModel__noLabel) {
    this.org_apache_royale_jewel_beads_models_AlertModel__noLabel = value;
    this.dispatchEvent(new org.apache.royale.events.Event("noLabelChange"));
  }
};


Object.defineProperties(org.apache.royale.jewel.beads.models.AlertModel.prototype, /** @lends {org.apache.royale.jewel.beads.models.AlertModel.prototype} */ {
/**
 * @type {org.apache.royale.core.IStrand}
 */
strand: {
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__strand},
/**
 * @type {string}
 */
title: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__title,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__title},
/**
 * @type {string}
 */
htmlTitle: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__htmlTitle,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__htmlTitle},
/**
 * @type {string}
 */
message: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__message,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__message},
/**
 * @type {string}
 */
htmlMessage: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__htmlMessage,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__htmlMessage},
/**
 * @type {number}
 */
flags: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__flags,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__flags},
/**
 * @type {string}
 */
okLabel: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__okLabel,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__okLabel},
/**
 * @type {string}
 */
cancelLabel: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__cancelLabel,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__cancelLabel},
/**
 * @type {string}
 */
yesLabel: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__yesLabel,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__yesLabel},
/**
 * @type {string}
 */
noLabel: {
get: org.apache.royale.jewel.beads.models.AlertModel.prototype.get__noLabel,
set: org.apache.royale.jewel.beads.models.AlertModel.prototype.set__noLabel}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'AlertModel', qName: 'org.apache.royale.jewel.beads.models.AlertModel', kind: 'class' }], interfaces: [org.apache.royale.core.IAlertModel, org.apache.royale.core.IBead] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'strand': { type: 'org.apache.royale.core.IStrand', access: 'writeonly', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'title': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'htmlTitle': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'message': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'htmlMessage': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'flags': { type: 'uint', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'okLabel': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'cancelLabel': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'yesLabel': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'},
        'noLabel': { type: 'String', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'}
      };
    },
    methods: function () {
      return {
        'AlertModel': { type: '', declaredBy: 'org.apache.royale.jewel.beads.models.AlertModel'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.jewel.beads.models.AlertModel.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./AlertModel.js.map
