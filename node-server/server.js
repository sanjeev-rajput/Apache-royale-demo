import http from 'http';
import app from './app.js';
import { setupWikipediaStream } from './services/wikipediaStream.js';

const PORT = 3000;
const server = http.createServer(app);

setupWikipediaStream(server);

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
