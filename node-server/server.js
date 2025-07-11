import http from 'http';
import app from './app.js';
import { setupSharedWebSocketServer } from './services/sharedWebSocketServer.js';

const PORT = 3000;
const server = http.createServer(app);

setupSharedWebSocketServer(server); // ONE WebSocketServer only

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
