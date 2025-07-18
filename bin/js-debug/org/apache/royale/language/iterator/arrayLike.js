/**
 * Generated by Apache Royale Compiler from org/apache/royale/language/iterator/arrayLike.as
 * org.apache.royale.language.iterator.arrayLike
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.language.iterator.arrayLike');
/* Royale Dependency List: */
goog.require('org.apache.royale.utils.Language');
goog.provide('org.apache.royale.language.iterator.arrayLike.NULL_ITERABLE');
/* Royale Static Dependency List: org.apache.royale.utils.Language*/



/**
 * Used by the compiler for classes with [RoyaleArrayLike] metadata when processing for-in/for-each-in loops
 * @asparam forInstance the instance to be checked
 * @asparam lengthCheck either a string that represents a property to return length value, or a function method reference, e.g. instance.length()
 * @asparam getAt the String name of the accessor for the item at index... e.g. 'getItemAt'. If null it will default to Array Access []
 * @asparam lengthIsMethodCall true if the length accessor is an explicit method call instead of a getter
 * @asparam keys true if the request is to iterate over keys (as opposed to values)
 * @asreturn a lightweight iterator Object with hasNext() and next() methods
 *
 * @royalesuppressexport
 * @param {Object} forInstance
 * @param {string} lengthCheck
 * @param {string} getAt
 * @param {boolean} lengthIsMethodCall
 * @param {boolean=} keys
 * @return {Object}
 */
org.apache.royale.language.iterator.arrayLike = function(forInstance, lengthCheck, getAt, lengthIsMethodCall, keys) {
  keys = typeof keys !== 'undefined' ? keys : false;
  if (forInstance) {
    var /** @type {number} */ i = 0;
    var /** @type {Object} */ ret = {};
    if (lengthIsMethodCall) {
      ret['hasNext'] = function() {
        return i < forInstance[lengthCheck]();
      };
    } else {
      ret['hasNext'] = function() {
        return i < forInstance[lengthCheck];
      };
    }
    if (getAt != null) {
      ret['next'] = function() {
        if (keys)
          return (i++) + '';
        return forInstance[getAt](i++);
      };
    } else {
      ret['next'] = function() {
        if (keys)
          return (i++) + '';
        return forInstance[i++];
      };
    }
  } else {
    ret = org.apache.royale.language.iterator.arrayLike.NULL_ITERABLE;
  }
  return ret;
}


/**
 * @package
 * @const
 * @type {*}
 */
org.apache.royale.language.iterator.arrayLike.NULL_ITERABLE = {'hasNext':function() {
  return false;
}, 'next':function() {
  throw new TypeError('Cannot iterate over a null object reference');
}}
