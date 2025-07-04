/**
 * Generated by Apache Royale Compiler from org/apache/royale/collections/IArrayList.as
 * org.apache.royale.collections.IArrayList
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.collections.IArrayList');
/* Royale Dependency List: */

goog.require('org.apache.royale.collections.ICollection');
goog.require('org.apache.royale.events.IEventDispatcher');



/**
 * @interface
 * @extends {org.apache.royale.events.IEventDispatcher}
 * @extends {org.apache.royale.collections.ICollection}
 */
org.apache.royale.collections.IArrayList = function() {
};
/**  * @type {Array}
 */org.apache.royale.collections.IArrayList.prototype.source;
/**
 * Returns a copy of the source array.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @return {Array}
 */
org.apache.royale.collections.IArrayList.prototype.toArray = function() {
};
/**
 *  Fetches an item from the collection given an index.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {Object} item
 * @return {number}
 */
org.apache.royale.collections.IArrayList.prototype.getItemIndex = function(item) {
};
/**
 *  Adds an item to the end of the array.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {Object} item
 */
org.apache.royale.collections.IArrayList.prototype.addItem = function(item) {
};
/**
 *  Inserts an item to a specific location within the array.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {Object} item
 * @param {number} index
 */
org.apache.royale.collections.IArrayList.prototype.addItemAt = function(item, index) {
};
/**
 *  Replaces the item at the given index with a new item and
 *  returns the old item.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {Object} item
 * @param {number} index
 * @return {Object}
 */
org.apache.royale.collections.IArrayList.prototype.setItemAt = function(item, index) {
};
/**
 *  Removed an item from the array and returns it.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {Object} item
 * @return {boolean}
 */
org.apache.royale.collections.IArrayList.prototype.removeItem = function(item) {
};
/**
 *  Removes an item from a specific location within the array and
 *  returns it.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {number} index
 * @return {Object}
 */
org.apache.royale.collections.IArrayList.prototype.removeItemAt = function(index) {
};
org.apache.royale.collections.IArrayList.prototype.removeAll = function() {
};
/**
 *  Signals that an item in the array has been updated.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {Object} item
 */
org.apache.royale.collections.IArrayList.prototype.itemUpdated = function(item) {
};
/**
 *  Signals that an item in the array has been updated.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.0
 * @param {number} index
 */
org.apache.royale.collections.IArrayList.prototype.itemUpdatedAt = function(index) {
};
/**  * @type {number}
 */org.apache.royale.collections.IArrayList.prototype.length;


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.collections.IArrayList.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'IArrayList', qName: 'org.apache.royale.collections.IArrayList', kind: 'interface' }], interfaces: [org.apache.royale.events.IEventDispatcher, org.apache.royale.collections.ICollection] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.collections.IArrayList.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'source': { type: 'Array', access: 'readwrite', declaredBy: 'org.apache.royale.collections.IArrayList'},
        'length': { type: 'int', access: 'readonly', declaredBy: 'org.apache.royale.collections.IArrayList'}
      };
    },
    methods: function () {
      return {
        'toArray': { type: 'Array', declaredBy: 'org.apache.royale.collections.IArrayList'},
        'getItemIndex': { type: 'int', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'Object', false ]; }},
        'addItem': { type: 'void', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'Object', false ]; }},
        'addItemAt': { type: 'void', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'Object', false ,'int', false ]; }},
        'setItemAt': { type: 'Object', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'Object', false ,'int', false ]; }},
        'removeItem': { type: 'Boolean', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'Object', false ]; }},
        'removeItemAt': { type: 'Object', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'int', false ]; }},
        'removeAll': { type: 'void', declaredBy: 'org.apache.royale.collections.IArrayList'},
        'itemUpdated': { type: 'void', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'Object', false ]; }},
        'itemUpdatedAt': { type: 'void', declaredBy: 'org.apache.royale.collections.IArrayList', parameters: function () { return [ 'int', false ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.collections.IArrayList.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./IArrayList.js.map
