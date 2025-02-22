// routes/search.js (ESM)
import express from 'express';
import { ragQuery } from '../services/ragService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const answer = await ragQuery(query);
    return res.json({ answer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
