// services/orderService.js (ESM)
import ExecutiveOrder from '../models/ExecutiveOrder.js';
import { fetchExecutiveOrdersForDate } from './federalRegisterService.js';
import { summarizeExecutiveOrders } from './summarizationService.js';
import { embedAndUpsertEO } from './embeddingService.js';

export async function processExecutiveOrdersForDate(dateString) {
  // 1. Fetch new EOs
  const newOrders = await fetchExecutiveOrdersForDate(dateString);

  // 2. Summarize
  const orders = await ExecutiveOrder.find({ publicationDate: dateString });
  await summarizeExecutiveOrders(dateString, orders);

  // 3. Embed newly fetched EOs
  for (const item of newOrders) {
    const orderDoc = await ExecutiveOrder.findOne({ docId: item.document_number });
    if (orderDoc) {
      await embedAndUpsertEO(orderDoc);
    }
  }
}
