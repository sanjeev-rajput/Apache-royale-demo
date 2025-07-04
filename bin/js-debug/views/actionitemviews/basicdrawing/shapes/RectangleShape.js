/**
 * Generated by Apache Royale Compiler from views/actionitemviews/basicdrawing/shapes/RectangleShape.as
 * views.actionitemviews.basicdrawing.shapes.RectangleShape
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('views.actionitemviews.basicdrawing.shapes.RectangleShape');
/* Royale Dependency List: org.apache.royale.core.IChild,org.apache.royale.svg.elements.Rect,XML*/

goog.require('views.actionitemviews.basicdrawing.shapes.IDrawableShape');



/**
 * @constructor
 * @implements {views.actionitemviews.basicdrawing.shapes.IDrawableShape}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape = function() {
};


/**
 * @private
 * @type {org.apache.royale.svg.elements.Rect}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape = null;


/**
 * @private
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.views_actionitemviews_basicdrawing_shapes_RectangleShape__startX = NaN;


/**
 * @private
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.views_actionitemviews_basicdrawing_shapes_RectangleShape__startY = NaN;


/**
 * @private
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.views_actionitemviews_basicdrawing_shapes_RectangleShape__lastX = NaN;


/**
 * @private
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.views_actionitemviews_basicdrawing_shapes_RectangleShape__lastY = NaN;


/**
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {string} color
 * @return {org.apache.royale.core.IChild}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.create = function(startX, startY, endX, endY, color) {
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape = new org.apache.royale.svg.elements.Rect();
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__startX = startX;
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__startY = startY;
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__lastX = startX;
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__lastY = startY;
  this.update(endX, endY);
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.fill = color;
  return this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape;
};


/**
 * @param {number} endX
 * @param {number} endY
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.update = function(endX, endY) {
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.x = Math.min(this.views_actionitemviews_basicdrawing_shapes_RectangleShape__startX, endX);
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.y = Math.min(this.views_actionitemviews_basicdrawing_shapes_RectangleShape__startY, endY);
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.width = Math.abs(endX - this.views_actionitemviews_basicdrawing_shapes_RectangleShape__startX);
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.height = Math.abs(endY - this.views_actionitemviews_basicdrawing_shapes_RectangleShape__startY);
};


/**
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.hitTest = function(x, y) {
  return x >= this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.x && x <= this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.x + this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.width && y >= this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.y && y <= this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.y + this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.height;
};


/**
 * @param {number} dx
 * @param {number} dy
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.move = function(dx, dy) {
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.x += dx;
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.y += dy;
};


/**
 * @param {string} color
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.setColor = function(color) {
  this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.fill = color;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.currentX;


views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__currentX = function() {
  return this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.x;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.currentY;


views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__currentY = function() {
  return this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.y;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.width;


views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__width = function() {
  return this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.width;
};


/**
 * @nocollapse
 * @export
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.height;


views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__height = function() {
  return this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape.height;
};


/**
 * @nocollapse
 * @export
 * @type {org.apache.royale.core.IChild}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.shape;


views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__shape = function() {
  return this.views_actionitemviews_basicdrawing_shapes_RectangleShape__shape;
};


Object.defineProperties(views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype, /** @lends {views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype} */ {
/**
 * @type {number}
 */
currentX: {
get: views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__currentX},
/**
 * @type {number}
 */
currentY: {
get: views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__currentY},
/**
 * @type {number}
 */
width: {
get: views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__width},
/**
 * @type {number}
 */
height: {
get: views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__height},
/**
 * @type {org.apache.royale.core.IChild}
 */
shape: {
get: views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.get__shape}}
);


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'RectangleShape', qName: 'views.actionitemviews.basicdrawing.shapes.RectangleShape', kind: 'class' }], interfaces: [views.actionitemviews.basicdrawing.shapes.IDrawableShape] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'currentX': { type: 'Number', access: 'readonly', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape'},
        'currentY': { type: 'Number', access: 'readonly', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape'},
        'width': { type: 'Number', access: 'readonly', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape'},
        'height': { type: 'Number', access: 'readonly', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape'},
        'shape': { type: 'org.apache.royale.core.IChild', access: 'readonly', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape'}
      };
    },
    methods: function () {
      return {
        'create': { type: 'org.apache.royale.core.IChild', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape', parameters: function () { return [ 'Number', false ,'Number', false ,'Number', false ,'Number', false ,'String', false ]; }},
        'update': { type: 'void', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape', parameters: function () { return [ 'Number', false ,'Number', false ]; }},
        'hitTest': { type: 'Boolean', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape', parameters: function () { return [ 'Number', false ,'Number', false ]; }},
        'move': { type: 'void', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape', parameters: function () { return [ 'Number', false ,'Number', false ]; }},
        'setColor': { type: 'void', declaredBy: 'views.actionitemviews.basicdrawing.shapes.RectangleShape', parameters: function () { return [ 'String', false ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.RectangleShape.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./RectangleShape.js.map
