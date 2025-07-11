/**
 * Generated by Apache Royale Compiler from org/apache/royale/utils/IClassSelectorListSupport.as
 * org.apache.royale.utils.IClassSelectorListSupport
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.utils.IClassSelectorListSupport');
/* Royale Dependency List: */



/**
 * @interface
 */
org.apache.royale.utils.IClassSelectorListSupport = function() {
};
/**
 * Add a class selector to the list.
 * 
 * @asparam name Name of selector to add.
 * 
 * @langversion 3.0
 * @playerversion Flash 10.2
 * @playerversion AIR 2.6
 * @productversion Royale 0.9.3
 * @param {string} name
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.addClass = function(name) {
};
/**
 * Removes a class selector from the list.
 * 
 * @asparam name Name of selector to remove.
 *
 * @royaleignorecoercion HTMLElement
 * @royaleignorecoercion DOMTokenList
 * 
 * @langversion 3.0
 * @playerversion Flash 10.2
 * @playerversion AIR 2.6
 * @productversion Royale 0.9.3
 * @param {string} name
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.removeClass = function(name) {
};
/**
 * Add or remove a class selector to/from the list.
 * 
 * @asparam name Name of selector to add or remove.
 * @asparam value True to add, False to remove.
 * 
 * @langversion 3.0
 * @playerversion Flash 10.2
 * @playerversion AIR 2.6
 * @productversion Royale 0.9.3
 * @param {string} name
 * @param {boolean} value
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.toggleClass = function(name, value) {
};
/**
 *  Search for the name in the element class list 
 *
 *  @asparam name Name of selector to find.
 *  @asreturn return true if the name is found or false otherwise.
 * 
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.3
 * @param {string} name
 * @return {boolean}
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.containsClass = function(name) {
};
/**
 *  Replace a class for a new one. If new class is not set, use the old one instead
 *
 *  @asparam oldClass Name of selector to remove.
 *  @asparam newClass Name of selector to set.
 * 
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.8
 * @param {string} oldClass
 * @param {string=} newClass
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.replaceClass = function(oldClass, newClass) {
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'IClassSelectorListSupport', qName: 'org.apache.royale.utils.IClassSelectorListSupport', kind: 'interface' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'addClass': { type: 'void', declaredBy: 'org.apache.royale.utils.IClassSelectorListSupport', parameters: function () { return [ 'String', false ]; }},
        'removeClass': { type: 'void', declaredBy: 'org.apache.royale.utils.IClassSelectorListSupport', parameters: function () { return [ 'String', false ]; }},
        'toggleClass': { type: 'void', declaredBy: 'org.apache.royale.utils.IClassSelectorListSupport', parameters: function () { return [ 'String', false ,'Boolean', false ]; }},
        'containsClass': { type: 'Boolean', declaredBy: 'org.apache.royale.utils.IClassSelectorListSupport', parameters: function () { return [ 'String', false ]; }},
        'replaceClass': { type: 'void', declaredBy: 'org.apache.royale.utils.IClassSelectorListSupport', parameters: function () { return [ 'String', false ,'String', true ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.utils.IClassSelectorListSupport.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./IClassSelectorListSupport.js.map
