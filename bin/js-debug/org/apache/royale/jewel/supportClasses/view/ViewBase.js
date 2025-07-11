/**
 * Generated by Apache Royale Compiler from org/apache/royale/jewel/supportClasses/view/ViewBase.as
 * org.apache.royale.jewel.supportClasses.view.ViewBase
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.jewel.supportClasses.view.ViewBase');
/* Royale Dependency List: org.apache.royale.utils.sendEvent*/

goog.require('org.apache.royale.core.IPopUpHost');
goog.require('org.apache.royale.core.IPopUpHostParent');
goog.require('org.apache.royale.jewel.supportClasses.group.GroupBase');
goog.require('org.apache.royale.core.IApplicationView');



/**
 *  Constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.7
 * @constructor
 * @extends {org.apache.royale.jewel.supportClasses.group.GroupBase}
 * @implements {org.apache.royale.core.IPopUpHost}
 * @implements {org.apache.royale.core.IPopUpHostParent}
 * @implements {org.apache.royale.core.IApplicationView}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase = function() {
  org.apache.royale.jewel.supportClasses.view.ViewBase.base(this, 'constructor');
};
goog.inherits(org.apache.royale.jewel.supportClasses.view.ViewBase, org.apache.royale.jewel.supportClasses.group.GroupBase);


/**
 * @private
 * @type {Object}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.org_apache_royale_jewel_supportClasses_view_ViewBase__applicationModel;


/**
 * @nocollapse
 * @export
 * @type {Object}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.applicationModel;


org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.get__applicationModel = function() {
  return this.org_apache_royale_jewel_supportClasses_view_ViewBase__applicationModel;
};


org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.set__applicationModel = function(value) {
  this.org_apache_royale_jewel_supportClasses_view_ViewBase__applicationModel = value;
  org.apache.royale.utils.sendEvent(this, "modelChanged");
};


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IPopUpHostParent}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.popUpParent;


org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.get__popUpParent = function() {
  return this;
};


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IPopUpHost}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.popUpHost;


org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.get__popUpHost = function() {
  return this;
};


Object.defineProperties(org.apache.royale.jewel.supportClasses.view.ViewBase.prototype, /** @lends {org.apache.royale.jewel.supportClasses.view.ViewBase.prototype} */ {
/**
 * @type {Object}
 */
applicationModel: {
get: org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.get__applicationModel,
set: org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.set__applicationModel},
/**
 * @type {org.apache.royale.core.IPopUpHostParent}
 */
popUpParent: {
get: org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.get__popUpParent},
/**
 * @type {org.apache.royale.core.IPopUpHost}
 */
popUpHost: {
get: org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.get__popUpHost}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'ViewBase', qName: 'org.apache.royale.jewel.supportClasses.view.ViewBase', kind: 'class' }], interfaces: [org.apache.royale.core.IPopUpHost, org.apache.royale.core.IPopUpHostParent, org.apache.royale.core.IApplicationView] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'applicationModel': { type: 'Object', access: 'readwrite', declaredBy: 'org.apache.royale.jewel.supportClasses.view.ViewBase', metadata: function () { return [ { name: 'Bindable', args: [ { key: '', value: 'modelChanged' } ] } ]; }},
        'popUpParent': { type: 'org.apache.royale.core.IPopUpHostParent', access: 'readonly', declaredBy: 'org.apache.royale.jewel.supportClasses.view.ViewBase'},
        'popUpHost': { type: 'org.apache.royale.core.IPopUpHost', access: 'readonly', declaredBy: 'org.apache.royale.jewel.supportClasses.view.ViewBase'}
      };
    },
    methods: function () {
      return {
        'ViewBase': { type: '', declaredBy: 'org.apache.royale.jewel.supportClasses.view.ViewBase'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.jewel.supportClasses.view.ViewBase.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./ViewBase.js.map
