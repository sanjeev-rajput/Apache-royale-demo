import http from 'http';
import app from './app.js';
//import { setupWikipediaStream } from './services/wikipediaStream.js';
//import { setupDrawingSocket } from './services/drawingSocket.js'; // <-- ✅ New import
import { setupSharedWebSocketServer } from './services/sharedWebSocketServer.js';



const PORT = 3000;
const server = http.createServer(app);

//setupWikipediaStream(server);
//setupDrawingSocket(server); // <-- ✅ Attach WebSocket to server
setupSharedWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
