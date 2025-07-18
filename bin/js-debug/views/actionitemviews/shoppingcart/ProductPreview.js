/**
 * Generated by Apache Royale Compiler from views/actionitemviews/shoppingcart/ProductPreview.mxml
 * views.actionitemviews.shoppingcart.ProductPreview
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('views.actionitemviews.shoppingcart.ProductPreview');
/* Royale Dependency List: org.apache.royale.jewel.VGroup,org.apache.royale.jewel.HGroup,org.apache.royale.html.elements.H3,org.apache.royale.jewel.ImageIcon,org.apache.royale.jewel.supportClasses.scrollbar.ScrollingViewport,org.apache.royale.jewel.Image,org.apache.royale.jewel.Label,org.apache.royale.html.elements.Hr,com.controller.PopupManager,org.apache.royale.events.Event,org.apache.royale.events.MouseEvent,XML*/

goog.require('org.apache.royale.jewel.View');



/**
 * @constructor
 * @extends {org.apache.royale.jewel.View}
 */
views.actionitemviews.shoppingcart.ProductPreview = function() {
  views.actionitemviews.shoppingcart.ProductPreview.base(this, 'constructor');
  
  /**
   * @private
   * @type {org.apache.royale.jewel.VGroup}
   */
  this.$ID_11_6;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.HGroup}
   */
  this.$ID_11_1;
  
  /**
   * @private
   * @type {org.apache.royale.html.elements.H3}
   */
  this.name_;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.ImageIcon}
   */
  this.$ID_11_0;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.VGroup}
   */
  this.$ID_11_5;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.supportClasses.scrollbar.ScrollingViewport}
   */
  this.$ID_11_2;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.Image}
   */
  this.img_;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.Label}
   */
  this.description_;
  
  /**
   * @private
   * @type {org.apache.royale.html.elements.Hr}
   */
  this.$ID_11_3;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.HGroup}
   */
  this.$ID_11_4;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.Label}
   */
  this.price_;
  
  /**
   * @private
   * @type {org.apache.royale.jewel.Label}
   */
  this.qt_;
  
  /**
   * @private
   * @type {Array}
   */
  this.mxmldd;
  
  /**
   * @private
   * @type {Array}
   */
  this.mxmldp;

  this.generateMXMLAttributes([
    1,
    'style',
    true,
    'background:transparent',
    0,
    1,
    'initComplete',
    this.$EH_11_0
  ]);
  
};
goog.inherits(views.actionitemviews.shoppingcart.ProductPreview, org.apache.royale.jewel.View);




