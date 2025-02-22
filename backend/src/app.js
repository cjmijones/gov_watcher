// app.js (ESM)
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import { connectMongo } from './db/connectMongo.js';
import { initVectorDB } from './services/embeddingService.js';
import { initPinecone } from './services/ragService.js';
import { startDailyCron } from './cron/dailyCron.js';

// Routes
import ordersRoute from './routes/orders.js';
import summaryRoute from './routes/summary.js';
import searchRoute from './routes/search.js';
import testRoute from './routes/test.js';

async function startServer() {

  console.log("Hello World")
  // console.log(process.env['OPENAI_API_KEY'])

  // 1. Connect to Mongo
  await connectMongo();
  // 2. Connect/Init Pinecone
  await initVectorDB();
  await initPinecone();

  // 3. Setup Express
  const app = express();
  app.use(express.json());

  // 4. Mount routes
  app.use('/api/orders', ordersRoute);
  app.use('/api/summary', summaryRoute);
  app.use('/api/search', searchRoute);
  app.use('/api/test', testRoute);

  // 5. Start cron
  startDailyCron();

  // 6. Listen
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
