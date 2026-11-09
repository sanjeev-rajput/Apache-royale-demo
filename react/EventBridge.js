(function (global) {
  const EventBridge = {
    dispatchReactToRoyale: function (eventName, data = {}) {
      const event = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(event);
    },

    listenRoyaleToReact: function (eventName, handler) {
      window.addEventListener(eventName, handler);
    },

    removeRoyaleToReact: function (eventName, handler) {
      window.removeEventListener(eventName, handler);
    }
  };

  global.EventBridge = EventBridge;
})(window);
