// routes/orders.js (ESM)
import express from 'express';
import ExecutiveOrder from '../models/ExecutiveOrder.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const date = req.query.date;
    let filter = {};
    if (date) {
      // parse date or store as string
      filter = { publicationDate: new Date(date) };
    }
    const orders = await ExecutiveOrder.find(filter);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
