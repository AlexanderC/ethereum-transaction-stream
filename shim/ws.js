let ws;

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket;
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket;
} else {
  ws = window.WebSocket || window.MozWebSocket;
}

if (!ws.prototype.on || typeof ws.prototype.on !== 'function') {
  ws.prototype.on = function(event, handler) {
    this[`on${ event }`] = (...args) => {
      if (args[0]
        && typeof args[0] === 'object'
        && args[0].constructor
        && args[0].constructor.name === 'MessageEvent') {
        
        args[0] = args[0].data;
      }

      return handler(...args);
    };
  };
}

module.exports = ws;
