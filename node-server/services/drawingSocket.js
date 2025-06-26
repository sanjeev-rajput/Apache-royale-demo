import { WebSocketServer } from 'ws';

export function setupDrawingSocket(server) {
  const wss = new WebSocketServer({ server });

  const clients = new Set();

  wss.on('connection', (ws) => {
    console.log('🖌️ New client connected');
    clients.add(ws);

    ws.on('message', (message) => {
      // Broadcast received drawing data to all clients
      for (const client of clients) {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(message);
        }
      }
    });

    ws.on('close', () => {
      console.log('❌ Client disconnected');
      clients.delete(ws);
    });
  });

  console.log('🎨 WebSocket for drawing set up');
}
