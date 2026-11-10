import * as LiveClockComponent from './components/LiveClockComponent.js';

(function(global) {
  const ReactCompController = {
    mountLiveClock: LiveClockComponent.mount,
    // mountAnotherComponent: AnotherComponent.mount
  };

  global.ReactCompController = ReactCompController;
})(window);
