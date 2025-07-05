import WebSocket, { WebSocketServer } from 'ws';
import { createRequire } from 'module';



const require = createRequire(import.meta.url);
const EventSource = require('eventsource');

export function setupSharedWebSocketServer(server) {

    const wss = new WebSocketServer({ server });
    const clients = new Set();
    const userMap = new Map(); // ws -> userInfo
    let userCounter = 1;
    const MAX_CLIENTS = 3;

    const eventSource = new EventSource.EventSource('https://stream.wikimedia.org/v2/stream/recentchange');

    console.log('🔁 Wikipedia stream connected');

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
        let subscribedToWiki = false;
        clients.add(ws);
        const userId = `user_${userCounter++}`;
        userMap.set(ws, { id: userId });
        broadcastUserList();
        ws.send(JSON.stringify({
            type: 'welcome',
            userId: userId
        }));
        

        ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (err) {
            console.error('Invalid JSON:', message);
            return;
        }
        if (data.type === 'video-offer' || data.type === 'video-answer' || data.type === 'ice-candidate') {
            const targetClient = Array.from(clients).find(client => userMap.get(client)?.id === data.target);
            if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                data.sender = userMap.get(ws)?.id;
                targetClient.send(JSON.stringify(data));
            }
        }else if (data.type === 'user_disconnected') {
            const userInfo = userMap.get(ws);
            if (userInfo) {
                broadcastToAll({ type: 'user_disconnected', userId: userInfo.id });
                console.log('📢 Manual disconnect triggered by UI for:', userInfo.id);
            }
        }


        if (data.type === 'subscribe_collabaration') {
            const userInfo = userMap.get(ws);
            const broadcastData = {
                type: 'subscribe_collabaration',
                text: data.text,
                sender: userInfo.id
            };
            for (const client of clients) {
                if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(broadcastData));
                }
            }
        } else if (data.type === 'subscribe_wiki') {
            // Mark this client as interested in Wikipedia stream
            subscribedToWiki = true;
        } else {
            console.warn('Unknown message type:', data.type);
        }
        });

        // Send wiki events only to interested clients
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
            console.log('❌ Client disconnected');
            const userInfo = userMap.get(ws);
            const userId = userInfo?.id;

            if (userId) {
                console.log('📢 Broadcasting user_disconnected for', userId);
                broadcastToAll({ type: 'user_disconnected', userId });
            }

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
            if (client.readyState === client.OPEN) {
            client.send(msg);
            }
        }
    }

    function broadcastToAll(data) {
        const msg = JSON.stringify(data);
        console.log("📡 Sending to all clients:", msg);

        for (const client of clients) {
            if (client.readyState === client.OPEN) {
                try {
                    client.send(msg);
                } catch (err) {
                    console.error("⚠️ Failed to send:", err);
                }
            }
        }
    }


    console.log('✅ Unified WebSocket server ready');
}
