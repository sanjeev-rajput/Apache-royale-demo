// ✅ Global store for stock prices
const stockPrices = {}; // symbol => price

// ✅ Track clients: ws => { subscribed: bool, length: number }
const listeners = new Map();

// ✅ Track subscribed symbols: ws => [symbol1, symbol2, ...]
const symbolMap = new Map();

function randomWalk(price) {
  return price + (Math.random() - 0.5) * 10;
}

function getRandomSubset(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// ✅ Send periodic updates to all subscribed clients
/*setInterval(() => {
  for (const [ws, info] of listeners) {
    if (!info.subscribed || ws.readyState !== ws.OPEN) continue;

    const clientSymbols = symbolMap.get(ws);
    if (!clientSymbols || clientSymbols.length === 0) continue;

    const countToUpdate = Math.floor(Math.random() * 6) + 5; // 5–10 updates
    const randomSymbols = getRandomSubset(clientSymbols, countToUpdate);

    const payload = randomSymbols.map(symbol => {
      stockPrices[symbol] = randomWalk(stockPrices[symbol] || 100);
      return {
        symbol,
        price: +stockPrices[symbol].toFixed(2),
        timestamp: new Date().toISOString()
      };
    });

    ws.send(JSON.stringify({
      type: 'stock_update',
      payload
    }));
  }
}, 1000);*/



function scheduleStockUpdates() {
  const delay = Math.floor(Math.random() * (1000 - 5 + 1)) + 5; // 5–1000 ms

  setTimeout(() => {
    for (const [ws, info] of listeners) {
      if (!info.subscribed || ws.readyState !== ws.OPEN) continue;

      const clientSymbols = symbolMap.get(ws);
      if (!clientSymbols || clientSymbols.length === 0) continue;

      const countToUpdate = Math.floor(Math.random() * 6) + 5; // 5–10 updates
      const randomSymbols = getRandomSubset(clientSymbols, countToUpdate);

      const payload = randomSymbols.map(symbol => {
        stockPrices[symbol] = randomWalk(stockPrices[symbol] || 100);
        return {
          symbol,
          price: +stockPrices[symbol].toFixed(2),
          timestamp: new Date().toISOString()
        };
      });

      ws.send(JSON.stringify({
        type: 'stock_update',
        payload
      }));
    }

    // 🔁 reschedule with a new random delay
    scheduleStockUpdates();

  }, delay);
}

// 🚀 start random updates
scheduleStockUpdates();


// ✅ WebSocket message handler
export function setupStockTickerHandler(ws) {
  // Initialize listener state
  listeners.set(ws, { subscribed: false, length: 100 });

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'subscribe_stock') {
        const len = Math.max(1, Math.min(data.length || 100, 1000)); // cap to 1000
        const symbols = Array.from({ length: len }, (_, i) => `SYM${i + 1}`);

        // Store symbols and subscription info
        symbolMap.set(ws, symbols);
        listeners.set(ws, { subscribed: true, length: len });

        // Initialize prices
        for (const sym of symbols) {
          if (!stockPrices[sym]) {
            stockPrices[sym] = 100 + Math.random() * 1000;
          }
        }

        console.log(`📈 Subscribed client to ${len} stock symbols`);
      }

      if (data.type === 'unsubscribe_stock') {
        const prev = listeners.get(ws);
        if (prev) prev.subscribed = false;
        console.log('📉 Client unsubscribed from stock updates');
      }

    } catch (e) {
      console.error('❌ Invalid message format:', msg);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    listeners.delete(ws);
    symbolMap.delete(ws);
  });
}
