/**
 * Generated by Apache Royale Compiler from org/apache/royale/events/CloseEvent.as
 * org.apache.royale.events.CloseEvent
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.events.CloseEvent');
/* Royale Dependency List: */

goog.require('org.apache.royale.events.Event');



/**
 * @constructor
 * @extends {org.apache.royale.events.Event}
 * @param {string} type
 * @param {boolean=} bubbles
 * @param {boolean=} cancelable
 * @param {number=} detail
 */
org.apache.royale.events.CloseEvent = function(type, bubbles, cancelable, detail) {
  bubbles = typeof bubbles !== 'undefined' ? bubbles : false;
  cancelable = typeof cancelable !== 'undefined' ? cancelable : false;
  detail = typeof detail !== 'undefined' ? detail : 0x000004;
  org.apache.royale.events.CloseEvent.base(this, 'constructor', type, bubbles, cancelable);
  this.detail = detail;
};
goog.inherits(org.apache.royale.events.CloseEvent, org.apache.royale.events.Event);


/**
 * @nocollapse
 * @const
 * @type {string}
 */
org.apache.royale.events.CloseEvent.CLOSE = "close";


/**
 * @type {number}
 */
org.apache.royale.events.CloseEvent.prototype.detail = 0;


/**
 * Metadata
 *
 * @type {Object.<string, Array.<Object>>}
 */
org.apache.royale.events.CloseEvent.prototype.ROYALE_CLASS_INFO = { names: [{ name: 'CloseEvent', qName: 'org.apache.royale.events.CloseEvent', kind: 'class' }] };



/**
 * Reflection
 *
 * @return {Object.<string, Function>}
 */
org.apache.royale.events.CloseEvent.prototype.ROYALE_REFLECTION_INFO = function () {
  return {
    variables: function () {
      return {
        'detail': { type: 'uint', get_set: function (/** org.apache.royale.events.CloseEvent */ inst, /** * */ v) {return v !== undefined ? inst.detail = v : inst.detail;}}
      };
    },
    methods: function () {
      return {
        'CloseEvent': { type: 'void', declaredBy: 'org.apache.royale.events.CloseEvent', parameters: function () { return [ 'String', false ,'Boolean', true ,'Boolean', true ,'uint', true ]; }}
      };
    }
  };
};
/**
 * @const
 * @type {number}
 */
org.apache.royale.events.CloseEvent.prototype.ROYALE_COMPILE_FLAGS = 10;

//# sourceMappingURL=./CloseEvent.js.map
