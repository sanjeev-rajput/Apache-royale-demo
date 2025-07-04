/**
 * Generated by Apache Royale Compiler from views/actionitemviews/basicdrawing/shapes/IDrawableShape.as
 * views.actionitemviews.basicdrawing.shapes.IDrawableShape
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('views.actionitemviews.basicdrawing.shapes.IDrawableShape');
/* Royale Dependency List: org.apache.royale.core.IChild,XML*/




/**
 * @interface
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape = function() {
};
/**
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @param {string} color
 * @return {org.apache.royale.core.IChild}
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.create = function(startX, startY, endX, endY, color) {
};
/**
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.hitTest = function(x, y) {
};
/**
 * @param {number} dx
 * @param {number} dy
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.move = function(dx, dy) {
};
/**  * @type {org.apache.royale.core.IChild}
 */views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.shape;
/**
 * @param {number} endX
 * @param {number} endY
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.update = function(endX, endY) {
};
/**
 * @param {string} color
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.setColor = function(color) {
};


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'IDrawableShape', qName: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape', kind: 'interface' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    accessors: function () {
      return {
        'shape': { type: 'org.apache.royale.core.IChild', access: 'readonly', declaredBy: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape'}
      };
    },
    methods: function () {
      return {
        'create': { type: 'org.apache.royale.core.IChild', declaredBy: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape', parameters: function () { return [ 'Number', false ,'Number', false ,'Number', false ,'Number', false ,'String', false ]; }},
        'hitTest': { type: 'Boolean', declaredBy: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape', parameters: function () { return [ 'Number', false ,'Number', false ]; }},
        'move': { type: 'void', declaredBy: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape', parameters: function () { return [ 'Number', false ,'Number', false ]; }},
        'update': { type: 'void', declaredBy: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape', parameters: function () { return [ 'Number', false ,'Number', false ]; }},
        'setColor': { type: 'void', declaredBy: 'views.actionitemviews.basicdrawing.shapes.IDrawableShape', parameters: function () { return [ 'String', false ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
views.actionitemviews.basicdrawing.shapes.IDrawableShape.prototype.ROYALE_COMPILE_FLAGS = 9;

//# sourceMappingURL=./IDrawableShape.js.map
