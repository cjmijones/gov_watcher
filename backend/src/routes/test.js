// src/routes/test.js (ESM example)
import express from 'express';
import { processExecutiveOrdersForDate } from '../services/orderService.js';
import { fetchExecutiveOrdersForDate } from '../services/federalRegisterService.js';
import ExecutiveOrder from '../models/ExecutiveOrder.js';


const router = express.Router();

router.post('/fetchEos', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ error: 'startDate is required' });
    }

    console.log(`Manual trigger: startDate=${startDate}, endDate=${endDate || 'N/A'}`);

    const results = await fetchExecutiveOrdersForDate({ startDate, endDate });

    res.status(200).json({
      message: `Fetched ${results.length} executive orders`,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/fetchEosFromDB', async (req, res) => {
  try {
    const { docId } = req.body;

    // console.log(docId)

    const executiveOrder = await ExecutiveOrder.findOne({ docId })

    if (!executiveOrder) {
      return res.status(404).json({ error: `Executive order with docId ${docId} not found` });
    }

    res.status(200).json({
      message: `Fetched executive orders ${docId}`,
      data: executiveOrder
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
