import WebSocket, { WebSocketServer } from 'ws';
import { createRequire } from 'module';
import { setupStockTickerHandler } from './stockTickerHandler.js';

const require = createRequire(import.meta.url);
const EventSource = require('eventsource');

export function setupSharedWebSocketServer(server) {
    const wss = new WebSocketServer({ server });
    const clients = new Set();
    const userMap = new Map();
    let userCounter = 1;
    const MAX_CLIENTS = 10;

    const eventSource = new EventSource.EventSource('https://stream.wikimedia.org/v2/stream/recentchange');
    console.log('🔁 Wikipedia stream connected');

    // Stock handler shared map
    const stockSubscribers = new Set();

    wss.on('connection', (ws) => {
        if (clients.size >= MAX_CLIENTS) {
            ws.send(JSON.stringify({
                type: 'error',
                message: `🚫 Room is full (max ${MAX_CLIENTS} users). Try again later.`
            }));
            ws.close();
            console.warn('❌ Connection rejected due to max clients reached');
            return;
        }

        console.log('🧩 New WebSocket client connected');
        clients.add(ws);

        const userId = `user_${userCounter++}`;
        userMap.set(ws, { id: userId });
        broadcastUserList();

        ws.send(JSON.stringify({ type: 'welcome', userId }));

        let subscribedToWiki = false;
        setupStockTickerHandler(ws); // handles its own message subscription

        ws.on('message', (msg) => {
            let data;
            try {
                data = JSON.parse(msg);
            } catch (e) {
                console.error('Invalid message received:', msg);
                return;
            }

            // Stock subscription (already handled in handler, but we log)
            if (data.type === 'subscribe_stock') {
                console.log(`📈 Client ${userId} subscribed to stock updates`);
                return; // handled inside stockTickerHandler
            }

            // Collaboration drawing broadcast
            if (data.type === 'subscribe_collabaration') {
                const broadcastData = {
                    type: 'subscribe_collabaration',
                    text: data.text,
                    sender: userId
                };
                for (const client of clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(broadcastData));
                    }
                }
                return;
            }

            // Wiki subscription flag
            if (data.type === 'subscribe_wiki') {
                subscribedToWiki = true;
                return;
            }

            // WebRTC messages (video, ICE)
            if (['video-offer', 'video-answer', 'ice-candidate'].includes(data.type)) {
                const targetClient = Array.from(clients).find(client => userMap.get(client)?.id === data.target);
                if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                    data.sender = userId;
                    targetClient.send(JSON.stringify(data));
                }
                return;
            }

            // Webcam sharing
            if (data.type === 'share_webcam') {
                const broadcastData = { type: 'share_webcam', userId };
                for (const client of clients) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(broadcastData));
                    }
                }
                console.log(`📢 share_webcam broadcasted by ${userId}`);
                return;
            }

            // Manual UI disconnect
            if (data.type === 'user_disconnected') {
                broadcastToAll({ type: 'user_disconnected', userId });
                console.log('📢 Manual disconnect by', userId);
                return;
            }

            console.warn('⚠️ Unknown message type:', data.type);
        });

        // Wikipedia stream forwarding
        const onWikiEvent = (event) => {
            if (!subscribedToWiki) return;
            try {
                const change = JSON.parse(event.data);
                const wikiData = {
                    type: 'wiki_update',
                    title: change.title,
                    user: change.user,
                    changeType: change.type,
                    timestamp: change.timestamp,
                    comment: change.comment,
                    wiki: change.wiki,
                };
                ws.send(JSON.stringify(wikiData));
            } catch (err) {
                console.error('Error parsing Wikipedia event:', err);
            }
        };
        eventSource.addEventListener('message', onWikiEvent);

        ws.on('close', () => {
            console.log(`❌ Client ${userId} disconnected`);
            broadcastToAll({ type: 'user_disconnected', userId });

            clients.delete(ws);
            userMap.delete(ws);
            broadcastUserList();

            eventSource.removeEventListener('message', onWikiEvent);
        });
    });

    function broadcastUserList() {
        const users = Array.from(userMap.values()).map(u => u.id);
        const msg = JSON.stringify({
            type: 'user_list',
            users,
            count: users.length,
            max: MAX_CLIENTS
        });
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        }
    }

    function broadcastToAll(data) {
        const msg = JSON.stringify(data);
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(msg);
                } catch (err) {
                    console.error("⚠️ Failed to send:", err);
                }
            }
        }
    }
}
