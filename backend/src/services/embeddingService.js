// src/services/embeddingService.js
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { chunkText } from '../utils/chunking.js';

// 1) Initialize the OpenAI client:
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2) Declare a variable for the Pinecone Index so it’s accessible in both init and upsert:
let pineconeIndex = null;

/**
 * Initializes the Pinecone client and sets the pineconeIndex variable.
 */
export async function initVectorDB() {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  // This returns an Index object for your configured index name:
  pineconeIndex = pc.index(process.env.PINECONE_INDEX);

  console.log('Pinecone index initialized:', process.env.PINECONE_INDEX);
}

/**
 * Embeds the given ExecutiveOrder object and upserts chunks into Pinecone.
 */
export async function embedAndUpsertEO(executiveOrder) {
  if (!pineconeIndex) {
    throw new Error('Pinecone index has not been initialized. Call initVectorDB() first.');
  }

  // 1) Chunk the text
  const chunks = chunkText(executiveOrder.bodyText, 1000);

  // 2) Build vectors from embeddings
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    // Skip empty strings
    if (!chunk.trim()) continue;

    // Create embedding
    const res = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: chunk,
    });

    const embedding = res.data.data[0].embedding;
    vectors.push({
      id: `${executiveOrder.docId}-${i}`, // e.g., "EO-12345-0"
      metadata: {
        docId: executiveOrder.docId,
        title: executiveOrder.title,
        chunkIndex: i,
        text: chunk,
      },
      values: embedding,
    });
  }

  // 3) Upsert to Pinecone if we have any chunks
  if (vectors.length > 0) {
    await pineconeIndex.upsert({
      upsertRequest: {
        vectors,
        namespace: 'executive-orders', // Optional: set your own namespace
      },
    });
    console.log(`Upserted ${vectors.length} chunks for EO docId=${executiveOrder.docId}`);
  } else {
    console.log('No valid chunks to upsert.');
  }
}
