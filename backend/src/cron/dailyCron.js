// cron/dailyCron.js (ESM)
import cron from 'node-cron';
import moment from 'moment';
import { processExecutiveOrdersForDate } from '../services/orderService.js';

export function startDailyCron() {
  cron.schedule('0 0 * * *', async () => {
    const dateString = moment().format('YYYY-MM-DD');
    console.log(`Running daily job for ${dateString}`);
    await processExecutiveOrdersForDate(dateString);
  });
}
