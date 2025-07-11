/**
 * Generated by Apache Royale Compiler from org/apache/royale/jewel/beads/controllers/ListSingleSelectionMouseController.as
 * org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController');
/* Royale Dependency List: org.apache.royale.core.IStrand,org.apache.royale.events.Event,org.apache.royale.events.IEventDispatcher,org.apache.royale.events.ItemClickedEvent,org.apache.royale.jewel.beads.models.IJewelSelectionModel,org.apache.royale.utils.Language*/

goog.require('org.apache.royale.html.beads.controllers.ListSingleSelectionMouseController');



/**
 *  Constructor.
 *
 *  @langversion 3.0
 *  @playerversion Flash 10.2
 *  @playerversion AIR 2.6
 *  @productversion Royale 0.9.4
 * @constructor
 * @extends {org.apache.royale.html.beads.controllers.ListSingleSelectionMouseController}
 */
org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController = function() {
  org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.base(this, 'constructor');
};
goog.inherits(org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController, org.apache.royale.html.beads.controllers.ListSingleSelectionMouseController);


/**
 * @protected
 * @override
 */
org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.selectedHandler = function(event) {
  org.apache.royale.utils.Language.as(this.listModel, org.apache.royale.jewel.beads.models.IJewelSelectionModel).isItemClicked = true;
  org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.superClass_.selectedHandler.apply(this, [event]);
  org.apache.royale.utils.Language.as(this.listModel, org.apache.royale.jewel.beads.models.IJewelSelectionModel).isItemClicked = false;
};


/**
 * 
 * @asparam event 
 * @protected
 * @param {org.apache.royale.events.Event} event
 */
org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.modelChangeHandler = function(event) {
  org.apache.royale.utils.Language.as(this._strand, org.apache.royale.events.IEventDispatcher, true).dispatchEvent(new org.apache.royale.events.Event(event.type));
};


org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.set__strand = function(value) {
  org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.superClass_.set__strand.apply(this, [value]);
  if (org.apache.royale.utils.Language.is(this.listModel, org.apache.royale.jewel.beads.models.IJewelSelectionModel) && !(this.listModel.hasDispatcher)) {
    this.listModel.dispatcher = value;
  } else {
    this.listModel.addEventListener('rollOverIndexChanged', org.apache.royale.utils.Language.closure(this.modelChangeHandler, this, 'modelChangeHandler'));
    this.listModel.addEventListener('selectionChanged', org.apache.royale.utils.Language.closure(this.modelChangeHandler, this, 'modelChangeHandler'));
    this.listModel.addEventListener('dataProviderChanged', org.apache.royale.utils.Language.closure(this.modelChangeHandler, this, 'modelChangeHandler'));
  }
};


Object.defineProperties(org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype, /** @lends {org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype} */ {
/**
 * @type {org.apache.royale.core.IStrand}
 */
strand: {
set: org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.set__strand}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'ListSingleSelectionMouseController', qName: 'org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'strand': { type: 'org.apache.royale.core.IStrand', access: 'writeonly', declaredBy: 'org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController'}
      };
    },
    methods: function () {
      return {
        'ListSingleSelectionMouseController': { type: '', declaredBy: 'org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.jewel.beads.controllers.ListSingleSelectionMouseController.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./ListSingleSelectionMouseController.js.map
