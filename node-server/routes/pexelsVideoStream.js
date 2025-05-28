// routes/pexels.js
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const PEXELS_API_KEY = 'dSk7faqBdAhgumubOzfM5fXeJ5jmXYCYivPxeL4k37Lg7jJglLxJpuY8'; // Replace with your real key

router.get('/videoStream', async (req, res) => {
  const query = req.query.q || 'technology'; // Default search
  const perPage = req.query.per_page || 5;

  try {
    const response = await fetch(`https://api.pexels.com/videos/search?query=${query}&per_page=${perPage}`, {
      headers: {
        Authorization: PEXELS_API_KEY
      }
    });

    const data = await response.json();
    res.json(data.videos); // Send only video list
  } catch (err) {
    console.error('Pexels API error:', err);
    res.status(500).json({ error: 'Failed to fetch Pexels videos' });
  }
});

export default router;
