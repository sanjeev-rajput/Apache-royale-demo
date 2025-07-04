/**
 * Generated by Apache Royale Compiler from org/apache/royale/html/elements/Hr.as
 * org.apache.royale.html.elements.Hr
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.html.elements.Hr');
/* Royale Dependency List: org.apache.royale.core.WrappedHTMLElement,org.apache.royale.html.util.addElementToWrapper*/

goog.require('org.apache.royale.html.NodeElementBase');



/**
 *  constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9
 * @constructor
 * @extends {org.apache.royale.html.NodeElementBase}
 */
org.apache.royale.html.elements.Hr = function() {
  org.apache.royale.html.elements.Hr.base(this, 'constructor');
};
goog.inherits(org.apache.royale.html.elements.Hr, org.apache.royale.html.NodeElementBase);


/**
 * @protected
 * @override
 */
org.apache.royale.html.elements.Hr.prototype.createElement = function() {
  return org.apache.royale.html.util.addElementToWrapper(this, 'hr');
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.html.elements.Hr.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'Hr', qName: 'org.apache.royale.html.elements.Hr', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.html.elements.Hr.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'Hr': { type: '', declaredBy: 'org.apache.royale.html.elements.Hr'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.html.elements.Hr.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./Hr.js.map
