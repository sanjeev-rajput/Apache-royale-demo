import express from 'express';
import path from 'path';
import fs from 'node:fs/promises';
import cors from 'cors';
import bodyParser from 'body-parser';

import chatRoutes from './routes/chat.js';
import visionRoutes from './routes/vision.js';
import llamaRoutes from './routes/llama.js';
import pexelsVideoRoutes from './routes/pexelsVideoStream.js';
import learningRoutes from './routes/learning.js';
import { fileURLToPath } from 'url';
//import voiceTranslateRoutes from './routes/voiceTranslate.js';
import multilingualRoutes from './routes/multilingual.js';
import agentRoutes from './routes/agent.js';
import assessmentRoutes from './routes/assessment.js';
import questionBankRoutes from './routes/questionBank.js';
import adaptiveLearningRoutes from './routes/adaptiveLearning.js';
import { questionBankRepository } from './services/questionBank/questionBankRepository.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://sanjeev-rajput.github.io',
    'http://localhost:8501'
  ]
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/bin', express.static(path.join(__dirname, 'bin')));

// Serve only images from the configured Question Bank repository.
// The repository layout includes the publisher directory.
app.get('/question-bank-assets/:classId/:subjectId/icon/:filename', async (req, res) => {
  try {
    const { classId, subjectId, filename } = req.params;
    const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif']);

    if (!/^class-[A-Za-z0-9_-]+$/.test(classId) ||
        !/^[A-Za-z0-9_-]+$/.test(subjectId) ||
        path.basename(filename) !== filename ||
        !allowedExtensions.has(path.extname(filename).toLowerCase())) {
      return res.status(400).json({ error: 'Invalid Question Bank image path.' });
    }

    const repositoryRoot = await fs.realpath(questionBankRepository.dataDir);
    const iconDirectory = path.join(
      repositoryRoot,
      'unspecified-publisher',
      classId,
      subjectId,
      'icon'
    );
    const realIconDirectory = await fs.realpath(iconDirectory);
    const realImagePath = await fs.realpath(path.join(realIconDirectory, filename));

    // Reject symlinks or paths resolving outside the requested icon folder.
    const relativePath = path.relative(realIconDirectory, realImagePath);
    if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return res.status(404).json({ error: 'Question Bank image not found.' });
    }

    const imageStats = await fs.stat(realImagePath);
    if (!imageStats.isFile()) {
      return res.status(404).json({ error: 'Question Bank image not found.' });
    }

    return res.sendFile(realImagePath);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      return res.status(404).json({ error: 'Question Bank image not found.' });
    }
    console.error('[Question Bank images] Failed to serve image:', error);
    return res.status(500).json({ error: 'Unable to serve Question Bank image.' });
  }
});

app.use(bodyParser.json());
app.use(express.json());

// Mount routes
app.use('/api/vision', visionRoutes);
app.use('/api/llama', llamaRoutes);
app.use('/api/pexels', pexelsVideoRoutes);
// Assessment endpoints must be registered before the general learning route.
app.use('/api/learning/assessment', assessmentRoutes);
app.use('/api/learning/question-bank', questionBankRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/chat', chatRoutes);
//app.use('/api/voice', voiceTranslateRoutes);
app.use('/api/multilingual', multilingualRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/adaptive-learning', adaptiveLearningRoutes);

export default app;
