import http from "node:http";
import app from "./app.js";
import { setupSharedWebSocketServer } from "./services/sharedWebSocketServer.js";

const PORT = Number(process.env.PORT || 3000);
const server = http.createServer(app);

// Keep the existing shared WebSocket setup; the catalog loads from CSV on demand.
setupSharedWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
