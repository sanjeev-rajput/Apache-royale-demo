/**
 * Generated by Apache Royale Compiler from views/actionitemviews/shoppingcart/Controller.as
 * views.actionitemviews.shoppingcart.Controller
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('views.actionitemviews.shoppingcart.Controller');
/* Royale Dependency List: com.model.ServiceLoader,org.apache.royale.debugging.throwError,org.apache.royale.events.MouseEvent,org.apache.royale.icons.FontAwesomeToggleIcon,views.actionitemviews.shoppingcart.CartManager,views.actionitemviews.shoppingcart.CheckoutManager,views.actionitemviews.shoppingcart.ProductManager,views.actionitemviews.shoppingcart.ShoppingMain,org.apache.royale.utils.Language,XML*/




/**
 * @constructor
 * @param {views.actionitemviews.shoppingcart.ShoppingMain} view
 */
views.actionitemviews.shoppingcart.Controller = function(view) {
  this.views_actionitemviews_shoppingcart_Controller__view = view;
  this.views_actionitemviews_shoppingcart_Controller__view.cartArea.height -= this.views_actionitemviews_shoppingcart_Controller__view.checkoutArea.height;
  this.views_actionitemviews_shoppingcart_Controller_loadData();
  this.views_actionitemviews_shoppingcart_Controller_setupCartDropTarget();
  this.views_actionitemviews_shoppingcart_Controller_initEvents();
};


/**
 * @private
 * @type {views.actionitemviews.shoppingcart.ShoppingMain}
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller__view = null;


/**
 * @private
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller_loadData = function() {
  var /** @type {com.model.ServiceLoader} */ sldr = new com.model.ServiceLoader();
  sldr.loadJData("config/ShoppingProduct.json", org.apache.royale.utils.Language.closure(this.views_actionitemviews_shoppingcart_Controller_loadHandler, this, 'views_actionitemviews_shoppingcart_Controller_loadHandler'), com.model.ServiceLoader.DATA_TYPE_JSON, org.apache.royale.utils.Language.closure(this.views_actionitemviews_shoppingcart_Controller_errorHandler, this, 'views_actionitemviews_shoppingcart_Controller_errorHandler'), false);
};


/**
 * @private
 * @param {JSON} d
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller_loadHandler = function(d) {
  views.actionitemviews.shoppingcart.ProductManager.instance.products = d;
  views.actionitemviews.shoppingcart.ProductManager.instance.renderProductList(this.views_actionitemviews_shoppingcart_Controller__view.productList);
  views.actionitemviews.shoppingcart.CartManager.instance.view = this.views_actionitemviews_shoppingcart_Controller__view.cartArea;
  views.actionitemviews.shoppingcart.CheckoutManager.instance.view = this.views_actionitemviews_shoppingcart_Controller__view.checkoutArea;
};


/**
 * @private
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller_errorHandler = function() {
  org.apache.royale.debugging.throwError("failed to load shopping data");
};


/**
 * @private
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller_setupCartDropTarget = function() {
  var self = this;
  this.views_actionitemviews_shoppingcart_Controller__view.cartArea.element.addEventListener("dragover", function(e) {
    e["preventDefault"]();
  });
  this.views_actionitemviews_shoppingcart_Controller__view.cartArea.element.addEventListener("drop", function(e) {
    var /** @type {string} */ id = org.apache.royale.utils.Language.string(e["dataTransfer"]["getData"]("text/plain"));
    views.actionitemviews.shoppingcart.CartManager.instance.addToCart(id);
  });
};


/**
 * @private
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller_initEvents = function() {
  this.views_actionitemviews_shoppingcart_Controller__view.sortUiByPrice.addEventListener(org.apache.royale.events.MouseEvent.CLICK, org.apache.royale.utils.Language.closure(this.views_actionitemviews_shoppingcart_Controller_sortUiEventHandler, this, 'views_actionitemviews_shoppingcart_Controller_sortUiEventHandler'));
  this.views_actionitemviews_shoppingcart_Controller__view.sortUiByQty.addEventListener(org.apache.royale.events.MouseEvent.CLICK, org.apache.royale.utils.Language.closure(this.views_actionitemviews_shoppingcart_Controller_sortUiEventHandler, this, 'views_actionitemviews_shoppingcart_Controller_sortUiEventHandler'));
};


/**
 * @private
 * @param {org.apache.royale.events.MouseEvent} e
 */
views.actionitemviews.shoppingcart.Controller.prototype.views_actionitemviews_shoppingcart_Controller_sortUiEventHandler = function(e) {
  var /** @type {org.apache.royale.icons.FontAwesomeToggleIcon} */ sUi = e.currentTarget;
  if (sUi.id == 'sortUiByPrice') {
    if (sUi.flipVertical)
      views.actionitemviews.shoppingcart.ProductManager.instance.shortProductListBy(views.actionitemviews.shoppingcart.ProductManager.SORT_BY_PRICE, views.actionitemviews.shoppingcart.ProductManager.DESCENDING);
    if (!sUi.flipVertical)
      views.actionitemviews.shoppingcart.ProductManager.instance.shortProductListBy(views.actionitemviews.shoppingcart.ProductManager.SORT_BY_PRICE, views.actionitemviews.shoppingcart.ProductManager.ASCENDING);
    sUi.flipVertical = !sUi.flipVertical;
  }
  if (sUi.id == 'sortUiByQty') {
    if (sUi.flipVertical)
      views.actionitemviews.shoppingcart.ProductManager.instance.shortProductListBy(views.actionitemviews.shoppingcart.ProductManager.SORT_BY_QUANTITY, views.actionitemviews.shoppingcart.ProductManager.DESCENDING);
    if (!sUi.flipVertical)
      views.actionitemviews.shoppingcart.ProductManager.instance.shortProductListBy(views.actionitemviews.shoppingcart.ProductManager.SORT_BY_QUANTITY, views.actionitemviews.shoppingcart.ProductManager.ASCENDING);
    sUi.flipVertical = !sUi.flipVertical;
  }
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
views.actionitemviews.shoppingcart.Controller.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'Controller', qName: 'views.actionitemviews.shoppingcart.Controller', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
views.actionitemviews.shoppingcart.Controller.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    methods: function () {
      return {
        'Controller': { type: '', declaredBy: 'views.actionitemviews.shoppingcart.Controller', parameters: function () { return [ 'views.actionitemviews.shoppingcart.ShoppingMain', false ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
views.actionitemviews.shoppingcart.Controller.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./Controller.js.map
