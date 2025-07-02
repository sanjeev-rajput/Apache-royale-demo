import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import chatRoutes from './routes/chat.js';
import visionRoutes from './routes/vision.js';
import llamaRoutes from './routes/llama.js';
import pexelsVideoRoutes from './routes/pexelsVideoStream.js';
//import voiceTranslateRoutes from './routes/voiceTranslate.js';


const app = express();

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://sanjeev-rajput.github.io'
  ]
}));


app.use(bodyParser.json());
app.use(express.json());

// Mount routes
app.use('/api/chat', chatRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/llama', llamaRoutes);
app.use('/api/pexels', pexelsVideoRoutes);
//app.use('/api/voice', voiceTranslateRoutes);


export default app;
