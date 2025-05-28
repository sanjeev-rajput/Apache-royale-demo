import { WebSocketServer } from 'ws';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const EventSource = require('eventsource'); // CommonJS interop

export function setupWikipediaStream(server) {
  const wss = new WebSocketServer({ server });

  const eventSource = new EventSource.EventSource('https://stream.wikimedia.org/v2/stream/recentchange');

  wss.on('connection', (ws) => {
    console.log('Client connected');

    const onMessage = (event) => {
      try {
        const change = JSON.parse(event.data);
        const data = {
          title: change.title,
          user: change.user,
          type: change.type,
          timestamp: change.timestamp,
          comment: change.comment,
          wiki: change.wiki,
        };
        ws.send(JSON.stringify(data));
      } catch (err) {
        console.error('Error parsing event:', err);
      }
    };

    eventSource.addEventListener('message', onMessage);

    ws.on('close', () => {
      console.log('Client disconnected');
      eventSource.removeEventListener('message', onMessage);
    });
  });
}
