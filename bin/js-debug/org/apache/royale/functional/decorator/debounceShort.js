/**
 * Generated by Apache Royale Compiler from org/apache/royale/functional/decorator/debounceShort.as
 * org.apache.royale.functional.decorator.debounceShort
 *
 * @fileoverview
 *
 * @suppress {missingRequire|checkTypes|accessControls}
 */

goog.provide('org.apache.royale.functional.decorator.debounceShort');
/* Royale Dependency List: */



/**
 * Returns a debounced function to run after a delay.
 * The first invocation of the function will be run after its delay.
 * Any invocations between the first invocation and the delay will be ignored.
 * 
 * @royalesuppressexport
 * @langversion 3.0
 * @productversion Royale 0.9.9
 * 
 * @param {Function} method
 * @param {number} delay
 * @return {Function}
 */
org.apache.royale.functional.decorator.debounceShort = function(method, delay) {
  var /** @type {*} */ timeoutRef;
  return function(args) {
    args = Array.prototype.slice.call(arguments, 0);
    function callback() {
      method.apply(null, args);
      timeoutRef = null;
    };
    if (timeoutRef == null) {
      timeoutRef = setTimeout(callback, delay);
    }
  };
}
