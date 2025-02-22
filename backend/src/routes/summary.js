// routes/summary.js (ESM)
import express from 'express';
import DailySummary from '../models/DailySummary.js';
import { summarizeExecutiveOrder } from '../services/summarizationService.js';


const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) {
      // Return the latest summary
      const latest = await DailySummary.findOne().sort({ date: -1 });
      return res.json(latest || {});
    }
    const summary = await DailySummary.findOne({ date });
    return res.json(summary || {});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint: Summarize a single EO
router.post('/summarize-executive-order', async (req, res) => {
  const { docId } = req.body;

  if (!docId) {
    return res.status(400).json({ error: "docId is required" });
  }

  const summary = await summarizeExecutiveOrder(docId);

  if (!summary) {
    return res.status(500).json({ error: "Failed to generate summary" });
  }

  res.json({ message: "Executive Order summarized", summary });
});


export default router;