/**
 * @private
 * @type {Object}
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.views_actionitemviews_shoppingcart_ProductPreview__data = null;


/**
 * @private
 * @type {boolean}
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.views_actionitemviews_shoppingcart_ProductPreview__initialized = false;


/**
 * @private
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.views_actionitemviews_shoppingcart_ProductPreview_init = function() {
  var self = this;
  if (!this.views_actionitemviews_shoppingcart_ProductPreview__data)
    return;
  this.views_actionitemviews_shoppingcart_ProductPreview__initialized = true;
  this.name.innerHTML = org.apache.royale.utils.Language.string(this.views_actionitemviews_shoppingcart_ProductPreview__data["title"]);
  this.description.html = org.apache.royale.utils.Language.string(this.views_actionitemviews_shoppingcart_ProductPreview__data["description"]);
  this.price.text = "Price $" + this.views_actionitemviews_shoppingcart_ProductPreview__data["price"]["toFixed"](2);
  this.img.src = 'img/shopping/' + this.views_actionitemviews_shoppingcart_ProductPreview__data["filename"];
  this.qt.text = 'Quantity ' + this.views_actionitemviews_shoppingcart_ProductPreview__data["qty"]["toString"]();
  this.element.setAttribute("draggable", "true");
  this.element.setAttribute("data-id", this.views_actionitemviews_shoppingcart_ProductPreview__data["id"]);
  this.element.addEventListener("dragstart", function(e) {
    e["dataTransfer"]["setData"]("text/plain", self.views_actionitemviews_shoppingcart_ProductPreview__data["id"]);
    org.apache.royale.utils.Language.trace("Drag started for item with ID: " + e["dataTransfer"]["getData"]("text/plain"));
    e["dataTransfer"]["effectAllowed"] = "move";
  });
};


;


/**
 * @private
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.views_actionitemviews_shoppingcart_ProductPreview_closeHandler = function() {
  com.controller.PopupManager.getInstance().reomovePopup();
};





/**
 * @nocollapse
 * @export
 * @type {Object}
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.data;


views.actionitemviews.shoppingcart.ProductPreview.prototype.set__data = function(d) {
  this.views_actionitemviews_shoppingcart_ProductPreview__data = d;
  this.id = org.apache.royale.utils.Language.string(d["id"]);
  if (this.views_actionitemviews_shoppingcart_ProductPreview__initialized) {
    this.views_actionitemviews_shoppingcart_ProductPreview_init();
  }
};


Object.defineProperties(views.actionitemviews.shoppingcart.ProductPreview.prototype, /** @lends {views.actionitemviews.shoppingcart.ProductPreview.prototype} */ {
/**
 * @type {Object}
 */
data: {
set: views.actionitemviews.shoppingcart.ProductPreview.prototype.set__data}}
);/**
 * @export
 * @param {org.apache.royale.events.Event} event
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.$EH_11_0 = function(event)
{
  this.views_actionitemviews_shoppingcart_ProductPreview_init();
};


/**
 * @export
 * @param {org.apache.royale.events.MouseEvent} event
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.$EH_11_1 = function(event)
{
  this.views_actionitemviews_shoppingcart_ProductPreview_closeHandler();
};


Object.defineProperties(views.actionitemviews.shoppingcart.ProductPreview.prototype, /** @lends {views.actionitemviews.shoppingcart.ProductPreview.prototype} */ {
  name: {
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    get: function() {
      return this.name_;
    },
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    set: function(value) {
      if (value != this.name_) {
        this.name_ = value;
        this.dispatchEvent(org.apache.royale.events.ValueChangeEvent.createUpdateEvent(this, 'name', null, value));
      }
    }
  },
  img: {
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    get: function() {
      return this.img_;
    },
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    set: function(value) {
      if (value != this.img_) {
        this.img_ = value;
        this.dispatchEvent(org.apache.royale.events.ValueChangeEvent.createUpdateEvent(this, 'img', null, value));
      }
    }
  },
  description: {
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    get: function() {
      return this.description_;
    },
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    set: function(value) {
      if (value != this.description_) {
        this.description_ = value;
        this.dispatchEvent(org.apache.royale.events.ValueChangeEvent.createUpdateEvent(this, 'description', null, value));
      }
    }
  },
  price: {
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    get: function() {
      return this.price_;
    },
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    set: function(value) {
      if (value != this.price_) {
        this.price_ = value;
        this.dispatchEvent(org.apache.royale.events.ValueChangeEvent.createUpdateEvent(this, 'price', null, value));
      }
    }
  },
  qt: {
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    get: function() {
      return this.qt_;
    },
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    set: function(value) {
      if (value != this.qt_) {
        this.qt_ = value;
        this.dispatchEvent(org.apache.royale.events.ValueChangeEvent.createUpdateEvent(this, 'qt', null, value));
      }
    }
  },
  'MXMLDescriptor': {
    /** @this {views.actionitemviews.shoppingcart.ProductPreview} */
    get: function() {
      if (this.mxmldd == undefined)
      {
        /** @type {Array} */
        var arr = views.actionitemviews.shoppingcart.ProductPreview.superClass_.get__MXMLDescriptor.apply(this);
        /** @type {Array} */
        var mxmldd = [
          org.apache.royale.jewel.VGroup,
          2,
          '_id',
          true,
          '$ID_11_6',
          'className',
          true,
          'shoppingProductPreview',
          0,
          0,
          [
            org.apache.royale.jewel.HGroup,
            4,
            '_id',
            true,
            '$ID_11_1',
            'percentWidth',
            true,
            100.0,
            'itemsVerticalAlign',
            true,
            'itemsCenter',
            'itemsHorizontalAlign',
            true,
            'itemsSpaceBetween',
            0,
            0,
            [
              org.apache.royale.html.elements.H3,
              3,
              'id',
              true,
              'name',
              'text',
              true,
              'Jewel Card',
              'percentWidth',
              true,
              100.0,
              0,
              0,
              null,
              org.apache.royale.jewel.ImageIcon,
              3,
              '_id',
              true,
              '$ID_11_0',
              'src',
              true,
              'img/close.png',
              'width',
              true,
              30,
              0,
              1,
              'click',
              this.$EH_11_1,
              null
            ],
            org.apache.royale.jewel.VGroup,
            2,
            '_id',
            true,
            '$ID_11_5',
            'beads',
            null,
            [
              org.apache.royale.jewel.supportClasses.scrollbar.ScrollingViewport,
              1,
              '_id',
              true,
              '$ID_11_2',
              0,
              0,
              null
            ],
            0,
            0,
            [
              org.apache.royale.jewel.Image,
              2,
              'id',
              true,
              'img',
              'className',
              true,
              'shoppingImgPreview',
              0,
              0,
              null,
              org.apache.royale.jewel.Label,
              3,
              'id',
              true,
              'description',
              'text',
              true,
              'A simple t-shirt made from organic cotton.',
              'multiline',
              true,
              true,
              0,
              0,
              null,
              org.apache.royale.html.elements.Hr,
              2,
              '_id',
              true,
              '$ID_11_3',
              'percentWidth',
              true,
              100.0,
              0,
              0,
              null,
              org.apache.royale.jewel.HGroup,
              3,
              '_id',
              true,
              '$ID_11_4',
              'itemsHorizontalAlign',
              true,
              'itemsSpaceBetween',
              'percentWidth',
              true,
              100.0,
              0,
              0,
              [
                org.apache.royale.jewel.Label,
                3,
                'id',
                true,
                'price',
                'text',
                true,
                'Jewel Simple Card',
                'className',
                true,
                'shopProductLbl',
                0,
                0,
                null,
                org.apache.royale.jewel.Label,
                2,
                'id',
                true,
                'qt',
                'className',
                true,
                'shopProductLbl',
                0,
                0,
                null
              ]
            ]
          ]
        ];
        if (arr)
          this.mxmldd = arr.concat(mxmldd);
        else
          this.mxmldd = mxmldd;
      }
      return this.mxmldd;
    }
  }
});
/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'ProductPreview', qName: 'views.actionitemviews.shoppingcart.ProductPreview', kind: 'class'  }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'data': { type: 'Object', access: 'writeonly', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'},
        'name': { type: 'org.apache.royale.html.elements.H3', access: 'readwrite', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'},
        'img': { type: 'org.apache.royale.jewel.Image', access: 'readwrite', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'},
        'description': { type: 'org.apache.royale.jewel.Label', access: 'readwrite', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'},
        'price': { type: 'org.apache.royale.jewel.Label', access: 'readwrite', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'},
        'qt': { type: 'org.apache.royale.jewel.Label', access: 'readwrite', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'}
      };
    },
    methods: function () {
      return {
        'ProductPreview': { type: '', declaredBy: 'views.actionitemviews.shoppingcart.ProductPreview'}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
views.actionitemviews.shoppingcart.ProductPreview.prototype.ROYALE_COMPILE_FLAGS = 9;



//# sourceMappingURL=./ProductPreview.js.map
