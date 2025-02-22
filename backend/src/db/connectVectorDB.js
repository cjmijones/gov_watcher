// db/connectVectorDB.js (ESM)
import { PineconeClient } from '@pinecone-database/pinecone';

let pineconeClient = null;

export async function connectVectorDB() {
  try {
    pineconeClient = new PineconeClient();
    await pineconeClient.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENV,
    });
    console.log('Connected to Pinecone');
    return pineconeClient;
  } catch (error) {
    console.error('Error connecting to Pinecone:', error);
    throw error;
  }
}

export function getPineconeClient() {
  if (!pineconeClient) {
    throw new Error('Pinecone client is not initialized.');
  }
  return pineconeClient;
}
