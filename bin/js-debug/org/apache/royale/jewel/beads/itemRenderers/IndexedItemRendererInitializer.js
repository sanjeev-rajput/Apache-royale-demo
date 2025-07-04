/**
 * Generated by Apache Royale Compiler from org/apache/royale/jewel/beads/itemRenderers/IndexedItemRendererInitializer.as
 * org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer');
/* Royale Dependency List: org.apache.royale.core.IIndexedItemRenderer,org.apache.royale.core.IStrand,org.apache.royale.core.StyledUIBase,org.apache.royale.html.beads.IPaddings,org.apache.royale.html.beads.layouts.Paddings,org.apache.royale.utils.Language*/

goog.require('org.apache.royale.html.beads.IndexedItemRendererInitializer');



/**
 *  constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.8
 * @constructor
 * @extends {org.apache.royale.html.beads.IndexedItemRendererInitializer}
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer = function() {
  org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.base(this, 'constructor');
};
goog.inherits(org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer, org.apache.royale.html.beads.IndexedItemRendererInitializer);


/**
 *  @copy org.apache.royale.core.IBead#strand
 *  
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.8
 * @protected
 * @override
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.prototype.setupVisualsForItemRenderer = function(ir) {
  this.setPaddings(ir);
};


/**
 * set padding for this renderer.
 * 
 * try to retrieve paddings from the item renderer.
 * If not exits create one with default padding setting
 * @param {org.apache.royale.core.IStrand} ir
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.prototype.setPaddings = function(ir) {
  var /** @type {org.apache.royale.html.beads.layouts.Paddings} */ paddings = org.apache.royale.utils.Language.as(org.apache.royale.utils.Language.as(ir, org.apache.royale.core.StyledUIBase, true).getBeadByType(org.apache.royale.html.beads.IPaddings), org.apache.royale.html.beads.layouts.Paddings);
  if (!paddings) {
    paddings = new org.apache.royale.html.beads.layouts.Paddings();
    paddings.padding = org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.DEFAULT_PADDING;
    ir.addBead(paddings);
  }
};


/**
 * @nocollapse
 * @const
 * @type {number}
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.DEFAULT_PADDING = 8;


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'IndexedItemRendererInitializer', qName: 'org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'IndexedItemRendererInitializer': { type: '', declaredBy: 'org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer'},
        'setPaddings': { type: 'void', declaredBy: 'org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer', parameters: function () { return [ 'org.apache.royale.core.IStrand', false ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.jewel.beads.itemRenderers.IndexedItemRendererInitializer.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./IndexedItemRendererInitializer.js.map
