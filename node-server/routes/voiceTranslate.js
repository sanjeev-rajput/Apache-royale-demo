import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch'; // use node-fetch if not already imported

const router = express.Router();

// Store uploaded audio
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('audio'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `translated/output_${Date.now()}.wav`;

  try {
    // Step 1: Transcribe using whisper
    await runCommand(`whisper ${inputPath} --language English --output_format txt`);

    const transcript = fs.readFileSync(inputPath.replace(/\.(webm|wav|mp3)$/, '.txt'), 'utf-8');
    console.log('Transcript:', transcript);

    // Step 2: Translate using LibreTranslate
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: transcript,
        source: 'en',
        target: 'hi', // example: Hindi
        format: 'text'
      }),
    });
    const { translatedText } = await response.json();
    console.log('Translated:', translatedText);

    // Step 3: Generate speech using eSpeak
    await runCommand(`espeak -v hi "${translatedText}" --stdout > ${outputPath}`);

    res.sendFile(outputPath, { root: '.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Processing failed' });
  } finally {
    fs.unlinkSync(inputPath); // Clean up uploaded file
  }
});

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}

export default router;
